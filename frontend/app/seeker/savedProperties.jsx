import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GuestRegisterPrompt from "../../components/GuestRegisterPrompt";
import PropertyCard from "../../components/PropertyCard";
import { theme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { favoritesAPI } from "../../services/api";
import { router } from "expo-router";

const SavedProperties = () => {
  const { isGuest } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  if (isGuest) {
    return <GuestRegisterPrompt feature="saved properties" />;
  }

  const fetchFavoriteProperties = async () => {
    try {
      setLoading(true);
      const response = await favoritesAPI.getFavoriteProperties();
      
      if (response.success) {
        // Extract properties from favorites data
        const favoritesList = response.data.favorites || response.data.properties || [];
        const properties = favoritesList.map(fav => {
          // If it's a favorite object with property nested, extract the property
          if (fav.property) {
            return { ...fav.property, favoriteId: fav.id };
          }
          // Otherwise, it's already a property object
          return fav;
        });
        setFavorites(properties);
      } else {
        console.error('Failed to fetch favorites:', response.message);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert(
        'Error',
        'Failed to load saved properties. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = (property, isFavorited) => {
    if (!isFavorited) {
      // Property was removed from favorites, update the list
      setFavorites(prevFavorites => 
        prevFavorites.filter(fav => fav.id !== property.id)
      );
    }
  };

  const handleRemoveFromFavorites = async (property) => {
    try {
      await favoritesAPI.removeFromFavorites(property.id);
      setFavorites(prevFavorites => 
        prevFavorites.filter(fav => fav.id !== property.id)
      );
    } catch (error) {
      console.error('Error removing from favorites:', error);
      Alert.alert(
        'Error',
        'Failed to remove property from favorites. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFavoriteProperties();
    setRefreshing(false);
  };

  const renderProperty = ({ item }) => (
    <PropertyCard
      property={item}
      showOwnerActions={false}
      showSaveButton={true}
      onFavoriteChange={handleFavoriteChange}
      onRemoveFromFavorites={handleRemoveFromFavorites}
      initialFavoriteStatus={true}
      isFavoritesList={true}
      onPress={(propertyId) => {
        router.push(`/screens/property/${propertyId}`);
      }}
    />
  );

  const renderHeader = () => (
    <Text style={styles.headerText}>{favorites?.length} Saved Properties</Text>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Saved Properties</Text>
      <Text style={styles.emptySubtitle}>
        Properties you save will appear here for easy access
      </Text>
    </View>
  );

  useEffect(() => {
    fetchFavoriteProperties();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading saved properties...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.propertiesContainer}>
        <FlatList
          data={favorites}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id?.toString()}
          ListHeaderComponent={favorites?.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.scrollContent,
            favorites?.length === 0 && styles.emptyContentContainer,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              progressBackgroundColor={theme.colors.surface}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={{ height: 50 }} />
    </SafeAreaView>
  );
};

export default SavedProperties;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    marginHorizontal: theme.spacing.lg,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSubtle,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  propertiesContainer: {
    flex: 1,
    marginTop: -theme.spacing.lg,
  },
  headerText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
});
