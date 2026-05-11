import { TelemetryProvider } from "@/services/telemetry/TelemetryContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getSession } from "../lib/auth";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        const session = await getSession();
        if (!isMounted) return;

        const isAuth = !!session?.accessToken;
        const inAuthGroup = segments[0] === "login" || segments[0] === "signup" || segments[0] === "verify-otp";

        if (!isAuth && !inAuthGroup) {
          router.replace("/login");
        } else if (isAuth && inAuthGroup) {
          router.replace("/(tabs)");
        }
      } catch (error) {
        if (!isMounted) return;
        // Proceed as unauthenticated
        const inAuthGroup = segments[0] === "login" || segments[0] === "signup" || segments[0] === "verify-otp";
        if (!inAuthGroup) {
          router.replace("/login");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, [segments[0]]);

  if (isLoading) {
    return (
      <SafeAreaProvider style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#1f7004" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <TelemetryProvider>
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: "#ffffff" },
          headerTitleStyle: { color: "#112342" },
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        {/* Login screens */}
        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="signup"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="verify-otp"
          options={{ headerShown: false }}
        />

        {/* Tabs */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      </Stack>
    </SafeAreaProvider>
    </TelemetryProvider>
  );
}
