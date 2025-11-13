import { Ionicons } from "@expo/vector-icons";
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

const Registration = () => {
  const { signup } = useAuth();
  const [registrationMethod, setRegistrationMethod] = useState("email"); // "email" or "phone"
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("seeker");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSignup = async () => {
    const identifier = registrationMethod === "email" ? email : phoneNumber;
    
    if (!role) {
      setError("Please select a role");
      return;
    }

    if (!name || !identifier || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (registrationMethod === "email" && !identifier.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (registrationMethod === "phone") {
      setError("Phone registration is coming soon. Please use email for now.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    if (!passwordRegex.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (name.length < 2 || name.length > 100) {
      setError("Name must be between 2 and 100 characters");
      return;
    }

    if (bio && bio.length > 500) {
      setError("Bio cannot exceed 500 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await signup(
        identifier, 
        password,
        role,
        name,
        confirmPassword,
        phoneNumber || null, 
        bio || "Hello! I'm using Lizy." 
      );

      console.log("Signup result:", result);
      
      if (result.success) {
        router.replace({
          pathname: "/(auth)/verifyEmail",
          params: {
            email: identifier,
            message: "Please check your email for verification instructions."
          }
        });
      }
    } catch (err) {
      setError(err.message || "Registration failed");
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
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Start your room hunting journey</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  style={styles.input}
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            {/* Registration Method Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  registrationMethod === "email" && styles.toggleButtonActive,
                ]}
                onPress={() => setRegistrationMethod("email")}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="mail" 
                  size={16} 
                  color={registrationMethod === "email" ? "#ffffff" : "#94a3b8"} 
                />
                <Text style={[
                  styles.toggleText,
                  registrationMethod === "email" && styles.toggleTextActive,
                ]}>
                  Email
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  registrationMethod === "phone" && styles.toggleButtonActive,
                ]}
                onPress={() => setRegistrationMethod("phone")}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="call" 
                  size={16} 
                  color={registrationMethod === "phone" ? "#ffffff" : "#94a3b8"} 
                />
                <Text style={[
                  styles.toggleText,
                  registrationMethod === "phone" && styles.toggleTextActive,
                ]}>
                  Phone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Contact Input Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {registrationMethod === "email" ? "Email Address" : "Phone Number"}
              </Text>
              <View style={styles.inputWrapper}>
                {registrationMethod === "email" ? (
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
                    placeholder="+91 XXXXXXXXXX"
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
                  placeholder="Create a secure password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  style={styles.input}
                  placeholderTextColor="#64748b"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Ionicons
                    name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!confirmPasswordVisible}
                  style={styles.input}
                  placeholderTextColor="#64748b"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                >
                  <Ionicons
                    name={confirmPasswordVisible ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.roleSection}>
              <Text style={styles.roleSectionTitle}>
                What describes you best?
              </Text>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === "provider" && styles.roleOptionSelected,
                ]}
                onPress={() => setRole("provider")}
                activeOpacity={0.9}
              >
                <View style={styles.roleContent}>
                  <View
                    style={[
                      styles.roleIcon,
                      role === "provider" && styles.roleIconSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleEmoji,
                        role === "provider" && styles.roleEmojiSelected,
                      ]}
                    >
                      🏠
                    </Text>
                  </View>
                  <View style={styles.roleTextContent}>
                    <Text
                      style={[
                        styles.roleTitle,
                        role === "provider" && styles.roleTitleSelected,
                      ]}
                    >
                      Room Provider
                    </Text>
                    <Text
                      style={[
                        styles.roleDescription,
                        role === "provider" && styles.roleDescriptionSelected,
                      ]}
                    >
                      I have rooms available for rent
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioButton,
                      role === "provider" && styles.radioButtonSelected,
                    ]}
                  >
                    {role === "provider" && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === "seeker" && styles.roleOptionSelected,
                ]}
                onPress={() => setRole("seeker")}
                activeOpacity={0.9}
              >
                <View style={styles.roleContent}>
                  <View
                    style={[
                      styles.roleIcon,
                      role === "seeker" && styles.roleIconSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleEmoji,
                        role === "seeker" && styles.roleEmojiSelected,
                      ]}
                    >
                      🔍
                    </Text>
                  </View>
                  <View style={styles.roleTextContent}>
                    <Text
                      style={[
                        styles.roleTitle,
                        role === "seeker" && styles.roleTitleSelected,
                      ]}
                    >
                      Room Seeker
                    </Text>
                    <Text
                      style={[
                        styles.roleDescription,
                        role === "seeker" && styles.roleDescriptionSelected,
                      ]}
                    >
                      I'm looking for the perfect room
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioButton,
                      role === "seeker" && styles.radioButtonSelected,
                    ]}
                  >
                    {role === "seeker" && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.signupButton,
                loading && styles.signupButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Registration;

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
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#1e293b",
    opacity: 0.3,
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: 100,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#334155",
    opacity: 0.2,
  },
  header: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 60,
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 24,
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
    fontSize: 28,
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e293b",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#334155",
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: "#f8fafc",
    backgroundColor: "transparent",
  },
  roleSection: {
    marginBottom: 20,
  },
  roleSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 16,
    textAlign: "center",
  },
  roleOption: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 12,
  },
  roleOptionSelected: {
    borderColor: "#10b981",
    backgroundColor: "#064e3b",
  },
  roleContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  roleIconSelected: {
    backgroundColor: "#10b981",
  },
  roleEmoji: {
    fontSize: 20,
  },
  roleEmojiSelected: {
    fontSize: 22,
  },
  roleTextContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 4,
  },
  roleTitleSelected: {
    color: "#ffffff",
  },
  roleDescription: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
  },
  roleDescriptionSelected: {
    color: "#d1fae5",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#64748b",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#ffffff",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  errorContainer: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  error: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  signupButton: {
    backgroundColor: "#10b981",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 24,
  },
  signupButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.2,
  },
  signupButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  loginText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  loginLink: {
    fontSize: 14,
    color: "#06b6d4",
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
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
  eyeIcon: {
    padding: 8,
    marginRight: 8,
  },
  bioInput: {
    height: 80,
    textAlignVertical: "top",
  },
  bioCounter: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "right",
    marginTop: 4,
  },
});
