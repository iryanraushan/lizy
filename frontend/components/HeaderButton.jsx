import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { theme } from "../constants/theme";

const HeaderButton = ({
  iconName,
  onPress,
  style = {},
  library = "ionicons",
  position = "left",
}) => {
  const Icon = library === "ionicons" ? Ionicons : MaterialCommunityIcons;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          width: 36,
          height: 36,
          borderRadius: theme.borderRadius.full,
          backgroundColor: `${theme.colors.textPrimary}10`,
          alignItems: "center",
          justifyContent: "center",
          marginLeft: position === "left" ? theme.spacing.md : 0,
          marginRight: position === "right" ? theme.spacing.md : 0,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      <Icon name={iconName} size={22} color={theme.colors.textPrimary} />
    </TouchableOpacity>
  );
};
export default HeaderButton;