import { router } from "expo-router";
import { Alert } from "react-native";

export const profileMenu = [
  {
    id: "edit_profile",
    title: "Edit Profile",
    subtitle: "Update your personal information",
    iconName: "user",
    iconFamily: "Feather",
    iconColor: "#10b981",
    backgroundColor: "#064e3b",
    onPress: () => router.push("/screens/profile/editProfile"),
    types: ["provider", "seeker"],
    section: "profile",
  },

  {
    id: "listed_properties",
    title: "All Properties",
    subtitle: "Manage your property listings",
    iconName: "home",
    iconFamily: "Feather",
    iconColor: "#3b82f6",
    backgroundColor: "#1e3a8a",
    onPress: () => router.push("/provider/listedProperties"),
    types: ["provider"],
    section: "content",
  },
  {
    id: "saved_rooms",
    title: "Saved Rooms",
    subtitle: "Your bookmarked properties",
    iconName: "bookmark",
    iconFamily: "Feather",
    iconColor: "#f59e0b",
    backgroundColor: "#92400e",
    onPress: () => router.push("/seeker/savedProperties"),
    types: ["seeker"],
    section: "content",
  },
  // {
  //   id: "booking_history",
  //   title: "Booking History",
  //   subtitle: "View your past bookings",
  //   iconName: "clipboard",
  //   iconFamily: "Feather",
  //   iconColor: "#8b5cf6",
  //   backgroundColor: "#5b21b6",
  //   onPress: () => router.push("/screens/bookingHistory"),
  //   types: ["seeker"],
  //   section: "content",
  // },
  // {
  //   id: "earnings",
  //   title: "Earnings",
  //   subtitle: "Track your rental income",
  //   iconName: "dollar-sign",
  //   iconFamily: "Feather",
  //   iconColor: "#10b981",
  //   backgroundColor: "#064e3b",
  //   onPress: () => router.push("/screens/earnings"),
  //   types: ["provider"],
  //   section: "content",
  // },
  // {
  //   id: "notifications",
  //   title: "Notifications",
  //   subtitle: "Manage your alert preferences",
  //   iconName: "bell",
  //   iconFamily: "Feather",
  //   iconColor: "#ef4444",
  //   backgroundColor: "#7f1d1d",
  //   onPress: () => router.push("/screens/notifications"),
  //   types: ["provider", "seeker"],
  //   section: "communication",
  // },

  //   {
  //     id: "payment_methods",
  //     title: "Payment Methods",
  //     subtitle: "Manage cards and payment options",
  //     iconName: "credit-card",
  //     iconFamily: "Feather",
  //     iconColor: "#8b5cf6",
  //     backgroundColor: "#5b21b6",
  //     onPress: () => router.push("/screens/paymentMethods"),
  //     types: ["provider", "seeker"],
  //     section: "account"
  //   },
  //   {
  //     id: "security",
  //     title: "Security & Privacy",
  //     subtitle: "Password and privacy settings",
  //     iconName: "shield",
  //     iconFamily: "Feather",
  //     iconColor: "#6b7280",
  //     backgroundColor: "#374151",
  //     onPress: () => router.push("/screens/security"),
  //     types: ["provider", "seeker"],
  //     section: "account"
  //   },
  //   {
  //     id: "subscription",
  //     title: "Subscription",
  //     subtitle: "Manage your premium features",
  //     iconName: "star",
  //     iconFamily: "Feather",
  //     iconColor: "#f59e0b",
  //     backgroundColor: "#92400e",
  //     onPress: () => router.push("/screens/subscription"),
  //     types: ["provider"],
  //     section: "account"
  //   },

  {
    id: "help_center",
    title: "Help Center",
    subtitle: "Get support and find answers",
    iconName: "help-circle",
    iconFamily: "Feather",
    iconColor: "#06b6d4",
    backgroundColor: "#164e63",
    onPress: () => router.push("/screens/help"),
    types: ["provider", "seeker"],
    section: "support",
  },
  {
    id: "contact_support",
    title: "Contact Support",
    subtitle: "Reach out to our team",
    iconName: "phone",
    iconFamily: "Feather",
    iconColor: "#10b981",
    backgroundColor: "#064e3b",
    onPress: () => router.push("/screens/contactSupport"),
    types: ["provider", "seeker"],
    section: "support",
  },
  {
    id: "rate_app",
    title: "Rate Our App",
    subtitle: "Share your feedback on app stores",
    iconName: "heart",
    iconFamily: "Feather",
    iconColor: "#f59e0b",
    backgroundColor: "#92400e",
    onPress: () => {
      Alert.alert(
        "Rate Our App",
        "Thank you for using our app! Would you like to rate us on the app store?",
        [
          { text: "Later", style: "cancel" },
          { text: "Rate Now", onPress: () => console.log("Opening app store") },
        ]
      );
    },
    types: ["provider", "seeker"],
    section: "support",
  },

  {
    id: "terms_service",
    title: "Terms of Service",
    subtitle: "Read our terms and conditions",
    iconName: "file-text",
    iconFamily: "Feather",
    iconColor: "#6b7280",
    backgroundColor: "#374151",
    onPress: () => router.push("/screens/termsOfService"),
    types: ["provider", "seeker"],
    section: "legal",
  },
  {
    id: "privacy_policy",
    title: "Privacy Policy",
    subtitle: "How we protect your data",
    iconName: "shield",
    iconFamily: "Feather",
    iconColor: "#6b7280",
    backgroundColor: "#374151",
    onPress: () => router.push("/screens/privacyPolicy"),
    types: ["provider", "seeker"],
    section: "legal",
  },

  {
    id: "logout",
    title: "Sign Out",
    subtitle: "Log out of your account",
    iconName: "log-out",
    iconFamily: "Feather",
    iconColor: "#ef4444",
    backgroundColor: "#7f1d1d",
    isDestructive: true,
    onPress: null,
    types: ["provider", "seeker"],
    section: "account_actions",
  },
];

export const getProfileMenuBySection = (userType) => {
  const sections = {
    profile: [],
    content: [],
    communication: [],
    account: [],
    support: [],
    legal: [],
    account_actions: [],
  };

  profileMenu.forEach((item) => {
    if (item.types.includes(userType)) {
      sections[item.section].push(item);
    }
  });

  return sections;
};

export const sectionTitles = {
  profile: "Profile",
  content: "My Listings",
  communication: "Communication",
  account: "Account Settings",
  support: "Support",
  legal: "Legal & Policies",
  account_actions: "Account Actions",
};

export const quickActions = [
  {
    id: "quick_post",
    title: "Add Property for Rent",
    iconName: "plus",
    iconFamily: "Feather",
    color: "#10b981",
    onPress: () => router.push("/screens/profile/addProperty"),
    types: ["provider"],
  },
  // {
  //   id: "quick_search",
  //   title: "Find Rooms",
  //   iconName: "search",
  //   iconFamily: "Feather",
  //   color: "#3b82f6",
  //   onPress: () => router.push("/screens/search"),
  //   types: ["seeker"],
  // },
];
