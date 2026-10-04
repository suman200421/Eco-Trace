export const DEBUG_MODE = true;

export const SENSOR_INTERVAL_MS = 100;

// 2-minute ML Inference Window
export const ML_INFERENCE_WINDOW_MS = 2 * 60 * 1000; // 120,000 ms (2 minutes)
export const ML_WINDOW_SAMPLES = Math.floor(ML_INFERENCE_WINDOW_MS / SENSOR_INTERVAL_MS); // 1200 samples

// Speed Gate Thresholds (in km/h)
// < 0.5 km/h  -> 'idle' locally
// 0.5 to < 5 km/h -> 'walk' locally
// >= 5 km/h   -> Send to Random Forest ML Pipeline
export const SPEED_GATE_IDLE_KMH = 0.5;
export const SPEED_GATE_WALK_KMH = 5.0;

// Conversion factors: 1 m/s = 3.6 km/h, 1 km/h = 1 / 3.6 m/s
export const MS_TO_KMH = 3.6;
export const KMH_TO_MS = 1 / 3.6;
export const SPEED_GATE_IDLE_MS = SPEED_GATE_IDLE_KMH * KMH_TO_MS; // ~0.13889 m/s
export const SPEED_GATE_WALK_MS = SPEED_GATE_WALK_KMH * KMH_TO_MS; // ~1.38889 m/s

// Legacy/local pipeline constants (for intermediate local updates)
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

