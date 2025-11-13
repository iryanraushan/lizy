import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Platform, View } from "react-native";
import { theme } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import HeaderButton from "./HeaderButton";

const TabIcon = ({ name, focused, size, color, library = "ionicons" }) => {
  const Icon = library === "ionicons" ? Ionicons : MaterialCommunityIcons;
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Icon name={name} size={size + (focused ? 2 : 0)} color={color} />
    </View>
  );
};

const screenOptions = {
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textMuted,
  tabBarStyle: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    height: Platform.OS === "ios" ? 88 : 68,
    borderTopLeftRadius: theme.borderRadius["2xl"],
    borderTopRightRadius: theme.borderRadius["2xl"],
    position: "absolute",
    paddingTop: theme.spacing.sm,
    paddingBottom: Platform.OS === "ios" ? theme.spacing.xl : theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  tabBarLabelStyle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: Platform.OS === "ios" ? 2 : 4,
    marginTop: 4,
  },
  headerStyle: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTintColor: theme.colors.textPrimary,
  headerTitleStyle: {
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
    marginLeft: theme.spacing.md,
  },
  tabBarHideOnKeyboard: true,
};

const getHeaderLeft = (
  showBackButton,
  defaultRoute = "/",
  library = "ionicons"
) =>
  showBackButton
    ? () => (
        <HeaderButton
          iconName={library === "ionicons" ? "arrow-back" : "arrow-left"}
          onPress={() => router.push(defaultRoute)}
          library={library}
          position="left"
        />
      )
    : undefined;

const getHeaderRight = (showSettingsButton, library = "ionicons", isGuest) =>
  showSettingsButton
    ? () => (
        <HeaderButton
          iconName={library === "ionicons" ? "settings-outline" : "cog-outline"}
          onPress={() => {
            if (isGuest) {
              router.push("/(auth)/register");
              return;
            }
            router.push("/screens/setting");
          }}
          library={library}
          position="right"
        />
      )
    : undefined;

export default function AppTabs({
  tabs,
  iconLibrary = "ionicons",
  defaultRoute,
}) {
  const { isGuest } = useAuth();
  
  return (
    <Tabs screenOptions={screenOptions}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            headerShown: tab.headerShown,
            headerLeft: getHeaderLeft(
              tab.showBackButton,
              defaultRoute,
              iconLibrary
            ),
            headerRight: getHeaderRight(tab.showSettingsButton, iconLibrary, isGuest),
            tabBarIcon: (props) => (
              <TabIcon {...props} name={tab.icon} library={iconLibrary} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
