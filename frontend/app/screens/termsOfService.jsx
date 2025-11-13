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
import { TERMS_OF_SERVICE_CONSTANTS, COMMON_CONSTANTS } from "../../constants/helpConstants";

const TermsOfService = () => {

  const renderSection = (section) => (
    <View key={section.id} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <Header title={TERMS_OF_SERVICE_CONSTANTS.TITLE} noMarginTop={true} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>{TERMS_OF_SERVICE_CONSTANTS.TITLE}</Text>
          <Text style={styles.lastUpdated}>{TERMS_OF_SERVICE_CONSTANTS.LAST_UPDATED}</Text>
          <Text style={styles.introText}>
            {TERMS_OF_SERVICE_CONSTANTS.INTRO_TEXT_1}
          </Text>
          <Text style={styles.introText}>
            {TERMS_OF_SERVICE_CONSTANTS.INTRO_TEXT_2}
          </Text>
        </View>

        {/* Terms Sections */}
        <View style={styles.termsContainer}>
          {TERMS_OF_SERVICE_CONSTANTS.SECTIONS.map(renderSection)}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Ionicons name="document-text" size={24} color={theme.colors.primary} />
            <View style={styles.footerText}>
              <Text style={styles.footerTitle}>{TERMS_OF_SERVICE_CONSTANTS.FOOTER_TITLE}</Text>
              <Text style={styles.footerSubtitle}>
                {TERMS_OF_SERVICE_CONSTANTS.FOOTER_SUBTITLE}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push("/screens/contactSupport")}
            activeOpacity={0.7}
          >
            <Text style={styles.contactButtonText}>{TERMS_OF_SERVICE_CONSTANTS.CONTACT_BUTTON_TEXT}</Text>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  introTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
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
  },
  termsContainer: {
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

export default TermsOfService;