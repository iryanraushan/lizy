import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterDrawer from "../../components/FilterDrawer";
import Header from "../../components/Header";
import MapScreen from "../../components/MapScreen";
import PropertyCard from "../../components/PropertyCard";
import { ALL_PROPERTY_TYPES, LISTING_TYPES } from "../../constants/property";
import { theme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useDatabase } from "../../context/DatabaseContext";
import { addToSearchHistory } from "../../utils/localStorage";

const Search = () => {
  const router = useRouter();
  const { searchQuery: initialQuery } = useLocalSearchParams();
  const { currentUser } = useAuth();
  const { 
    properties: dbProperties, 
    fetchProperties, 
    addToFavorites, 
    propertiesLoading,
    clearError
  } = useDatabase();

  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [searchedProperties, setSearchedProperties] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [hasMoreProperties, setHasMoreProperties] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [showMapView, setShowMapView] = useState(false);

  const [filters, setFilters] = useState({
    type: "",
    listingType: "",
    minPrice: "",
    maxPrice: "",
    city: "",
    furnished: "",
    genderPreference: "",
    amenities: [],
    availability: "Available",
  });

  const [activeFilters, setActiveFilters] = useState([]);

  // Load initial properties if not already loaded
  useEffect(() => {
    if (!dbProperties || dbProperties.length === 0) {
      // Fetch initial properties without search criteria
      fetchProperties({
        page: 0,
        size: 20,
        sortBy: "createdAt",
        sortDirection: "desc"
      }).catch(error => {
        console.error("Failed to load initial properties:", error);
      });
    }
  }, [dbProperties, fetchProperties]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    if (location) {
      setFilters((prev) => ({
        ...prev,
        city: location.address?.city || location.name || "",
      }));

      setSearchQuery(location.name || "");

      setTimeout(() => {
        searchProperties();
      }, 100);
    } else {
      setFilters((prev) => ({
        ...prev,
        city: "",
      }));
    }
    setShowLocationSearch(false);
  };

  // Search when filters change or query changes
  useEffect(() => {
    const hasActiveFilters = searchQuery.trim() || Object.values(filters).some(value => 
      Array.isArray(value) ? value.length > 0 : Boolean(value && value !== "Available")
    );
    
    if (hasActiveFilters) {
      searchProperties();
    } else {
      // Reset to show initial properties when no search/filters
      setHasSearched(false);
      setSearchedProperties([]);
    }
  }, [filters, searchQuery]);

  const searchProperties = useCallback(
    async (loadMore = false) => {
      try {
        if (!loadMore) {
          setLoading(true);
          setSearchedProperties([]);
          setCurrentPage(0);
          setHasMoreProperties(true);
          setHasSearched(true);
        }

        // Clear any previous errors
        clearError();

        // Add to search history if there's a query
        if (searchQuery.trim()) {
          await addToSearchHistory(searchQuery.trim());
        }

        // Build search criteria only if we have filters or search query
        const hasActiveFilters = searchQuery.trim() || 
          filters.type || 
          filters.listingType || 
          filters.city || 
          filters.furnished || 
          filters.genderPreference || 
          filters.minPrice || 
          filters.maxPrice || 
          (filters.amenities && filters.amenities.length > 0);

        if (!hasActiveFilters) {
          // No search criteria, show initial properties
          setHasSearched(false);
          setSearchedProperties([]);
          setLoading(false);
          return;
        }

        const searchCriteria = {
          page: loadMore ? currentPage + 1 : 0,
          size: 10,
          sortBy: "createdAt",
          sortDirection: "desc",
        };

        // Add search query
        if (searchQuery.trim()) {
          searchCriteria.search = searchQuery.trim();
        }

        // Add filters only if they have values
        if (filters.type) {
          searchCriteria.type = filters.type;
        }
        if (filters.listingType) {
          searchCriteria.listingType = filters.listingType;
        }
        if (filters.city) {
          searchCriteria.city = filters.city;
        }
        if (filters.furnished) {
          searchCriteria.furnishingStatus = filters.furnished;
        }
        if (filters.genderPreference) {
          searchCriteria.genderPreference = filters.genderPreference;
        }
        if (filters.minPrice) {
          searchCriteria.minPrice = parseFloat(filters.minPrice);
        }
        if (filters.maxPrice) {
          searchCriteria.maxPrice = parseFloat(filters.maxPrice);
        }
        if (filters.amenities && filters.amenities.length > 0) {
          searchCriteria.amenities = filters.amenities;
        }
        if (filters.availability && filters.availability !== "Available") {
          searchCriteria.availability = filters.availability;
        }

        // Call the API with search criteria
        const response = await fetchProperties(searchCriteria);
        
        if (response && response.properties) {
          const newProperties = response.properties;
          
          if (loadMore) {
            setSearchedProperties((prev) => [...prev, ...newProperties]);
            setCurrentPage(prev => prev + 1);
          } else {
            setSearchedProperties(newProperties);
            setCurrentPage(0);
          }

          // Update pagination
          setHasMoreProperties(newProperties.length === 10 && response.hasMore !== false);
        } else {
          setSearchedProperties([]);
          setHasMoreProperties(false);
        }

        // Update active filters count
        updateActiveFilters();
      } catch (error) {
        console.error("Search error:", error);
        // Show a more user-friendly error message
        Alert.alert("Search Error", "Unable to search properties at the moment. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, filters, currentPage, fetchProperties, clearError]
  );

  const updateActiveFilters = () => {
    const active = [];
    if (filters.type)
      active.push(
        `Type: ${
          ALL_PROPERTY_TYPES.find((t) => t.value === filters.type)?.label
        }`
      );
    if (filters.listingType)
      active.push(
        `Listing: ${LISTING_TYPES[filters.listingType.toUpperCase()]?.label}`
      );
    if (filters.minPrice || filters.maxPrice) {
      const price = `₹${filters.minPrice || "0"} - ₹${filters.maxPrice || "∞"}`;
      active.push(`Price: ${price}`);
    }
    if (filters.city) active.push(`City: ${filters.city}`);
    if (filters.furnished) active.push(`Furnished: ${filters.furnished}`);
    if (filters.genderPreference)
      active.push(`Gender: ${filters.genderPreference}`);
    if (filters.amenities.length > 0)
      active.push(`${filters.amenities.length} Amenities`);
    if (filters.availability && filters.availability !== "Available")
      active.push(`Status: ${filters.availability}`);

    setActiveFilters(active);
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      listingType: "",
      minPrice: "",
      maxPrice: "",
      city: "",
      furnished: "",
      genderPreference: "",
      amenities: [],
      availability: "Available",
    });
    setActiveFilters([]);
    setSearchQuery("");
    setHasSearched(false);
    setSearchedProperties([]);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    searchProperties();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      clearError();
      const hasActiveFilters = searchQuery.trim() || 
        filters.type || 
        filters.listingType || 
        filters.city || 
        filters.furnished || 
        filters.genderPreference || 
        filters.minPrice || 
        filters.maxPrice || 
        (filters.amenities && filters.amenities.length > 0);
      
      if (hasActiveFilters) {
        await searchProperties();
      } else {
        // If no search/filters, just reset to show initial properties
        setHasSearched(false);
        setSearchedProperties([]);
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [searchProperties, searchQuery, filters]);

  const loadMoreProperties = useCallback(async () => {
    if (!loading && hasMoreProperties) {
      await searchProperties(true);
    }
  }, [loading, hasMoreProperties, searchProperties]);

  const handlePropertyPress = (propertyId) => {
    router.push(`/screens/property/${propertyId}`);
  };

  const handleMapMarkerPress = (property) => {
    setShowMapView(false);
    handlePropertyPress(property);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <Header title="Search Properties" noMarginTop={true} />
      <View style={styles.searchContainer}>
        <View style={styles.textSearchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by location, property type..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => searchProperties()}
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={18} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.switchSearchButton}
            onPress={() => setShowMapView(true)}
          >
            <Feather name="map-pin" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterDrawer(true)}
        >
          <Feather name="filter" size={20} color={theme.colors.textPrimary} />
          {activeFilters.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilters.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {selectedLocation && (
        <View style={styles.selectedLocationContainer}>
          <View style={styles.selectedLocationContent}>
            <Feather name="map-pin" size={16} color={theme.colors.primary} />
            <Text style={styles.selectedLocationText}>
              Searching near: {selectedLocation.name}
            </Text>
            <TouchableOpacity
              onPress={() => handleLocationSelect(null)}
              style={styles.clearLocationButton}
            >
              <Feather name="x" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeFilters.length > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {activeFilters.map((filter, index) => (
              <View key={index} style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{filter}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {loading || propertiesLoading
                ? "Loading properties..."
                : hasSearched
                ? `${searchedProperties?.length || 0} properties found`
                : `${dbProperties?.length || 0} properties available`}
            </Text>
          </View>

          {(loading || propertiesLoading) && (hasSearched ? searchedProperties?.length === 0 : dbProperties?.length === 0) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>
                Loading properties...
              </Text>
            </View>
          ) : (hasSearched ? searchedProperties?.length === 0 : dbProperties?.length === 0) ? (
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color="#64748b" />
              <Text style={styles.emptyTitle}>
                No Properties Available
              </Text>
              <Text style={styles.emptySubtitle}>
                {hasSearched
                  ? "Try adjusting your search criteria or filters"
                  : "No properties have been added yet"
                }
              </Text>
            </View>
          ) : (
            <View style={styles.propertiesContainer}>
              {(hasSearched ? searchedProperties : dbProperties)?.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  showSaveButton={true}
                  onPress={handlePropertyPress}
                  onSave={(prop) => addToFavorites(prop.id)}
                />
              ))}
              
              {hasSearched && hasMoreProperties && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreProperties}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <Text style={styles.loadMoreText}>Load More Properties</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <FilterDrawer
        visible={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={clearFilters}
      />

      <MapScreen
        visible={showMapView}
        onClose={() => setShowMapView(false)}
        properties={hasSearched ? searchedProperties : dbProperties}
        onMarkerPress={handleMapMarkerPress}
        title="Property Locations"
      />
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  locationSearchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  locationSearchWrapper: {
    flex: 1,
  },
  textSearchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  switchSearchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedLocationContainer: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  selectedLocationContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
    gap: theme.spacing.sm,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
  clearLocationButton: {
    padding: theme.spacing.xs,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
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
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  activeFiltersContainer: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
  },
  activeFilterText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  clearFiltersButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  clearFiltersText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing["5xl"],
  },
  resultsContainer: {
    paddingHorizontal: theme.spacing.xl,
  },
  resultsHeader: {
    marginBottom: theme.spacing.lg,
  },
  resultsCount: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSubtle,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["5xl"],
  },
  loadingText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.fontSize.base,
    marginTop: theme.spacing.lg,
    fontWeight: theme.typography.fontWeight.medium,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["5xl"],
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
    paddingHorizontal: theme.spacing.xl,
  },
  propertiesContainer: {
    gap: theme.spacing.lg,
  },
  loadMoreButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadMoreText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
