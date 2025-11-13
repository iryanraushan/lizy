import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

const LazyImage = ({ 
  source, 
  style, 
  placeholder, 
  contentFit = 'cover',
  blurhash = 'LGF~k+00_3M{?aayM{of~qxuWBt7',
  onLoad,
  onError,
  threshold = 100, // Distance from viewport to start loading
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const viewRef = useRef(null);

  useEffect(() => {
    const checkViewport = () => {
      if (viewRef.current) {
        viewRef.current.measure((x, y, width, height, pageX, pageY) => {
          const screenHeight = Dimensions.get('window').height;
          const isVisible = pageY < screenHeight + threshold && pageY + height > -threshold;
          
          if (isVisible && !isInViewport) {
            setIsInViewport(true);
          }
        });
      }
    };

    // Initial check
    const timer = setTimeout(checkViewport, 100);
    
    return () => clearTimeout(timer);
  }, [isInViewport, threshold]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    onLoad?.();
  };

  const handleImageError = (error) => {
    setHasError(true);
    setIsLoaded(false);
    onError?.(error);
  };

  const renderPlaceholder = () => (
    <View style={[styles.placeholder, style]}>
      <Ionicons 
        name={hasError ? "image-outline" : "images-outline"} 
        size={24} 
        color={theme.colors.textMuted} 
      />
    </View>
  );

  return (
    <View ref={viewRef} style={[styles.container, style]} {...props}>
      {!isInViewport && renderPlaceholder()}
      
      {isInViewport && (
        <>
          {!isLoaded && !hasError && renderPlaceholder()}
          
          <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
            <Image
              source={typeof source === 'string' ? { uri: source } : source}
              style={[styles.image, style]}
              contentFit={contentFit}
              placeholder={{ blurhash }}
              onLoad={handleImageLoad}
              onError={handleImageError}
              transition={200}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default LazyImage;