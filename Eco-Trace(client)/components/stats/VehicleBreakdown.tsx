import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { StatsData, VehicleType, VEHICLE_COLORS, ImpactStatus } from './types';

interface VehicleBreakdownProps {
  statsData: StatsData | null;
  loading: boolean;
  error: string | null;
  impact: ImpactStatus;
}

export const VehicleBreakdown: React.FC<VehicleBreakdownProps> = ({ statsData, loading, error, impact }) => {
  // Get vehicle icon based on type
  const getVehicleIcon = (type: VehicleType): string => {
    const iconMap: Record<VehicleType, string> = {
      car: '🚗',
      bus: '🚌',
      train: '🚆',
      bike: '🚲',
      others: '⋯',
    };
    return iconMap[type];
  };

  // Get vehicle display name
  const getVehicleName = (type: VehicleType): string => {
    const nameMap: Record<VehicleType, string> = {
      car: 'Car',
      bus: 'Bus',
      train: 'Train',
      bike: 'Bike',
      others: 'Others',
    };
    return nameMap[type];
  };

  return (
    <View style={styles.breakdownContainer}>
      <Text style={styles.sectionTitle}>Vehicle Breakdown</Text>
      
      <View style={styles.sideBySideRow}>
        
        {/* Left Column: Donut Visualization */}
        <View style={styles.chartCol}>
          <View style={styles.donutWrapper}>
            <Svg height="150" width="150" viewBox="0 0 100 100">
              <G rotation="-90" origin="50, 50">
                <Circle cx="50" cy="50" r="38" stroke="#F0F0F0" strokeWidth="8" fill="none" />
                {statsData?.vehicles && statsData.vehicles.map((vehicle, index) => {
                  const circumference = 238.7;
                  const cumulativePercentage = statsData.vehicles.slice(0, index).reduce((sum, v) => sum + v.percentage, 0);
                  const offset = circumference * (1 - (vehicle.percentage / 100));
                  const rotation = (cumulativePercentage / 100) * 360;
                  
                  return (
                    <Circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="38"
                      stroke={VEHICLE_COLORS[vehicle.type]}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      transform={`rotate(${rotation}, 50, 50)`}
                    />
                  );
                })}
              </G>
            </Svg>
            <View style={styles.chartCenterText}>
              <Text style={styles.innerSmallLabel}>Total Emission</Text>
              <Text style={styles.innerBigValue}>{statsData?.total.carbon_kg.toFixed(2) || '0'} kg CO₂</Text>
              <Text style={[styles.innerSmallSubValue, { color: impact.color }]}>{statsData?.total.distance_km.toFixed(2) || '0'} km</Text>
            </View>
          </View>
          
          <View style={styles.chartFooter}>
            <Text style={styles.footerDash}>— Total Distance —</Text>
            <Text style={styles.footerFinalValue}>{statsData?.total.distance_km.toFixed(2) || '0'} km</Text>
          </View>
        </View>

        {/* Right Column: Progress List */}
        <View style={styles.listCol}>
          {loading ? (
            <Text style={styles.loadingText}>Loading vehicles...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : statsData?.vehicles && statsData.vehicles.length > 0 ? (
            statsData.vehicles.map((item, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.rowIcon}>{getVehicleIcon(item.type)}</Text>
                <View style={styles.rowContent}>
                  <View style={styles.rowTopLine}>
                    <Text style={styles.vehicleName}>{getVehicleName(item.type)}</Text>
                    <Text style={styles.vehicleKm}>{item.carbon_kg.toFixed(2)} kg CO₂</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${item.percentage}%`,
                          backgroundColor: VEHICLE_COLORS[item.type],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.rowBottomLine}>
                    {item.distance_km.toFixed(2)} km {item.percentage}%
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No vehicle data available</Text>
          )}
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  breakdownContainer: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  sideBySideRow: { flexDirection: 'row' },
  
  // Left: Chart
  chartCol: { flex: 0.45, alignItems: 'center' },
  donutWrapper: { justifyContent: 'center', alignItems: 'center' },
  chartCenterText: { position: 'absolute', alignItems: 'center' },
  innerSmallLabel: { fontSize: 10, color: '#BBB' },
  innerBigValue: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  innerSmallSubValue: { fontSize: 12, fontWeight: '700' },
  chartFooter: { marginTop: 15, alignItems: 'center' },
  footerDash: { fontSize: 11, color: '#CCC' },
  footerFinalValue: { fontSize: 18, fontWeight: 'bold', color: '#3E2723' },

  // Right: Progress bars
  listCol: { flex: 0.55, paddingLeft: 10 },
  statRow: { flexDirection: 'row', marginBottom: 15 },
  rowIcon: { fontSize: 18, marginRight: 8, marginTop: 2 },
  rowContent: { flex: 1 },
  rowTopLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  vehicleName: { fontSize: 13, fontWeight: '700', color: '#333' },
  vehicleKm: { fontSize: 13, fontWeight: '700', color: '#333' },
  barBg: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  rowBottomLine: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 2 },
  
  // Loading & Error States
  loadingText: { fontSize: 14, color: '#999', textAlign: 'center', marginVertical: 20 },
  errorText: { fontSize: 14, color: '#FF6B6B', textAlign: 'center', marginVertical: 20 },
  noDataText: { fontSize: 14, color: '#999', textAlign: 'center', marginVertical: 20 },
});
