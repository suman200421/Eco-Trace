import React from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;
const BRAND_GREEN = '#117A0E';
const DARK_GREEN = '#075D16';
const LIGHT_GREEN_BG = '#E5F6E9';
const TEXT_DARK = '#101318';

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
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Hi EcoTrace User</Text>
          <Text style={styles.greetingSubtitle}>Track your impact today</Text>
        </View>

        {/* Today's footprint */}
        <LinearGradient
          colors={['#2E9322', '#177412', '#0E5C0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCard}
        >
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
              <Path
                d="M162 142 Q162 115 162 104"
                stroke="rgba(165,235,140,0.55)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d="M162 116 C142 116 134 102 136 90 C150 90 162 102 162 116 Z"
                fill="rgba(165,235,140,0.5)"
              />
              <Path
                d="M162 112 C164 95 178 84 192 86 C192 100 178 112 162 112 Z"
                fill="rgba(165,235,140,0.55)"
              />
            </Svg>
          </View>

          <View style={styles.cardHeaderRow}>
            <Text style={styles.scoreLabel}>Today's Footprint</Text>
            <View style={styles.statusBadge}>
              <MaterialCommunityIcons name="leaf" size={16} color={BRAND_GREEN} />
              <Text style={styles.statusText}>LOW IMPACT</Text>
            </View>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreValueWrap}>
              <Text style={styles.scoreValue}>{dailyFootprint.toFixed(1)}</Text>
              <Text style={styles.unit}>kg CO₂</Text>
            </View>

            <View style={styles.comparisonBadge}>
              <Ionicons name="arrow-down" size={14} color="#FFFFFF" />
              <Text style={styles.comparisonText}>12% vs yesterday</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Weekly trend */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <View style={styles.sectionIconCircle}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={21}
                  color={BRAND_GREEN}
                />
              </View>
              <Text style={styles.sectionTitle}>Weekly Emission Trend</Text>
            </View>

            <TouchableOpacity activeOpacity={0.7} style={styles.filterButton}>
              <Text style={styles.filterText}>This Week</Text>
              <Ionicons name="chevron-down" size={17} color={BRAND_GREEN} />
            </TouchableOpacity>
          </View>

          <View style={styles.chartCard}>
            <LineChart
              data={weeklyData}
              width={screenWidth - 44}
              height={220}
              segments={4}
              withShadow
              bezier
              fromZero={false}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                fillShadowGradientFrom: '#1B8A16',
                fillShadowGradientTo: '#FFFFFF',
                fillShadowGradientFromOpacity: 0.20,
                fillShadowGradientToOpacity: 0,
                decimalPlaces: 1,
                color: () => BRAND_GREEN,
                labelColor: () => '#626262',
                propsForDots: {
                  r: '4.5',
                  strokeWidth: '0',
                  fill: BRAND_GREEN,
                },
                propsForBackgroundLines: {
                  stroke: '#E9EDE9',
                  strokeWidth: 1,
                  strokeDasharray: '',
                },
              }}
              style={styles.chartStyle}
            />
          </View>
        </View>

        {/* Live activity */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <View style={styles.sectionIconCircle}>
                <Ionicons name="stats-chart" size={20} color={BRAND_GREEN} />
              </View>
              <Text style={styles.sectionTitle}>Live Activity Insights</Text>
            </View>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/start')}
            >
              <View style={styles.actionCardLeft}>
                <View style={styles.iconPill}>
                  <MaterialCommunityIcons
                    name="car"
                    size={29}
                    color={BRAND_GREEN}
                  />
                </View>
                <Text style={styles.actionLabel}>Transport</Text>
                <Text style={styles.actionSubLabel}>Start Tracking</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#111111" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.actionCard}
            >
              <View style={styles.actionCardLeft}>
                <View style={styles.iconPill}>
                  <Ionicons name="flash" size={27} color={BRAND_GREEN} />
                </View>
                <Text style={styles.actionLabel}>Electricity</Text>
                <Text style={styles.actionSubLabel}>Smart Sync On</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#111111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Environmental context */}
        <View style={styles.equivCard}>
          <View style={styles.environmentIllustration}>
            <MaterialCommunityIcons
              name="pine-tree"
              size={47}
              color="#3D9B43"
              style={styles.treeIcon}
            />
            <View style={styles.globeWrap}>
              <MaterialCommunityIcons
                name="earth"
                size={66}
                color="#238D78"
              />
            </View>
            <MaterialCommunityIcons
              name="sprout"
              size={37}
              color="#4A9D35"
              style={styles.sproutIcon}
            />
          </View>

          <View style={styles.equivDivider} />

          <View style={styles.equivContent}>
            <Text style={styles.equivTitle}>Environmental Context</Text>
            <Text style={styles.equivText}>
              Your CO₂ output today matches the absorption capacity of{' '}
              <Text style={styles.equivHighlight}>31 mature trees.</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 28,
  },
  greeting: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  greetingTitle: {
    color: '#102C25',
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    color: '#929292',
    fontSize: 17,
    marginTop: 2,
  },
  scoreCard: {
    marginHorizontal: 18,
    borderRadius: 25,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 21,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#0E5C0B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.20,
    shadowRadius: 10,
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
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 22,
    gap: 5,
  },
  statusText: {
    color: DARK_GREEN,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  scoreValueWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 58,
    fontWeight: '800',
    lineHeight: 64,
    letterSpacing: -1.2,
  },
  unit: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 7,
  },
  comparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.19)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 4,
    marginBottom: 5,
  },
  comparisonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionContainer: {
    marginTop: 23,
    paddingHorizontal: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LIGHT_GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    color: BRAND_GREEN,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    paddingTop: 10,
    paddingBottom: 2,
    paddingHorizontal: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F2F0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
  },
  chartStyle: {
    borderRadius: 17,
    paddingRight: 25,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minHeight: 143,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 15,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F0F2F0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
  },
  actionCardLeft: {
    flex: 1,
  },
  iconPill: {
    width: 70,
    height: 54,
    borderRadius: 28,
    backgroundColor: LIGHT_GREEN_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  actionSubLabel: {
    fontSize: 14,
    color: '#777777',
    marginTop: 3,
  },
  equivCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: 23,
    borderRadius: 22,
    padding: 13,
    minHeight: 125,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F2F0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
  },
  environmentIllustration: {
    width: 145,
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  treeIcon: {
    marginRight: -13,
    marginTop: 16,
  },
  globeWrap: {
    width: 67,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sproutIcon: {
    marginLeft: -10,
    marginTop: 16,
  },
  equivDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#D8E5D8',
    marginHorizontal: 10,
  },
  equivContent: {
    flex: 1,
    paddingVertical: 5,
  },
  equivTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 5,
  },
  equivText: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 19,
  },
  equivHighlight: {
    color: BRAND_GREEN,
    fontWeight: '800',
  },
});

export default EcoTraceHome;
