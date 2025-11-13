import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ImageCropper from './ImageCropper';
import { theme } from '../constants/theme';
import { imageAPI } from '../services/imageAPI';

const EditProfileImagePicker = ({ 
  currentUser, 
  profileImageUrl,
  profileImageId,
  previewImageUrl,
  isUploadingImage,
  onImageSelected,
  onImageRemoved,
  showToast 
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const options = [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
    ];

    if (profileImageUrl) {
      options.unshift({ text: 'Remove Picture', onPress: handleRemoveImage });
    }

    options.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      profileImageUrl ? 'Update Profile Picture' : 'Add Profile Picture',
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
    
    try {
      const imageData = {
        uri: croppedUri,
        type: 'image/jpeg',
        name: 'profile-image.jpg',
      };
      
      if (onImageSelected) {
        onImageSelected(imageData);
      }
      
      setSelectedImage(null);
      showToast && showToast('Image selected. Click "Update Profile" to save changes.', 'info');
    } catch (error) {
      console.error('Image selection error:', error);
      showToast && showToast('Failed to select image', 'error');
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
            try {
              await imageAPI.removeProfileImage();
              
              if (onImageRemoved) {
                onImageRemoved();
              }
              
              showToast && showToast('Profile image removed successfully', 'success');
            } catch (error) {
              console.error('Profile image removal error:', error);
              showToast && showToast(error.message || 'Failed to remove profile image', 'error');
            }
          }
        },
      ]
    );
  };

  const displayImageUrl = previewImageUrl || profileImageUrl;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity
          style={styles.imageWrapper}
          onPress={selectImage}
          disabled={isUploadingImage}
          activeOpacity={0.9}
        >
          {isUploadingImage ? (
            <View style={styles.placeholderImage}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (previewImageUrl || profileImageUrl) ? (
            <View style={styles.imageContent}>
              <Image
                source={{ uri: previewImageUrl || profileImageUrl }}
                style={styles.profileImage}
              />
              {previewImageUrl && (
                <View style={styles.pendingIndicator}>
                  <Ionicons
                    name="time"
                    size={12}
                    color={theme.colors.amber || '#FFA500'}
                  />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons
                name="person"
                size={60}
                color={theme.colors.textSubtle || '#999'}
              />
            </View>
          )}
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  imageContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface || '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border || '#e0e0e0',
  },
  pendingIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditProfileImagePicker;