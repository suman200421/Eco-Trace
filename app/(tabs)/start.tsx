import { useTelemetry } from "@/services/telemetry/TelemetryContext";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

// Design System Constants
const COLORS = {
  PRIMARY: "#00B386",
  DEEP: "#008F6B",
  MINT: "#EAFBF4",
  BG: "#F5F7F9",
  CARD: "#FFFFFF",
  TEXT_PRIMARY: "#0F172A",
  TEXT_SECONDARY: "#6B7280",
  BORDER: "#E5E7EB",
};

export default function Start() {
  const { isActive, pipelineState, vehicleType, startPipeline, stopPipeline } = useTelemetry();
  const [chartData, setChartData] = useState(Array(12).fill(20));

  const scale = useSharedValue(1);
  
  // Simulate live data for the chart when active
  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setChartData(prev => [...prev.slice(1), 20 + Math.random() * 40]);
      }, 500);
    } else {
      setChartData(Array(12).fill(15));
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const startButtonPress = () => {
    scale.value = withSequence(withSpring(1.2), withSpring(1));
    if (isActive) {
      stopPipeline();
    } else {
      startPipeline();
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => {
    if (!isActive) return { opacity: 0 };
    return {
      opacity: withRepeat(withSequence(withTiming(0.4, { duration: 1000 }), withTiming(0, { duration: 1000 })), -1),
      transform: [{ scale: withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(1.3, { duration: 1000 })), -1) }],
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            {/* <Text style={styles.welcomeText}>DASHBOARD</Text> */}
            {/* <Text style={styles.brandTitle}>Eco-Trace</Text> */}
          </View>
          {/* <TouchableOpacity style={styles.profileButton}>
            <View style={styles.notificationDot} />
            <Ionicons name="notifications-outline" size={22} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity> */}
        </View>

        <View style={styles.content}>
          {/* Main Status Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={isActive ? "analytics" : "leaf"} 
                  size={24} 
                  color={COLORS.PRIMARY} 
                />
              </View>
              <View style={styles.statusBadge}>
                <View style={[styles.dot, { backgroundColor: isActive ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY }]} />
                <Text style={styles.statusLabel}>
                  {isActive ? "LIVE TELEMETRY" : "STANDBY MODE"}
                </Text>
              </View>
            </View>

            <View style={styles.metricsContainer}>
              <View>
                <Text style={styles.metricLabel}>Current Activity</Text>
                <Text style={styles.metricValue}>
                  {isActive ? pipelineState.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "System Idle"}
                </Text>
              </View>
              {isActive && vehicleType && (
                <View style={styles.vehicleChip}>
                  <Ionicons name="car" size={14} color={COLORS.PRIMARY} />
                  <Text style={styles.vehicleChipText}>{vehicleType.toUpperCase()}</Text>
                </View>
              )}
            </View>

            {/* Analytics Visualizer */}
            <View style={styles.chartPlaceholder}>
              {chartData.map((val, i) => (
                <View 
                  key={i}
                  style={[
                    styles.chartBar, 
                    { 
                      height: val,
                      opacity: isActive ? 1 : 0.2,
                      backgroundColor: isActive ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY
                    }
                  ]} 
                />
              ))}
            </View>
          </View>

          {/* Environmental Insight Card */}
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightTitle}>Eco Insight</Text>
              <Text style={styles.insightDescription}>
                System is optimized for low-energy data collection.
              </Text>
            </View>
          </View>

          {/* Action Center */}
          <View style={styles.actionCenter}>
            <View style={styles.buttonWrapper}>
              <Animated.View style={[styles.pulseCircle, pulseStyle]} />
              <Animated.View style={animatedButtonStyle}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={startButtonPress}
                  style={[
                    styles.mainActionButton,
                    { backgroundColor: isActive ? "#FF4B4B" : COLORS.PRIMARY }
                  ]}
                >
                  <Ionicons
                    name={isActive ? "square" : "play"}
                    size={28}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
            <Text style={styles.actionTitle}>
              {isActive ? "Stop Tracking" : "Start Collection"}
            </Text>
            <Text style={styles.actionSubtitle}>
              {isActive ? "Telemetry is active and syncing" : "Ready to capture eco-data streams"}
            </Text>
          </View>
        </View>

        {/* Floating Bottom Nav - Removed as requested */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: -1,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.CARD,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  notificationDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4B4B",
    borderWidth: 2,
    borderColor: COLORS.CARD,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  mainCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.MINT,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.BG,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 0.8,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "500",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
  },
  vehicleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.MINT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  vehicleChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.PRIMARY,
    marginLeft: 6,
  },
  chartPlaceholder: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 4,
  },
  chartBar: {
    width: (width - 120) / 12,
    borderRadius: 10,
  },
  insightCard: {
    flexDirection: "row",
    backgroundColor: COLORS.MINT,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 40,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.CARD,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.PRIMARY,
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: 12,
    color: COLORS.DEEP,
    opacity: 0.8,
  },
  actionCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  pulseCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  mainActionButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  actionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6,
  },
  actionSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});