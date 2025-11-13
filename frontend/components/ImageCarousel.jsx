import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import LazyImage from './LazyImage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ImageCarousel = ({ 
  images = [], 
  height = 250, 
  showIndicators = true, 
  autoPlay = false,
  autoPlayInterval = 3000,
  enableFullscreen = true,
  borderRadius = theme.borderRadius.lg,
  style 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const flatListRef = useRef(null);
  const fullscreenFlatListRef = useRef(null);

  React.useEffect(() => {
    if (autoPlay && images.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [autoPlay, currentIndex, images.length, autoPlayInterval]);

  const onMomentumScrollEnd = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const onFullscreenMomentumScrollEnd = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setFullscreenIndex(index);
  };

  const openFullscreen = (index) => {
    if (enableFullscreen) {
      setFullscreenIndex(index);
      setShowFullscreen(true);
    }
  };

  const closeFullscreen = () => {
    setShowFullscreen(false);
  };

  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.imageSlide, { width: screenWidth, height }]}
      onPress={() => openFullscreen(index)}
      activeOpacity={enableFullscreen ? 0.9 : 1}
    >
      <View style={styles.imageWrapper}>
        <LazyImage
          source={item}
          style={styles.carouselImage}
          contentFit="cover"
          threshold={200}
        />
      </View>
    </TouchableOpacity>
  );

  const renderFullscreenItem = ({ item }) => (
    <View style={styles.fullscreenImageContainer}>
      <LazyImage
        source={item}
        style={styles.fullscreenImage}
        contentFit="contain"
        threshold={0}
      />
    </View>
  );

  if (!images || images.length === 0) {
    return (
      <View style={[styles.placeholder, { height, borderRadius }, style]}>
        <Ionicons name="image-outline" size={40} color={theme.colors.textMuted} />
        <Text style={styles.placeholderText}>No Image Available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderImageItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        keyExtractor={(item, index) => `${item}-${index}`}
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        decelerationRate="fast"
        snapToInterval={screenWidth}
        snapToAlignment="start"
        contentContainerStyle={styles.flatListContent}
      />

      {/* Image counter */}
      {images.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <View style={styles.indicators}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                index === currentIndex ? styles.activeIndicator : styles.inactiveIndicator,
              ]}
              onPress={() => {
                setCurrentIndex(index);
                flatListRef.current?.scrollToIndex({ index, animated: false });
              }}
            />
          ))}
        </View>
      )}

      {/* Fullscreen Modal */}
      <Modal
        visible={showFullscreen}
        transparent={false}
        animationType="fade"
        statusBarTranslucent
      >
        <SafeAreaView style={styles.fullscreenContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeFullscreen}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Text style={styles.fullscreenCounter}>
              {fullscreenIndex + 1} / {images.length}
            </Text>
          </View>

          <FlatList
            ref={fullscreenFlatListRef}
            data={images}
            renderItem={renderFullscreenItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onFullscreenMomentumScrollEnd}
            keyExtractor={(item, index) => `fullscreen-${item}-${index}`}
            initialScrollIndex={fullscreenIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            decelerationRate="fast"
            snapToInterval={screenWidth}
            snapToAlignment="start"
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default ImageCarousel;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  flatListContent: {
    alignItems: 'center',
  },
  imageSlide: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.border,
  },
  placeholderText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  counter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  indicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  closeButton: {
    padding: 10,
  },
  fullscreenCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullscreenImageContainer: {
    width: screenWidth,
    height: screenHeight - 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
});