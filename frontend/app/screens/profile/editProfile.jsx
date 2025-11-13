import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import GuestRegisterPrompt from "../../../components/GuestRegisterPrompt";
import Header from "../../../components/Header";
import InputField from "../../../components/InputField";
import EditProfileImagePicker from "../../../components/EditProfileImagePicker";
import { theme } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";
import { authAPI } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

const EditProfile = () => {
  const { isGuest, currentUser, refreshCurrentUser } = useAuth();
  const { showToast } = useToast();

  if (isGuest) {
    return <GuestRegisterPrompt feature="profile editing" />;
  }

  const [name, setName] = useState(currentUser?.name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (text) => {
    if (text.length <= 50) {
      setName(text);
    }
  };

  const handleBioChange = (text) => {
    if (text.length <= 1000) {
      setBio(text);
    }
  };

  const handlePhoneChange = (text) => {
    const digits = text.replace(/\D/g, "");
    if (digits.length <= 10) {
      setPhone(digits);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      if (phone && phone.length !== 10) {
        Alert.alert("Error", "Please enter a valid 10-digit phone number");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('bio', bio.trim());
      formData.append('phone', phone.trim());
      
      if (selectedImage) {
        formData.append('profile_picture', {
          uri: selectedImage,
          type: 'image/jpeg',
          name: 'profile-picture.jpg',
        });
      }
      
      const result = await authAPI.updateProfileWithImage(formData);
      
      if (result.success) {
        await refreshCurrentUser();
        setSelectedImage(null);
        showToast("Profile updated successfully", "success");
      }
    } catch (err) {
      console.error('Profile update error:', err);
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayText = () => {
    return currentUser?.role === "provider"
      ? "I have properties to rent/sell"
      : "I am looking for a property to rent/buy";
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.sectionSubtitle}>
            Update your personal details below
          </Text>
        </View>

        <EditProfileImagePicker
          currentImageUrl={currentUser?.profile_pictures?.medium?.url || null}
          onImageSelected={(croppedUri) => setSelectedImage(croppedUri)}
          onImageRemoved={() => setSelectedImage(null)}
        />
        
        {selectedImage && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>✓ Image selected - will be saved when you update profile</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <InputField
              label="Full Name"
              value={name}
              onChangeText={handleNameChange}
              placeholder="Enter your full name"
              icon="user"
              iconColor={theme.colors.primary}
              style={styles.inputField}
            />
            <Text style={styles.characterCount}>{name.length}/50</Text>
          </View>

          <View style={styles.inputWrapper}>
            <InputField
              label="Email Address"
              value={email}
              placeholder="Enter your email"
              icon="mail"
              iconColor={theme.colors.textSubtle}
              keyboardType="email-address"
              style={[styles.inputField, styles.readOnlyField]}
              editable={false}
            />
            <Text style={styles.readOnlyHint}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputWrapper}>
            <InputField
              label="Phone Number"
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="Enter your phone number"
              icon="phone"
              iconColor={theme.colors.primary}
              keyboardType="numeric"
              style={styles.inputField}
              maxLength={10}
            />
            <Text style={styles.characterCount}>
              {phone.length}/10 {phone.length === 10 && "✓"}
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <InputField
              label="Bio"
              value={bio}
              onChangeText={handleBioChange}
              placeholder="Tell us about yourself..."
              icon="edit-3"
              iconColor={theme.colors.primary}
              multiline
              numberOfLines={4}
              style={styles.inputField}
              maxLength={1000}
            />
            <Text style={styles.characterCount}>{bio.length}/1000</Text>
          </View>

          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Account Type</Text>
            <View style={styles.roleDisplay}>
              <View style={styles.roleIcon}>
                <Ionicons
                  name={currentUser?.role === "provider" ? "home" : "search"}
                  size={20}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.roleText}>{getRoleDisplayText()}</Text>
            </View>
            <Text style={styles.roleHint}>
              Contact support to change your account type
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.updateButton,
            (isLoading || !name.trim()) && styles.updateButtonDisabled,
          ]}
          onPress={handleUpdate}
          disabled={isLoading || !name.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.updateButtonText}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Your information is secure and will not be shared with others.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing["5xl"],
  },
  sectionHeader: {
    marginBottom: theme.spacing["3xl"],
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSubtle,
    lineHeight: theme.typography.lineHeight.normal,
  },
  formContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputWrapper: {
    marginBottom: theme.spacing.lg,
  },
  inputField: {
    borderRadius: theme.borderRadius.xl,
  },
  previewContainer: {
    backgroundColor: theme.colors.success + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  previewText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  roleContainer: {
    marginBottom: theme.spacing.xl,
  },
  roleLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  roleDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  roleText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  roleHint: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSubtle,
    fontStyle: "italic",
  },
  updateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing["2xl"],
    alignItems: "center",
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  updateButtonDisabled: {
    backgroundColor: theme.colors.textDisabled,
    opacity: 0.6,
  },
  updateButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  infoSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSubtle,
    lineHeight: 20,
    textAlign: "center",
  },
  characterCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSubtle,
    textAlign: "right",
    marginTop: -theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  readOnlyField: {
    backgroundColor: theme.colors.surface,
    opacity: 0.7,
  },
  readOnlyHint: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSubtle,
    textAlign: "right",
    marginTop: -theme.spacing.md,
    marginRight: theme.spacing.sm,
    fontStyle: "italic",
  },
});