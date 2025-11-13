import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

const ForgotPassword = () => {
  const { forgotPassword, verifyResetOtp, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1: contact info, 2: OTP verification, 3: success
  const [contactMethod, setContactMethod] = useState("email"); // "email" or "phone"
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const { showToast } = useToast();

  const handleSendReset = async () => {
    const identifier = contactMethod === "email" ? email : phoneNumber;
    
    if (!identifier) {
      showToast(`Please enter your ${contactMethod}`);
      return;
    }

    if (contactMethod === "email" && !identifier.includes("@")) {
      showToast("Please enter a valid email address");
      return;
    }

    if (contactMethod === "phone" && !/^\+?[\d\s-()]{10,}$/.test(identifier)) {
      showToast("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    
    try {
      if (contactMethod === "email") {
        await forgotPassword(email);
        setStep(2); 
      } else {
        showToast("Phone number reset is not supported yet. Please use email.");
        return;
      }
      
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = "Failed to send reset instructions. Please try again.";
      
      if (error?.message?.includes("User not found")) {
        errorMessage = "User not found";
      } else if (error?.message?.includes("Please register first")) {
        errorMessage = "Please register first. Account not verified.";
      } else if (error?.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      showToast(errorMessage, "error");
    }
    
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setOtpError("");
    
    try {
      const identifier = contactMethod === "email" ? email : phoneNumber;
      await verifyResetOtp(identifier, otp);
      handleContinueToReset();
    } catch (error) {
      if (error.message.includes("Invalid OTP")) {
        setOtpError("Invalid code. Please try again.");
      } else if (error.message.includes("expired")) {
        setOtpError("Code expired. Please request a new one.");
      } else {
        setOtpError("Verification failed. Please try again.");
      }
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    try {
      setLoading(true);
      const identifier = contactMethod === "email" ? email : phoneNumber;
      await forgotPassword(identifier);
      showToast("Verification code resent");
      setResendCooldown(30);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      showToast("Failed to resend code. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (code) => {
    setOtp(code);
    setOtpError("");
  };

  const handleContinueToReset = () => {
    router.replace({
      pathname: "/screens/settings/resetPassword",
      params: { 
        contactMethod,
        contact: contactMethod === "email" ? email : phoneNumber,
        verified: "true"
      }
    });
  };

  // Step 2: OTP Verification
  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(1)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          
          <Text style={styles.titleText}>Verify Code</Text>
          
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.codeIcon}>
                <Ionicons name="mail" size={40} color={theme.colors.primary} />
              </View>
              <Text style={styles.infoTitle}>Enter Verification Code</Text>
              <Text style={styles.infoText}>
                We sent a 6-digit verification code to your {contactMethod}:
              </Text>
              <Text style={styles.contactText}>
                {contactMethod === "email" ? email : phoneNumber}
              </Text>
            </View>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <Text style={styles.inputLabel}>Enter 6-digit code</Text>
              <View style={[styles.otpInputWrapper, otpError && styles.inputError]}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="000000"
                  placeholderTextColor={theme.colors.placeholder}
                  value={otp}
                  onChangeText={handleOTPChange}
                  keyboardType="numeric"
                  maxLength={6}
                  autoFocus={true}
                />
              </View>
              {otpError && <Text style={styles.errorText}>{otpError}</Text>}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              activeOpacity={0.8}
            >
              <Text style={styles.verifyButtonText}>
                {loading ? "Verifying..." : "Verify Code"}
              </Text>
            </TouchableOpacity>

            {/* Resend Section */}
            <View style={styles.resendSection}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <TouchableOpacity
                style={[styles.resendButton, resendCooldown > 0 && styles.resendButtonDisabled]}
                onPress={handleResendOTP}
                disabled={resendCooldown > 0 || loading}
                activeOpacity={0.7}
              >
                <Text style={[styles.resendButtonText, resendCooldown > 0 && styles.resendButtonTextDisabled]}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const handleResend = () => {
    setEmailSent(false);
    handleSendReset();
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          
          <Text style={styles.titleText}>Password Reset</Text>
          
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Success Icon */}
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="mail" size={40} color={theme.colors.primary} />
              </View>
              
              <Text style={styles.successTitle}>Reset Instructions Sent!</Text>
              <Text style={styles.successText}>
                We've sent password reset instructions to your {contactMethod}.
                {contactMethod === "email" && " Please check your email inbox and spam folder."}
                {contactMethod === "phone" && " Please check your text messages."}
              </Text>

              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>What's next?</Text>
                
                <View style={styles.instruction}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepText}>1</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Check your {contactMethod} for reset instructions
                  </Text>
                </View>

                <View style={styles.instruction}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepText}>2</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Click the reset link or follow the instructions
                  </Text>
                </View>

                <View style={styles.instruction}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepText}>3</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Create a new secure password
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResend}
                activeOpacity={0.8}
              >
                <Text style={styles.resendButtonText}>Resend Instructions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => router.replace("/(auth)/login")}
                activeOpacity={0.8}
              >
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.titleText}>Forgot Password</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.infoTitle}>Reset Your Password</Text>
            <Text style={styles.infoText}>
              Enter your email address and we'll send you one time password to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {contactMethod === "email" ? "Email Address" : "Phone Number"}
              </Text>
              <View style={styles.inputWrapper}>
                {contactMethod === "email" ? (
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@example.com"
                    placeholderTextColor={theme.colors.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <TextInput
                    style={styles.input}
                    placeholder="+91 xxx-xxx-xxxx"
                    placeholderTextColor={theme.colors.placeholder}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                )}
              </View>
            </View>

            {/* Send Reset Button */}
            <TouchableOpacity
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={handleSendReset}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={styles.sendButtonText}>
                {loading ? "Sending..." : "Send OTP"}
              </Text>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.loginContainer}
              onPress={() => router.replace("/(auth)/login")}
              activeOpacity={0.7}
            >
              <Text style={styles.loginText}>Remember your password? </Text>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  titleText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  infoSection: {
    alignItems: "center",
    marginBottom: theme.spacing["3xl"],
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  infoText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: 25,
    padding: 4,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: 21,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.xs,
  },
  toggleTextActive: {
    color: theme.colors.textPrimary,
  },
  inputGroup: {
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  loginText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  loginLink: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  // Success Screen Styles
  successContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing["3xl"],
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  successTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  successText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: theme.spacing["3xl"],
  },
  instructionsContainer: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing["3xl"],
  },
  instructionsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  instruction: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  stepText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  instructionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  resendButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  resendButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    textAlign: "center",
  },
  backToLoginButton: {
    paddingVertical: theme.spacing.lg,
  },
  backToLoginText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  // OTP Verification Styles
  codeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },
  contactText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  otpSection: {
    paddingVertical: theme.spacing["3xl"],
    alignItems: "center",
  },
  verifyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  resendSection: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  resendText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  resendButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  resendButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  otpContainer: {
    marginBottom: theme.spacing.xl,
  },
  otpInputWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  otpInput: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.textPrimary,
    textAlign: "center",
    letterSpacing: 8,
  },
  // Success Screen Styles (Step 3)
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    width: "100%",
  },
  continueButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
});

export default ForgotPassword;