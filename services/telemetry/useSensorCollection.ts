import * as Location from "expo-location";
import { Accelerometer, Gyroscope } from "expo-sensors";
import { useEffect } from "react";

type SensorCallbacks = {
  intervalMs: number;
  enabled: boolean;
  onAccelerometer: (value: { x: number; y: number; z: number }) => void;
  onGyroscope: (value: { x: number; y: number; z: number }) => void;
  onLocation: (value: {
    latitude: number;
    longitude: number;
    speed: number;
    accuracy: number | null;
  }) => void;
};

export const useSensorCollection = ({
  intervalMs,
  enabled,
  onAccelerometer,
  onGyroscope,
  onLocation,
}: SensorCallbacks): void => {
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    let locationSub: Location.LocationSubscription | null = null;

    const accSub = Accelerometer.addListener((value) => onAccelerometer(value));
    const gyroSub = Gyroscope.addListener((value) => onGyroscope(value));
    Accelerometer.setUpdateInterval(intervalMs);
    Gyroscope.setUpdateInterval(intervalMs);

    const startLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mounted || status !== "granted") return;

      locationSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: intervalMs,
          distanceInterval: 0,
        },
        (location) => {
          onLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            speed: Math.max(0, location.coords.speed ?? 0),
            accuracy: location.coords.accuracy,
          });
        }
      );
    };

    void startLocation();

    return () => {
      mounted = false;
      accSub.remove();
      gyroSub.remove();
      if (locationSub) locationSub.remove();
    };
  }, [enabled, intervalMs, onAccelerometer, onGyroscope, onLocation]);
};

