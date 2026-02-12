import { Stack } from "expo-router";

import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#ffffff" },
          headerTitleStyle: { color: "#112342" },
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        {/* Add login screen FIRST */}
        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />

        {/* Tabs */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
