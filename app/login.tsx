import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL, persistSession } from "../lib/auth";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  message?: string;
  user?: {
    id: string | number;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  user_id?: string | number | null;
  userId?: string | number | null;
  id?: string | number | null;
};

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [secure, setSecure] = useState<boolean>(true);

  const isFormValid = email.trim() && password.trim();

  const login = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok) {
        Alert.alert("Login failed", "Invalid credentials");
        return;
      }

      const userId = data.user?.id ?? data.user_id ?? data.userId ?? data.id;

      await persistSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId,
      });

      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Login fetch error:", err);
      Alert.alert(
        "Server Connection Error",
        `Could not reach server at ${API_BASE_URL}.\n\nError: ${err?.message ?? "Network request failed"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Securely login to your account</Text>

          {/* Email */}
          <TextInput
            placeholder="Email address"
            style={styles.input}
            value={email}
            placeholderTextColor="#496b4b"
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              style={styles.passwordInput}
              value={password}
              placeholderTextColor="#496b4b"
              secureTextEntry={secure}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Text style={styles.showText}>{secure ? "Show" : "Hide"}</Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isFormValid ? "#1f7004" : "#9CA3AF",
              },
            ]}
            onPress={login}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Navigate to Sign Up */}
          {/* Navigate to Sign Up */}
          <TouchableOpacity onPress={() => router.push("./signup")}>
            <Text style={styles.linkText}>Dont have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eaf1ec",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    padding: 25,
    borderRadius: 15,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#777",
    marginBottom: 20,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  passwordInput: {
    flex: 1,
    color: "#333",
    height: 45,
  },
  showText: {
    color: "#1f7004",
    fontWeight: "600",
  },
  forgotText: {
    textAlign: "right",
    color: "#1f7004",
    fontSize: 13,
    marginBottom: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkText: {
    textAlign: "center",
    marginTop: 15,
    color: "#1f7004",
    fontWeight: "600",
  },
});
