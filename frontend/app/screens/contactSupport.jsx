import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useContext } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { theme } from "../../constants/theme";
import {
  CONTACT_SUPPORT_CONSTANTS,
} from "../../constants/helpConstants";
import { AuthContext, useAuth } from "../../context/AuthContext";
import { ToastContext, useToast } from "../../context/ToastContext";
import { supportAPI } from "../../services/api";

const ContactSupport = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const getCategoryColor = (icon) => {
    const colorMap = {
      bug: theme.colors.error,
      "person-circle": theme.colors.blue,
      home: theme.colors.primary,
      card: theme.colors.warning,
      "shield-checkmark": theme.colors.purple,
      "chatbubble-ellipses": theme.colors.cyan,
    };
    return colorMap[icon] || theme.colors.primary;
  };
  const getContactMethodColor = (icon) => {
    const colorMap = {
      mail: theme.colors.primary,
      call: theme.colors.success,
      "logo-whatsapp": "#25D366",
    };
    return colorMap[icon] || theme.colors.primary;
  };

  const { showToast } = useToast()

  const handleContactMethod = (methodId) => {
    if (methodId === "whatsapp") {
      return openWhatsApp();
    }
  };

  const categories = CONTACT_SUPPORT_CONSTANTS.CATEGORIES.map((cat) => ({
    ...cat,
    color: getCategoryColor(cat.icon),
  }));

  const contactMethods = CONTACT_SUPPORT_CONSTANTS.CONTACT_METHODS.map(
    (method) => ({
      ...method,
      color: getContactMethodColor(method.icon),
      onPress: () => handleContactMethod(method.id),
    })
  );



  const openWhatsApp = () => {
    const categoryText = selectedCategory
      ? categories.find((c) => c.id === selectedCategory)?.title
      : "General Inquiry";

    const whatsappMessage = `${
      CONTACT_SUPPORT_CONSTANTS.EMAIL_TEMPLATES.WHATSAPP_PREFIX
    } ${categoryText}. ${message || ""}`;
    const phoneNumber =
      CONTACT_SUPPORT_CONSTANTS.CONTACT_METHODS[0].subtitle.replace(
        /[^0-9]/g,
        ""
      );
    Linking.openURL(
      `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
        whatsappMessage
      )}`
    );
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !subject || !message) {
      Alert.alert(
        CONTACT_SUPPORT_CONSTANTS.ALERTS.MISSING_INFO.TITLE,
        CONTACT_SUPPORT_CONSTANTS.ALERTS.MISSING_INFO.MESSAGE
      );
      return;
    }

    setLoading(true);
  
    try {
      const result = await supportAPI.reportProblem({
        category: selectedCategory,
        subject,
        message,
      });

      showToast(result.message, 'success');
      
      // Reset form
      setSelectedCategory(null);
      setSubject("");
      setMessage("");
      
    } catch (error) {
      console.error('Submit error:', error);
      showToast(error.message || 'Failed to submit problem report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryItem,
        selectedCategory === category.id && styles.categorySelected,
      ]}
      onPress={() => setSelectedCategory(category.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
        <Ionicons
          name={category.icon}
          size={24}
          color={theme.colors.textPrimary}
        />
      </View>
      <View style={styles.categoryContent}>
        <Text
          style={[
            styles.categoryTitle,
            selectedCategory === category.id && styles.categoryTitleSelected,
          ]}
        >
          {category.title}
        </Text>
        <Text
          style={[
            styles.categorySubtitle,
            selectedCategory === category.id && styles.categorySubtitleSelected,
          ]}
        >
          {category.subtitle}
        </Text>
      </View>
      <View
        style={[
          styles.radioButton,
          selectedCategory === category.id && styles.radioButtonSelected,
        ]}
      >
        {selectedCategory === category.id && (
          <View style={styles.radioButtonInner} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderContactMethod = (method) => (
    <TouchableOpacity
      key={method.id}
      style={styles.contactMethodItem}
      onPress={method.onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.contactMethodIcon, { backgroundColor: method.color }]}
      >
        <Ionicons
          name={method.icon}
          size={24}
          color={theme.colors.textPrimary}
        />
      </View>
      <View style={styles.contactMethodContent}>
        <Text style={styles.contactMethodTitle}>{method.title}</Text>
        <Text style={styles.contactMethodSubtitle}>{method.subtitle}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textMuted}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      <Header
        title={CONTACT_SUPPORT_CONSTANTS.CONTACT_SUPPORT_TITLE}
        noMarginTop={true}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {CONTACT_SUPPORT_CONSTANTS.QUICK_CONTACT_METHODS_TITLE}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {CONTACT_SUPPORT_CONSTANTS.QUICK_CONTACT_SUBTITLE}
          </Text>

          <View style={styles.contactMethodsContainer}>
            {contactMethods.map(renderContactMethod)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {CONTACT_SUPPORT_CONSTANTS.DETAILED_MESSAGE_TITLE}
          </Text>

          <View style={styles.subsection}>
            <Text style={styles.fieldLabel}>
              {CONTACT_SUPPORT_CONSTANTS.CATEGORY_LABEL}
            </Text>
            <View style={styles.categoriesContainer}>
              {categories.map(renderCategory)}
            </View>
          </View>



          {/* Subject Input */}
          <View style={styles.subsection}>
            <Text style={styles.fieldLabel}>
              {CONTACT_SUPPORT_CONSTANTS.SUBJECT_LABEL}
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={CONTACT_SUPPORT_CONSTANTS.SUBJECT_PLACEHOLDER}
                placeholderTextColor={theme.colors.placeholder}
                value={subject}
                onChangeText={setSubject}
              />
            </View>
          </View>

          {/* Message Input */}
          <View style={styles.subsection}>
            <Text style={styles.fieldLabel}>
              {CONTACT_SUPPORT_CONSTANTS.MESSAGE_LABEL}
            </Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={CONTACT_SUPPORT_CONSTANTS.MESSAGE_PLACEHOLDER}
                placeholderTextColor={theme.colors.placeholder}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {loading
                ? CONTACT_SUPPORT_CONSTANTS.SENDING_TEXT
                : CONTACT_SUPPORT_CONSTANTS.SEND_BUTTON_TEXT}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Support Hours */}
        <View style={styles.section}>
          <View style={styles.supportHours}>
            <Ionicons name="time" size={24} color={theme.colors.primary} />
            <View style={styles.supportHoursContent}>
              <Text style={styles.supportHoursTitle}>
                {CONTACT_SUPPORT_CONSTANTS.SUPPORT_HOURS.TITLE}
              </Text>
              <Text style={styles.supportHoursText}>
                {CONTACT_SUPPORT_CONSTANTS.SUPPORT_HOURS.WEEKDAYS}
              </Text>
              <Text style={styles.supportHoursText}>
                {CONTACT_SUPPORT_CONSTANTS.SUPPORT_HOURS.WEEKENDS}
              </Text>
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
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  contactMethodsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  contactMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  contactMethodContent: {
    flex: 1,
  },
  contactMethodTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  contactMethodSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  contactMethodDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    lineHeight: 16,
  },
  subsection: {
    marginBottom: theme.spacing.xl,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  categoriesContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  categorySelected: {
    backgroundColor: theme.colors.surfaceLight,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  categoryTitleSelected: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  categorySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  categorySubtitleSelected: {
    color: theme.colors.textSecondary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
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
  inputWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textAreaWrapper: {
    height: 120,
  },
  input: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    marginTop: theme.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  supportHours: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  supportHoursContent: {
    marginLeft: theme.spacing.md,
  },
  supportHoursTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  supportHoursText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  contactInfoLast: {
    borderBottomWidth: 0,
  },
});

export default ContactSupport;
