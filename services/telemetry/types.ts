export type MotionSample = {
  timestamp: number;
  accX: number;
  accY: number;
  accZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  speed: number;
  latitude: number | null;
  longitude: number | null;
};

export type FeatureVector = {
  acc_mean_x: number;
  acc_mean_y: number;
  acc_mean_z: number;
  acc_std_x: number;
  acc_std_y: number;
  acc_std_z: number;
  acc_mag_mean: number;
  acc_mag_std: number;
  acc_rms_mean: number;
  gyro_mag_mean: number;
  gyro_mag_std: number;
  speed_mean: number;
  speed_std: number;
};

export type PipelineState = "idle" | "walking" | "vehicle";

export type MlOutput = {
  vehicle_type: "car" | "bike" | "bus" | "walking";
  confidence: number;
};

export type PersistedRecord = {
  id?: number;
  timestamp: number;
  latitude: number | null;
  longitude: number | null;
  distance_5s: number;
  state: PipelineState;
  vehicle_type: string | null;
  confidence: number | null;
  synced: number;
};

export type RawSensorFeatures = {
  ax_mean: number;
  ay_mean: number;
  az_mean: number;
  ax_std: number;
  ay_std: number;
  az_std: number;
  magnitude_mean: number;
  magnitude_std: number;
  rms: number;
  speed: number;
  speed_std: number;
  gyro_magnitude_mean: number;
  gyro_magnitude_std: number;
};

export type MlPredictionResult = {
  windowId?: string | null;
  windowIndex?: number | null;
  durationMs: number;
  mode: string;
  confidence: number;
  confidence_percent: number;
  probabilities: Record<string, number>;
  predictedAt: string;
};
