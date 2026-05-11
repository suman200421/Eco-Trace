export const DEBUG_MODE = true;

export const SENSOR_INTERVAL_MS = 100;
export const WINDOW_SECONDS = 5;
export const WINDOW_SIZE = Math.floor((WINDOW_SECONDS * 1000) / SENSOR_INTERVAL_MS);
export const STATE_PERSISTENCE_WINDOWS = 3;
export const PREDICTION_BUFFER_SIZE = 5;
export const MIN_PREDICTION_PERSISTENCE = 3;
export const DEBUG_FEATURE_BUFFER_SIZE = 50;
export const MIN_LOCATION_ACCURACY_METERS = 20;
export const MIN_MOVEMENT_METERS = 3;
export const SYNC_INTERVAL_MS = 10 * 60 * 1000;
export const SYNC_BATCH_SIZE = 150;
