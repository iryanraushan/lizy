import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import {
  getProfileMenuBySection,
  quickActions,
  sectionTitles,
} from "../../constants/profileMenu";
import { theme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { formatMemberSince } from "../../utils/utils";
import IconComponent from "../IconComponent";

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const sections = getProfileMenuBySection(currentUser?.role);
  const userQuickActions = quickActions.filter((action) =>
    action.types.includes(currentUser?.role)
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderSettingsSection = (sectionKey, items) => {
    if (items.length === 0) return null;

    return (
      <View key={sectionKey} style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>{sectionTitles[sectionKey]}</Text>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              item.isDestructive && styles.destructiveItem,
            ]}
            onPress={
              item.id === "logout"
                ? async () => {
                    setLoading(true);
                    try {
                      await logout();
                      router.replace("/(auth)/login");
                    } catch (error) {
                      console.error("Logout error:", error);
                      setLoading(false);
                    }
                  }
                : item.onPress
            }
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.navIconContainer,
                { backgroundColor: item.backgroundColor + "50" || "#334155" },
              ]}
            >
              <IconComponent
                iconName={item.iconName}
                iconFamily={item.iconFamily}
                size={20}
                color={item.iconColor || theme.colors.textPrimary}
              />
            </View>

            <View style={styles.navTextContainer}>
              <Text
                style={[
                  styles.navTitle,
                  item.isDestructive && styles.destructiveText,
                ]}
              >
                {item.title}
              </Text>
              {item.subtitle && (
                <Text
                  style={[
                    styles.navSubtitle,
                    item.isDestructive && styles.destructiveSubtitle,
                  ]}
                >
                  {item.subtitle}
                </Text>
              )}
            </View>

            <Feather
              name="chevron-right"
              size={18}
              color={
                item.isDestructive
                  ? theme.colors.destructiveLight
                  : theme.colors.textDisabled
              }
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {currentUser?.profileImageUrl ? (
              <Image 
                source={{ uri: currentUser?.profileImageUrl }} 
                style={styles.avatarImage} 
                resizeMode="contain"
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {currentUser?.name
                    ? currentUser?.name.charAt(0).toUpperCase()
                    : "The Lizy"}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{currentUser?.name}</Text>
          <Text style={styles.email}>{currentUser?.email}</Text>
          <View style={styles.roleTag}>
            <IconComponent
              iconName={currentUser?.role === "provider" ? "home" : "search"}
              iconFamily="Feather"
              size={16}
              color={theme.colors.primary}
            />
            <Text style={styles.roleText}>
              {currentUser?.role === "provider"
                ? "I have properties to rent/sell"
                : "I am looking for a property in rent/buy"}
            </Text>
          </View>
        </View>

        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{currentUser.bio || "I am a lizzy user"}</Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Feather name="calendar" size={16} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Member Since</Text>
            </View>
            <Text style={styles.infoValue}>
              {formatMemberSince(currentUser?.date_joined)}
            </Text>
          </View>
        </View>

        {Object.entries(sections).map(([sectionKey, items]) =>
          renderSettingsSection(sectionKey, items)
        )}
      </ScrollView>
    </View>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing["5xl"],
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },

  header: {
    alignItems: "center",
    paddingTop: 30,
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    resizeMode: "contain",
  },
  avatarText: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  name: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSubtle,
    marginBottom: theme.spacing.lg,
  },
  roleTag: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center",
    backgroundColor: theme.components.roleTag.backgroundColor,
    paddingHorizontal: theme.components.roleTag.paddingHorizontal,
    paddingVertical: theme.components.roleTag.paddingVertical,
    borderRadius: theme.components.roleTag.borderRadius,
    borderWidth: 1,
    borderColor: theme.components.roleTag.borderColor,
  },
  roleText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },

  bioSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bioText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.lineHeight.normal,
    letterSpacing: 1,
  },

  userInfo: {
    flexDirection: "row",
    gap: theme.spacing.xl,
    marginBottom: theme.spacing["2xl"],
  },
  infoCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSubtle,
    marginLeft: theme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
    fontWeight: theme.typography.fontWeight.medium,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
  },

  quickActionsContainer: {
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  quickActionItem: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 100,
  },
  quickActionIconContainer: {
    width: theme.components.icon.container.width,
    height: theme.components.icon.container.height,
    borderRadius: theme.components.icon.container.borderRadius,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  quickActionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },

  settingsSection: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    paddingLeft: 4,
  },

  navItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  navIconContainer: {
    width: theme.components.icon.container.width,
    height: theme.components.icon.container.height,
    borderRadius: theme.components.icon.container.borderRadius,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.lg,
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  navSubtitle: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    lineHeight: theme.typography.lineHeight.tight,
  },

  destructiveItem: {
    backgroundColor: theme.colors.destructiveBackground,
    borderColor: theme.colors.destructiveBorder,
  },
  destructiveText: {
    color: theme.colors.destructive,
  },
  destructiveSubtitle: {
    color: theme.colors.destructiveLight,
  },
});
