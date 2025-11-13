import { Platform, StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";

let AppleMaps, GoogleMaps;
try {
  const expoMaps = require("expo-maps");
  AppleMaps = expoMaps.AppleMaps;
  GoogleMaps = expoMaps.GoogleMaps;
} catch (error) {
  console.log("expo-maps not available, using fallback");
  AppleMaps = null;
  GoogleMaps = null;
}

const PropertyMapView = ({
  style,
  properties = [],
  onMarkerPress,
  initialRegion,
  region,
  ...props
}) => {
  const getMapRegion = () => {
    if (region) return region;
    
    if (initialRegion) return initialRegion;

    if (properties.length === 0) {
      return {
        latitude: 28.6139,
        longitude: 77.209,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    if (properties.length === 1) {
      const property = properties[0];
      return {
        latitude: parseFloat(property.latitude),
        longitude: parseFloat(property.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const validProperties = properties.filter(
      (p) =>
        p.latitude &&
        p.longitude &&
        !isNaN(parseFloat(p.latitude)) &&
        !isNaN(parseFloat(p.longitude))
    );

    if (validProperties.length === 0) {
      return {
        latitude: 28.6139,
        longitude: 77.209,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const lats = validProperties.map((p) => parseFloat(p.latitude));
    const lngs = validProperties.map((p) => parseFloat(p.longitude));

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const deltaLat = (maxLat - minLat) * 1.2;
    const deltaLng = (maxLng - minLng) * 1.2;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  };

  const getPropertyMarkers = () => {
    return properties
      .filter(
        (property) =>
          property.latitude &&
          property.longitude &&
          !isNaN(parseFloat(property.latitude)) &&
          !isNaN(parseFloat(property.longitude))
      )
      .map((property) => ({
        id: property.$id,
        coordinates: {
          latitude: parseFloat(property.latitude),
          longitude: parseFloat(property.longitude),
        },
        title: `₹${property.minimumPrice}${
          property.maximumPrice &&
          property.maximumPrice !== property.minimumPrice
            ? ` - ₹${property.maximumPrice}`
            : ""
        }`,
        description: property.title || "Property",
        property,
        icon: {
          type: "ionicon",
          name: "home",
          size: 30,
          color: theme.colors.primary || "#007AFF",
        },
        markerColor: theme.colors.primary || "#007AFF",
      }));
  };

  const handleMarkerPress = (marker) => {
    if (onMarkerPress && marker.property) {
      onMarkerPress(marker.property);
    }
  };

  const getCameraPosition = () => {
    const mapRegion = getMapRegion();
    return {
      coordinates: {
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      },
      zoom: mapRegion.latitudeDelta
        ? Math.log2(360 / mapRegion.latitudeDelta)
        : 10,
    };
  };

  const mapStyle = [styles.defaultStyle, style];
  const cameraPosition = getCameraPosition();
  const markers = getPropertyMarkers();

  if (!AppleMaps || !GoogleMaps) {
    return (
      <View style={[mapStyle, styles.fallbackContainer]}>
        <Text style={styles.fallbackText}>
          Maps require a development build with expo-maps.{"\n"}
          Please run: eas build --profile development
        </Text>
        <Text style={styles.fallbackSubtext}>
          Properties: {properties.length} found
        </Text>
        {markers.length > 0 && (
          <View style={styles.fallbackMarkers}>
            <Text style={styles.fallbackSubtext}>Locations:</Text>
            {markers.slice(0, 3).map((marker, index) => (
              <Text key={index} style={styles.fallbackMarkerText}>
                • {marker.title} - {marker.description}
              </Text>
            ))}
            {markers.length > 3 && (
              <Text style={styles.fallbackSubtext}>
                +{markers.length - 3} more properties
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }

  if (Platform.OS === "ios") {
    return (
      <AppleMaps.View
        style={mapStyle}
        cameraPosition={cameraPosition}
        markers={markers}
        onMarkerPress={handleMarkerPress}
        properties={{
          isMyLocationEnabled: true,
        }}
        uiSettings={{
          compassEnabled: true,
          myLocationButtonEnabled: true,
          scaleBarEnabled: true,
        }}
        {...props}
      />
    );
  } else if (Platform.OS === "android") {
    return (
      <GoogleMaps.View
        style={mapStyle}
        cameraPosition={cameraPosition}
        markers={markers}
        onMarkerPress={handleMarkerPress}
        properties={{
          isMyLocationEnabled: true,
        }}
        uiSettings={{
          compassEnabled: true,
          myLocationButtonEnabled: true,
          scaleBarEnabled: true,
          zoomControlsEnabled: true,
          rotationGesturesEnabled: true,
          scrollGesturesEnabled: true,
          tiltGesturesEnabled: true,
          zoomGesturesEnabled: true,
        }}
        {...props}
      />
    );
  } else {
    return (
      <View style={[mapStyle, styles.fallbackContainer]}>
        <Text style={styles.fallbackText}>
          Maps are only available on Android and iOS
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  defaultStyle: {
    flex: 1,
  },
  fallbackContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    margin: 10,
    borderRadius: 8,
    padding: 20,
  },
  fallbackText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 10,
  },
  fallbackSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 5,
  },
  fallbackMarkers: {
    marginTop: 15,
    alignItems: "center",
  },
  fallbackMarkerText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 3,
  },
});

export default PropertyMapView;
