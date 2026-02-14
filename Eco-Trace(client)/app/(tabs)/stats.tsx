import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { AbstractChartConfig } from 'react-native-chart-kit/dist/AbstractChart';

const screenWidth = Dimensions.get('window').width;

// --- Types & Interfaces ---
type Period = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
type VehicleName = 'Car' | 'Bus' | 'Auto' | 'Bike';

interface VehicleData {
  id: string;
  name: VehicleName;
  icon: string;
  km: number;
  color: string;
}

// --- Constants & Color Logic ---
const COLORS = {
  low: '#1f7004',    // Your brand green
  mid: '#f1c40f',    // Yellow
  high: '#e74c3c',   // Red
};

const FACTORS: Record<string, number> = { 
  car: 0.17, 
  bus: 0.05, 
  auto: 0.08, 
  bike: 0.04 
};

const getStatusColor = (value: number, period: Period): string => {
  const multiplier: Record<Period, number> = { 
    Daily: 1, 
    Weekly: 7, 
    Monthly: 30, 
    Yearly: 365 
  };
  
  const lowLimit = 4 * multiplier[period];
  const midLimit = 10 * multiplier[period];

  if (value < lowLimit) return COLORS.low;
  if (value < midLimit) return COLORS.mid;
  return COLORS.high;
};

const getVehicleStats = (period: Period): VehicleData[] => {
  const multiplier = { Daily: 1, Weekly: 7, Monthly: 30, Yearly: 365 }[period];
  return [
    { id: '1', name: 'Car', icon: '🚗', km: 25 * multiplier, color: '#FF6B6B' },
    { id: '2', name: 'Bus', icon: '🚌', km: 15 * multiplier, color: '#4D96FF' },
    { id: '3', name: 'Auto', icon: '🛺', km: 10 * multiplier, color: '#FFD93D' },
    { id: '4', name: 'Bike', icon: '🏍️', km: 12 * multiplier, color: '#6BCB77' },
  ];
};

const VehicleStatsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Daily');
  const [vehicles, setVehicles] = useState<VehicleData[]>(getVehicleStats('Daily'));

  useEffect(() => {
    setVehicles(getVehicleStats(selectedPeriod));
  }, [selectedPeriod]);

  const totalEmissions = vehicles.reduce(
    (acc, v) => acc + v.km * (FACTORS[v.name.toLowerCase()] || 0), 
    0
  );
  
  const themeColor = getStatusColor(totalEmissions, selectedPeriod);

  const chartConfig: AbstractChartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => themeColor,
    strokeWidth: 3,
    decimalPlaces: 1,
    fillShadowGradient: themeColor,
    fillShadowGradientOpacity: 0.1,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, 0.6)`,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: themeColor,
      fill: "#fff"
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Eco-Trace Stats</Text>
          <Text style={styles.subtitle}>Impact Status: 
            <Text style={{ color: themeColor, fontWeight: 'bold' }}> 
              {themeColor === COLORS.low ? ' Excellent' : themeColor === COLORS.mid ? ' Moderate' : ' High'}
            </Text>
          </Text>
        </View>

        {/* Period Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as Period[]).map((p) => (
            <TouchableOpacity 
              key={p} 
              onPress={() => setSelectedPeriod(p)}
              style={[styles.filterBtn, selectedPeriod === p && { backgroundColor: themeColor }]}
            >
              <Text style={[styles.filterText, selectedPeriod === p && { color: '#fff' }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Summary Card */}
        <View style={[styles.mainCard, { backgroundColor: themeColor }]}>
          <Text style={styles.cardLabel}>Total {selectedPeriod} Footprint</Text>
          <Text style={styles.cardValue}>
            {totalEmissions.toFixed(1)} <Text style={{ fontSize: 18 }}>kg CO₂</Text>
          </Text>
          <View style={styles.badge}>
             <Text style={{ color: themeColor, fontWeight: 'bold', fontSize: 12 }}>
               {totalEmissions > (15 * (selectedPeriod === 'Daily' ? 1 : 7)) ? '⚠️ High Impact' : '🌿 Eco-Friendly'}
             </Text>
          </View>
        </View>

        {/* Vehicle Breakdown */}
        <Text style={styles.sectionTitle}>Vehicle Breakdown</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {vehicles.map((item) => (
            <View key={item.id} style={styles.vehicleCard}>
              <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              </View>
              <Text style={styles.vehicleName}>{item.name}</Text>
              <Text style={styles.vehicleKm}>{item.km} km</Text>
              <Text style={[styles.vehicleEm, { color: themeColor }]}>
                {(item.km * (FACTORS[item.name.toLowerCase()] || 0)).toFixed(1)} kg
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Scrollable Trend Chart */}
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>{selectedPeriod} Emission Trend</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <LineChart
              key={selectedPeriod + themeColor}
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{ data: Array.from({ length: 7 }, () => Math.random() * 20) }]
              }}
              // Width set larger than screen (600) to allow horizontal scrolling
              width={600} 
              height={220}
              yAxisSuffix="kg"
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </ScrollView>
          <Text style={styles.scrollHint}>Swipe left to view full week →</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBFC' },
  header: { padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  filterContainer: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 4, 
    marginBottom: 20, 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  filterText: { fontWeight: '700', color: '#888', fontSize: 13 },
  mainCard: { 
    marginHorizontal: 20, 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 25, 
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },
  cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  cardValue: { color: '#FFF', fontSize: 42, fontWeight: '900', marginTop: 5 },
  badge: { backgroundColor: '#FFF', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: 20, marginBottom: 15, color: '#333' },
  horizontalScroll: { paddingHorizontal: 20, marginBottom: 25 },
  vehicleCard: { 
    backgroundColor: '#FFF', 
    width: 120, 
    padding: 16, 
    borderRadius: 20, 
    marginRight: 15, 
    alignItems: 'center', 
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  iconBox: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  vehicleName: { fontWeight: '800', fontSize: 15, color: '#2c3e50' },
  vehicleKm: { fontSize: 12, color: '#7f8c8d', marginBottom: 4 },
  vehicleEm: { fontWeight: 'bold', fontSize: 14 },
  chartBox: { 
    backgroundColor: '#FFF', 
    marginHorizontal: 20, 
    padding: 20, 
    borderRadius: 24, 
    elevation: 4, 
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  chartTitle: { fontWeight: '700', fontSize: 16, marginBottom: 10, color: '#333' },
  chart: { borderRadius: 16, paddingRight: 50, marginTop: 10 },
  scrollHint: { textAlign: 'center', fontSize: 12, color: '#95a5a6', marginTop: 10, fontStyle: 'italic' }
});

export default VehicleStatsScreen;