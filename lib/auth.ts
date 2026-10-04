import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// On physical devices over Wi-Fi, the host computer is reachable at 192.168.0.126.
const DEFAULT_HOST = "http://192.168.0.126:5000";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_HOST
).replace(/\/+$/, "");

type SessionTokens = {
  accessToken: string;
  refreshToken?: string | null;
  userId?: string | number | null;
};

type RefreshResponse = {
  accessToken?: string;
  refreshToken?: string;
  user_id?: string | number | null;
  userId?: string | number | null;
  id?: string | number | null;
};

export async function persistSession({
  accessToken,
  refreshToken,
  userId,
}: SessionTokens): Promise<void> {
  await SecureStore.setItemAsync("accessToken", accessToken);

  if (refreshToken) {
    await SecureStore.setItemAsync("refreshToken", refreshToken);
  }

  if (userId !== undefined && userId !== null) {
    await SecureStore.setItemAsync("user_id", String(userId));
    return;
  }

  await SecureStore.deleteItemAsync("user_id");
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
  await SecureStore.deleteItemAsync("user_id");
}

export async function logout(): Promise<void> {
  const refreshToken = await SecureStore.getItemAsync("refreshToken");

  if (refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore network errors and continue local logout.
    }
  }

  await clearSession();
}

export async function getSession(): Promise<SessionTokens | null> {
  try {
    const accessToken = await SecureStore.getItemAsync("accessToken");

    if (!accessToken) {
      return null;
    }

    // Check if token is expired
    if (isTokenExpired(accessToken)) {
      // Try to refresh the token
      const newToken = await refreshAccessToken();
      if (!newToken) {
        // Refresh failed, clear session
        await clearSession();
        return null;
      }
      // Return new token
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      const userId = await SecureStore.getItemAsync("user_id");
      return {
        accessToken: newToken,
        refreshToken,
        userId,
      };
    }

    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    const userId = await SecureStore.getItemAsync("user_id");

    return {
      accessToken,
      refreshToken,
      userId,
    };
  } catch {
    return null;
  }
}

// Helper function to check if JWT token is expired
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    // Decode the payload (second part) using atob (works in Expo)
    const payload = JSON.parse(atob(parts[1]));

    // Check if exp claim exists and is in the past
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      // Add 30 second buffer to refresh before actual expiry
      return now >= expirationTime - 30000;
    }

    return false;
  } catch (err) {
    console.error("Error decoding token:", err);
    return true; // If we can't decode, assume it's expired
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync("refreshToken");

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = (await response.json()) as RefreshResponse;

    if (!response.ok || !data.accessToken) {
      await clearSession();
      return null;
    }

    const userId = data.user_id ?? data.userId ?? data.id;

    await persistSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? refreshToken,
      userId,
    });

    return data.accessToken;
  } catch {
    return null;
  }
}