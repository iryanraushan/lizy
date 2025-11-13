import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import IconComponent from "./IconComponent";

const { height } = Dimensions.get("window");

const MapModal = ({ visible, onClose, title, children }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.modalContainer}>
          <View style={styles.handleBar} />
          <View style={styles.header}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <IconComponent
                iconName="close-circle"
                size={22}
                color={theme.colors.textSecondary}
                iconFamily="AntDesign"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>{children}</View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default MapModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalContainer: {
    height: height,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 50,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.sm,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginLeft: 15,
  },
  closeBtn: {
    padding: 5,
  },
  content: {
    flex: 1,
    marginTop: 10,
  },
});
