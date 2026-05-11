import { FeatureVector, MotionSample } from "@/services/telemetry/types";

const mean = (values: number[]): number => {
  if (values.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) sum += values[i];
  return sum / values.length;
};

const std = (values: number[], m: number): number => {
  if (values.length === 0) return 0;
  let variance = 0;
  for (let i = 0; i < values.length; i += 1) {
    const delta = values[i] - m;
    variance += delta * delta;
  }
  return Math.sqrt(variance / values.length);
};

export const extractFeatureVector = (window: MotionSample[]): FeatureVector => {
  const accX = window.map((s) => s.accX);
  const accY = window.map((s) => s.accY);
  const accZ = window.map((s) => s.accZ);
  const gyroMag = window.map((s) => Math.sqrt(s.gyroX ** 2 + s.gyroY ** 2 + s.gyroZ ** 2));
  const accMag = window.map((s) => Math.sqrt(s.accX ** 2 + s.accY ** 2 + s.accZ ** 2));
  const speed = window.map((s) => s.speed);
  const accRms = window.map((s) => Math.sqrt((s.accX ** 2 + s.accY ** 2 + s.accZ ** 2) / 3));

  const acc_mean_x = mean(accX);
  const acc_mean_y = mean(accY);
  const acc_mean_z = mean(accZ);
  const acc_std_x = std(accX, acc_mean_x);
  const acc_std_y = std(accY, acc_mean_y);
  const acc_std_z = std(accZ, acc_mean_z);
  const acc_mag_mean = mean(accMag);
  const acc_mag_std = std(accMag, acc_mag_mean);
  const acc_rms_mean = mean(accRms);
  const gyro_mag_mean = mean(gyroMag);
  const gyro_mag_std = std(gyroMag, gyro_mag_mean);
  const speed_mean = mean(speed);
  const speed_std = std(speed, speed_mean);

  return {
    acc_mean_x,
    acc_mean_y,
    acc_mean_z,
    acc_std_x,
    acc_std_y,
    acc_std_z,
    acc_mag_mean,
    acc_mag_std,
    acc_rms_mean,
    gyro_mag_mean,
    gyro_mag_std,
    speed_mean,
    speed_std,
  };
};
