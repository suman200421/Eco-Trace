import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

import { inferVehicleType, isIdleWindow, toPipelineState } from "@/services/telemetry/classifier";
import {
  DEBUG_FEATURE_BUFFER_SIZE,
  DEBUG_MODE,
  MIN_PREDICTION_PERSISTENCE,
  ML_INFERENCE_WINDOW_MS,
  MS_TO_KMH,
  PREDICTION_BUFFER_SIZE,
  SENSOR_INTERVAL_MS,
  SPEED_GATE_IDLE_KMH,
  SPEED_GATE_WALK_KMH,
  STATE_PERSISTENCE_WINDOWS,
  SYNC_BATCH_SIZE,
  SYNC_INTERVAL_MS,
  WINDOW_SIZE,
} from "@/services/telemetry/config";
import { computeRawSensorFeatures, extractFeatureVector } from "@/services/telemetry/features";
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
import { sendMlWindowPrediction, syncBatchToBackend } from "@/services/telemetry/sync";
import { FeatureVector, MlPredictionResult, MotionSample, PipelineState } from "@/services/telemetry/types";
import { useSensorCollection } from "@/services/telemetry/useSensorCollection";

type RuntimeState = {
  latestAcc: { x: number; y: number; z: number } | null;
  latestGyro: { x: number; y: number; z: number } | null;
  latestLocation: { latitude: number; longitude: number; speed: number } | null;
  lastAcceptedLocation: { latitude: number; longitude: number } | null;
  distanceAccumulated: number;
  window: MotionSample[];
  // 2-Minute ML Inference Window Buffers
  mlActiveBuffer: MotionSample[];
  mlWindowIndex: number;
  mlInferenceInFlight: boolean;
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
  mlActiveBuffer: [],
  mlWindowIndex: 0,
  mlInferenceInFlight: false,
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

  const [lastPrediction, setLastPrediction] = useState<MlPredictionResult | null>(null);

  const runtimeRef = useRef<RuntimeState>(createRuntimeState());
  const filterStateRef = useRef(createInitialFilterState());
  const sampleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mlWindowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  /**
   * Evaluates the completed 2-minute inference window.
   * Called strictly on the 2-minute boundary (non-overlapping).
   * Implements Speed-Gated ML Inference:
   *  - < 0.5 km/h: Local 'idle' classification (bypasses ML)
   *  - 0.5 to < 5.0 km/h: Local 'walk' classification (bypasses ML)
   *  - >= 5.0 km/h: Dispatches 13-feature payload to Random Forest ML service
   */
  const processCompletedMlWindow = useCallback(async (): Promise<void> => {
    const runtime = runtimeRef.current;

    // Rotate buffers immediately: freeze activeBuffer as completedBuffer
    const completedBuffer = runtime.mlActiveBuffer;
    runtime.mlActiveBuffer = []; // Fresh non-overlapping buffer for Window N+1
    const windowIndex = runtime.mlWindowIndex++;

    if (completedBuffer.length === 0) {
      if (DEBUG_MODE) {
        console.log(`ML Window #${windowIndex}: Skipped (no samples in window).`);
      }
      return;
    }

    if (runtime.mlInferenceInFlight) {
      console.warn(`ML Window #${windowIndex}: Previous inference still in-flight, skipping to prevent unbounded queue.`);
      return;
    }

    runtime.mlInferenceInFlight = true;

    try {
      // Aggregate the raw 2-minute samples into ONE 13-feature vector
      const rawFeatures = computeRawSensorFeatures(completedBuffer);
      const windowId = `win_${Date.now()}_${windowIndex}`;

      // Convert speed from m/s to km/h for speed gate evaluation
      const rawSpeedMs = Number.isFinite(rawFeatures.speed) ? Math.max(0, rawFeatures.speed) : 0;
      const speedKmh = rawSpeedMs * MS_TO_KMH;

      // --- SPEED GATE EVALUATION ---
      // 1. Below 0.5 km/h: Classify as 'idle' locally without network request
      if (speedKmh < SPEED_GATE_IDLE_KMH) {
        if (DEBUG_MODE) {
          console.log(
            `[SpeedGate] Window #${windowIndex}: ${speedKmh.toFixed(2)} km/h < ${SPEED_GATE_IDLE_KMH} km/h -> Classified as 'idle' locally. Skipping ML inference.`
          );
        }
        runtime.vehicleType = null;
        runtime.currentState = "idle";
        setPipelineState("idle");
        setVehicleType(null);
        setLastPrediction({
          windowId,
          windowIndex,
          durationMs: ML_INFERENCE_WINDOW_MS,
          mode: "idle",
          confidence: 1.0,
          confidence_percent: 100,
          probabilities: { idle: 1.0 },
          predictedAt: new Date().toISOString(),
        });
        return;
      }

      // 2. Between 0.5 km/h and < 5.0 km/h: Classify as 'walk' locally without network request
      if (speedKmh < SPEED_GATE_WALK_KMH) {
        if (DEBUG_MODE) {
          console.log(
            `[SpeedGate] Window #${windowIndex}: ${speedKmh.toFixed(2)} km/h (< ${SPEED_GATE_WALK_KMH} km/h) -> Classified as 'walk' locally. Skipping ML inference.`
          );
        }
        runtime.vehicleType = "walk";
        runtime.currentState = "walking";
        setPipelineState("walking");
        setVehicleType("walk");
        setLastPrediction({
          windowId,
          windowIndex,
          durationMs: ML_INFERENCE_WINDOW_MS,
          mode: "walk",
          confidence: 1.0,
          confidence_percent: 100,
          probabilities: { walk: 1.0 },
          predictedAt: new Date().toISOString(),
        });
        return;
      }

      // 3. At or above 5.0 km/h: Vehicle speed detected -> Dispatch to ML Pipeline
      if (DEBUG_MODE) {
        console.log(
          `[SpeedGate] Window #${windowIndex}: ${speedKmh.toFixed(2)} km/h >= ${SPEED_GATE_WALK_KMH} km/h -> Dispatching ML inference...`
        );
        console.log(`[ML 2-MIN WINDOW #${windowIndex}] Aggregated ${completedBuffer.length} samples. Sending 1 inference request...`, {
          speedKmh: speedKmh.toFixed(2),
          rms: rawFeatures.rms.toFixed(4),
          gyro: rawFeatures.gyro_magnitude_mean.toFixed(4),
        });
      }

      // Format speed features to km/h to match ML training units
      rawFeatures.speed = speedKmh;
      rawFeatures.speed_std = (Number.isFinite(rawFeatures.speed_std) ? rawFeatures.speed_std : 0) * MS_TO_KMH;

      // Send ONE compact request to EcoTrace Backend
      const prediction = await sendMlWindowPrediction(
        windowId,
        windowIndex,
        ML_INFERENCE_WINDOW_MS,
        rawFeatures
      );

      if (prediction) {
        if (DEBUG_MODE) {
          console.log(`[ML 2-MIN PREDICTION #${windowIndex} RECEIVED]:`, {
            mode: prediction.mode,
            confidence: prediction.confidence_percent + "%",
            probabilities: prediction.probabilities,
          });
        }

        setLastPrediction(prediction);

        // Update active vehicle type & state from ML
        const predictedMode = prediction.mode.toLowerCase();
        runtime.vehicleType = predictedMode;
        setVehicleType(predictedMode);

        const newState: PipelineState = predictedMode === "walk" || predictedMode === "walking" ? "walking" : "vehicle";
        runtime.currentState = newState;
        setPipelineState(newState);
      }
    } catch (err) {
      console.error("Failed to process 2-minute ML window:", err);
    } finally {
      runtime.mlInferenceInFlight = false;
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
    if (mlWindowTimerRef.current) clearInterval(mlWindowTimerRef.current);
    if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    sampleTimerRef.current = null;
    processTimerRef.current = null;
    mlWindowTimerRef.current = null;
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

      // Sample collection timer (100ms)
      sampleTimerRef.current = setInterval(() => {
        const runtime = runtimeRef.current;
        if (!runtime.latestAcc || !runtime.latestGyro) return;

        const acc = preprocessAccelerometer(runtime.latestAcc, filterStateRef.current);
        if (!acc) return;
        const gyro = preprocessGyroscope(runtime.latestGyro, filterStateRef.current);

        const sample: MotionSample = {
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
        };

        // 5-second sliding window for local storage
        runtime.window.push(sample);
        if (runtime.window.length > WINDOW_SIZE) {
          runtime.window.shift();
        }

        // Continuous 2-minute non-overlapping ML buffer
        runtime.mlActiveBuffer.push(sample);
      }, SENSOR_INTERVAL_MS);

      // Local 5-second persistence & interim status timer
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
        let currentVehicle: string | null = runtime.vehicleType;
        let confidence: number | null = null;

        if (!isIdle) {
          const mlOutput = inferVehicleType(featureVector);
          runtime.predictionBuffer.push(mlOutput.vehicle_type);
          if (runtime.predictionBuffer.length > PREDICTION_BUFFER_SIZE) {
            runtime.predictionBuffer.shift();
          }

          const voted = getMajority(runtime.predictionBuffer);
          const occurrences = runtime.predictionBuffer.filter((v) => v === voted).length;

          if (voted && occurrences >= MIN_PREDICTION_PERSISTENCE) {
            currentVehicle = runtime.vehicleType || voted;
            confidence = mlOutput.confidence;
            windowState = toPipelineState(mlOutput);
          } else {
            windowState = "walking";
          }
        }

        const stableState = getStableState(runtime.stateHistory, windowState);
        if (stableState) {
          runtime.currentState = stableState;
          setPipelineState(stableState);
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
      }, 5000);

      // 2-MINUTE ML INFERENCE WINDOW TIMER (Executed EXACTLY ONCE every 2 minutes)
      mlWindowTimerRef.current = setInterval(() => {
        void processCompletedMlWindow();
      }, ML_INFERENCE_WINDOW_MS);

      // Periodic cloud sync
      syncTimerRef.current = setInterval(() => {
        void syncNow();
      }, SYNC_INTERVAL_MS);

      console.log(`Telemetry Pipeline: STARTED (2-Minute ML Window: ${ML_INFERENCE_WINDOW_MS / 1000}s)`);
    };

    void start();

    return () => {
      mounted = false;
      clearAll();
      console.log("Telemetry Pipeline: STOPPED");
    };
  }, [isActive, syncNow, processCompletedMlWindow]);

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
    lastPrediction,
    startPipeline: () => {
      console.log("Pipeline action: START");
      setIsActive(true);
    },
    stopPipeline: () => {
      console.log("Pipeline action: STOP");
      setIsActive(false);
      setPipelineState("idle");
      setVehicleType(null);
      setLastPrediction(null);
      runtimeRef.current = createRuntimeState();
    },
  };
};
