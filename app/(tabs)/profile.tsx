import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React, { ReactNode, useRef } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { logout as logoutUser } from "../../lib/auth";
import { signOutFromGoogle } from "../../lib/googleSignIn";

const palette = {
  background: "#F5F7F9",
  card: "#FFFFFF",
  accent: "#4CAF7D",
  accentSoft: "#EAF7F0",
  text: "#0F172A",
  subText: "#64748B",
  border: "#E2E8F0",
  danger: "#DC2626",
};

type IconName = React.ComponentProps<typeof Feather>["name"];

type PressScaleProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

function PressScale({ children, onPress, style, contentStyle }: PressScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 32,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.98)}
        onPressOut={() => animateTo(1)}
        style={[styles.pressScalePressable, contentStyle]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const summaryCards: {
  label: string;
  value: string;
  detail: string;
  icon: IconName;
}[] = [
  { label: "Trips Tracked", value: "128", detail: "+12 this month", icon: "map" },
  { label: "CO2 Saved", value: "42kg", detail: "vs solo car rides", icon: "wind" },
  { label: "Eco Score", value: "86", detail: "Top 15% locally", icon: "trending-up" },
  { label: "Active Days", value: "24", detail: "Current streak", icon: "calendar" },
];

const actionRows: {
  title: string;
  description: string;
  icon: IconName;
  danger?: boolean;
}[] = [
  {
    title: "Edit Profile",
    description: "Update your personal details",
    icon: "user",
  },
  {
    title: "Saved Routes",
    description: "Manage frequent eco-friendly routes",
    icon: "bookmark",
  },
  {
    title: "Notifications",
    description: "Control alerts and reminders",
    icon: "bell",
  },
  {
    title: "Privacy & Security",
    description: "Session, account, and data controls",
    icon: "shield",
  },
  {
    title: "Help & Support",
    description: "Get guidance from the Eco-Trace team",
    icon: "help-circle",
  },
  {
    title: "Logout",
    description: "Sign out from this device",
    icon: "log-out",
    danger: true,
  },
];

export default function Profile() {
  const logout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOutFromGoogle();
          } finally {
            await logoutUser();
            router.replace("/login");
          }
        },
      },
    ]);
  };

  const handleAction = (title: string) => {
    if (title === "Logout") {
      logout();
      return;
    }

    Alert.alert(title, "This profile tool will be available soon.");
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerAccent} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>ET</Text>
          </View>

          <View style={styles.headerTextWrap}>
            <View style={styles.badge}>
              <Feather name="award" size={13} color={palette.accent} />
              <Text style={styles.badgeText}>Eco impact member</Text>
            </View>
            <Text style={styles.name}>Eco-Trace User</Text>
            <Text style={styles.role}>Sustainability analytics profile</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Impact Overview</Text>
          <Text style={styles.sectionMeta}>This month</Text>
        </View>

        <View style={styles.summaryGrid}>
          {summaryCards.map((card) => (
            <PressScale key={card.label} style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Feather name={card.icon} size={18} color={palette.accent} />
              </View>
              <Text style={styles.summaryValue}>{card.value}</Text>
              <Text style={styles.summaryLabel}>{card.label}</Text>
              <Text style={styles.summaryDetail}>{card.detail}</Text>
            </PressScale>
          ))}
        </View>

        <View style={styles.impactCard}>
          <View style={styles.impactIcon}>
            <Feather name="sunrise" size={22} color={palette.accent} />
          </View>
          <View style={styles.impactCopy}>
            <Text style={styles.impactTitle}>Your impact matters</Text>
            <Text style={styles.impactText}>
              Your lower-emission trips helped offset the equivalent of 106 km
              of average car travel this month.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Text style={styles.sectionMeta}>Account</Text>
        </View>

        <View style={styles.actionsCard}>
          {actionRows.map((row, index) => {
            const tint = row.danger ? palette.danger : palette.accent;
            const isLast = index === actionRows.length - 1;

            return (
              <PressScale
                key={row.title}
                onPress={() => handleAction(row.title)}
                style={[
                  styles.actionRow,
                  !isLast && styles.actionRowBorder,
                ]}
                contentStyle={styles.actionRowContent}
              >
                <View
                  style={[
                    styles.actionIcon,
                    row.danger && styles.actionIconDanger,
                  ]}
                >
                  <Feather name={row.icon} size={19} color={tint} />
                </View>
                <View style={styles.actionText}>
                  <Text
                    style={[
                      styles.actionTitle,
                      row.danger && styles.actionTitleDanger,
                    ]}
                  >
                    {row.title}
                  </Text>
                  <Text style={styles.actionDescription}>{row.description}</Text>
                </View>
                <Feather name="chevron-right" size={21} color="#94A3B8" />
              </PressScale>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const shadow = {
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 4,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  pressScalePressable: {
    flex: 1,
  },
  headerCard: {
    ...shadow,
    minHeight: 156,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 28,
    backgroundColor: palette.card,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 62,
    backgroundColor: palette.accentSoft,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: palette.card,
  },
  avatarText: {
    color: palette.card,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0,
  },
  headerTextWrap: {
    flex: 1,
    gap: 6,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "#D7EEE3",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  name: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0,
  },
  role: {
    color: palette.subText,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
  },
  sectionMeta: {
    color: palette.subText,
    fontSize: 13,
    fontWeight: "600",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  summaryCard: {
    ...shadow,
    width: "47.8%",
    minHeight: 142,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 22,
    backgroundColor: palette.card,
    padding: 16,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: palette.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  summaryValue: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0,
  },
  summaryLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  summaryDetail: {
    color: palette.subText,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  impactCard: {
    ...shadow,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#D8EDE2",
    borderRadius: 24,
    backgroundColor: palette.card,
    padding: 18,
    flexDirection: "row",
    gap: 14,
  },
  impactIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: palette.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  impactCopy: {
    flex: 1,
  },
  impactTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0,
  },
  impactText: {
    color: palette.subText,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  actionsCard: {
    ...shadow,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 24,
    backgroundColor: palette.card,
  },
  actionRow: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: palette.card,
  },
  actionRowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconDanger: {
    backgroundColor: "#FEF2F2",
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
  actionTitleDanger: {
    color: palette.danger,
  },
  actionDescription: {
    color: palette.subText,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
});
