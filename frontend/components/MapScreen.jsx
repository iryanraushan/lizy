import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LocationHelper } from "../constants/locations";
import { theme } from "../constants/theme";
import MapModal from "./Modal";
import PropertyMapView from "./PropertyMapView";

const MapScreen = ({
  visible,
  onClose,
  properties = [],
  onMarkerPress,
  title = "Property Locations",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapRegion, setMapRegion] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const filteredProperties = useMemo(() => {
    if (!searchQuery) return properties;

    const lower = searchQuery.toLowerCase();
    return properties.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(lower)) ||
        (p.location && p.location.toLowerCase().includes(lower)) ||
        (p.city && p.city.toLowerCase().includes(lower)) ||
        (p.type && p.type.toLowerCase().includes(lower)) ||
        (p.roomConfig && p.roomConfig.toLowerCase().includes(lower))
    );
  }, [searchQuery, properties]);

  const geocodeLocation = async (locationQuery) => {
    try {
      setIsGeocoding(true);
      
      try {
        const results = await Location.geocodeAsync(locationQuery);
        
        if (results && results.length > 0) {
          const location = results[0];
          const newRegion = {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 1.0, 
            longitudeDelta: 1.0,
          };
          setMapRegion(newRegion);
          return newRegion;
        }
      } catch (locationError) {
        console.log('Expo Location geocoding failed, trying fallback:', locationError);
      }
      
      const locationMatches = LocationHelper.searchLocations(locationQuery, 5);
      if (locationMatches.length > 0) {
        const match = locationMatches[0];
        let coordinates = getApproximateCoordinates(match);
        
        if (coordinates) {
          const newRegion = {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: match.type === 'state' ? 2.0 : match.type === 'city' ? 0.5 : 0.1,
            longitudeDelta: match.type === 'state' ? 2.0 : match.type === 'city' ? 0.5 : 0.1,
          };
          setMapRegion(newRegion);
          return newRegion;
        }
      }
      
    } catch (error) {
      console.log('Geocoding error:', error);
    } finally {
      setIsGeocoding(false);
    }
    return null;
  };

  const getApproximateCoordinates = (locationMatch) => {
    const stateCoordinates = {
      'Andhra Pradesh': { latitude: 15.9129, longitude: 79.7400 },
      'Arunachal Pradesh': { latitude: 28.2180, longitude: 94.7278 },
      'Assam': { latitude: 26.2006, longitude: 92.9376 },
      'Bihar': { latitude: 25.0961, longitude: 85.3131 },
      'Chhattisgarh': { latitude: 21.2787, longitude: 81.8661 },
      'Goa': { latitude: 15.2993, longitude: 74.1240 },
      'Gujarat': { latitude: 22.2587, longitude: 71.1924 },
      'Haryana': { latitude: 29.0588, longitude: 76.0856 },
      'Himachal Pradesh': { latitude: 31.1048, longitude: 77.1734 },
      'Jharkhand': { latitude: 23.6102, longitude: 85.2799 },
      'Karnataka': { latitude: 15.3173, longitude: 75.7139 },
      'Kerala': { latitude: 10.8505, longitude: 76.2711 },
      'Madhya Pradesh': { latitude: 22.9734, longitude: 78.6569 },
      'Maharashtra': { latitude: 19.7515, longitude: 75.7139 },
      'Manipur': { latitude: 24.6637, longitude: 93.9063 },
      'Meghalaya': { latitude: 25.4670, longitude: 91.3662 },
      'Mizoram': { latitude: 23.1645, longitude: 92.9376 },
      'Nagaland': { latitude: 26.1584, longitude: 94.5624 },
      'Odisha': { latitude: 20.9517, longitude: 85.0985 },
      'Punjab': { latitude: 31.1471, longitude: 75.3412 },
      'Rajasthan': { latitude: 27.0238, longitude: 74.2179 },
      'Sikkim': { latitude: 27.5330, longitude: 88.5122 },
      'Tamil Nadu': { latitude: 11.1271, longitude: 78.6569 },
      'Telangana': { latitude: 18.1124, longitude: 79.0193 },
      'Tripura': { latitude: 23.9408, longitude: 91.9882 },
      'Uttar Pradesh': { latitude: 26.8467, longitude: 80.9462 },
      'Uttarakhand': { latitude: 30.0668, longitude: 79.0193 },
      'West Bengal': { latitude: 22.9868, longitude: 87.8550 },
      'Delhi': { latitude: 28.7041, longitude: 77.1025 },
    };

    const { state, city, country } = locationMatch;
    
    if (locationMatch.type === 'state' && stateCoordinates[state]) {
      return stateCoordinates[state];
    }
    
    if (locationMatch.type === 'city' && stateCoordinates[state]) {
      return stateCoordinates[state];
    }
    
    if (country === 'India') {
      return { latitude: 28.7041, longitude: 77.1025 };
    }
    
    return null;
  };

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setMapRegion(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      geocodeLocation(searchQuery);
    }, 1000); 

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (!visible) return null;

  return (
    <MapModal visible={visible} onClose={onClose} title={title}>
      <View style={styles.searchWrapper}>
        <Feather name="search" size={18} color={theme.colors.textSecondary} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, city, or location..."
          placeholderTextColor={theme.colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            activeOpacity={0.9}
            style={styles.clearButton}
            disabled={searchQuery.length === 0}
          >
            <Feather
              name="x-circle"
              size={18}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.mapContainer}>
        <PropertyMapView
          properties={filteredProperties}
          onMarkerPress={onMarkerPress}
          style={StyleSheet.absoluteFillObject}
          region={mapRegion}
        />
        <View style={styles.overlay}>
          <View style={styles.propertyCount}>
            <Feather 
              name={isGeocoding ? "loader" : "map-pin"} 
              size={16} 
              color={theme.colors.primary} 
            />
            <Text style={styles.propertyCountText}>
              {isGeocoding ? "Searching location..." : 
                `${filteredProperties.filter((p) => p.latitude && p.longitude).length} locations`
              }
            </Text>
          </View>
        </View>
      </View>
    </MapModal>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  clearButton: {
    marginLeft: theme.spacing.sm,
  },
  overlay: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: "flex-start",
  },
  propertyCount: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    gap: theme.spacing.sm,
  },
  propertyCountText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
});

export default MapScreen;
