import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthContextProvider, useAuth } from "../context/AuthContext";
import { DatabaseProvider } from "../context/DatabaseContext";
import { ToastProvider } from "../context/ToastContext";
import { NotificationProvider } from "../context/NotificationContext";

function RootNavigator() {
  const { currentUser, isGuest, loading } = useAuth();
  console.log("Current User in RootNavigator:", currentUser);
  useEffect(() => {
    if (!loading) {
      if (isGuest) {
        router.replace("/seeker/explore");
      } else if (currentUser) {
        if (currentUser.role) {
          router.replace(`/${currentUser.role}`);
        }
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [currentUser, isGuest, loading]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f172a",
        }}
      >
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0f172a" },
      }}
    >
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/registration" />
      <Stack.Screen name="(auth)/verifyEmail" />
      <Stack.Screen name="seeker" />
      <Stack.Screen name="provider" />
      <Stack.Screen name="screens" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthContextProvider>
          <DatabaseProvider>
            <NotificationProvider>
              <RootNavigator />
            </NotificationProvider>
          </DatabaseProvider>
        </AuthContextProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
