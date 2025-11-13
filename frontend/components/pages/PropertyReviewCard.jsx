import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { theme } from '../../constants/theme';
import IconComponent from '../IconComponent';
import LazyImage from '../LazyImage';
import {
  PROPERTY_HELPERS,
  LISTING_TYPES,
  COMMON_OPTIONS,
  AMENITIES,
} from '../../constants/property';

const PropertyReviewCard = ({ propertyData, images = [] }) => {
  const ReviewSection = ({ title, children, icon }) => (
    <View style={styles.reviewSection}>
      <View style={styles.reviewSectionHeader}>
        {icon && (
          <IconComponent
            iconName={icon}
            iconFamily="Feather"
            size={20}
            color={theme.colors.primary}
            style={styles.reviewSectionIcon}
          />
        )}
        <Text style={styles.reviewSectionTitle}>{title}</Text>
      </View>
      <View style={styles.reviewSectionContent}>
        {children}
      </View>
    </View>
  );

  const ReviewItem = ({ label, value, isHighlight = false }) => (
    <View style={[styles.reviewItem, isHighlight && styles.highlightItem]}>
      <Text style={styles.reviewLabel}>{label}:</Text>
      <Text style={[styles.reviewValue, isHighlight && styles.highlightValue]}>
        {value || 'Not specified'}
      </Text>
    </View>
  );

  const formatPrice = () => {
    if (propertyData.minimumPrice > 0 && propertyData.maximumPrice > 0) {
      return propertyData.minimumPrice === propertyData.maximumPrice
        ? `₹${propertyData.minimumPrice.toLocaleString()}`
        : `₹${propertyData.minimumPrice.toLocaleString()} - ₹${propertyData.maximumPrice.toLocaleString()}`;
    }
    return 'Not set';
  };

  const getAmenityLabel = (amenityValue) => {
    // Get all amenities for the property type/category
    const availableAmenities = PROPERTY_HELPERS.getAmenities(propertyData.type);
    const amenityObj = availableAmenities.find(a => a.value === amenityValue);
    return amenityObj ? amenityObj.label : amenityValue;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {images.length > 0 && (
        <ReviewSection title="Property Photos" icon="camera">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScrollView}
            contentContainerStyle={styles.imagesContainer}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <LazyImage 
                  source={typeof image === 'string' ? image : image.uri || image}
                  style={styles.reviewImage}
                  contentFit="cover"
                />
                {index === 0 && (
                  <View style={styles.mainImageBadge}>
                    <Text style={styles.mainImageText}>Main</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
          <Text style={styles.imageCount}>
            {images.length} photo{images.length !== 1 ? 's' : ''} selected
          </Text>
        </ReviewSection>
      )}

      <ReviewSection title="Property Details" icon="home">
        <ReviewItem
          label="Property Type"
          value={PROPERTY_HELPERS.getPropertyType(propertyData.type)?.label}
          isHighlight={true}
        />
        <ReviewItem
          label="Listing Type"
          value={Object.values(LISTING_TYPES).find(l => l.value === propertyData.listingType)?.label}
          isHighlight={true}
        />
        <ReviewItem label="Title" value={propertyData.title} />
        {propertyData.roomConfig && (
          <ReviewItem
            label="Room Configuration"
            value={typeof propertyData.roomConfig === 'object' 
              ? propertyData.roomConfig.label 
              : propertyData.roomConfig}
          />
        )}
        {propertyData.areaSize && (
          <ReviewItem label="Area Size" value={propertyData.areaSize} />
        )}
      </ReviewSection>

      {/* Description */}
      {propertyData.description && (
        <ReviewSection title="Description" icon="file-text">
          <Text style={styles.descriptionText}>{propertyData.description}</Text>
        </ReviewSection>
      )}

      {/* Pricing Information */}
      <ReviewSection title="Pricing & Availability" icon="dollar-sign">
        <ReviewItem
          label="Price Range"
          value={formatPrice()}
          isHighlight={true}
        />
        {propertyData.deposit && (
          <ReviewItem label="Security Deposit" value={`₹${propertyData.deposit}`} />
        )}
        <ReviewItem
          label="Available From"
          value={propertyData.availableFrom || 'Immediately'}
        />
        <ReviewItem
          label="Availability Status"
          value={COMMON_OPTIONS.AVAILABILITY.find(a => a.value === propertyData.availability)?.label}
        />
        <ReviewItem
          label="Furnished Status"
          value={COMMON_OPTIONS.FURNISHED_STATUS.find(f => f.value === propertyData.furnished)?.label}
        />
        {propertyData.genderPreference && (
          <ReviewItem
            label="Gender Preference"
            value={COMMON_OPTIONS.GENDER_PREFERENCE.find(g => g.value === propertyData.genderPreference)?.label}
          />
        )}
      </ReviewSection>

      {/* Location Information */}
      <ReviewSection title="Location" icon="map-pin">
        <ReviewItem label="Address" value={propertyData.location} isHighlight={true} />
        <ReviewItem 
          label="City, State, Country" 
          value={`${propertyData.city}, ${propertyData.state}, ${propertyData.country}`} 
        />
        {propertyData.latitude && propertyData.longitude && (
          <ReviewItem
            label="GPS Coordinates"
            value={`${parseFloat(propertyData.latitude).toFixed(6)}, ${parseFloat(propertyData.longitude).toFixed(6)}`}
          />
        )}
      </ReviewSection>

      {/* Amenities */}
      {propertyData.amenities && propertyData.amenities.length > 0 && (
        <ReviewSection title="Amenities" icon="check-circle">
          <View style={styles.amenitiesContainer}>
            {propertyData.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{getAmenityLabel(amenity)}</Text>
              </View>
            ))}
          </View>
        </ReviewSection>
      )}

      {/* Summary Section */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <IconComponent
            iconName="check-circle"
            iconFamily="Feather"
            size={24}
            color={theme.colors.success}
          />
          <Text style={styles.summaryTitle}>Ready to Submit</Text>
        </View>
        <Text style={styles.summaryText}>
          Please review all the information above carefully. Once submitted, your property will be listed and visible to potential {propertyData.listingType === 'rent' ? 'tenants' : 'buyers'}.
        </Text>
        {images.length === 0 && (
          <Text style={styles.warningText}>
            ⚠️ Consider adding photos to make your listing more attractive
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reviewSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reviewSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  reviewSectionIcon: {
    marginRight: theme.spacing.sm,
  },
  reviewSectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  reviewSectionContent: {
    gap: theme.spacing.sm,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  highlightItem: {
    backgroundColor: `${theme.colors.primary}05`,
    marginHorizontal: -theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderBottomColor: 'transparent',
  },
  reviewLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  reviewValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 2,
    textAlign: 'right',
  },
  highlightValue: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  descriptionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal,
    textAlign: 'justify',
  },
  imagesScrollView: {
    marginBottom: theme.spacing.md,
  },
  imagesContainer: {
    paddingRight: theme.spacing.md,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  reviewImage: {
    width: 120,
    height: 90,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceLight,
  },
  mainImageBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  mainImageText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  imageCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  amenityTag: {
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  amenityText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  summaryCard: {
    backgroundColor: `${theme.colors.success}10`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: `${theme.colors.success}30`,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
    marginLeft: theme.spacing.sm,
  },
  summaryText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal,
    marginBottom: theme.spacing.sm,
  },
  warningText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.amber,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

export default PropertyReviewCard;