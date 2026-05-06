import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { refreshAccessToken } from "../lib/auth";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    void checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      setIsLoggedIn(true);
      setLoading(false);
      return;
    }

    const accessToken = await SecureStore.getItemAsync("accessToken");

    if (accessToken) {
      setIsLoggedIn(true);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isLoggedIn ? (
    <Redirect href="./(tabs)/stats" />
  ) : (
    <Redirect href="./login" />
  );
}
