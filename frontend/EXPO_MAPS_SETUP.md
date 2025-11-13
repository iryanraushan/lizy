# Expo Maps Implementation Guide

## What's Been Implemented

### 1. Package Installation
- `expo-maps` is already installed in your package.json
- Version: ~0.12.7

### 2. Configuration Updates
- Updated `app.json` to include expo-maps plugin with location permissions
- Configured location permission message for iOS

### 3. New Components Created

#### ExpoMapView (`/components/ExpoMapView.jsx`)
A universal map component that:
- Uses `AppleMaps.View` on iOS (no additional setup required)
- Uses `GoogleMaps.View` on Android (requires Google Maps API key)
- Shows fallback message on other platforms
- Provides compatibility with react-native-maps props

#### Updated Components
- `addProperty.jsx`: Replaced react-native-maps MapView with ExpoMapView
- `MapLocationPicker.jsx`: Updated to use ExpoMapView instead of react-native-maps

## Required Setup for Android (Google Maps)

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Maps SDK for Android"
4. Create an API key:
   - Go to Credentials → Create Credentials → API Key
   - Restrict the API key to Android apps
   - Add your package name: `com.ryan_xd.easyhome`
   - Add your SHA-1 certificate fingerprint

### 2. Get SHA-1 Fingerprint

For development builds:
```bash
cd android && ./gradlew signingReport
```

For Google Play Store:
- Upload your app to Google Play Console
- Go to Release → Setup → App integrity → App Signing
- Copy the SHA-1 certificate fingerprint

### 3. Add API Key to app.json
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
        }
      }
    }
  }
}
```

## iOS Setup
- No additional setup required for Apple Maps
- Location permission is already configured in app.json

## Usage Examples

### Basic Map
```jsx
import ExpoMapView from '../components/ExpoMapView';

<ExpoMapView
  style={{ flex: 1 }}
  initialRegion={{
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
  onPress={(event) => {
    console.log('Pressed:', event.coordinates);
  }}
  markers={[
    {
      id: 'marker1',
      coordinates: { latitude: 37.78825, longitude: -122.4324 },
      title: 'My Location'
    }
  ]}
/>
```

### With Markers
```jsx
const markers = [
  {
    id: 'home',
    coordinates: { latitude: 37.78825, longitude: -122.4324 },
    title: 'Home',
  },
  {
    id: 'work',
    coordinates: { latitude: 37.79825, longitude: -122.4424 },
    title: 'Work',
  }
];

<ExpoMapView
  style={{ flex: 1 }}
  markers={markers}
  initialRegion={{
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
/>
```

## Platform-Specific Features

### iOS (Apple Maps)
- Native Apple Maps integration
- SF Symbols support for markers
- Look Around view support
- No API key required

### Android (Google Maps)
- Native Google Maps integration
- Custom marker icons support
- Street View support
- Requires Google Maps API key

## Development Commands

### Start Development Server
```bash
npx expo start
```

### Build for Specific Platform
```bash
npx expo run:ios
npx expo run:android
```

### Create Development Build
```bash
eas build --profile development --platform all
```

## Testing Checklist

- [ ] Maps render correctly on iOS
- [ ] Maps render correctly on Android
- [ ] Location selection works by tapping
- [ ] Markers display properly
- [ ] Location permissions are requested
- [ ] Reverse geocoding works for address lookup
- [ ] Current location button functions
- [ ] Map camera position updates correctly

## Troubleshooting

### Maps Don't Show on Android
1. Verify Google Maps API key is correct
2. Check if Maps SDK for Android is enabled
3. Ensure SHA-1 fingerprint is added to API key restrictions
4. Check package name matches in Google Cloud Console

### Location Permission Issues
1. Verify expo-maps plugin is properly configured in app.json
2. Check if location permissions are granted in device settings
3. Test location requests in development build

### Build Issues
1. Clear Expo cache: `npx expo start --clear`
2. Clean node modules: `rm -rf node_modules && npm install`
3. Reset Metro bundler cache: `npx react-native start --reset-cache`