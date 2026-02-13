import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function VerifyOtp() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    if (!otp.trim()) {
      alert("Please enter OTP");
      return;
    }

    alert("Email Verified ✅");

    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>

      <Text style={styles.subtitle}>
        Enter the OTP sent to {email}
      </Text>

      <TextInput
        placeholder="Enter OTP"
        style={styles.input}
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",   // ✅ center horizontally
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    color: "#777",
  },

  input: {
    width: "40%",          // ✅ smaller width
    height: 40,            // ✅ smaller height
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  button: {
    width: "40%",          // ✅ smaller width
    paddingVertical: 10,   // ✅ smaller height
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#1f7004",
    marginTop: 5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,          // slightly smaller text
  },
});