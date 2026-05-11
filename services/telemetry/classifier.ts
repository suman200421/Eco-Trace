import { FeatureVector, MlOutput, PipelineState } from "@/services/telemetry/types";

export const isIdleWindow = (features: FeatureVector): boolean => {
  return (
    features.acc_rms_mean < 0.25 &&
    features.acc_mag_std < 0.35 &&
    features.gyro_mag_std < 0.08 &&
    features.speed_mean < 0.8
  );
};

export const inferVehicleType = (features: FeatureVector): MlOutput => {
  const motionScore = features.acc_mag_std + 0.8 * features.gyro_mag_std + 0.2 * features.speed_mean;

  if (features.speed_mean > 6.5 && features.gyro_mag_std < 0.45) {
    return { vehicle_type: "car", confidence: Math.min(0.98, 0.65 + motionScore / 10) };
  }

  if (features.gyro_mag_std > 0.7 && features.speed_mean > 3) {
    return { vehicle_type: "bike", confidence: Math.min(0.95, 0.6 + motionScore / 12) };
  }

  if (features.speed_mean > 4.5 && features.acc_mag_std < 1.1) {
    return { vehicle_type: "bus", confidence: Math.min(0.94, 0.58 + motionScore / 11) };
  }

  return { vehicle_type: "walking", confidence: Math.min(0.9, 0.5 + motionScore / 14) };
};

export const toPipelineState = (ml: MlOutput): PipelineState => {
  return ml.vehicle_type === "walking" ? "walking" : "vehicle";
};
