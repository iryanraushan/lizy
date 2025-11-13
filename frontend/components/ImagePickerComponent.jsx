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
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ImageCropper from './ImageCropper';
import { theme } from '../constants/theme';

const ImagePickerComponent = ({ 
  onImageSelected, 
  currentImage, 
  style,
  showCropper = false,
  placeholder = "Add Image",
  size = 100 
}) => {
  const [selectedImage, setSelectedImage] = useState(currentImage);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToProcess, setImageToProcess] = useState(null);
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
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: !showCropper,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleImageSelection(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: !showCropper,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleImageSelection(result.assets[0].uri);
    }
  };

  const handleImageSelection = (uri) => {
    if (showCropper) {
      setImageToProcess(uri);
      setShowCropModal(true);
    } else {
      setSelectedImage(uri);
      onImageSelected?.(uri);
    }
  };

  const handleCropComplete = (croppedUri) => {
    setShowCropModal(false);
    setSelectedImage(croppedUri);
    setImageToProcess(null);
    onImageSelected?.(croppedUri);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToProcess(null);
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSelectedImage(null);
            onImageSelected?.(null);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.imageContainer,
          { width: size, height: size },
          selectedImage && styles.imageSelected,
        ]}
        onPress={selectImage}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : selectedImage ? (
          <>
            <Image source={{ uri: selectedImage }} style={styles.image} />
            <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
              <Ionicons name="close-circle" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera" size={30} color="#8E8E93" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      {showCropper && (
        <ImageCropper
          visible={showCropModal}
          imageUri={imageToProcess}
          onClose={handleCropCancel}
          onCrop={handleCropComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    position: 'relative',
    overflow: 'hidden',
  },
  imageSelected: {
    borderStyle: 'solid',
    borderColor: '#007AFF',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 5,
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
});

export default ImagePickerComponent;