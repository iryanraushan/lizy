import { StatusBar, StyleSheet, View } from "react-native";
import GuestProfile from "../../components/GuestProfile";
import ProfilePage from "../../components/pages/ProfilePage";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { isGuest } = useAuth();

  if (isGuest) {
    return <GuestProfile />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ProfilePage />
    </View>
  );
};

export default Profile;
