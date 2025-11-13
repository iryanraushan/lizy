import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import ExpoMapView from "./ExpoMapView";
import IconComponent from "./IconComponent";

const MapLocationPicker = ({
  visible,
  onClose,
  onLocationSelect,
  initialLocation = null,
  title = "Select Location",
  saveButtonText = "Save",
  enableCurrentLocation = true,
  initialRegion = {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 10.0,
    longitudeDelta: 10.0,
  },
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [userLocation, setUserLocation] = useState(null);
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);

  useEffect(() => {
    if (visible && enableCurrentLocation) {
      getCurrentLocation();
    }
  }, [visible, enableCurrentLocation]);

  useEffect(() => {
    setSelectedLocation(initialLocation);
  }, [initialLocation]);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Permission to access location was denied"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to get current location");
    }
  };

  const reverseGeocodeLocation = async (latitude, longitude) => {
    try {
      setIsGeocodingLocation(true);
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result && result.length > 0) {
        const address = result[0];

        const addressComponents = {
          street: address.name || address.street,
          district: address.district || address.subregion,
          city: address.city || address.region,
          state: address.region || address.administrativeArea,
          country: address.country,
          postalCode: address.postalCode,
        };

        const locationParts = [];
        if (
          addressComponents.street &&
          addressComponents.street !== addressComponents.city
        ) {
          locationParts.push(addressComponents.street);
        }
        if (
          addressComponents.district &&
          addressComponents.district !== addressComponents.city
        ) {
          locationParts.push(addressComponents.district);
        }
        if (addressComponents.city) {
          locationParts.push(addressComponents.city);
        }

        const formattedLocation =
          locationParts.join(", ") ||
          `${addressComponents.city || "Unknown Location"}`;

        return {
          formattedAddress: formattedLocation,
          city: addressComponents.city || "",
          state: addressComponents.state || "",
          country: addressComponents.country || "",
          fullAddress: address,
        };
      }

      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      Alert.alert(
        "Geocoding Error",
        "Failed to get address for the selected location"
      );
      return null;
    } finally {
      setIsGeocodingLocation(false);
    }
  };

  const handleMapLocationSelect = async (event) => {
    const coordinate = event.coordinates;
    if (!coordinate) {
      setSelectedLocation(null);
      return;
    }

    setSelectedLocation(coordinate);
    const addressInfo = await reverseGeocodeLocation(
      coordinate.latitude,
      coordinate.longitude
    );

    const locationData = {
      coordinate,
      address: addressInfo,
    };
    if (onLocationSelect) {
      onLocationSelect(locationData);
    }
  };

  const handleSave = () => {
    if (selectedLocation && !isGeocodingLocation) {
      onClose();
    } else if (!selectedLocation) {
      Alert.alert(
        "No location selected",
        "Please tap on the map to select a location"
      );
    } else if (isGeocodingLocation) {
      Alert.alert("Please wait", "Getting address information...");
    }
  };

  const handleClose = () => {
    setSelectedLocation(initialLocation);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              gap: 5,
            }}
          >
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <IconComponent
                iconName="x"
                iconFamily="Feather"
                size={24}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>

            <Text style={styles.title}>{title}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedLocation || isGeocodingLocation) &&
                styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={!selectedLocation || isGeocodingLocation}
          >
            <Text
              style={[
                styles.saveText,
                (!selectedLocation || isGeocodingLocation) &&
                  styles.disabledButtonText,
              ]}
            >
              {isGeocodingLocation ? "Getting address..." : saveButtonText}
            </Text>
          </TouchableOpacity>
        </View>

        <ExpoMapView
          style={styles.map}
          initialRegion={userLocation || initialRegion}
          onPress={handleMapLocationSelect}
          markers={
            selectedLocation
              ? [
                  {
                    id: "selected-location",
                    coordinates: selectedLocation,
                    title: "Selected Location",
                  },
                ]
              : []
          }
        />

        <View style={styles.instructionsOverlay}>
          <View style={styles.instructionsContainer}>
            <IconComponent
              iconName="map-pin"
              iconFamily="Feather"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.instructionsText}>
              Tap on the map to select your property location
            </Text>
          </View>

          {selectedLocation && (
            <View style={styles.selectedLocationInfo}>
              <Text style={styles.selectedLocationText}>
                Location selected: {selectedLocation.latitude.toFixed(6)},{" "}
                {selectedLocation.longitude.toFixed(6)}
              </Text>
              {isGeocodingLocation && (
                <Text style={styles.geocodingText}>Getting address...</Text>
              )}
            </View>
          )}
        </View>

        {enableCurrentLocation && (
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
            activeOpacity={0.8}
          >
            <IconComponent
              iconName="crosshair"
              iconFamily="Feather"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </Modal>
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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  disabledButton: {
    backgroundColor: theme.colors.textDisabled,
  },
  saveText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.sm,
  },
  disabledButtonText: {
    color: theme.colors.textMuted,
  },
  map: {
    flex: 1,
  },
  instructionsOverlay: {
    position: "absolute",
    top: 90,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  instructionsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
    fontWeight: theme.typography.fontWeight.medium,
  },
  selectedLocationInfo: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  selectedLocationText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textPrimary,
    fontFamily: "monospace",
    fontWeight: theme.typography.fontWeight.medium,
  },
  geocodingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontStyle: "italic",
    marginTop: theme.spacing.xs,
  },
  currentLocationButton: {
    position: "absolute",
    bottom: theme.spacing.xl + 20,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export default MapLocationPicker;
