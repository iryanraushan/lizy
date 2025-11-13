import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0f172a" },
      }}
    >
      <Stack.Screen name="allViewProperties" />
      <Stack.Screen name="contactSupport" />
      <Stack.Screen name="help" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="privacyPolicy" />
      <Stack.Screen name="search" />
      <Stack.Screen name="searchRooms" />
      <Stack.Screen name="setting" />
      <Stack.Screen name="termsOfService" />
      <Stack.Screen name="profile/addProperty" />
      <Stack.Screen name="profile/editProfile" />
      <Stack.Screen name="property/[id]" />
      <Stack.Screen name="settings/changePassword" />
      <Stack.Screen name="settings/deleteAccount" />
      <Stack.Screen name="settings/forgotPassword" />
    </Stack>
  );
}