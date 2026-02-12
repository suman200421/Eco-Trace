import React, { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  // ---------------- Validation ----------------
  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isFormValid =
    isValidEmail(email) && password.length >= 6;

  // ---------------- Login Handler ----------------
  const handleLogin = async () => {
    if (!isFormValid) {
      alert("Please enter valid credentials");
      return;
    }

    try {
      setLoading(true);

      // Simulated API call
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      // Navigate to Tabs after success
      router.replace("/(tabs)");
    } catch (error) {
      alert("Something went wrong. Try again.");
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
          <Text style={styles.subtitle}>
            Securely login to your account
          </Text>

          {/* Email */}
          <TextInput
            placeholder="Email address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              secureTextEntry={secure}
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setSecure(!secure)}
            >
              <Text style={styles.showText}>
                {secure ? "Show" : "Hide"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity>
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isFormValid
                  ? "#1f7004"
                  : "#9CA3AF",
              },
            ]}
            onPress={handleLogin}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Log In
              </Text>
            )}
          </TouchableOpacity>

          {/* Navigate to Sign Up */}
          <TouchableOpacity
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.linkText}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>

        </View>
        

{/* ---------- Social Section (ADD HERE) ---------- */}
<View style={styles.socialSection}>

  <Text style={styles.divider}>
    – OR Continue with –
  </Text>

  <View style={styles.socialRow}>
    <TouchableOpacity style={styles.socialBtn}>
      <Text style={styles.socialText}>Google</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.socialBtn}>
      <Text style={styles.socialText}>Facebook</Text>
    </TouchableOpacity>
  </View>

  <View style={styles.signupRow}>
    <Text>Create An Account </Text>
    <TouchableOpacity onPress={() => router.push("/signup")}>
      <Text style={styles.signupText}>Sign Up</Text>
    </TouchableOpacity>
  </View>

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
