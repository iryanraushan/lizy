import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PropertyCard from "../../components/PropertyCard";
import { theme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useDatabase } from "../../context/DatabaseContext";
import { getRecentVisits, getSearchHistory } from "../../utils/localStorage";

const Explore = () => {
  const router = useRouter();
  const { addToFavorites } = useDatabase();

  const [recentVisits, setRecentVisits] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = useCallback(async () => {
    try {
      const visits = await getRecentVisits(5);
      const history = await getSearchHistory(4);

      setRecentVisits(visits);
      setSearchHistory(history);
    } catch (error) {
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLocalData();
    setRefreshing(false);
  }, [loadLocalData]);

  const handleSearchPress = () => {
    router.push("/screens/search");
  };

  const handleRecentSearchPress = (searchQuery) => {
    router.push({
      pathname: "/screens/search",
      params: { searchQuery: searchQuery.query },
    });
  };

  const handlePropertyPress = (propertyId) => {
    if (!propertyId) {
      console.error('Property ID is missing:', propertyId);
      return;
    }
    router.push(`/screens/property/${propertyId}`);
  };

  const handleViewAllRecentVisits = () => {
    router.push("/screens/allViewProperties");
  };

  const handleFavoriteChange = useCallback((property, isFavorited) => {
    // Update the recent visits list to reflect favorite status changes
    setRecentVisits(prev => 
      prev.map(visit => 
        (visit.id) === (property.id ) 
          ? { ...visit, isFavorited } 
          : visit
      )
    );
  }, []);

  const renderRecentVisit = ({ item }) => (
    <PropertyCard
      key={item.id}
      property={item}
      showSaveButton={true}
      onPress={handlePropertyPress}
      onFavoriteChange={handleFavoriteChange}
      style={styles.recentVisitCard}
    />
  );

  const renderRecentSearch = ({ item, index }) => (
    <TouchableOpacity
      key={index}
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(item)}
    >
      <Feather name="clock" size={16} color={theme.colors.textSubtle} />
      <Text style={styles.recentSearchText}>{item.query}</Text>
      <Feather name="arrow-up-left" size={16} color={theme.colors.textSubtle} />
    </TouchableOpacity>
  );

  const scrollableSectionsData = [];

  // Recent searches section
  if (searchHistory.length > 0) {
    scrollableSectionsData.push({
      type: "recentSearches",
      key: "recentSearches",
      data: searchHistory,
    });
  }

  // Recent visits section
  if (recentVisits.length > 0) {
    scrollableSectionsData.push({
      type: "recentVisits",
      key: "recentVisits",
      data: recentVisits,
    });
  }

  // Empty state section
  if (recentVisits.length === 0 && searchHistory.length === 0) {
    scrollableSectionsData.push({
      type: "emptyState",
      key: "emptyState",
    });
  }

  const renderScrollableItem = ({ item }) => {
    switch (item.type) {
      case "recentSearches":
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
            </View>
            <View style={styles.recentSearchesContainer}>
              {item.data.map((searchItem, index) =>
                renderRecentSearch({ item: searchItem, index })
              )}
            </View>
          </View>
        );

      case "recentVisits":
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Visited</Text>
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={handleViewAllRecentVisits}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Feather
                  name="arrow-right"
                  size={14}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, marginHorizontal: 20 }}>
              <FlatList
                data={item.data}
                renderItem={renderRecentVisit}
                keyExtractor={(visitItem) => visitItem.id || visitItem.$id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.verticalListContent}
              />
            </View>
          </View>
        );

      case "emptyState":
        return (
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color="#64748b" />
            <Text style={styles.emptyTitle}>Start Exploring</Text>
            <Text style={styles.emptySubtitle}>
              Search for properties or browse categories to find your perfect
              home
            </Text>
            <TouchableOpacity
              style={styles.startSearchButton}
              onPress={handleSearchPress}
            >
              <Feather name="search" size={20} color="#ffffff" />
              <Text style={styles.startSearchButtonText}>Start Searching</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Find Your Dream Place</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back! Search for properties or explore your recent visits
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={handleSearchPress}
        >
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#64748b" />
            <Text style={styles.searchPlaceholder}>
              Search by city, address...eg Delhi
            </Text>
            <Feather name="arrow-right" size={18} color="#64748b" />
          </View>
        </TouchableOpacity>

        {/* Scrollable Content */}
        <FlatList
          style={styles.scrollableContent}
          data={scrollableSectionsData}
          renderItem={renderScrollableItem}
          keyExtractor={(item) => item.key}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              progressBackgroundColor={theme.colors.surface}
            />
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => <View style={styles.bottomSpacing} />}
        />
      </View>
    </View>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing["2xl"],
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing["3xl"],
    paddingBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSubtle,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.lg,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchPlaceholder: {
    flex: 1,
    color: theme.colors.placeholder,
    fontSize: theme.typography.fontSize.base,
    marginLeft: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  recentSearchesContainer: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  recentSearchText: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textPrimary,
  },
  horizontalListContent: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  verticalListContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["5xl"],
    paddingHorizontal: theme.spacing.xl,
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
  startSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing["2xl"],
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  startSearchButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  bottomSpacing: {
    height: 80,
  },
});
