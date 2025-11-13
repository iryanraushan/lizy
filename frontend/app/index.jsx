import { ActivityIndicator, StyleSheet, View } from "react-native";

const StartupPage = () => {
  console.log("StartupPage rendered");
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );
};

export default StartupPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
});
