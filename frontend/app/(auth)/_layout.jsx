import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0f172a" },
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          title: "Login"
        }}
      />
      <Stack.Screen 
        name="registration" 
        options={{
          title: "Registration"
        }}
      />
      <Stack.Screen 
        name="verifyEmail" 
        options={{
          title: "Verify Email"
        }}
      />
    </Stack>
  );
}