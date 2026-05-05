import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, } from "react";
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
import { API_BASE_URL } from "../lib/auth";

export default function SignUp() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState<boolean>(false);
  const [securePassword, setSecurePassword] = useState<boolean>(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState<boolean>(true);

  // const isValidEmail = (value) =>
  //   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // const passwordsMatch =
  //   password.length >= 6 && password === confirmPassword;

  // const isFormValid =
  //   firstName.trim() &&
  //   lastName.trim() &&
  //   isValidEmail(email) &&
  //   passwordsMatch;


  // const handleVerifyEmail = async () => {
  //   if (!isFormValid) {
  //     alert("Please fill all fields correctly");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     // Simulate sending OTP
  //     await new Promise((resolve) => setTimeout(resolve, 1500));

  //     // ✅ Navigate to OTP screen & pass email
  //     router.push({
  //       pathname: "/verify-otp",
  //       params: { email: email },
  //     });

  //   } catch (error) {
  //     alert("Something went wrong. Try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const register = async (): Promise<void> => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          email,
          password
        })
      });

      if (!res.ok) {
        Alert.alert("Error", "Registration failed");
        return;
      }

      Alert.alert("Success", "OTP sent to your email");

      router.push({
        pathname: "./verify-otp",//need to change
        params: { email }
      });

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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to get started
          </Text>

          {/* First Name */}
          <TextInput
            placeholder="First Name *"
            style={styles.input}
            value={firstName}
            placeholderTextColor="#496b4b"
            onChangeText={setFirstName}
          />

          {/* Middle Name */}
          <TextInput
            placeholder="Middle Name (Optional)"
            style={styles.input}
            value={middleName}
            placeholderTextColor="#496b4b"
            onChangeText={setMiddleName}
          />

          {/* Last Name */}
          <TextInput
            placeholder="Last Name *"
            style={styles.input}
            value={lastName}
            placeholderTextColor="#496b4b"
            onChangeText={setLastName}
          />

          {/* Email */}
          <TextInput
            placeholder="Email *"
            style={styles.input}
            value={email}
            placeholderTextColor="#496b4b"
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              value={password}
              placeholderTextColor="#496b4b"
              onChangeText={setPassword}
              secureTextEntry={securePassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setSecurePassword(!securePassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={securePassword ? "eye-off" : "eye"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              placeholderTextColor="#496b4b"
              onChangeText={setConfirmPassword}
              secureTextEntry={secureConfirmPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={secureConfirmPassword ? "eye-off" : "eye"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={register}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>
                Verify Email
              </Text>
            )}
          </TouchableOpacity>

          {/* Navigate to Login */}
          <TouchableOpacity
            onPress={() => router.push("./login")}
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
  eyeIcon: {
    padding: 5,
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
    fontWeight: "bold",
    fontSize: 16,
    color: "#1f7004"
  },
  linkText: {
    textAlign: "center",
    marginTop: 15,
    color: "#1f7004",
    fontWeight: "600",
  },
});
