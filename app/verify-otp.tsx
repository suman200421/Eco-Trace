import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { API_BASE_URL } from "../lib/auth";

export default function VerifyOtp() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    if (!/^\d?$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus to next input if digit entered
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace - focus to previous input
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter all 6 digits");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          otp: otpCode
        })
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Verification failed");
        return;
      }

      Alert.alert("Success", "Email verified successfully");
      router.replace("./login");
    } catch {
      Alert.alert("Error", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Verify Email</Text>
//       <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

//       {/* 6-Digit OTP Boxes */}
//       {/* <View style={styles.otpContainer}>
//         {otp.map((digit, index) => (
//           <TextInput
//             key={index}
//             ref={(ref) => (inputs.current[index] = ref)}
//             style={styles.otpBox}
//             keyboardType="number-pad"
//             maxLength={1}
//             value={digit}
//             onChangeText={(text) => handleChange(text, index)}
//             onKeyPress={(e) => handleKeyPress(e, index)}
//           />
//         ))}
//       </View> */}
//       <TextInput
//         value={otp}
//         onChangeText={setOtp}
//         keyboardType="number-pad"
//         maxLength={6}
//         placeholder="Enter OTP"
//         style={styles.input}
//       />

//       {/* Timer Section */}
//       {/* <View style={styles.timerContainer}>
//         {canResend ? (
//           <TouchableOpacity onPress={handleResend}>
//             <Text style={styles.resendText}>Resend OTP</Text>
//           </TouchableOpacity>
//         ) : (
//           <Text style={styles.timerText}>Resend in {timer}s</Text>
//         )}
//       </View> */}

//       <Pressable
//         style={({ pressed }) => [
//           styles.button,
//           pressed && { opacity: 0.7 }
//         ]}
//         onPress={verifyOtp}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>
//           {loading ? "Verifying..." : "Verify"}
//         </Text>
//       </Pressable>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   subtitle: {
//     textAlign: "center",
//     marginBottom: 30,
//     color: "#777",
//   },
//   otpContainer: {
//     flexDirection: "row",
//     gap: 10,
//     justifyContent: "center",
//     width: "100%",
//     marginBottom: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 14,
//     borderRadius: 8,
//     marginBottom: 20,
//     textAlign: "center",
//     fontSize: 18,
//     letterSpacing: 6
//   },
//   otpBox: {
//     width: 45,
//     height: 50,
//     borderWidth: 1.5,
//     borderColor: "#373535",
//     borderRadius: 8,
//     textAlign: "center",
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1f7004", // Your brand green
//   },
//   timerContainer: {
//     marginBottom: 30,
//     height: 20,
//   },
//   timerText: {
//     color: "#777",
//     fontSize: 14,
//   },
//   resendText: {
//     color: "#1f7004",
//     fontWeight: "bold",
//     fontSize: 14,
//     textDecorationLine: "underline",
//   },
//   button: {
//     width: "40%",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     backgroundColor: "#1f7004",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// }
  return (
    <View style={styles.wrapper}>
      <View style={styles.otpForm}>
        <Text style={styles.mainHeading}>Enter OTP</Text>
        <Text style={styles.otpSubheading}>
          We have sent a verification code to your Email Id
        </Text>
        <View style={styles.inputContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputs.current[index] = ref;
              }}
              style={styles.otpInput}
              maxLength={1}
              keyboardType="numeric"
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>
        <TouchableOpacity 
          style={styles.verifyButton}
          onPress={verifyOtp}
          disabled={loading}
        >
          <Text style={styles.verifyButtonText}>
            {loading ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exitBtn}>
          <Text style={styles.exitBtnText}>×</Text>
        </TouchableOpacity>
        <View style={styles.resendNote}>
          <Text style={styles.resendNoteText}>Didnt receive the code?</Text>
          <TouchableOpacity>
            <Text style={styles.resendBtn}>Resend Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpForm: {
    width: 300,
    height: 400,
    backgroundColor: 'rgb(255, 255, 255)',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    gap: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.082,
    shadowRadius: 20,
    elevation: 5,
    borderRadius: 15,
  },
  mainHeading: {
    fontSize: 19,
    marginBottom: 25,
    color: 'rgb(15, 15, 15)',
    fontWeight: '700',
  },
  otpSubheading: {
    fontSize: 11,
    color: 'black',
    lineHeight: 17,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    backgroundColor: 'rgb(228, 228, 228)',
    width: 30,
    height: 30,
    textAlign: 'center',
    borderRadius: 7,
    color: 'rgb(44, 44, 44)',
    fontWeight: '600',
  },
  verifyButton: {
    width: '100%',
    height: 30,
    backgroundColor: 'rgb(127, 129, 255)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  exitBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 50,
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.171,
    shadowRadius: 20,
    elevation: 3,
  },
  exitBtnText: {
    color: 'black',
    fontSize: 17,
  },
  resendNote: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    width: '100%',
  },
  resendNoteText: {
    fontSize: 11,
    color: 'black',
  },
  resendBtn: {
    color: 'rgb(127, 129, 255)',
    fontSize: 12,
    fontWeight: '700',
  },
}
);