import { StyleSheet, View } from "react-native";
import GuestProfile from "../../components/GuestProfile";
import ProfilePage from "../../components/pages/ProfilePage";
import { useAuth } from "../../context/AuthContext";
import { useDatabase } from "../../context/DatabaseContext";

const Profile = () => {
  const { isGuest } = useAuth();

  if (isGuest) {
    return <GuestProfile />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ProfilePage />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
