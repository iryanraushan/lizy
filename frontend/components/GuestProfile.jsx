import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";

const GuestProfile = () => {

  const handleRegister = () => {
    router.push("/(auth)/registration");
  };

  const handleHelp = () => {
    router.push("/screens/help");
  };

  const handleTermsOfService = () => {
    router.push("/screens/termsOfService");
  };

  const handlePrivacyPolicy = () => {
    router.push("/screens/privacyPolicy");
  };

  const handleLogout = () => {
    Alert.alert(
      "Exit Guest Mode",
      "Are you sure you want to exit guest mode?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Exit",
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Guest Banner */}
        <View style={styles.guestBanner}>
          <View style={styles.guestIconContainer}>
            <Feather name="user" size={32} color="#06b6d4" />
          </View>
          <Text style={styles.guestTitle}>Guest User</Text>
          <Text style={styles.guestSubtitle}>
            You're browsing as a guest. Register to unlock all features!
          </Text>
        </View>

        {/* Registration Prompt */}
        <View style={styles.registrationPrompt}>
          <Text style={styles.promptTitle}>Haven't Registered Yet?</Text>
          <Text style={styles.promptSubtitle}>
            Join EasyHome to save properties, contact owners, and access exclusive features.
          </Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Feather name="user-plus" size={20} color="#ffffff" />
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleHelp}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Feather name="help-circle" size={20} color="#06b6d4" />
              </View>
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleTermsOfService}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Feather name="file-text" size={20} color="#06b6d4" />
              </View>
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePrivacyPolicy}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuItemIcon}>
                <Feather name="shield" size={20} color="#06b6d4" />
              </View>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={20} color="#ef4444" />
            <Text style={styles.logoutButtonText}>Exit Guest Mode</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuestProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  guestBanner: {
    alignItems: "center",
    padding: theme.spacing["2xl"],
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  guestIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  guestTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  guestSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSubtle,
    textAlign: "center",
    lineHeight: theme.typography.lineHeight.normal,
  },
  registrationPrompt: {
    margin: theme.spacing.lg,
    padding: theme.spacing["2xl"],
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  promptTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  promptSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSubtle,
    textAlign: "center",
    lineHeight: theme.typography.lineHeight.normal,
    marginBottom: theme.spacing["2xl"],
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing["2xl"],
    borderRadius: theme.borderRadius.md,
  },
  registerButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  menuSection: {
    margin: theme.spacing.lg,
  },
  menuSectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    paddingLeft: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.lg,
  },
  menuItemText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  logoutSection: {
    margin: theme.spacing.lg,
    marginTop: theme.spacing["2xl"],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#ef4444",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing["2xl"],
    borderRadius: theme.borderRadius.md,
  },
  logoutButtonText: {
    color: "#ef4444",
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
});