import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0f172a" },
      }}
    >
      <Stack.Screen name="changePassword" />
      <Stack.Screen name="deleteAccount" />
      <Stack.Screen name="forgotPassword" />
    </Stack>
  );
}