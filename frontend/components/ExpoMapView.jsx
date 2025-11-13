import { Platform, StyleSheet, Text, View } from "react-native";

// Try to import expo-maps, fallback to null if not available
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

const ExpoMapView = ({
  style,
  initialRegion,
  region,
  onPress,
  children,
  markers = [],
  onMapClick,
  cameraPosition,
  ...props
}) => {
  const getCameraPosition = () => {
    const regionData = region || initialRegion;
    if (!regionData) return undefined;

    return {
      coordinates: {
        latitude: regionData.latitude,
        longitude: regionData.longitude,
      },
      zoom: regionData.latitudeDelta
        ? Math.log2(360 / regionData.latitudeDelta)
        : 10,
    };
  };

  // Convert markers to expo-maps format
  const getExpoMarkers = () => {
    if (!markers || markers.length === 0) return [];

    return markers.map((marker, index) => ({
      id: marker.id || `marker-${index}`,
      coordinates: marker.coordinate || marker.coordinates,
      title: marker.title,
      ...marker,
    }));
  };

  // Handle map press events
  const handleMapPress = (event) => {
    if (onPress) {
      onPress(event);
    }
    if (onMapClick) {
      onMapClick(event);
    }
  };

  const mapStyle = [styles.defaultStyle, style];
  const finalCameraPosition = cameraPosition || getCameraPosition();
  const expoMarkers = getExpoMarkers();

  // Check if expo-maps is available
  if (!AppleMaps || !GoogleMaps) {
    return (
      <View style={[mapStyle, styles.fallbackContainer]}>
        <Text style={styles.fallbackText}>
          Maps require a development build with expo-maps.{"\n"}
          Please run: eas build --profile development
        </Text>
        <Text style={styles.fallbackSubtext}>
          Region:{" "}
          {finalCameraPosition
            ? `${finalCameraPosition.coordinates.latitude.toFixed(
                4
              )}, ${finalCameraPosition.coordinates.longitude.toFixed(4)}`
            : "Not set"}
        </Text>
        {markers && markers.length > 0 && (
          <Text style={styles.fallbackSubtext}>
            Markers: {markers.length} location(s)
          </Text>
        )}
      </View>
    );
  }

  if (Platform.OS === "ios") {
    return (
      <AppleMaps.View
        style={mapStyle}
        cameraPosition={finalCameraPosition}
        onMapClick={handleMapPress}
        markers={expoMarkers}
        properties={{
          isMyLocationEnabled: true,
        }}
        uiSettings={{
          compassEnabled: true,
          myLocationButtonEnabled: true,
          scaleBarEnabled: true,
        }}
        {...props}
      >
        {children}
      </AppleMaps.View>
    );
  } else if (Platform.OS === "android") {
    return (
      <GoogleMaps.View
        style={mapStyle}
        cameraPosition={finalCameraPosition}
        onMapClick={handleMapPress}
        markers={expoMarkers}
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
      >
        {children}
      </GoogleMaps.View>
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

export const ExpoMarker = ({
  coordinate,
  coordinates,
  title,
  onPress,
  children,
  ...props
}) => {
  return null;
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
  },
  fallbackText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 20,
    fontWeight: "600",
  },
  fallbackSubtext: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 5,
  },
});

export default ExpoMapView;
