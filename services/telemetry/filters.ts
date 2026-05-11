import { MIN_LOCATION_ACCURACY_METERS, MIN_MOVEMENT_METERS } from "@/services/telemetry/config";

type Vec3 = { x: number; y: number; z: number };

export type FilterState = {
  gravity: Vec3;
  accSmoothed: Vec3;
  gyroSmoothed: Vec3;
};

export const createInitialFilterState = (): FilterState => ({
  gravity: { x: 0, y: 0, z: 0 },
  accSmoothed: { x: 0, y: 0, z: 0 },
  gyroSmoothed: { x: 0, y: 0, z: 0 },
});

export const preprocessAccelerometer = (input: Vec3, state: FilterState): Vec3 | null => {
  const gravityAlpha = 0.9;
  const smoothAlpha = 0.25;

  state.gravity.x = gravityAlpha * state.gravity.x + (1 - gravityAlpha) * input.x;
  state.gravity.y = gravityAlpha * state.gravity.y + (1 - gravityAlpha) * input.y;
  state.gravity.z = gravityAlpha * state.gravity.z + (1 - gravityAlpha) * input.z;

  const hpX = input.x - state.gravity.x;
  const hpY = input.y - state.gravity.y;
  const hpZ = input.z - state.gravity.z;

  const scaledX = hpX * 9.81;
  const scaledY = hpY * 9.81;
  const scaledZ = hpZ * 9.81;
  const magnitude = Math.sqrt(scaledX ** 2 + scaledY ** 2 + scaledZ ** 2);

  if (magnitude > 20) {
    return null;
  }

  state.accSmoothed.x = smoothAlpha * scaledX + (1 - smoothAlpha) * state.accSmoothed.x;
  state.accSmoothed.y = smoothAlpha * scaledY + (1 - smoothAlpha) * state.accSmoothed.y;
  state.accSmoothed.z = smoothAlpha * scaledZ + (1 - smoothAlpha) * state.accSmoothed.z;

  return { ...state.accSmoothed };
};

export const preprocessGyroscope = (input: Vec3, state: FilterState): Vec3 => {
  const smoothAlpha = 0.2;
  state.gyroSmoothed.x = smoothAlpha * input.x + (1 - smoothAlpha) * state.gyroSmoothed.x;
  state.gyroSmoothed.y = smoothAlpha * input.y + (1 - smoothAlpha) * state.gyroSmoothed.y;
  state.gyroSmoothed.z = smoothAlpha * input.z + (1 - smoothAlpha) * state.gyroSmoothed.z;
  return { ...state.gyroSmoothed };
};

export const isLocationAcceptable = (accuracy: number | null | undefined): boolean => {
  return typeof accuracy === "number" && accuracy <= MIN_LOCATION_ACCURACY_METERS;
};

export const haversineMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const computeSegmentDistance = (
  prev: { latitude: number; longitude: number } | null,
  next: { latitude: number; longitude: number } | null
): number => {
  if (!prev || !next) return 0;
  const distance = haversineMeters(prev.latitude, prev.longitude, next.latitude, next.longitude);
  return distance < MIN_MOVEMENT_METERS ? 0 : distance;
};
