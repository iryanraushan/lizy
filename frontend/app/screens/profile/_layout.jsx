import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0f172a" },
      }}
    >
      <Stack.Screen name="addProperty" />
      <Stack.Screen name="editProfile" />
    </Stack>
  );
}