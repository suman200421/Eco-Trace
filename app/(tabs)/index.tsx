import React from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle, Polygon, Rect, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;
const BRAND_GREEN = '#117A0E';
const LIGHT_GREEN_BG = '#E6F5E6';

const EcoTraceHome: React.FC = () => {
  const dailyFootprint = 6.2;

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [4.5, 8.1, 5.2, 6.2, 4.8, 9.5, 3.2],
        color: () => BRAND_GREEN,
        strokeWidth: 2.5,
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Main Impact Card --- */}
        <View style={styles.scoreCard}>
          {/* Background Gradient (SVG-based for universal cross-platform compatibility) */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <SvgLinearGradient id="scoreCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#2E9322" stopOpacity="1" />
                  <Stop offset="50%" stopColor="#177412" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#0E5C0B" stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#scoreCardGrad)" />
            </Svg>
          </View>
          {/* Decorative background curve & sprout */}
          <View style={styles.cardDecorContainer} pointerEvents="none">
            <Svg width="200" height="160" viewBox="0 0 200 160">
              <Path
                d="M40 160 C80 90, 140 50, 200 30 L200 160 Z"
                fill="rgba(255,255,255,0.06)"
              />
              <Path
                d="M115 160 C135 125, 170 115, 200 125 L200 160 Z"
                fill="rgba(0,0,0,0.12)"
              />
              {/* Sprout stem */}
              <Path
                d="M162 142 Q162 115 162 104"
                stroke="rgba(165, 235, 140, 0.45)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Left leaf */}
              <Path
                d="M162 116 C142 116, 134 102, 136 90 C150 90, 162 102, 162 116 Z"
                fill="rgba(165, 235, 140, 0.4)"
              />
              {/* Right leaf */}
              <Path
                d="M162 112 C164 95, 178 84, 192 86 C192 100, 178 112, 162 112 Z"
                fill="rgba(165, 235, 140, 0.45)"
              />
            </Svg>
          </View>

          <View style={styles.cardHeaderRow}>
            <Text style={styles.scoreLabel}>Today's Footprint</Text>
            <View style={styles.statusBadge}>
              <MaterialCommunityIcons name="leaf" size={14} color={BRAND_GREEN} />
              <Text style={styles.statusText}>LOW IMPACT</Text>
            </View>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreValueWrap}>
              <Text style={styles.scoreValue}>{dailyFootprint}</Text>
              <Text style={styles.unit}>kg CO₂</Text>
            </View>

            <View style={styles.comparisonBadge}>
              <Ionicons name="arrow-down" size={13} color="#FFFFFF" />
              <Text style={styles.comparisonText}>12% vs yesterday</Text>
            </View>
          </View>
        </View>

        {/* --- Weekly Trend Line Chart --- */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <View style={styles.sectionIconCircle}>
                <MaterialCommunityIcons name="trending-up" size={20} color={BRAND_GREEN} />
              </View>
              <Text style={styles.sectionTitle}>Weekly Emission Trend</Text>
            </View>

            <TouchableOpacity activeOpacity={0.7} style={styles.filterButton}>
              <Text style={styles.filterText}>This Week</Text>
              <Ionicons name="chevron-down" size={16} color={BRAND_GREEN} />
            </TouchableOpacity>
          </View>

          <View style={styles.chartCard}>
            <LineChart
              data={weeklyData}
              width={screenWidth - 44}
              height={195}
              segments={4}
              withShadow
              bezier
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                fillShadowGradientFrom: '#1B8A16',
                fillShadowGradientTo: '#FFFFFF',
                fillShadowGradientFromOpacity: 0.18,
                fillShadowGradientToOpacity: 0.0,
                decimalPlaces: 1,
                color: () => BRAND_GREEN,
                labelColor: () => '#666666',
                propsForDots: {
                  r: '5',
                  strokeWidth: '0',
                  fill: BRAND_GREEN,
                },
                propsForBackgroundLines: {
                  stroke: '#EFEFEF',
                  strokeWidth: 1,
                  strokeDasharray: '',
                },
              }}
              style={styles.chartStyle}
            />
          </View>
        </View>

        {/* --- Live Activity Insights --- */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <View style={styles.sectionIconCircle}>
                <Ionicons name="stats-chart" size={18} color={BRAND_GREEN} />
              </View>
              <Text style={styles.sectionTitle}>Live Activity Insights</Text>
            </View>
          </View>

          <View style={styles.actionGrid}>
            {/* Transport Tile */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/start')}
            >
              <View style={styles.actionCardLeft}>
                <View style={styles.iconPill}>
                  <MaterialCommunityIcons name="car" size={26} color={BRAND_GREEN} />
                </View>
                <Text style={styles.actionLabel}>Transport</Text>
                <Text style={styles.actionSubLabel}>Start Tracking</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#222222" />
            </TouchableOpacity>

            {/* Electricity Tile */}
            <TouchableOpacity activeOpacity={0.7} style={styles.actionCard}>
              <View style={styles.actionCardLeft}>
                <View style={styles.iconPill}>
                  <Ionicons name="flash" size={24} color={BRAND_GREEN} />
                </View>
                <Text style={styles.actionLabel}>Electricity</Text>
                <Text style={styles.actionSubLabel}>Smart Sync On</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#222222" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Environmental Context Card --- */}
        <View style={styles.equivCard}>
          <View style={styles.equivIllustration}>
            <Svg width="128" height="106" viewBox="0 0 128 106">
              {/* Soft green ground hill */}
              <Path
                d="M0 95 Q35 72 72 82 Q100 88 128 78 L128 106 L0 106 Z"
                fill="#A7DC8A"
              />
              <Path
                d="M0 100 Q45 84 95 96 L128 92 L128 106 L0 106 Z"
                fill="#8BCE6B"
              />
              {/* Pine tree */}
              <Rect x="25" y="68" width="5" height="22" rx="1.5" fill="#7D5A44" />
              <Polygon points="27.5,20 11,48 44,48" fill="#4BA845" />
              <Polygon points="27.5,33 8,62 47,62" fill="#3C9438" />
              <Polygon points="27.5,47 6,74 49,74" fill="#2E7F2B" />

              {/* Earth globe */}
              <Circle cx="72" cy="60" r="28" fill="#42A68C" />
              <G opacity="0.85">
                <Path
                  d="M55 44 Q64 40 68 48 Q72 56 64 62 Q56 66 52 56 Z"
                  fill="#8AD48E"
                />
                <Path
                  d="M78 38 Q88 42 90 52 Q84 58 76 54 Q72 48 78 38 Z"
                  fill="#8AD48E"
                />
                <Path
                  d="M70 64 Q82 62 88 72 Q82 82 70 80 Q64 74 70 64 Z"
                  fill="#8AD48E"
                />
              </G>

              {/* Leafy sprig */}
              <Path
                d="M110 85 Q111 60 114 40"
                stroke="#3C9438"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d="M111 72 C102 68 100 60 105 56 C110 60 112 66 111 72 Z"
                fill="#60B84F"
              />
              <Path
                d="M112 62 C119 57 122 49 117 45 C112 49 111 56 112 62 Z"
                fill="#74C662"
              />
              <Path
                d="M113 48 C108 42 110 34 115 32 C119 37 117 44 113 48 Z"
                fill="#60B84F"
              />
            </Svg>
          </View>

          <View style={styles.equivContent}>
            <Text style={styles.equivTitle}>Environmental Context</Text>
            <Text style={styles.equivText}>
              Your CO₂ output today matches the absorption capacity of{' '}
              <Text style={styles.equivHighlight}>31 mature trees.</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* --- Bottom Navigation Bar --- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity activeOpacity={0.7} style={styles.navItem}>
          <Ionicons name="home" size={22} color={BRAND_GREEN} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
          <View style={styles.activeIndicator} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={styles.navItem}>
          <Ionicons name="stats-chart-outline" size={22} color="#1A1A1A" />
          <Text style={styles.navLabel}>Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.centerFab}
          onPress={() => router.push('/(tabs)/start')}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={styles.navItem}>
          <Ionicons name="notifications-outline" size={22} color="#1A1A1A" />
          <Text style={styles.navLabel}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={styles.navItem}>
          <Ionicons name="person-outline" size={22} color="#1A1A1A" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 28,
  },

  /* Main Impact Card */
  scoreCard: {
    marginHorizontal: 18,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    overflow: 'hidden',
    backgroundColor: '#177412',
    elevation: 6,
    shadowColor: '#0E5C0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  cardDecorContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  statusText: {
    color: BRAND_GREEN,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  scoreValueWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '800',
    lineHeight: 56,
  },
  unit: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 6,
  },
  comparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    marginBottom: 4,
  },
  comparisonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Sections */
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LIGHT_GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_GREEN,
  },

  /* Chart Card */
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingTop: 16,
    paddingBottom: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F2F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  chartStyle: {
    borderRadius: 16,
    paddingRight: 28,
  },

  /* Live Activity Insights */
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F0F2F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  actionCardLeft: {
    flex: 1,
  },
  iconPill: {
    width: 56,
    height: 44,
    borderRadius: 22,
    backgroundColor: LIGHT_GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  actionSubLabel: {
    fontSize: 13,
    color: '#777777',
    marginTop: 3,
  },

  /* Environmental Context Card */
  equivCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: 22,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F2F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  equivIllustration: {
    width: 128,
    height: 106,
    backgroundColor: '#F6FAF6',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  equivContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  equivTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  equivText: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 19,
  },
  equivHighlight: {
    color: BRAND_GREEN,
    fontWeight: '700',
  },

  /* Bottom Navigation */
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  navLabel: {
    fontSize: 11,
    color: '#222222',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: BRAND_GREEN,
    fontWeight: '700',
  },
  activeIndicator: {
    width: 44,
    height: 3,
    backgroundColor: BRAND_GREEN,
    borderRadius: 2,
    marginTop: 4,
  },
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BRAND_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0E5C0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});

export default EcoTraceHome;