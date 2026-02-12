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

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [loading, setLoading] = useState(false);

  // ---------------- Validation ----------------
  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const passwordsMatch =
    password.length >= 6 && password === confirmPassword;

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    isValidEmail(email) &&
    passwordsMatch;

  // ---------------- Sign Up Handler ----------------
  const handleSignUp = async () => {
    if (!isFormValid) {
      alert("Please fill all fields correctly");
      return;
    }

    try {
      setLoading(true);

      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to Home Tabs after success
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to get started
          </Text>

          {/* First Name */}
          <TextInput
            placeholder="First Name *"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />

          {/* Middle Name */}
          <TextInput
            placeholder="Middle Name (Optional)"
            style={styles.input}
            value={middleName}
            onChangeText={setMiddleName}
          />

          {/* Last Name */}
          <TextInput
            placeholder="Last Name *"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />

          {/* Email */}
          <TextInput
            placeholder="Email *"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password (min 6 characters)"
              secureTextEntry={secure}
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Text style={styles.showText}>
                {secure ? "Show" : "Hide"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View
            style={[
              styles.passwordContainer,
              confirmPassword &&
                !passwordsMatch && { borderColor: "red" },
            ]}
          >
            <TextInput
              placeholder="Confirm Password *"
              secureTextEntry={secureConfirm}
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setSecureConfirm(!secureConfirm)}
            >
              <Text style={styles.showText}>
                {secureConfirm ? "Show" : "Hide"}
              </Text>
            </TouchableOpacity>
          </View>

          {confirmPassword && !passwordsMatch && (
            <Text style={styles.errorText}>
              Passwords must match and be at least 6 characters
            </Text>
          )}

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isFormValid
                  ? "#1f7004"
                  : "#9CA3AF",
              },
            ]}
            onPress={handleSignUp}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          {/* Navigate to Login */}
          <TouchableOpacity
            onPress={() => router.push("/login")}
          >
            <Text style={styles.linkText}>
              Already have an account? Login
            </Text>
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
    height: 45,
  },
  showText: {
    color: "#1f7004",
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    fontSize: 12,
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
