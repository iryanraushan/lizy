import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import PropertyCard from "../../components/PropertyCard";
import { theme } from "../../constants/theme";
import { useDatabase } from "../../context/DatabaseContext";
import { clearRecentVisits, getRecentVisits } from "../../utils/localStorage";

export default function AllViewProperties() {
  const router = useRouter();
  const { addToFavorites } = useDatabase();

  const [recentVisits, setRecentVisits] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentVisits();
  }, []);

  const loadRecentVisits = useCallback(async () => {
    try {
      setLoading(true);
      const visits = await getRecentVisits(); // Get all recent visits
      setRecentVisits(visits);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecentVisits();
    setRefreshing(false);
  }, [loadRecentVisits]);

  const handlePropertyPress = (propertyId) => {
    router.push(`/screens/property/${propertyId}`);
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your recent visits? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearRecentVisits();
              setRecentVisits([]);
              Alert.alert("Success", "Recent visits history cleared!");
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to clear history. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const renderProperty = ({ item }) => (
    <PropertyCard
      key={item.$id}
      property={item}
      showSaveButton={true}
      onPress={handlePropertyPress}
      onSave={(prop) => addToFavorites(prop)}
      showVisitedDate={true}
      visitedAt={item.visitedAt}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Feather name="clock" size={48} color="#64748b" />
      <Text style={styles.emptyTitle}>No Recent Visits</Text>
      <Text style={styles.emptySubtitle}>
        Properties you visit will appear here for easy access
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push("/screens/search")}
      >
        <Feather name="search" size={20} color="#ffffff" />
        <Text style={styles.browseButtonText}>Browse Properties</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Text style={styles.countText}>
        {recentVisits.length}{" "}
        {recentVisits.length === 1 ? "property" : "properties"} visited
      </Text>
      {recentVisits.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearHistory}
        >
          <Feather name="trash-2" size={16} color="#ef4444" />
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      <Header title="Recent Visits" noMarginTop={true} />

      <FlatList
        data={recentVisits}
        renderItem={renderProperty}
        keyExtractor={(item) => item.$id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.background}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        updateCellsBatchingPeriod={50}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  countText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSubtle,
    fontWeight: theme.typography.fontWeight.medium,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  clearButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: "#ef4444",
    fontWeight: theme.typography.fontWeight.medium,
  },
  flatListContent: {
    marginHorizontal: theme.spacing.lg,
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
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing["2xl"],
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  browseButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
