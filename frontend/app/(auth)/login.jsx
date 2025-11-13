import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const Login = () => {
  const [loginMethod, setLoginMethod] = useState("email"); 
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginAsGuest } = useAuth();

  const handleLogin = async () => {
    const identifier = loginMethod === "email" ? email : phoneNumber;
    
    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (loginMethod === "email" && !identifier.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (loginMethod === "phone") {
      setError("Phone login is coming soon. Please use email for now.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const result = await login(identifier, password);
      
      if (result.needsEmailVerification) {
        router.push({
          pathname: "/(auth)/verify-email",
          params: {
            email: identifier,
            message: result.message
          }
        });
      } 
    } catch (err) {
      setError(err.message || "Login failed");
    }
    setLoading(false);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await loginAsGuest();
      router.replace("/seeker/explore");
    } catch (err) {
      setError(err.message || "Guest login failed");
    }
    setLoading(false);
  };
  

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          <View style={styles.header}>
            {/* <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>R</Text>
              </View>
            </View> */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your journey
            </Text>
          </View>

          <View style={styles.formSection}>
            {/* Login Method Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  loginMethod === "email" && styles.toggleButtonActive,
                ]}
                onPress={() => setLoginMethod("email")}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="mail" 
                  size={16} 
                  color={loginMethod === "email" ? "#ffffff" : "#94a3b8"} 
                />
                <Text style={[
                  styles.toggleText,
                  loginMethod === "email" && styles.toggleTextActive,
                ]}>
                  Email
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  loginMethod === "phone" && styles.toggleButtonActive,
                ]}
                onPress={() => setLoginMethod("phone")}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="call" 
                  size={16} 
                  color={loginMethod === "phone" ? "#ffffff" : "#94a3b8"} 
                />
                <Text style={[
                  styles.toggleText,
                  loginMethod === "phone" && styles.toggleTextActive,
                ]}>
                  Phone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {loginMethod === "email" ? "Email Address" : "Phone Number"}
              </Text>
              <View style={styles.inputWrapper}>
                {loginMethod === "email" ? (
                  <TextInput
                    placeholder="your.email@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                    placeholderTextColor="#64748b"
                  />
                ) : (
                  <TextInput
                    placeholder="+91 9876543210"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    style={styles.input}
                    placeholderTextColor="#64748b"
                  />
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => router.push("/screens/settings/forgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/registration")}
              >
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    backgroundColor: "#0f172a",
    paddingBottom: Platform.OS === "ios" ? 20 : 40,
  },
  decorativeCircle1: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#1e293b",
    opacity: 0.3,
  },
  decorativeCircle2: {
    position: "absolute",
    top: 100,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#334155",
    opacity: 0.2,
  },
  header: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#06b6d4",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 24,
  },
  formSection: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: "#1e293b",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#334155",
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: "#f8fafc",
    backgroundColor: "transparent",
  },
  errorContainer: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  error: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#10b981",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 32,
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  registerText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  registerLink: {
    fontSize: 14,
    color: "#06b6d4",
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 25,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 21,
  },
  toggleButtonActive: {
    backgroundColor: "#10b981",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    marginLeft: 6,
  },
  toggleTextActive: {
    color: "#ffffff",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#334155",
  },
  dividerText: {
    color: "#94a3b8",
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: "500",
  },
  guestButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#06b6d4",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 20,
  },
  guestButtonText: {
    color: "#06b6d4",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#06b6d4",
    fontWeight: "600",
  },
});