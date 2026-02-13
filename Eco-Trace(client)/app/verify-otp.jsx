import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Keyboard 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function VerifyOtp() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  
  // States
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Refs for focusing next input
  const inputs = useRef([]);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next box if text is entered
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
    
    // Close keyboard if last box is filled
    if (text && index === 5) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e, index) => {
    // Move to previous box on backspace if current box is empty
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    // Add your API call for resending OTP here
    alert("New OTP sent to " + email);
  };

  const handleVerify = () => {
    const finalOtp = otp.join("");
    if (finalOtp.length < 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }
    alert("Email Verified ✅");
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>
      <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

      {/* 6-Digit OTP Boxes */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>

      {/* Timer Section */}
      <View style={styles.timerContainer}>
        {canResend ? (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.timerText}>Resend in {timer}s</Text>
        )}
      </View>

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
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    color: "#777",
  },
  otpContainer: {
    flexDirection: "row",
    gap:10,
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
  },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1.5,
    borderColor: "#373535",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f7004", // Your brand green
  },
  timerContainer: {
    marginBottom: 30,
    height: 20,
  },
  timerText: {
    color: "#777",
    fontSize: 14,
  },
  resendText: {
    color: "#1f7004",
    fontWeight: "bold",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  button: {
    width: "40%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#1f7004",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});