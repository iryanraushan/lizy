import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { theme } from "../../constants/theme";
import { HELP_CONSTANTS, COMMON_CONSTANTS } from "../../constants/helpConstants";

const Help = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  
  const getActionColor = (icon) => {
    const colorMap = {
      'headset': theme.colors.primary,
      'shield-checkmark': theme.colors.success,
      'document-text': theme.colors.blue,
      'play-circle': theme.colors.warning
    };
    return colorMap[icon] || theme.colors.primary;
  };
  
  const handleActionPress = (action) => {
    if (action.route) {
      router.push(action.route);
    } else if (action.url) {
      Linking.openURL(action.url);
    }
  };
  
  const quickActions = HELP_CONSTANTS.QUICK_ACTIONS.map(action => ({
    ...action,
    color: getActionColor(action.icon),
    onPress: () => handleActionPress(action)
  }));

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionItem}
      onPress={action.onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon} size={24} color={theme.colors.textPrimary} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{action.title}</Text>
        <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );

  const renderFAQItem = (faq, isLast) => (
    <TouchableOpacity
      key={faq.id}
      style={[styles.faqItem, isLast && styles.faqItemLast]}
      onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
      activeOpacity={0.9}
    >
      <View style={styles.faqQuestionRow}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Ionicons
          name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.colors.textMuted}
        />
      </View>
      {expandedFAQ === faq.id && (
        <Text style={styles.faqAnswer}>{faq.answer}</Text>
      )}
    </TouchableOpacity>
  );

  const groupedFAQs = HELP_CONSTANTS.FAQ_DATA.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <Header title={HELP_CONSTANTS.HELP_CENTER_TITLE} noMarginTop={true} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="help-circle" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.welcomeTitle}>{HELP_CONSTANTS.WELCOME_TITLE}</Text>
          <Text style={styles.welcomeSubtitle}>
            {HELP_CONSTANTS.WELCOME_SUBTITLE}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{HELP_CONSTANTS.QUICK_ACTIONS_TITLE}</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{HELP_CONSTANTS.FAQ_TITLE}</Text>
          
          {Object.entries(groupedFAQs).map(([category, faqs]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <View style={styles.faqContainer}>
                {faqs.map((faq, index) => renderFAQItem(faq, index === faqs.length - 1))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{HELP_CONSTANTS.STILL_NEED_HELP_TITLE}</Text>
          <View style={styles.contactContainer}>
            <View style={styles.contactInfo}>
              <Ionicons name="mail" size={24} color={theme.colors.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactTitle}>{HELP_CONSTANTS.CONTACT_INFO.EMAIL.TITLE}</Text>
                <Text style={styles.contactSubtitle}>{HELP_CONSTANTS.CONTACT_INFO.EMAIL.VALUE}</Text>
              </View>
            </View>
            
            <View style={[styles.contactInfo, styles.contactInfoLast]}>
              <Ionicons name="call" size={24} color={theme.colors.primary} />
              <View style={styles.contactDetails}>
                <Text style={styles.contactTitle}>{HELP_CONSTANTS.CONTACT_INFO.PHONE.TITLE}</Text>
                <Text style={styles.contactSubtitle}>{HELP_CONSTANTS.CONTACT_INFO.PHONE.VALUE}</Text>
              </View>
            </View>
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
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing["3xl"],
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  welcomeTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  quickActionsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickActionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  categorySection: {
    marginBottom: theme.spacing.xl,
  },
  categoryTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  faqContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  faqItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqQuestionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.md,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginTop: theme.spacing.md,
  },
  contactContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contactInfoLast: {
    borderBottomWidth: 0,
  },
  contactDetails: {
    marginLeft: theme.spacing.md,
  },
  contactTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
});

export default Help;