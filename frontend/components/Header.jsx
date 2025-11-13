import { router } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import { theme } from "../constants/theme";
import HeaderButton from "./HeaderButton";

const Header = ({ 
  title = "Setting", 
  showBackButton = true, 
  noMarginTop = false,
  customMarginTop = null 
}) => {
  return (
    <View style={[
      styles.container, 
      noMarginTop && styles.noMarginTop,
      customMarginTop !== null && { marginTop: customMarginTop }
    ]}>
      {showBackButton && (
        <HeaderButton
          iconName="arrow-back"
          onPress={() => router.back()}
          position="left"
        />
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 50 : 30,
    borderColor: theme.colors.border,
    borderBottomWidth: 1,
    paddingBottom: theme.spacing.sm,
  },
  noMarginTop: {
    marginTop: 17,
  },
  title: {
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
    marginLeft: theme.spacing.md,
  },
});
