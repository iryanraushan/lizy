import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  Dimensions,
  PanGestureHandler,
  PinchGestureHandler,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ImageCropper = ({ visible, imageUri, onClose, onCrop, aspectRatio = 1 }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cropAreaSize = Math.min(screenWidth - 40, screenHeight * 0.5);

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        setImageDimensions({ width, height });
      });
    }
  }, [imageUri]);

  const cropImage = async () => {
    if (!imageUri || !imageDimensions.width || !imageDimensions.height) return;
    
    setIsProcessing(true);
    try {
      // Calculate the display dimensions of the image
      const imageAspectRatio = imageDimensions.width / imageDimensions.height;
      const containerWidth = screenWidth;
      const containerHeight = screenHeight * 0.7;
      
      let displayWidth, displayHeight, offsetX, offsetY;
      
      if (imageAspectRatio > containerWidth / containerHeight) {
        // Image is wider than container
        displayWidth = containerWidth;
        displayHeight = containerWidth / imageAspectRatio;
        offsetX = 0;
        offsetY = (containerHeight - displayHeight) / 2;
      } else {
        // Image is taller than container
        displayHeight = containerHeight;
        displayWidth = containerHeight * imageAspectRatio;
        offsetX = (containerWidth - displayWidth) / 2;
        offsetY = 0;
      }
      
      // Calculate scale factor to convert from display coordinates to actual image coordinates
      const scaleFactorX = imageDimensions.width / displayWidth;
      const scaleFactorY = imageDimensions.height / displayHeight;
      
      // Calculate crop area in display coordinates
      const cropLeft = (screenWidth - cropAreaSize) / 2;
      const cropTop = (screenHeight - cropAreaSize) / 2;
      
      // Convert to image coordinates with current transform
      const imageLeft = offsetX + translateX.value;
      const imageTop = offsetY + translateY.value;
      
      // Calculate actual crop coordinates
      const cropX = Math.max(0, (cropLeft - imageLeft) / scale.value * scaleFactorX);
      const cropY = Math.max(0, (cropTop - imageTop) / scale.value * scaleFactorY);
      const cropWidth = Math.min(
        imageDimensions.width - cropX,
        (cropAreaSize / scale.value) * scaleFactorX
      );
      const cropHeight = Math.min(
        imageDimensions.height - cropY,
        (cropAreaSize / scale.value) * scaleFactorY
      );

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: cropX,
              originY: cropY,
              width: cropWidth,
              height: cropHeight,
            },
          },
          {
            resize: {
              width: 400,
              height: 400,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      onCrop(result.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to crop image');
      console.error('Crop error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(0.5, Math.min(3, event.scale));
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const resetTransform = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color="#fff" />
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Crop Image</Text>
          
          <TouchableOpacity 
            onPress={cropImage} 
            style={[styles.headerButton, isProcessing && styles.disabled]}
            disabled={isProcessing}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
            <Text style={styles.headerButtonText}>
              {isProcessing ? 'Processing...' : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
            <Animated.View style={[styles.imageWrapper, animatedStyle]}>
              <Image source={{ uri: imageUri }} style={styles.image} />
            </Animated.View>
          </GestureDetector>
          
          {/* Crop overlay */}
          <View style={[styles.cropOverlay, { width: cropAreaSize, height: cropAreaSize }]} />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={resetTransform} style={styles.controlButton}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageWrapper: {
    position: 'absolute',
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.7,
    resizeMode: 'contain',
  },
  cropOverlay: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  controlButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
});

export default ImageCropper;