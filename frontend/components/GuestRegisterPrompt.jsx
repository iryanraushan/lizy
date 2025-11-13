import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";

const GuestRegisterPrompt = ({ feature = "this feature" }) => {
  const handleRegister = () => {
    router.push("/(auth)/registration");
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const getFeatureIcon = () => {
    switch (feature) {
      case "notifications":
        return "bell";
      case "saved properties":
        return "heart";
      default:
        return "lock";
    }
  };

  const getFeatureTitle = () => {
    switch (feature) {
      case "notifications":
        return "Get Notifications";
      case "saved properties":
        return "Save Properties";
      default:
        return "Access Feature";
    }
  };

  const getFeatureDescription = () => {
    switch (feature) {
      case "notifications":
        return "Stay updated with property alerts, messages from owners, and important updates by creating an account.";
      case "saved properties":
        return "Save your favorite properties, create collections, and access them anytime by creating an account.";
      default:
        return `Please register or login to access ${feature}.`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name={getFeatureIcon()} size={48} color="#06b6d4" />
        </View>

        <Text style={styles.title}>{getFeatureTitle()}</Text>
        <Text style={styles.description}>{getFeatureDescription()}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Feather name="user-plus" size={20} color="#ffffff" />
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Feather name="log-in" size={20} color="#06b6d4" />
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Why register?</Text>
          <View style={styles.benefitItem}>
            <Feather name="check" size={16} color="#10b981" />
            <Text style={styles.benefitText}>Save and organize properties</Text>
          </View>
          <View style={styles.benefitItem}>
            <Feather name="check" size={16} color="#10b981" />
            <Text style={styles.benefitText}>Contact property owners directly</Text>
          </View>
          <View style={styles.benefitItem}>
            <Feather name="check" size={16} color="#10b981" />
            <Text style={styles.benefitText}>Get personalized notifications</Text>
          </View>
          <View style={styles.benefitItem}>
            <Feather name="check" size={16} color="#10b981" />
            <Text style={styles.benefitText}>Access exclusive features</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GuestRegisterPrompt;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing["2xl"],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing["2xl"],
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSubtle,
    textAlign: "center",
    lineHeight: theme.typography.lineHeight.normal,
    marginBottom: theme.spacing["3xl"],
  },
  buttonContainer: {
    width: "100%",
    gap: theme.spacing.lg,
    marginBottom: theme.spacing["3xl"],
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
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#06b6d4",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing["2xl"],
    borderRadius: theme.borderRadius.md,
  },
  loginButtonText: {
    color: "#06b6d4",
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  benefitsContainer: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing["2xl"],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  benefitsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  benefitText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
});