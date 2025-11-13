import React, { useState, useEffect } from 'react';
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
import { profileAPI } from '../services/profileAPI';

const SimpleProfilePicker = ({ user, onUpdate }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    loadProfilePicture();
  }, []);

  const loadProfilePicture = async () => {
    try {
      const result = await profileAPI.getProfilePicture();
      if (result.profile_picture_url) {
        setProfileImage(result.profile_picture_url);
      }
    } catch (error) {
      console.log('No profile picture found');
    }
  };

  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access photos.');
      return;
    }

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permission.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPreviewImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPreviewImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri) => {
    setIsUploading(true);
    try {
      const result = await profileAPI.uploadProfilePicture(imageUri);
      setProfileImage(result.profile_picture_url);
      setPreviewImage(null);
      
      if (onUpdate) {
        onUpdate(result.profile_picture_url);
      }
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      setPreviewImage(null);
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const displayImage = previewImage || profileImage;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.imageContainer} 
        onPress={selectImage}
        disabled={isUploading}
      >
        {isUploading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        ) : displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="person" size={50} color="#999" />
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
        
        <View style={styles.editButton}>
          <Ionicons name="camera" size={16} color="#007AFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  profileImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: '#007AFF',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SimpleProfilePicker;