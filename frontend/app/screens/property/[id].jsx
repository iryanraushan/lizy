import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import ImageCarousel from "../../../components/ImageCarousel";
import {
  ALL_AMENITIES,
  COMMON_OPTIONS,
  LISTING_TYPES,
  PROPERTY_HELPERS,
} from "../../../constants/property";
import { theme } from "../../../constants/theme";
import { useAuth } from "../../../context/AuthContext";
import { useDatabase } from "../../../context/DatabaseContext";
import { addToRecentVisits } from "../../../utils/localStorage";
import { formatDate, getStatusColor } from "../../../utils/utils";
import { favoritesAPI, chatAPI } from "../../../services/api";

const { width, height } = Dimensions.get("window");

export default function PropertyDetails() {
  const { id } = useLocalSearchParams();

  const {
    deleteProperty,
    getPropertyById,
    updatePropertyStatus,
    changePropertyStatusLoading,
  } = useDatabase();
  const { isGuest, currentUser } = useAuth();
  const [propertyData, setPropertyData] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isLoading, setIsLoading] = useState(!propertyData);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const togglePropertyStatus = async (propertyId, currentStatus) => {
    try {
      const availableOptions = COMMON_OPTIONS.AVAILABILITY.filter(
        (opt) => opt.value !== currentStatus
      );

      const alertButtons = availableOptions.map((opt) => ({
        text: opt.label,
        onPress: async () => {
          setSelectedProperty(propertyId);
          try {
            const response = await updatePropertyStatus(propertyId, opt.value);
            setPropertyData(response);
          } catch (err) {
            Alert.alert("Error", "Failed to update property status");
          } finally {
            setSelectedProperty(null);
          }
        },
      }));

      alertButtons.push({
        text: "Cancel",
        style: "cancel",
        onPress: () => console.log("Status change cancelled"),
      });

      Alert.alert(
        "Change Property Status",
        "Choose the new status for this property:",
        alertButtons
      );
    } catch (error) {
      Alert.alert("Error", "Something went wrong while updating status");
    }
  };

  const propertyType = useMemo(
    () => PROPERTY_HELPERS.getPropertyType(propertyData?.type),
    [propertyData?.type]
  );

  const listingType = useMemo(
    () => LISTING_TYPES[propertyData?.listingType?.toUpperCase()],
    [propertyData?.listingType]
  );

  const availabilityStatus = useMemo(
    () =>
      COMMON_OPTIONS.AVAILABILITY.find(
        (opt) => opt.value === propertyData?.availability
      ),
    [propertyData?.availability]
  );

  const furnishedStatus = useMemo(
    () =>
      COMMON_OPTIONS.FURNISHED_STATUS.find(
        (opt) => opt.value === propertyData?.furnished
      ),
    [propertyData?.furnished]
  );

  const genderPreference = useMemo(
    () =>
      COMMON_OPTIONS.GENDER_PREFERENCE.find(
        (opt) => opt.value === propertyData?.genderPreference
      ),
    [propertyData?.genderPreference]
  );

  const checkFavoriteStatus = useCallback(async () => {
    if (isGuest || currentUser?.role !== 'seeker' || !id) return;
    
    try {
      const response = await favoritesAPI.getFavoriteStatus(id);
      if (response.success) {
        setIsFavorited(response.data.favorited);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }, [id, isGuest, currentUser]);

  const loadPropertyDetails = useCallback(async () => {
    try {
      setIsLoadingImages(true);
      setIsLoading(true);
      console.log("PropertyDetails: Loading property with images for ID:", id);

      const response = await getPropertyById(id);
      setPropertyData(response.data);
      
      // Check favorite status after loading property
      await checkFavoriteStatus();
    } catch (error) {
      console.error(
        "PropertyDetails: Failed to load property with images:",
        error
      );
    } finally {
      setIsLoadingImages(false);
      setIsLoading(false);
    }
  }, [id, getPropertyById, checkFavoriteStatus]);

  useEffect(() => {
    loadPropertyDetails();
  }, []);

  useEffect(() => {
    if (propertyData) {
      addToRecentVisits(propertyData);
    }
  }, [propertyData]);

  const handleAskOwner = useCallback(async () => {
    if (isGuest) {
      Alert.alert(
        "Registration Required",
        "Please register to contact property owners.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Register",
            onPress: () => router.push("/(auth)/registration"),
          },
        ]
      );
      return;
    }
    
    try {
      const response = await chatAPI.createChat(propertyData?.owner);
      if (response.success) {
        router.push(`/screens/chat/${response.data.id}`);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to start chat');
    }
  }, [isGuest, propertyData?.owner, router]);

  const handleSaveProperty = useCallback(async () => {
    if (isGuest) {
      Alert.alert(
        "Registration Required",
        "Please register to save properties to your favorites.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Register",
            onPress: () => router.push("/(auth)/registration"),
          },
        ]
      );
      return;
    }

    if (currentUser?.role !== 'seeker') {
      Alert.alert("Error", "Only seekers can save properties to favorites.");
      return;
    }

    if (favoriteLoading) return;

    try {
      setFavoriteLoading(true);
      const response = await favoritesAPI.toggleFavorite(propertyData.id);
      
      if (response.success) {
        setIsFavorited(response.data.favorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert("Error", "Failed to update favorite status. Please try again.");
    } finally {
      setFavoriteLoading(false);
    }
  }, [isGuest, currentUser, propertyData, favoriteLoading, router]);

  const renderAmenityChip = useCallback((amenityValue) => {
    const amenity = ALL_AMENITIES.find((a) => a.value === amenityValue);
    return (
      <View key={amenityValue} style={styles.amenityChip}>
        <Ionicons
          name={amenity?.icon || "checkmark-circle-outline"}
          size={16}
          color={theme.colors.primary}
          style={styles.amenityIcon}
        />
        <Text style={styles.amenityText}>{amenity?.label || amenityValue}</Text>
      </View>
    );
  }, []);

  const handleEditProperty = () => {
    router.push({
      pathname: "/screens/profile/addProperty",
      params: {
        editMode: "true",
        propertyId: id,
        propertyData: JSON.stringify(propertyData),
      },
    });
  };

  const handleDeleteProperty = () => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const propertyId = id;
              const result = await deleteProperty(propertyId);
              if (result.success) {
                Alert.alert("Success", "Property deleted successfully!", [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ]);
              } else {
                Alert.alert(
                  "Error",
                  `Failed to delete property: ${
                    result.error || "Unknown error"
                  }`
                );
              }
            } catch (error) {
              Alert.alert(
                "Error",
                "An unexpected error occurred. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  if (!propertyData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading property details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <Header title="Property Details" noMarginTop />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={styles.imageContainer}>
          {isLoadingImages ? (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading images...</Text>
            </View>
          ) : (
            <ImageCarousel
              images={propertyData.imageUrls || []}
              height={300}
              enableFullscreen={true}
              showIndicators={true}
              borderRadius={0}
              style={styles.carousel}
            />
          )}

          <View style={styles.listingTypeBadge}>
            <Text style={styles.listingTypeText}>
              {listingType?.label || propertyData.listingType}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(propertyData.availability),
              },
            ]}
          >
            <Text style={styles.statusText}>
              {availabilityStatus?.label || propertyData.availability}
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.propertyTitle}>{propertyData.title}</Text>
            </View>
            <Text style={styles.propertyType}>{propertyType?.label}</Text>

            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>
                {propertyData.listingType === "rent" ? "Monthly Rent" : "Price"}
              </Text>
              <Text style={styles.priceValue}>
                ₹ {propertyData.minimumPrice} - ₹{propertyData.maximumPrice}
              </Text>
              {propertyData.deposit && (
                <Text style={styles.depositText}>
                  Security Deposit: ₹{propertyData.deposit}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="map-pin" size={20} color="#10b981" />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Text style={styles.locationText}>{propertyData.location}</Text>
            <Text style={styles.addressText}>
              {propertyData.city}, {propertyData.state}, {propertyData.country}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="info" size={20} color="#10b981" />
              <Text style={styles.sectionTitle}>Property Features</Text>
            </View>
            <View style={styles.featuresGrid}>
              {propertyData.areaSize && (
                <View style={styles.featureItem}>
                  <Feather name="maximize" size={16} color="#94a3b8" />
                  <Text style={styles.featureLabel}>Area</Text>
                  <Text style={styles.featureValue}>
                    {propertyData.areaSize}
                  </Text>
                </View>
              )}
              {furnishedStatus && (
                <View style={styles.featureItem}>
                  <Feather name="home" size={16} color="#94a3b8" />
                  <Text style={styles.featureLabel}>Furnished</Text>
                  <Text style={styles.featureValue}>
                    {furnishedStatus.label}
                  </Text>
                </View>
              )}
              {propertyData.availableFrom && (
                <View style={styles.featureItem}>
                  <Feather name="calendar" size={16} color="#94a3b8" />
                  <Text style={styles.featureLabel}>Available From</Text>
                  <Text style={styles.featureValue}>
                    {formatDate(propertyData.availableFrom)}
                  </Text>
                </View>
              )}
              {genderPreference && (
                <View style={styles.featureItem}>
                  <Feather name="users" size={16} color="#94a3b8" />
                  <Text style={styles.featureLabel}>Preference</Text>
                  <Text style={styles.featureValue}>
                    {genderPreference.label}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="file-text" size={20} color="#10b981" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>
              {propertyData.description}
            </Text>
          </View>

          {propertyData.amenities && propertyData.amenities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="star" size={20} color="#10b981" />
                <Text style={styles.sectionTitle}>Amenities</Text>
              </View>
              <View style={styles.amenitiesContainer}>
                {propertyData.amenities.map(renderAmenityChip)}
              </View>
            </View>
          )}

          {(currentUser?.role === "seeker" || isGuest) && propertyData.owner !== currentUser?.id && (
            <View style={styles.contactSection}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleAskOwner}
                activeOpacity={0.9}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#ffffff" />
                <Text style={styles.contactButtonText}>Contact Owner</Text>
              </TouchableOpacity>

              <View style={styles.secondaryActions}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    !isGuest && currentUser?.role === 'seeker' && isFavorited && styles.saveButtonActive,
                  ]}
                  onPress={handleSaveProperty}
                  activeOpacity={0.9}
                  disabled={favoriteLoading || currentUser?.role !== 'seeker'}
                >
                  {favoriteLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <Ionicons
                      name={isFavorited ? "heart" : "heart-outline"}
                      size={20}
                      color={isFavorited ? "#ffffff" : theme.colors.primary}
                    />
                  )}
                  <Text
                    style={[
                      styles.saveButtonText,
                      isFavorited && styles.saveButtonTextActive,
                    ]}
                  >
                    {isFavorited ? "Saved" : "Save"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => {
                    const phoneNumber = propertyData.owner_phone || "1234567890";
                    const url = `tel:${phoneNumber}`;
                    Linking.openURL(url).catch(() => {
                      Alert.alert("Error", "Unable to open phone dialer");
                    });
                  }}
                  activeOpacity={0.9}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentUser?.role === "provider" && propertyData.owner === currentUser?.id && (
            <View style={styles.providerActionsSection}>
              <Text style={styles.providerActionsTitle}>Property Actions</Text>
              <Text style={styles.providerActionsSubtitle}>
                This action is only visible to you
              </Text>

              <View style={styles.providerButtonsRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditProperty}
                  activeOpacity={0.9}
                >
                  <Feather name="edit-3" size={18} color="#ffffff" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() =>
                    togglePropertyStatus(
                      propertyData.id,
                      propertyData.availability
                    )
                  }
                  activeOpacity={0.9}
                >
                  {selectedProperty === propertyData.id ||
                  changePropertyStatusLoading ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Feather name="refresh-cw" size={18} color="#3b82f6" />
                      <Text style={styles.statusButtonText}>Status</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteProperty}
              >
                <Feather name="trash-2" size={18} color="#ffffff" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.fontSize.base,
    marginTop: theme.spacing.md,
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: theme.colors.background,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 300,
    backgroundColor: theme.colors.surface,
  },
  carousel: {
    flex: 1,
  },
  imageLoadingContainer: {
    flex: 1,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  listingTypeBadge: {
    position: "absolute",
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  listingTypeText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.spacing["2xl"],
    borderTopRightRadius: theme.spacing["2xl"],
    marginTop: -30,
    paddingTop: theme.spacing["2xl"],
  },
  titleSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing["2xl"],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  propertyTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  statusBadge: {
    position: "absolute",
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  propertyType: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSubtle,
    marginBottom: theme.spacing.lg,
  },
  priceSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSubtle,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  depositText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSubtle,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing["2xl"],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSubtle,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featureItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    minWidth: (width - 100) / 3,
  },
  featureLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSubtle,
    marginTop: theme.spacing.sm,
    marginBottom: 4,
  },
  featureValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  descriptionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeight.normal,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  amenityIcon: {
    marginRight: 6,
  },
  amenityText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  contactSection: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  contactButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  saveButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  saveButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.xs,
  },
  saveButtonTextActive: {
    color: "#ffffff",
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  callButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.xs,
  },
  providerActionsSection: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  providerActionsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  providerActionsSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSubtle,
    marginBottom: theme.spacing.lg,
  },
  providerButtonsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  editButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  statusButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
  },
  statusButtonText: {
    color: "#3b82f6",
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  deleteButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  propertyStatsCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  propertyStatsTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSubtle,
    marginTop: 4,
  },
});
