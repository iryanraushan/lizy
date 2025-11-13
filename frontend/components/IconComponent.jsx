import {
  AntDesign,
  Feather,
  FontAwesome,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
const IconComponent = ({
  iconName,
  iconFamily,
  size = 20,
  color = "#e2e8f0",
}) => {
  const IconLib =
    {
      Feather,
      MaterialIcons,
      Ionicons,
      Fontisto,
      AntDesign,
      FontAwesome,
      MaterialCommunityIcons,
    }[iconFamily] || Feather;

  return <IconLib name={iconName} size={size} color={color} />;
};
export default IconComponent;
