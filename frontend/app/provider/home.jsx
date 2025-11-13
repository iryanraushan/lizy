import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import PropertyCard from "../../components/PropertyCard";
import AnalyticsGrid from "../../components/AnalyticsGrid";
import { theme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useDatabase } from "../../context/DatabaseContext";
import IconComponent from "../../components/IconComponent";
import { propertyAPI } from "../../services/api";

const Home = () => {
  const { currentUser } = useAuth();
  const {
    properties,
    loading,
    error,
    fetchProperties,
    fetchMyPropertyCount,
    clearError,
  } = useDatabase();

  const [refreshing, setRefreshing] = useState(false);
  const [showPhoneAlert, setShowPhoneAlert] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (
      currentUser &&
      (!currentUser.phone || currentUser.phone.trim() === "")
    ) {
      setShowPhoneAlert(true);
    }

    // Clear any previous errors when component mounts
    if (error) {
      clearError();
    }
  }, [currentUser, error, clearError]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const response = await propertyAPI.getProviderAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProperties({ page: 1, size: 20 }, true); // Force refresh on focus
      fetchMyPropertyCount();
      fetchAnalytics();
    }, [fetchProperties, fetchMyPropertyCount, fetchAnalytics])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchProperties({ page: 1, size: 20 }, true), // Force refresh
        fetchMyPropertyCount(),
        fetchAnalytics(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProperties, fetchMyPropertyCount, fetchAnalytics]);

  const handleSearchPress = () => {
    router.push("/screens/search");
  };

  const handleAddProperty = () => {
    router.push("/screens/profile/addProperty");
  };

  const handleManageProperties = () => {
    router.push("/provider/listedProperties");
  };

  const handleEditProfile = () => {
    router.push("/screens/profile/editProfile");
  };

  const handlePropertyPress = (propertyId) => {
    if (!propertyId) {
      console.error("Property ID is missing:", propertyId);
      return;
    }
    router.push(`/screens/property/${propertyId}`);
  };

  const renderPhoneAlert = () => {
    if (!showPhoneAlert) return null;

    return (
      <View style={styles.phoneAlertContainer}>
        <View style={styles.phoneAlert}>
          <Feather name="phone" size={20} color={theme.colors.warning} />
          <View style={styles.phoneAlertText}>
            <Text style={styles.phoneAlertTitle}>Add Phone Number</Text>
            <Text style={styles.phoneAlertSubtitle}>
              Add your phone number to make it easier for clients to reach you
            </Text>
          </View>
          <TouchableOpacity
            style={styles.phoneAlertButton}
            onPress={handleEditProfile}
            activeOpacity={0.9}
          >
            <Text style={styles.phoneAlertButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.phoneAlertClose}
          onPress={() => setShowPhoneAlert(false)}
          activeOpacity={0.9}
        >
          <Feather name="x" size={18} color={theme.colors.textSubtle} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderErrorAlert = () => {
    if (!error) return null;

    return (
      <View style={styles.errorAlertContainer}>
        <View style={styles.errorAlert}>
          <Feather name="alert-circle" size={20} color={theme.colors.error} />
          <View style={styles.errorAlertText}>
            <Text style={styles.errorAlertTitle}>Error</Text>
            <Text style={styles.errorAlertSubtitle}>{error}</Text>
          </View>
          <TouchableOpacity
            style={styles.errorAlertButton}
            onPress={clearError}
            activeOpacity={0.9}
          >
            <Text style={styles.errorAlertButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{currentUser?.name || "Provider"}</Text>
        </View>
      </View>

      {/* <TouchableOpacity
        style={styles.searchContainer}
        onPress={handleSearchPress}
        activeOpacity={0.8}
      >
        <Feather name="search" size={18} color={theme.colors.textSubtle} />
        <Text style={styles.searchPlaceholder}>
          Search locations for properties...
        </Text>
        <Feather name="arrow-right" size={18} color={theme.colors.primary} />
      </TouchableOpacity> */}
    </View>
  );

  const analyticsConfig = [
    {
      key: 'views',
      icon: 'eye',
      iconColor: theme.colors.blue,
      borderColor: theme.colors.blueDark,
      dataKey: 'total_views',
      title: 'Total Views',
      subtitle: (data) => `+${data.views_this_week || 0} this week`
    },
    {
      key: 'favorites',
      icon: 'heart',
      iconColor: theme.colors.primary,
      borderColor:theme.colors.primaryDark,
      dataKey: 'total_favorites',
      title: 'Total Favorites',
      subtitle: (data) => `+${data.favorites_this_week || 0} this week`
    },
    {
      key: 'viewers',
      icon: 'users',
      iconColor: theme.colors.cyan,
      borderColor:theme.colors.cyanDark,
      dataKey: 'unique_viewers',
      title: 'Unique Viewers',
      subtitle: () => 'People interested'
    },
    {
      key: 'properties',
      icon: 'home',
      iconColor: theme.colors.purple,
      borderColor:theme.colors.purpleDark,
      dataKey: 'active_properties',
      title: 'Active Properties',
      subtitle: (data) => `of ${data.total_properties || 0} total`
    }
  ];

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <AnalyticsGrid
        title="Analytics Overview"
        data={analytics}
        loading={analyticsLoading}
        cardConfigs={analyticsConfig}
      />
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[
            styles.quickActionCard,
            { backgroundColor: theme.colors.primary + "20" },
          ]}
          onPress={handleAddProperty}
          activeOpacity={0.9}
        >
          <IconComponent
            iconName="plus-circle"
            iconFamily={"AntDesign"}
            size={28}
            color={theme.colors.primary}
          />
          <Text style={styles.quickActionText}>Add more</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionCard,
            { backgroundColor: theme.colors.blue + "20" },
          ]}
          onPress={handleManageProperties}
          activeOpacity={0.9}
        >
          <Feather name="list" size={28} color={theme.colors.blue} />
          <Text style={styles.quickActionText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentProperties = () => {
    const recentProperties = properties?.slice(0, 5) || [];
    if (recentProperties.length === 0 && !loading) {
      return (
        <View style={styles.recentPropertiesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Properties</Text>
          </View>
          <View style={styles.emptyState}>
            <Feather name="home" size={48} color={theme.colors.textSubtle} />
            <Text style={styles.emptyTitle}>No Properties Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by adding your first property
            </Text>
            <TouchableOpacity
              style={styles.addFirstPropertyButton}
              onPress={handleAddProperty}
            >
              <Text style={styles.addFirstPropertyButtonText}>
                Add Property
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.recentPropertiesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Properties</Text>
          <TouchableOpacity
            onPress={handleManageProperties}
            activeOpacity={0.9}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <View style={styles.propertiesGrid}>
            {recentProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={handlePropertyPress}
                showEditButton={true}
                showStatusButton={true}
                providerView={true}
                onEdit={() => {
                  router.push({
                    pathname: "/screens/profile/addProperty",
                    params: {
                      editMode: "true",
                      propertyId: property.id,
                      propertyData: JSON.stringify(property),
                    },
                  });
                }}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {renderHeader()}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.background}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderErrorAlert()}
        {renderPhoneAlert()}
        {renderAnalytics()}
        {renderQuickActions()}
        {renderRecentProperties()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header Styles
  headerContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    // paddingBottom: theme.spacing.lg,
    // borderBottomWidth: 1,
    // borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSubtle,
    marginBottom: 4,
  },
  userName: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  // Search Styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSubtle,
  },

  phoneAlertContainer: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    position: "relative",
  },
  phoneAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.warning + "15",
    borderColor: theme.colors.warning + "30",
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  phoneAlertText: {
    flex: 1,
  },
  phoneAlertTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  phoneAlertSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSubtle,
    lineHeight: theme.typography.lineHeight.tight,
  },
  phoneAlertButton: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  phoneAlertButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.background,
  },
  phoneAlertClose: {
    position: "absolute",
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    padding: theme.spacing.xs,
  },

  // Error Alert Styles
  errorAlertContainer: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.error + "15",
    borderColor: theme.colors.error + "30",
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  errorAlertText: {
    flex: 1,
  },
  errorAlertTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  errorAlertSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSubtle,
    lineHeight: theme.typography.lineHeight.tight,
  },
  errorAlertButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  errorAlertButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.background,
  },

  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing["5xl"],
  },

  sectionTitle: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    fontSize: theme.typography.fontSize.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewAllText: {
    color: theme.colors.primary,
  },

  quickActionsContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },

  analyticsContainer: {
    marginHorizontal: theme.spacing.xl,
  },

  recentPropertiesContainer: {
    paddingHorizontal: theme.spacing.xl,
  },
  propertiesGrid: {
    gap: theme.spacing.xs,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["3xl"],
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["3xl"],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSubtle,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  addFirstPropertyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  addFirstPropertyButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
});
