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
import Header from "../../../components/Header";
import { theme } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";

const DeleteAccount = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { user, deleteAccount } = useAuth();

  const reasons = [
    "I no longer need the service",
    "I found a better alternative",
    "Privacy concerns",
    "Too many notifications",
    "App is difficult to use",
    "Technical issues",
    "Other",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Password is required to delete your account";
    }

    if (!reason) {
      newErrors.reason = "Please select a reason for deleting your account";
    }

    if (confirmation.toLowerCase() !== "delete") {
      newErrors.confirmation = 'Please type "DELETE" to confirm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeleteAccount = async () => {
    if (!validateForm()) {
      return;
    }

    Alert.alert(
      "Delete Account",
      "Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            
            try {
              await deleteAccount(password);
              
              Alert.alert(
                "Account Deleted",
                "Your account has been successfully deleted. We're sorry to see you go!",
                [{ text: "OK", onPress: () => {
                  router.replace("/(auth)/login");
                }}]
              );
            } catch (error) {
              console.error('Account deletion error:', error);
              let errorMessage = "Failed to delete account. Please try again.";
              
              if (error.message.includes("Incorrect password")) {
                errorMessage = "Incorrect password. Please try again.";
                setErrors({ password: "Incorrect password" });
              }
              
              Alert.alert("Error", errorMessage);
            }
            
            setLoading(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <Header title="Delete Account" noMarginTop={true} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Warning Section */}
          <View style={styles.warningSection}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning" size={40} color={theme.colors.error} />
            </View>
            <Text style={styles.warningTitle}>Permanent Action</Text>
            <Text style={styles.warningText}>
              Deleting your account is permanent and cannot be undone. All your data, including profile information, property listings, and chat history will be permanently removed.
            </Text>
          </View>

          {/* What Will Be Deleted */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What will be deleted:</Text>
            <View style={styles.itemsList}>
              <View style={styles.listItem}>
                <Ionicons name="person" size={20} color={theme.colors.error} />
                <Text style={styles.listItemText}>Your profile and personal information</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="home" size={20} color={theme.colors.error} />
                <Text style={styles.listItemText}>All property listings and photos</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="chatbubble" size={20} color={theme.colors.error} />
                <Text style={styles.listItemText}>Message history and conversations</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="bookmark" size={20} color={theme.colors.error} />
                <Text style={styles.listItemText}>Saved properties and preferences</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="time" size={20} color={theme.colors.error} />
                <Text style={styles.listItemText}>Booking history and transactions</Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Reason Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Why are you leaving us? (Optional)</Text>
              <View style={styles.reasonsContainer}>
                {reasons.map((reasonOption, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.reasonItem,
                      reason === reasonOption && styles.reasonSelected,
                    ]}
                    onPress={() => setReason(reasonOption)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.radioButton,
                      reason === reasonOption && styles.radioButtonSelected,
                    ]}>
                      {reason === reasonOption && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={[
                      styles.reasonText,
                      reason === reasonOption && styles.reasonTextSelected,
                    ]}>
                      {reasonOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.reason && <Text style={styles.errorText}>{errors.reason}</Text>}
            </View>

            {/* Password Confirmation */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm with your password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Final Confirmation */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type "DELETE" to confirm</Text>
              <View style={[styles.inputWrapper, errors.confirmation && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="DELETE"
                  placeholderTextColor={theme.colors.placeholder}
                  value={confirmation}
                  onChangeText={setConfirmation}
                  autoCapitalize="characters"
                />
              </View>
              {errors.confirmation && <Text style={styles.errorText}>{errors.confirmation}</Text>}
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
              onPress={handleDeleteAccount}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>
                {loading ? "Deleting Account..." : "Delete My Account"}
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Keep My Account</Text>
            </TouchableOpacity>
          </View>

          {/* Support Section */}
          <View style={styles.supportSection}>
            <Text style={styles.supportTitle}>Need help instead?</Text>
            <Text style={styles.supportText}>
              If you're experiencing issues, our support team is here to help. Consider reaching out before deleting your account.
            </Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => router.push("/screens/contactSupport")}
              activeOpacity={0.7}
            >
              <Ionicons name="headset" size={20} color={theme.colors.primary} />
              <Text style={styles.supportButtonText}>Contact Support</Text>
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
  warningSection: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  warningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.destructiveBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  warningTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  warningText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  itemsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  listItemText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  form: {
    marginBottom: theme.spacing.xl,
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
  reasonsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  reasonSelected: {
    backgroundColor: theme.colors.surfaceLight,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  reasonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  reasonTextSelected: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
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
  deleteButton: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  supportSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  supportTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  supportText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  supportButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
});

export default DeleteAccount;