import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const BRAND_GREEN = "#1f7004";

const EcoTraceHome: React.FC = () => {
  const dailyFootprint = 6.2; 
  
  const weeklyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      data: [4.5, 8.1, 5.2, 6.2, 4.8, 9.5, 3.2],
      color: (opacity = 1) => BRAND_GREEN, 
      strokeWidth: 3
    }]
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Eco-Warrior!</Text>
            <Text style={styles.date}>Sunday, April 26</Text>
          </View>
          <View style={styles.profileCircle} />
        </View>

        {/* --- Main Impact Card --- */}
        <View style={[styles.scoreCard, { backgroundColor: BRAND_GREEN }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.scoreLabel}>Today's Footprint</Text>
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, { color: BRAND_GREEN }]}>Low Impact</Text>
            </View>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>{dailyFootprint} <Text style={styles.unit}>kg CO₂</Text></Text>
            <View style={styles.comparisonBadge}>
              <Text style={styles.comparisonText}>↓ 12% vs yesterday</Text>
            </View>
          </View>
        </View>

        {/* --- Weekly Trend Line Chart --- */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly Emission Trend</Text>
          <View style={styles.chartWrapper}>
            <LineChart
              data={weeklyData}
              width={screenWidth - 40}
              height={200}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 1,
                color: (opacity = 1) => BRAND_GREEN,
                labelColor: (opacity = 1) => `#999`,
                propsForDots: { r: "5", strokeWidth: "2", stroke: BRAND_GREEN },
                propsForBackgroundLines: { stroke: "#F0F0F0", strokeDasharray: "" }
              }}
              bezier
              style={styles.chartStyle}
            />
          </View>
        </View>

        {/* --- Automatic Activity Insights --- */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Live Activity Insights</Text>
          <View style={styles.actionGrid}>
            
            {/* Transport Tile */}
            <TouchableOpacity activeOpacity={0.7} style={styles.actionButton}>
              <View style={[styles.iconBox, { backgroundColor: BRAND_GREEN + '15' }]}>
                <Text style={{fontSize: 24}}>🚗</Text>
              </View>
              <View style={styles.actionTextContent}>
                <Text style={styles.actionLabel}>Transport</Text>
                <Text style={styles.actionSubLabel}>Active tracking</Text>
              </View>
            </TouchableOpacity>

            {/* Electricity Tile */}
            <TouchableOpacity activeOpacity={0.7} style={styles.actionButton}>
              <View style={[styles.iconBox, { backgroundColor: BRAND_GREEN + '15' }]}>
                <Text style={{fontSize: 24}}>⚡</Text>
              </View>
              <View style={styles.actionTextContent}>
                <Text style={styles.actionLabel}>Electricity</Text>
                <Text style={styles.actionSubLabel}>Smart Sync on</Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* --- Environmental Context Card --- */}
        <View style={styles.equivCard}>
          <Text style={styles.equivTitle}>Environmental Context</Text>
          <View style={styles.equivRow}>
            <Text style={styles.equivEmoji}>🌳</Text>
            <Text style={styles.equivText}>
              Your CO₂ output today matches the absorption capacity of 
              <Text style={{fontWeight: 'bold', color: BRAND_GREEN}}> 31 mature trees</Text>.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  date: { fontSize: 14, color: '#888', marginTop: 2 },
  profileCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0' },

  scoreCard: { marginHorizontal: 20, borderRadius: 28, padding: 24, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  statusBadge: { backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  scoreValue: { color: '#FFF', fontSize: 44, fontWeight: 'bold' },
  unit: { fontSize: 18, fontWeight: 'normal' },
  comparisonBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  comparisonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  chartSection: { marginTop: 30, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
  chartWrapper: { backgroundColor: '#FFF', borderRadius: 24, alignItems: 'center' },
  chartStyle: { borderRadius: 16, paddingRight: 40 },

  activitySection: { marginTop: 30, paddingHorizontal: 20 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { 
    flex: 0.48, 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 24, 
    flexDirection: 'column', 
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 1
  },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTextContent: { width: '100%' },
  actionLabel: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  actionSubLabel: { fontSize: 12, color: '#999', marginTop: 2 },

  equivCard: { backgroundColor: '#F9F9F9', marginHorizontal: 20, padding: 20, borderRadius: 24, marginTop: 30 },
  equivTitle: { fontSize: 14, fontWeight: '700', color: '#666', marginBottom: 10 },
  equivRow: { flexDirection: 'row', alignItems: 'center' },
  equivEmoji: { fontSize: 36, marginRight: 15 },
  equivText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 22 },
});

export default EcoTraceHome;