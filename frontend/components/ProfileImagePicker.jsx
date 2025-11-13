import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ImageCropper from './ImageCropper';
import { imageAPI } from '../services/api';
import { theme } from '../constants/theme';

const ProfileImagePicker = ({ currentUser, onImageUpdated, showRemoveButton = true }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
      return false;
    }
    return true;
  };

  const selectImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const options = [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
    ];

    // Add remove option if user has a profile image and showRemoveButton is true
    if (currentUser?.profileImageUrl && showRemoveButton) {
      options.unshift({ text: 'Remove Picture', onPress: handleRemoveImage });
    }

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      currentUser?.profileImageUrl ? 'Update Profile Picture' : 'Add Profile Picture',
      'Choose an option',
      options
    );
  };

  const openCamera = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setShowCropModal(true);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setShowCropModal(true);
    }
  };

  const handleCropComplete = async (croppedUri) => {
    setShowCropModal(false);
    setIsUploading(true);
    
    try {
      const hasCurrentImage = !!currentUser?.profileImageUrl;
      const result = await imageAPI.handleProfileImageOperation(croppedUri, hasCurrentImage);
      
      // Notify parent component of the update
      if (onImageUpdated) {
        onImageUpdated(result.imageUrl);
      }
      
      Alert.alert('Success', 'Profile image updated successfully');
    } catch (error) {
      console.error('Profile image update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile image');
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImage(null);
  };

  const handleRemoveImage = async () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            setIsUploading(true);
            try {
              await imageAPI.removeProfileImage();
              
              // Notify parent component of the removal
              if (onImageUpdated) {
                onImageUpdated(null);
              }
              
              Alert.alert('Success', 'Profile image removed successfully');
            } catch (error) {
              console.error('Profile image removal error:', error);
              Alert.alert('Error', error.message || 'Failed to remove profile image');
            } finally {
              setIsUploading(false);
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {isUploading ? (
          <View style={[styles.avatar, styles.avatarLoading]}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : currentUser?.profileImageUrl ? (
          <TouchableOpacity 
            style={styles.avatarImageContainer} 
            onPress={selectImage}
            activeOpacity={0.8}
          >
            <Image 
              source={{ uri: currentUser.profileImageUrl }} 
              style={styles.avatarImage} 
            />
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={20} color="#ffffff" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.avatar}
            onPress={selectImage}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>
              {currentUser?.name
                ? currentUser.name.charAt(0).toUpperCase()
                : "U"}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.editAvatarButton}
          onPress={selectImage}
          disabled={isUploading}
        >
          <Ionicons name="camera" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.statusIndicator} />
      </View>

      <ImageCropper
        visible={showCropModal}
        imageUri={selectedImage}
        onClose={handleCropCancel}
        onCrop={handleCropComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: "relative",
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: theme.components.avatar.size.lg,
    height: theme.components.avatar.size.lg,
    borderRadius: theme.components.avatar.size.lg / 2,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: theme.components.avatar.borderWidth,
    borderColor: theme.colors.primaryDark,
  },
  avatarLoading: {
    backgroundColor: theme.colors.primary + '80',
  },
  avatarImageContainer: {
    width: theme.components.avatar.size.lg,
    height: theme.components.avatar.size.lg,
    borderRadius: theme.components.avatar.size.lg / 2,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.components.avatar.size.lg / 2,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: "#ffffff",
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: theme.components.statusIndicator.size,
    height: theme.components.statusIndicator.size,
    borderRadius: theme.components.statusIndicator.borderRadius,
    backgroundColor: theme.colors.primary,
    borderWidth: theme.components.statusIndicator.borderWidth,
    borderColor: theme.colors.background,
  },
});

export default ProfileImagePicker;