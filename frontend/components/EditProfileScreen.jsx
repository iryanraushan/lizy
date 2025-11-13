import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EditProfileImagePicker from './EditProfileImagePicker';
import Header from './Header';
import { imageAPI } from '../services/imageAPI';
import { theme } from '../constants/theme';

const EditProfileScreen = ({ currentUser, updateUser, refreshCurrentUser, showToast }) => {
  const [name, setName] = useState(currentUser?.name || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [profileImageUrl, setProfileImageUrl] = useState(currentUser?.profileImageUrl || null);
  const [profileImageId, setProfileImageId] = useState(currentUser?.profileImageId || null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [pendingImageData, setPendingImageData] = useState(null);

  useEffect(() => {
    const loadProfileImageUrl = async () => {
      if (profileImageId && !profileImageUrl) {
        try {
          const result = await imageAPI.getProfileImageUrl();
          if (result.success && result.data?.imageUrl) {
            setProfileImageUrl(result.data.imageUrl);
          }
        } catch (error) {
          console.error('Failed to load profile image URL:', error);
        }
      }
    };

    loadProfileImageUrl();
  }, [profileImageId, profileImageUrl]);

  const handleNameChange = (text) => {
    if (text.length <= 50) {
      setName(text);
    }
  };

  const handleEmailChange = (text) => {
    if (text.length <= 50) {
      setEmail(text);
    }
  };

  const handleBioChange = (text) => {
    if (text.length <= 2000) {
      setBio(text);
    }
  };

  const handlePhoneChange = (text) => {
    const digits = text.replace(/\D/g, "");
    if (digits.length <= 10) {
      setPhone(digits);
    }
  };

  const handleImageSelected = (imageData) => {
    setPendingImageData(imageData);
    setPreviewImageUrl(imageData.uri);
  };

  const handleImageRemoved = () => {
    setProfileImageUrl(null);
    setProfileImageId(null);
    setPreviewImageUrl(null);
    setPendingImageData(null);
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      if (phone && phone.length !== 10) {
        Alert.alert("Error", "Please enter a valid 10-digit phone number");
        setIsLoading(false);
        return;
      }

      let updatedImageId = profileImageId;
      let updatedImageUrl = profileImageUrl;
      
      if (pendingImageData) {
        setIsUploadingImage(true);
        try {
          const hasCurrentImage = !!profileImageId;
          const imageResult = await imageAPI.handleProfileImageOperation(
            pendingImageData.uri, 
            hasCurrentImage
          );
          
          if (imageResult.success && imageResult.data?.imageId) {
            updatedImageId = imageResult.data.imageId;
            updatedImageUrl = imageResult.data.imageUrl;
            setProfileImageId(updatedImageId);
            setProfileImageUrl(updatedImageUrl);
            setPendingImageData(null);
            setPreviewImageUrl(null);
          }
        } catch (imageError) {
          console.error('Image upload error:', imageError);
          showToast('Profile updated, but image upload failed. Please try again.', 'warning');
        } finally {
          setIsUploadingImage(false);
        }
      }

      const updateData = {
        name: name.trim(),
        bio: bio.trim(),
        email: email.trim(),
        phone: phone.trim(),
        profileImageUrl: updatedImageId, 
      };
      
      await updateUser(updateData);
      await refreshCurrentUser();
      showToast("Profile updated successfully", "success");
    } catch (err) {
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

        <View style={styles.imageContainer}>
          <EditProfileImagePicker
            currentUser={currentUser}
            profileImageUrl={profileImageUrl}
            profileImageId={profileImageId}
            previewImageUrl={previewImageUrl}
            isUploadingImage={isUploadingImage}
            onImageSelected={handleImageSelected}
            onImageRemoved={handleImageRemoved}
            showToast={showToast}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={handleNameChange}
            placeholder="Enter your name"
            maxLength={50}
          />
          <Text style={styles.charCount}>{name.length}/50</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={handleEmailChange}
            placeholder="Enter your email"
            keyboardType="email-address"
            maxLength={50}
          />
          <Text style={styles.charCount}>{email.length}/50</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="Enter your phone number"
            keyboardType="numeric"
            maxLength={10}
          />
          <Text style={styles.charCount}>{phone.length}/10</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={handleBioChange}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
            maxLength={2000}
          />
          <Text style={styles.charCount}>{bio.length}/2000</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.roleText}>{getRoleDisplayText()}</Text>
        </View>

        <TouchableOpacity
          style={[styles.updateButton, (isLoading || isUploadingImage) && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={isLoading || isUploadingImage}
        >
          {isLoading || isUploadingImage ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background || '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text || '#000',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: theme.colors.textSubtle || '#666',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text || '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border || '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.surface || '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.textSubtle || '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  roleText: {
    fontSize: 16,
    color: theme.colors.textSubtle || '#666',
    fontStyle: 'italic',
    padding: 12,
    backgroundColor: theme.colors.surface || '#f5f5f5',
    borderRadius: 8,
  },
  updateButton: {
    backgroundColor: theme.colors.primary || '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;