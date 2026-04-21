import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';

// --- Constants & Types ---
type Period = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

const VEHICLE_DATA = [
  { name: 'Car', km: 30, co2: 91.3, percentage: 48, color: '#FF6B6B', icon: '🚗' },
  { name: 'Bus', km: 12, co2: 22.5, percentage: 19, color: '#4D96FF', icon: '🚌' },
  { name: 'Train', km: 10, co2: 18.8, percentage: 16, color: '#FFB800', icon: '🚆' },
  { name: 'Bike', km: 5, co2: 12.0, percentage: 8, color: '#6BCB77', icon: '🚲' },
  { name: 'Others', km: 5.7, co2: 10.0, percentage: 9, color: '#D1D1D1', icon: '⋯' },
];

const EcoTraceStats: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Monthly');

  const periods: Period[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Eco-Trace Stats</Text>
          <Text style={styles.subtitle}>
            Impact Status: <Text style={styles.statusYellow}>Moderate</Text>
          </Text>
        </View>

        {/* --- Tab Switcher (Pill Style) --- */}
        <View style={styles.tabWrapper}>
          <View style={styles.tabBackground}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedPeriod(p)}
                style={[styles.tabItem, selectedPeriod === p && styles.activeTabItem]}
              >
                <Text style={[styles.tabText, selectedPeriod === p && styles.activeTabText]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- Footprint Card --- */}
        <View style={styles.mainCard}>
          <Text style={styles.cardLabel}>Total {selectedPeriod} Footprint</Text>
          <Text style={styles.cardValue}>188.4 <Text style={styles.unitText}>kg CO₂</Text></Text>
          <View style={styles.actionBadge}>
            <Text style={styles.actionText}>⚠️ Action Required</Text>
          </View>
        </View>

        {/* --- Breakdown Section --- */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.sectionTitle}>Vehicle Breakdown</Text>
          
          <View style={styles.sideBySideRow}>
            
            {/* Left Column: Donut Visualization */}
            <View style={styles.chartCol}>
              <View style={styles.donutWrapper}>
                <Svg height="150" width="150" viewBox="0 0 100 100">
                  <G rotation="-90" origin="50, 50">
                    <Circle cx="50" cy="50" r="38" stroke="#F0F0F0" strokeWidth="8" fill="none" />
                    {/* Segment 1: Car */}
                    <Circle cx="50" cy="50" r="38" stroke="#FF6B6B" strokeWidth="10" fill="none" strokeDasharray="238.7" strokeDashoffset={238.7 * (1 - 0.48)} />
                    {/* Segment 2: Bus (Calculated Offset) */}
                    <Circle cx="50" cy="50" r="38" stroke="#4D96FF" strokeWidth="10" fill="none" strokeDasharray="238.7" strokeDashoffset={238.7 * (1 - 0.19)} transform="rotate(172, 50, 50)" />
                  </G>
                </Svg>
                <View style={styles.chartCenterText}>
                  <Text style={styles.innerSmallLabel}>Total Distance</Text>
                  <Text style={styles.innerBigValue}>62.7 km</Text>
                  <Text style={styles.innerSmallSubValue}>188.4 kg CO₂</Text>
                </View>
              </View>
              
              <View style={styles.chartFooter}>
                <Text style={styles.footerDash}>— Total Distance —</Text>
                <Text style={styles.footerFinalValue}>188.4 kg CO₂</Text>
              </View>
            </View>

            {/* Right Column: Progress List */}
            <View style={styles.listCol}>
              {VEHICLE_DATA.map((item, index) => (
                <View key={index} style={styles.statRow}>
                  <Text style={styles.rowIcon}>{item.icon}</Text>
                  <View style={styles.rowContent}>
                    <View style={styles.rowTopLine}>
                      <Text style={styles.vehicleName}>{item.name}</Text>
                      <Text style={styles.vehicleKm}>{item.km} km</Text>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                    </View>
                    <Text style={styles.rowBottomLine}>{item.co2}kg {item.percentage}%</Text>
                  </View>
                </View>
              ))}
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 4 },
  statusYellow: { color: '#FFB800', fontWeight: 'bold' },

  // Tabs Styling
  tabWrapper: { paddingHorizontal: 20, marginVertical: 15 },
  tabBackground: { flexDirection: 'row', backgroundColor: '#F2F2F2', borderRadius: 12, padding: 4 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabItem: { backgroundColor: '#FFB800' },
  tabText: { color: '#999', fontWeight: '600', fontSize: 13 },
  activeTabText: { color: '#FFF' },

  // Card Styling
  mainCard: { backgroundColor: '#FFB800', marginHorizontal: 20, borderRadius: 25, padding: 25, height: 180, justifyContent: 'center' },
  cardLabel: { color: '#FFF', fontSize: 15, opacity: 0.9 },
  cardValue: { color: '#FFF', fontSize: 42, fontWeight: 'bold', marginVertical: 5 },
  unitText: { fontSize: 18, fontWeight: 'normal' },
  actionBadge: { backgroundColor: '#FFF', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 15, marginTop: 5 },
  actionText: { color: '#FFB800', fontWeight: 'bold', fontSize: 12 },

  // Breakdown Section
  breakdownContainer: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  sideBySideRow: { flexDirection: 'row' },
  
  // Left: Chart
  chartCol: { flex: 0.45, alignItems: 'center' },
  donutWrapper: { justifyContent: 'center', alignItems: 'center' },
  chartCenterText: { position: 'absolute', alignItems: 'center' },
  innerSmallLabel: { fontSize: 10, color: '#BBB' },
  innerBigValue: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  innerSmallSubValue: { fontSize: 12, color: '#FFB800', fontWeight: '700' },
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
});

export default EcoTraceStats;