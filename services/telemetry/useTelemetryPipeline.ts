import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

import { inferVehicleType, isIdleWindow, toPipelineState } from "@/services/telemetry/classifier";
import {
  DEBUG_FEATURE_BUFFER_SIZE,
  DEBUG_MODE,
  MIN_PREDICTION_PERSISTENCE,
  PREDICTION_BUFFER_SIZE,
  SENSOR_INTERVAL_MS,
  STATE_PERSISTENCE_WINDOWS,
  SYNC_BATCH_SIZE,
  SYNC_INTERVAL_MS,
  WINDOW_SIZE,
} from "@/services/telemetry/config";
import { extractFeatureVector } from "@/services/telemetry/features";
import {
  computeSegmentDistance,
  createInitialFilterState,
  isLocationAcceptable,
  preprocessAccelerometer,
  preprocessGyroscope,
} from "@/services/telemetry/filters";
import {
  fetchUnsyncedRecords,
  initTelemetryStorage,
  insertTelemetryRecord,
  markRecordsSynced,
} from "@/services/telemetry/storage";
import { syncBatchToBackend } from "@/services/telemetry/sync";
import { FeatureVector, MotionSample, PipelineState } from "@/services/telemetry/types";
import { useSensorCollection } from "@/services/telemetry/useSensorCollection";

type RuntimeState = {
  latestAcc: { x: number; y: number; z: number } | null;
  latestGyro: { x: number; y: number; z: number } | null;
  latestLocation: { latitude: number; longitude: number; speed: number } | null;
  lastAcceptedLocation: { latitude: number; longitude: number } | null;
  distanceAccumulated: number;
  window: MotionSample[];
  stateHistory: PipelineState[];
  predictionBuffer: Array<"car" | "bike" | "bus" | "walking">;
  debugFeatureVectors: FeatureVector[];
  currentState: PipelineState;
  vehicleType: string | null;
};

const createRuntimeState = (): RuntimeState => ({
  latestAcc: null,
  latestGyro: null,
  latestLocation: null,
  lastAcceptedLocation: null,
  distanceAccumulated: 0,
  window: [],
  stateHistory: [],
  predictionBuffer: [],
  debugFeatureVectors: [],
  currentState: "idle",
  vehicleType: null,
});

const getMajority = (items: string[]): string | null => {
  if (items.length === 0) return null;
  const count = new Map<string, number>();
  for (const item of items) {
    count.set(item, (count.get(item) ?? 0) + 1);
  }
  let winner: string | null = null;
  let max = 0;
  for (const [key, value] of count.entries()) {
    if (value > max) {
      max = value;
      winner = key;
    }
  }
  return winner;
};

const getStableState = (
  history: PipelineState[],
  candidate: PipelineState
): PipelineState | null => {
  history.push(candidate);
  if (history.length > STATE_PERSISTENCE_WINDOWS) history.shift();
  if (history.length < STATE_PERSISTENCE_WINDOWS) return null;
  const same = history.every((v) => v === history[0]);
  return same ? history[0] : null;
};

export const useTelemetryPipeline = () => {
  const [isActive, setIsActive] = useState(false);
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [vehicleType, setVehicleType] = useState<string | null>(null);

  const runtimeRef = useRef<RuntimeState>(createRuntimeState());
  const filterStateRef = useRef(createInitialFilterState());
  const sampleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncNow = useCallback(async (): Promise<void> => {
    try {
      const records = await fetchUnsyncedRecords(SYNC_BATCH_SIZE, 0.8);
      if (records.length === 0) {
        console.log("Telemetry Sync: No records to sync.");
        return;
      }
      console.log(`Telemetry Sync: Starting sync for ${records.length} records...`);
      const synced = await syncBatchToBackend({ items: records });
      if (synced) {
        const ids = records.map((record) => record.id).filter((id): id is number => typeof id === "number");
        await markRecordsSynced(ids);
        console.log(`Telemetry Sync: Successfully synced ${records.length} records.`);
      } else {
        console.warn("Telemetry Sync: Backend sync failed.");
      }
    } catch (e) {
      console.error("Sync failed:", e);
    }
  }, []);

  const onAccelerometer = useCallback((value: { x: number; y: number; z: number }) => {
    runtimeRef.current.latestAcc = value;
  }, []);

  const onGyroscope = useCallback((value: { x: number; y: number; z: number }) => {
    runtimeRef.current.latestGyro = value;
  }, []);

  const onLocation = useCallback(
    (location: { latitude: number; longitude: number; speed: number; accuracy: number | null }) => {
      if (!isLocationAcceptable(location.accuracy)) {
        return;
      }
      const nextPoint = {
        latitude: location.latitude,
        longitude: location.longitude,
      };
      const segmentDistance = computeSegmentDistance(runtimeRef.current.lastAcceptedLocation, nextPoint);
      runtimeRef.current.distanceAccumulated += segmentDistance;
      runtimeRef.current.lastAcceptedLocation = nextPoint;
      runtimeRef.current.latestLocation = {
        latitude: nextPoint.latitude,
        longitude: nextPoint.longitude,
        speed: location.speed,
      };
    },
    []
  );

  useSensorCollection({
    intervalMs: SENSOR_INTERVAL_MS,
    enabled: isActive,
    onAccelerometer,
    onGyroscope,
    onLocation,
  });

  const clearAll = (): void => {
    if (sampleTimerRef.current) clearInterval(sampleTimerRef.current);
    if (processTimerRef.current) clearInterval(processTimerRef.current);
    if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    sampleTimerRef.current = null;
    processTimerRef.current = null;
    syncTimerRef.current = null;
  };

  useEffect(() => {
    if (!isActive) {
      clearAll();
      return;
    }

    let mounted = true;

    const start = async (): Promise<void> => {
      await initTelemetryStorage();

      if (!mounted) return;

      sampleTimerRef.current = setInterval(() => {
        const runtime = runtimeRef.current;
        if (!runtime.latestAcc || !runtime.latestGyro) return;

        const acc = preprocessAccelerometer(runtime.latestAcc, filterStateRef.current);
        if (!acc) return;
        const gyro = preprocessGyroscope(runtime.latestGyro, filterStateRef.current);

        runtime.window.push({
          timestamp: Date.now(),
          accX: acc.x,
          accY: acc.y,
          accZ: acc.z,
          gyroX: gyro.x,
          gyroY: gyro.y,
          gyroZ: gyro.z,
          speed: runtime.latestLocation?.speed ?? 0,
          latitude: runtime.latestLocation?.latitude ?? null,
          longitude: runtime.latestLocation?.longitude ?? null,
        });

        if (runtime.window.length > WINDOW_SIZE) {
          runtime.window.shift();
        }
      }, SENSOR_INTERVAL_MS);

      processTimerRef.current = setInterval(async () => {
        const runtime = runtimeRef.current;
        if (runtime.window.length < WINDOW_SIZE) return;

        const featureVector = extractFeatureVector(runtime.window);
        if (DEBUG_MODE) {
          runtime.debugFeatureVectors.push(featureVector);
          if (runtime.debugFeatureVectors.length > DEBUG_FEATURE_BUFFER_SIZE) {
            runtime.debugFeatureVectors.shift();
          }
        }

        const isIdle = isIdleWindow(featureVector);
        let windowState: PipelineState = "idle";
        let currentVehicle: string | null = null;
        let confidence: number | null = null;

        if (DEBUG_MODE) {
          console.log("FEATURE_VECTOR:", {
            rms: featureVector.acc_rms_mean.toFixed(4),
            acc_std: featureVector.acc_mag_std.toFixed(4),
            gyro_std: featureVector.gyro_mag_std.toFixed(4),
            speed: featureVector.speed_mean.toFixed(2),
          });
        }

        if (!isIdle) {
          const mlOutput = inferVehicleType(featureVector);
          runtime.predictionBuffer.push(mlOutput.vehicle_type);
          if (runtime.predictionBuffer.length > PREDICTION_BUFFER_SIZE) {
            runtime.predictionBuffer.shift();
          }

          const voted = getMajority(runtime.predictionBuffer);
          const occurrences = runtime.predictionBuffer.filter((v) => v === voted).length;
          
          if (DEBUG_MODE) {
            console.log("ML_PREDICTION:", {
              raw: mlOutput.vehicle_type,
              conf: mlOutput.confidence.toFixed(2),
              voted: voted,
              persistence: occurrences
            });
          }

          if (voted && occurrences >= MIN_PREDICTION_PERSISTENCE) {
            currentVehicle = voted;
            confidence = mlOutput.confidence;
            windowState = toPipelineState(mlOutput);
          } else {
            windowState = "walking";
          }
        }

        const stableState = getStableState(runtime.stateHistory, windowState);
        if (stableState) {
          if (stableState !== runtime.currentState) {
            console.log(`STATE_TRANSITION: ${runtime.currentState} -> ${stableState} (${currentVehicle ?? "none"})`);
          }
          runtime.currentState = stableState;
          runtime.vehicleType = currentVehicle;
          setPipelineState(stableState);
          setVehicleType(currentVehicle);
        }

        const latest = runtime.latestLocation;
        const distance5s = runtime.distanceAccumulated;
        runtime.distanceAccumulated = 0;

        await insertTelemetryRecord({
          timestamp: Date.now(),
          latitude: latest?.latitude ?? null,
          longitude: latest?.longitude ?? null,
          distance_5s: distance5s,
          state: runtime.currentState,
          vehicle_type: runtime.currentState === "vehicle" ? currentVehicle : null,
          confidence: runtime.currentState === "vehicle" ? confidence : null,
          synced: 0,
        });

        if (DEBUG_MODE) {
          console.log("RECORD_SAVED", {
            state: runtime.currentState,
            vehicle: currentVehicle,
            dist: distance5s.toFixed(2)
          });
        }
      }, 5000);

      syncTimerRef.current = setInterval(() => {
        void syncNow();
      }, SYNC_INTERVAL_MS);

      console.log("Telemetry Pipeline: STARTED");
    };

    void start();

    return () => {
      mounted = false;
      clearAll();
      console.log("Telemetry Pipeline: STOPPED");
    };
  }, [isActive, syncNow]);

  useEffect(() => {
    const appStateSub = AppState.addEventListener("change", (status: AppStateStatus) => {
      if (status === "active" && isActive) {
        console.log("App active, syncing telemetry...");
        void syncNow();
      }
    });
    return () => appStateSub.remove();
  }, [isActive, syncNow]);

  return {
    isActive,
    pipelineState,
    vehicleType,
    startPipeline: () => {
      console.log("Pipeline action: START");
      setIsActive(true);
    },
    stopPipeline: () => {
      console.log("Pipeline action: STOP");
      setIsActive(false);
      setPipelineState("idle");
      setVehicleType(null);
      runtimeRef.current = createRuntimeState();
    },
  };
};
