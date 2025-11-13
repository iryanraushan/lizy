import { Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import GuestRegisterPrompt from "../../components/GuestRegisterPrompt";
import PropertyCard from "../../components/PropertyCard";
import { theme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useDatabase } from "../../context/DatabaseContext";

const ListedProperties = () => {
  const router = useRouter();
  const { currentUser, isGuest } = useAuth();

  if (isGuest) {
    return <GuestRegisterPrompt feature="property management" />;
  }
  const {
    properties,
    propertiesLoading,
    fetchProperties,
    deleteProperty,
  } = useDatabase();

  const [filteredProperties, setFilteredProperties] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filters, setFilters] = useState({});

  const filters_config = [
    { key: "all", label: "All", icon: "home" },
    { key: "Available", label: "Available", icon: "check-circle" },
    { key: "Occupied", label: "Occupied", icon: "users" },
    { key: "Maintenance", label: "Maintenance", icon: "tool" },
  ];

  // Initial load
  useEffect(() => {
    if (currentUser) {
      loadInitialProperties();
    }
  }, [currentUser]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (currentUser) {
        loadInitialProperties();
      }
    }, [currentUser, loadInitialProperties])
  );

  // Apply filters locally for better performance
  useEffect(() => {
    let filtered = properties;

    if (selectedFilter !== "all") {
      filtered = filtered.filter((p) => p.availability === selectedFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.city?.toLowerCase().includes(query) ||
          p.location?.toLowerCase().includes(query) ||
          p.type?.toLowerCase().includes(query)
      );
    }

    setFilteredProperties(filtered);
  }, [properties, selectedFilter, searchQuery]);

  const loadInitialProperties = useCallback(async () => {
    try {
      await fetchProperties({ page: 1, size: 20 }, true); // Force refresh
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  }, [fetchProperties]);

  const loadMoreProperties = useCallback(async () => {
    if (loadingMore || propertiesLoading) return;

    try {
      setLoadingMore(true);
      // Calculate next page based on current properties length
      const nextPage = Math.floor(filteredProperties.length / 20) + 1;
      await fetchProperties({ page: nextPage, size: 20 });
    } catch (error) {
      console.error('Failed to load more properties:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, propertiesLoading, filteredProperties.length, fetchProperties]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialProperties();
    } finally {
      setRefreshing(false);
    }
  }, [loadInitialProperties]);

  const handleScroll = useCallback(
    (event) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;

      if (isCloseToBottom && !loadingMore && !propertiesLoading) {
        loadMoreProperties();
      }
    },
    [loadingMore, propertiesLoading, loadMoreProperties]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Feather name="home" size={48} color="#64748b" />
      </View>
      <Text style={styles.emptyTitle}>No Properties Listed</Text>
      <Text style={styles.emptySubtitle}>
        Start by adding your first property to rent out
      </Text>
      <TouchableOpacity
        style={styles.addPropertyButton}
        onPress={() => router.push("/screens/profile/addProperty")}
      >
        <Feather name="plus" size={20} color="#ffffff" />
        <Text style={styles.addPropertyButtonText}>
          Add Your First Property
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadMoreButton = () => {
    // Only show if we have properties and might have more
    if (filteredProperties.length === 0 || filteredProperties.length < 20) return null;

    return (
      <View style={styles.loadMoreContainer}>
        {loadingMore ? (
          <ActivityIndicator size="small" color="#10b981" />
        ) : (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={loadMoreProperties}
          >
            <Text style={styles.loadMoreText}>Load More Properties</Text>
            <Feather name="chevron-down" size={16} color="#10b981" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleFilterChange = useCallback((filterKey) => {
    setSelectedFilter(filterKey);
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);
  const handleDeleteProperty = useCallback(async (propertyId) => {
    try {
      await deleteProperty(propertyId);
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  }, [deleteProperty]);

  if (propertiesLoading && properties.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading your properties...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
            colors={["#10b981"]}
            progressBackgroundColor="#0f172a"
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search properties..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange("")}>
                <Feather name="x" size={18} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterIcon}>
            <Feather name="filter" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filters_config.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.filterTabActive,
              ]}
              onPress={() => handleFilterChange(filter.key)}
            >
              <Feather
                name={filter.icon}
                size={14}
                color={selectedFilter === filter.key ? "#ffffff" : "#94a3b8"}
              />
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter.key && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.propertiesContainer}>
          {filteredProperties.length === 0 && !propertiesLoading
            ? renderEmptyState()
            : filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  showOwnerActions={true}
                  onEdit={() =>
                    router.push({
                      pathname: "/screens/profile/addProperty",
                      params: {
                        editMode: "true",
                        propertyId: property.id,
                        propertyData: JSON.stringify(property),
                      },
                    })
                  }
                  onDelete={() => deleteProperty(property.id)}
                />
              ))}

          {renderLoadMoreButton()}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
};

export default ListedProperties;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.fontSize.base,
    marginTop: theme.spacing.lg,
    fontWeight: theme.typography.fontWeight.medium,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.lg,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
    marginLeft: theme.spacing.md,
  },
  filterIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterContainer: {
    marginBottom: theme.spacing.xl,
    marginHorizontal: theme.spacing.xl,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 36,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  filterTabText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: 6,
  },
  filterTabTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  propertiesContainer: {
    paddingHorizontal: theme.spacing.xl,
  },
  loadMoreContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadMoreText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginRight: theme.spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: theme.spacing["5xl"],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing["2xl"],
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSubtle,
    textAlign: "center",
    lineHeight: theme.typography.lineHeight.normal,
    marginBottom: theme.spacing["3xl"],
  },
  addPropertyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing["2xl"],
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  addPropertyButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  bottomSpacing: {
    height: 50,
  },
});
