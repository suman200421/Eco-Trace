export type Period = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
export type VehicleType = 'car' | 'bus' | 'train' | 'bike' | 'others';

export interface Vehicle {
  type: VehicleType;
  distance_km: number;
  carbon_kg: number;
  percentage: number;
}

export interface StatsData {
  range: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  total: {
    distance_km: number;
    carbon_kg: number;
  };
  vehicles: Vehicle[];
}

export const VEHICLE_COLORS: Record<VehicleType, string> = {
  car: '#FF6B6B',
  bus: '#4D96FF',
  train: '#FFB800',
  bike: '#6BCB77',
  others: '#D1D1D1',
};

export interface ImpactStatus {
  label: string;
  color: string;
  message: string;
  icon: string;
}
