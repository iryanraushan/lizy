import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { theme } from "../../constants/theme";
import { PRIVACY_POLICY_CONSTANTS, COMMON_CONSTANTS } from "../../constants/helpConstants";

const PrivacyPolicy = () => {

  const renderSection = (section) => (
    <View key={section.id} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <Header title={PRIVACY_POLICY_CONSTANTS.TITLE} noMarginTop={true} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.privacyIcon}>
            <Ionicons name="shield-checkmark" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.introTitle}>{PRIVACY_POLICY_CONSTANTS.INTRO_TITLE}</Text>
          <Text style={styles.lastUpdated}>{PRIVACY_POLICY_CONSTANTS.LAST_UPDATED}</Text>
          <Text style={styles.introText}>
            {PRIVACY_POLICY_CONSTANTS.INTRO_TEXT_1}
          </Text>
          <Text style={styles.introText}>
            {PRIVACY_POLICY_CONSTANTS.INTRO_TEXT_2}
          </Text>
        </View>

        {/* Privacy Sections */}
        <View style={styles.policyContainer}>
          {PRIVACY_POLICY_CONSTANTS.SECTIONS.map(renderSection)}
        </View>

        {/* Quick Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>{PRIVACY_POLICY_CONSTANTS.SUMMARY_TITLE}</Text>
          <View style={styles.summaryPoints}>
            {PRIVACY_POLICY_CONSTANTS.SUMMARY_POINTS.map((point, index) => (
              <View key={index} style={styles.summaryPoint}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <Text style={styles.summaryText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Ionicons name="mail" size={24} color={theme.colors.primary} />
            <View style={styles.footerText}>
              <Text style={styles.footerTitle}>{PRIVACY_POLICY_CONSTANTS.FOOTER_TITLE}</Text>
              <Text style={styles.footerSubtitle}>
                {PRIVACY_POLICY_CONSTANTS.FOOTER_SUBTITLE}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push("/screens/contactSupport")}
            activeOpacity={0.7}
          >
            <Text style={styles.contactButtonText}>{PRIVACY_POLICY_CONSTANTS.CONTACT_BUTTON_TEXT}</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  introSection: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  privacyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  introTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  lastUpdated: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  introText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  policyContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  sectionContent: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  summarySection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  summaryPoints: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  summaryPoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  summaryText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  footerText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  footerTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  footerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  contactButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
});

export default PrivacyPolicy;