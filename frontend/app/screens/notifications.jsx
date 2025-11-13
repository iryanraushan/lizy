import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { useNotification } from "../../context/NotificationContext";
import { useFocusEffect } from "@react-navigation/native";

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotification();
  
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      const response = await fetchNotifications(1);
      setPage(1);
      setHasMore(response?.next ? true : false);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    
    try {
      const nextPage = page + 1;
      const response = await fetchNotifications(nextPage);
      setPage(nextPage);
      setHasMore(response?.next ? true : false);
    } catch (error) {
      console.error('Error loading more notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return { icon: 'chatbubble', color: theme.colors.blue };
      case 'favorite':
        return { icon: 'heart', color: theme.colors.error };
      case 'property_update':
        return { icon: 'home', color: theme.colors.success };
      default:
        return { icon: 'notifications', color: theme.colors.primary };
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderNotificationItem = (notification) => {
    const { icon, color } = getNotificationIcon(notification.notification_type);
    
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          !notification.is_read && styles.unreadNotification,
        ]}
        onPress={() => markAsRead(notification.id)}
        activeOpacity={0.9}
      >
        <View style={styles.notificationContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: color },
            ]}
          >
            <Ionicons
              name={icon}
              size={20}
              color={theme.colors.textPrimary}
            />
          </View>

          <View style={styles.notificationText}>
            <Text
              style={[
                styles.notificationTitle,
                !notification.is_read && styles.unreadTitle,
              ]}
            >
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.body}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTime(notification.created_at)}
            </Text>
            {notification.sender_name && (
              <Text style={styles.senderName}>
                From: {notification.sender_name}
              </Text>
            )}
          </View>

          <View style={styles.notificationActions}>
            {!notification.is_read && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSettingItem = (key, title, subtitle) => (
    <View key={key} style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) =>
          setSettings((prev) => ({ ...prev, [key]: value }))
        }
        trackColor={{
          false: theme.colors.surfaceLight,
          true: theme.colors.primary,
        }}
        thumbColor={
          settings[key] ? theme.colors.textPrimary : theme.colors.textMuted
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.settingsContainer}>
            {renderSettingItem("pushNotifications", "Push Notifications", "Receive notifications on your device")}
            {renderSettingItem("emailNotifications", "Email Notifications", "Get updates via email")}
            {renderSettingItem("smsNotifications", "SMS Notifications", "Receive text messages")}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to be notified about?</Text>
          
          <View style={styles.settingsContainer}>
            {renderSettingItem("newMatches", "New Property Matches", "Properties that match your search criteria")}
            {renderSettingItem("messages", "Messages", "New messages from property owners")}
            {renderSettingItem("bookingUpdates", "Booking Updates", "Updates about your bookings")}
            {renderSettingItem("priceAlerts", "Price Alerts", "When property prices change")}
            {renderSettingItem("marketingEmails", "Marketing Emails", "Promotional offers and updates")}
          </View>
        </View> */}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.notificationsContainer}>
          {loading && notifications.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : notifications.length > 0 ? (
            <>
              {notifications.map(renderNotificationItem)}
              {hasMore && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <Text style={styles.loadMoreText}>Load More</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-off"
                size={48}
                color={theme.colors.textMuted}
              />
              <Text style={styles.emptyStateText}>No notifications yet</Text>
              <Text style={styles.emptyStateSubtext}>
                You'll see your notifications here when they arrive
              </Text>
            </View>
          )}
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
  headerTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.sm,
  },
  unreadBadge: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  unreadBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  markAllButton: {
    padding: theme.spacing.sm,
  },
  markAllText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
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
    marginBottom: theme.spacing.lg,
  },
  settingsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingContent: {
    flex: 1,
    marginRight: theme.spacing.lg,
  },
  settingTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  notificationItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  unreadNotification: {
    backgroundColor: theme.colors.surfaceLight,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  notificationText: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  notificationTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  notificationMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
  },
  notificationActions: {
    alignItems: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing["5xl"],
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing["3xl"],
  },
  loadMoreButton: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadMoreText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
  senderName: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    fontStyle: "italic",
    marginTop: 2,
  },
});

export default Notifications;
