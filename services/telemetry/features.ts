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

/**
 * Calculates the exact 13 aggregate statistics required by the Random Forest ML service
 * from a completed 2-minute window of motion samples.
 */
export const computeRawSensorFeatures = (samples: MotionSample[]): import("./types").RawSensorFeatures => {
  if (samples.length === 0) {
    return {
      ax_mean: 0,
      ay_mean: 0,
      az_mean: 1.0,
      ax_std: 0,
      ay_std: 0,
      az_std: 0,
      magnitude_mean: 1.0,
      magnitude_std: 0,
      rms: 1.0,
      speed: 0,
      speed_std: 0,
      gyro_magnitude_mean: 0,
      gyro_magnitude_std: 0,
    };
  }

  const ax = samples.map((s) => s.accX);
  const ay = samples.map((s) => s.accY);
  const az = samples.map((s) => s.accZ);
  const speeds = samples.map((s) => s.speed);
  const gyroMags = samples.map((s) => Math.sqrt(s.gyroX ** 2 + s.gyroY ** 2 + s.gyroZ ** 2));
  const accMags = samples.map((s) => Math.sqrt(s.accX ** 2 + s.accY ** 2 + s.accZ ** 2));
  const accRmsList = samples.map((s) => Math.sqrt((s.accX ** 2 + s.accY ** 2 + s.accZ ** 2) / 3));

  const ax_mean = mean(ax);
  const ay_mean = mean(ay);
  const az_mean = mean(az);
  const ax_std = std(ax, ax_mean);
  const ay_std = std(ay, ay_mean);
  const az_std = std(az, az_mean);

  const magnitude_mean = mean(accMags);
  const magnitude_std = std(accMags, magnitude_mean);
  const rms = mean(accRmsList);

  const speed = mean(speeds);
  const speed_std = std(speeds, speed);

  const gyro_magnitude_mean = mean(gyroMags);
  const gyro_magnitude_std = std(gyroMags, gyro_magnitude_mean);

  return {
    ax_mean,
    ay_mean,
    az_mean,
    ax_std,
    ay_std,
    az_std,
    magnitude_mean,
    magnitude_std,
    rms,
    speed,
    speed_std,
    gyro_magnitude_mean,
    gyro_magnitude_std,
  };
};
