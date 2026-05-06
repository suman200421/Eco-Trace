import { GoogleSignin, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!;

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user_id?: string | number | null;
  userId?: string | number | null;
  id?: string | number | null;
};

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [secure, setSecure] = useState<boolean>(true);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const isFormValid = email.trim() && password.trim();

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // console.log(userInfo.data);
      if (userInfo.type === "success") {
        const idToken = userInfo.data.idToken;

        if (idToken) {
          await handleGoogleLogin(idToken);
        } else {
          Alert.alert("Error", "Could not get Google ID token");
        }
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // user cancelled the login flow
            break;
          case statusCodes.IN_PROGRESS:
            // operation (e.g. sign in) is in progress already
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("Error", "Play services not available or outdated");
            break;
          default:
            Alert.alert("Error", "Google sign-in failed: " + error.message);
        }
      } else {
        Alert.alert("Error", error.message ?? "Google sign-in failed");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    try {
      setGoogleLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, platform: Platform.OS }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(
          "Google Login Failed",
          data.message ?? "Something went wrong"
        );
        return;
      }

      const userId = data.user_id ?? data.userId ?? data.id;

      await persistSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId,
      });

      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Server not reachable");
    } finally {
      setGoogleLoading(false);
    }
  };

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

      const userId = data.user_id ?? data.userId ?? data.id;

      await persistSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId,
      });

      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Server not reachable");
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
          <TouchableOpacity onPress={() => router.push("./signup")}>
            <Text style={styles.linkText}>Dont have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* ---------- Social Section (ADD HERE) ---------- */}
        <View style={styles.socialSection}>
          <Text style={styles.divider}>– OR Continue with –</Text>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <Text style={styles.socialText}>Google</Text>
              )}
            </TouchableOpacity>

            
          </View>

          {/* <View style={styles.signupRow}>
            <Text>Create An Account </Text>
            <TouchableOpacity onPress={() => router.push("./signup")}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View> */}

          <Text style={styles.termsText}>
            By clicking Continue, you agree to our{" "}
            <Text style={styles.linkBlue}>Terms of Service</Text> and{" "}
            <Text style={styles.linkBlue}>Privacy Policy</Text>
          </Text>
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
  socialSection: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    marginTop: 25,
  },

  divider: {
    color: "#777",
    marginBottom: 20,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },

  socialBtn: {
    flex: 1,
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    backgroundColor: "#ffffff",
  },

  socialText: {
    fontWeight: "600",
    color: "#333",
  },

  signupRow: {
    flexDirection: "row",
    marginBottom: 15,
  },

  signupText: {
    color: "#2563eb",
    fontWeight: "bold",
  },

  termsText: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    paddingHorizontal: 20,
  },

  linkBlue: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
