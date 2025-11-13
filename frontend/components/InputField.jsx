import { StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "../constants/theme";
import IconComponent from "./IconComponent";

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  iconColor = "#64748b",
  iconSize = 18,
  iconFamily = "Feather",
  multiline,
  keyboardType,
  numberOfLines,
  secureTextEntry,
  style,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View
      style={[style, styles.inputWrapper, multiline && styles.textAreaWrapper]}
    >
      {icon && (
        <IconComponent
          iconName={icon}
          size={iconSize}
          color={iconColor}
          iconFamily={iconFamily}
        />
      )}
      <TextInput
        style={[styles.textInput, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines || (multiline ? 4 : 1)}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  </View>
);
export default InputField;

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    height: 50,
    alignItems: "center",
  },
  textAreaWrapper: {
    height: "auto",
    minHeight: 100,
    paddingVertical: theme.spacing.lg,
    alignItems: "flex-start",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#e2e8f0",
    fontWeight: "500",
    marginLeft: 12,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
});
