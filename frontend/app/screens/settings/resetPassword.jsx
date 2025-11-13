import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
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
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { theme } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const params = useLocalSearchParams();
  const { contactMethod, contact, verified } = params;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { showToast } = useToast();


  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    if (verified !== "true") {
      showToast("Please complete OTP verification first", "error");
      router.back();
      return;
    }

    setLoading(true);

    try {
      await resetPassword(contact, newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      showToast("Password reset successfully", "success");
      router.back();
    } catch (error) {
      let errorMessage = "Failed to reset password. Please try again.";
      
      if (error.message.includes("expired")) {
        errorMessage = "Verification expired. Please start the reset process again.";
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }

      showToast(errorMessage, "error");
    }

    setLoading(false);
  };

  const renderPasswordInput = (
    label,
    value,
    onChangeText,
    placeholder,
    showPassword,
    toggleShow,
    error
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={toggleShow}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const getPasswordStrength = (password) => {
    if (!password)
      return { strength: 0, text: "", color: theme.colors.textMuted };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2)
      return { strength: score, text: "Weak", color: theme.colors.error };
    if (score <= 3)
      return { strength: score, text: "Fair", color: theme.colors.warning };
    if (score <= 4)
      return { strength: score, text: "Good", color: theme.colors.blue };
    return { strength: score, text: "Strong", color: theme.colors.success };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <Header title="Reset Password" showBackButton={true} noMarginTop={true} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          <View style={styles.infoSection}>
            <View style={styles.lockIcon}>
              <Ionicons name="key" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.infoTitle}>Create New Password</Text>
            <Text style={styles.infoText}>
              Enter your new password for {contact}
            </Text>
          </View>

          <View style={styles.form}>
            {renderPasswordInput(
              "New Password",
              newPassword,
              setNewPassword,
              "Enter your new password",
              showNewPassword,
              () => setShowNewPassword(!showNewPassword),
              errors.newPassword
            )}

            {/* Password Strength Indicator */}
            {newPassword && (
              <View style={styles.strengthContainer}>
                <Text style={styles.strengthLabel}>Password Strength:</Text>
                <View style={styles.strengthMeter}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        level <= passwordStrength.strength && {
                          backgroundColor: passwordStrength.color,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    { color: passwordStrength.color },
                  ]}
                >
                  {passwordStrength.text}
                </Text>
              </View>
            )}

            {renderPasswordInput(
              "Confirm New Password",
              confirmPassword,
              setConfirmPassword,
              "Confirm your new password",
              showConfirmPassword,
              () => setShowConfirmPassword(!showConfirmPassword),
              errors.confirmPassword
            )}

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>
                Password Requirements:
              </Text>

              <View style={styles.requirement}>
                <Ionicons
                  name={
                    newPassword.length >= 8
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={16}
                  color={
                    newPassword.length >= 8
                      ? theme.colors.success
                      : theme.colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.requirementText,
                    newPassword.length >= 8 && styles.requirementMet,
                  ]}
                >
                  At least 8 characters
                </Text>
              </View>

              <View style={styles.requirement}>
                <Ionicons
                  name={
                    /[A-Z]/.test(newPassword)
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={16}
                  color={
                    /[A-Z]/.test(newPassword)
                      ? theme.colors.success
                      : theme.colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.requirementText,
                    /[A-Z]/.test(newPassword) && styles.requirementMet,
                  ]}
                >
                  One uppercase letter
                </Text>
              </View>

              <View style={styles.requirement}>
                <Ionicons
                  name={
                    /[a-z]/.test(newPassword)
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={16}
                  color={
                    /[a-z]/.test(newPassword)
                      ? theme.colors.success
                      : theme.colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.requirementText,
                    /[a-z]/.test(newPassword) && styles.requirementMet,
                  ]}
                >
                  One lowercase letter
                </Text>
              </View>

              <View style={styles.requirement}>
                <Ionicons
                  name={
                    /\d/.test(newPassword)
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={16}
                  color={
                    /\d/.test(newPassword)
                      ? theme.colors.success
                      : theme.colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.requirementText,
                    /\d/.test(newPassword) && styles.requirementMet,
                  ]}
                >
                  One number
                </Text>
              </View>
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                loading && styles.resetButtonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>
                {loading ? "Resetting Password..." : "Reset Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  eyeButton: {
    padding: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  strengthLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    marginRight: theme.spacing.sm,
  },
  strengthMeter: {
    flexDirection: "row",
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surfaceLight,
    marginRight: 2,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.sm,
  },
  requirementsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  requirementsTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  requirementText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  requirementMet: {
    color: theme.colors.success,
  },
  resetButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    marginTop: theme.spacing.lg,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
});

export default ResetPassword;