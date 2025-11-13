import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { theme } from "../../constants/theme";

const settingsOptions = [
  {
    id: "1",
    title: "Change Password",
    subtitle: "Update your account password",
    icon: "lock-closed",
    onPress: () => router.push("/screens/settings/changePassword"),
  },
  {
    id: "2",
    title: "Forgot Password",
    subtitle: "Reset your password via email/phone",
    icon: "help-circle",
    onPress: () => router.push("/screens/settings/forgotPassword"),
  },
  {
    id: "4",
    title: "Delete Account",
    subtitle: "Permanently remove your account",
    icon: "trash",
    type: "danger",
    onPress: () => router.push("/screens/settings/deleteAccount"),
  },
];

const Setting = () => {
  const renderSettingItem = ({ item }) => {
    const isDanger = item.type === "danger";
    return (
      <TouchableOpacity
        style={[styles.option, isDanger && styles.dangerOption]}
        onPress={item.onPress}
        activeOpacity={0.9}
      >
        <View style={styles.optionContent}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isDanger
                  ? theme.colors.errorDark
                  : theme.colors.primary,
              },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={theme.colors.textPrimary}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[styles.optionText, isDanger && styles.dangerOptionText]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.optionSubtitle,
                isDanger && styles.dangerOptionSubtitle,
              ]}
            >
              {item.subtitle}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDanger ? theme.colors.error : theme.colors.textMuted}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <Header title="Account Settings" noMarginTop={true} />

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.subtitle}>
            Manage your account security and preferences
          </Text>
        </View>

        <FlatList
          data={settingsOptions}
          keyExtractor={(item) => item.id}
          renderItem={renderSettingItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  titleSection: {
    paddingVertical: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
  option: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dangerOption: {
    // borderColor: theme.colors.destructiveBorder,
    // backgroundColor: theme.colors.destructiveBackground,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  dangerOptionText: {
    color: theme.colors.destructive,
    // fontWeight: theme.typography.fontWeight.semibold,
  },
  optionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  dangerOptionSubtitle: {
    color: theme.colors.destructiveLight,
  },
  chevron: {
    marginLeft: theme.spacing.sm,
  },
  separator: {
    height: theme.spacing.md,
  },
});
