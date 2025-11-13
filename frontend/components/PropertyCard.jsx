import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, fonts, theme } from "../constants/theme";
import IconComponent from "./IconComponent";
import { useDatabase } from "../context/DatabaseContext";
import { useAuth } from "../context/AuthContext";
import { getStatusColor, getStatusLabel } from "../utils/utils";
import { favoritesAPI } from "../services/api";
import { COMMON_OPTIONS } from "../constants/property";
import ImageCarousel from "./ImageCarousel";

const PropertyCard = ({
  property,
  showOwnerActions = false,
  onPress = null,
  onEdit = null,
  onDelete = null,
  showSaveButton = true,
  onFavoriteChange = null,
  initialFavoriteStatus = false,
  showEditButton = false,
  showStatusButton = false,
  providerView = false,
}) => {
  const [isFavorited, setIsFavorited] = useState(initialFavoriteStatus);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const { updatePropertyStatus, changePropertyStatusLoading } = useDatabase();
  const { currentUser, isGuest } = useAuth();

  // Only show save button for seekers
  const shouldShowSaveButton =
    showSaveButton && !isGuest && currentUser?.role === "seeker";

  useEffect(() => {
    if (shouldShowSaveButton && property?.id) {
      loadFavoriteStatus();
    }
  }, [property?.id, shouldShowSaveButton]);

  const loadFavoriteStatus = async () => {
    try {
      const response = await favoritesAPI.getFavoriteStatus(property.id);
      if (response.success) {
        setIsFavorited(response.data.favorited);
      }
    } catch (error) {
      console.error("Failed to load favorite status:", error);
    }
  };

  const getPropertyTypeLabel = (type) => {
    if (!type) return "";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress(property.id);
    }
  };

  const handleEditPress = () => {
    if (onEdit) {
      onEdit(property);
    } else {
      console.log("Edit property:", property.id);
    }
  };

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
            console.log(`Updating property ${propertyId} status to ${opt.value}`);
            await updatePropertyStatus(propertyId, opt.value);
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

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (onDelete) {
              onDelete(property.id);
            }
          },
        },
      ]
    );
  };

  const handleFavoritePress = async () => {
    if (isLoadingFavorite) return;

    setIsLoadingFavorite(true);
    try {
      const response = await favoritesAPI.toggleFavorite(property.id);

      if (response.success) {
        const newFavoriteStatus = response.data.favorited;
        setIsFavorited(newFavoriteStatus);

        if (onFavoriteChange) {
          onFavoriteChange(property, newFavoriteStatus);
        }
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      Alert.alert(
        "Error",
        "Failed to update favorite status. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.propertyCard}
      activeOpacity={0.9}
      onPress={handleCardPress}
    >
      <View style={styles.imageContainer}>
        {property.imageUrls && property.imageUrls.length > 0 ? (
          <ImageCarousel
            images={property.imageUrls}
            height={160}
            style={styles.carousel}
            borderRadius={0}
            showIndicators={true}
            enableFullscreen={true}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name="image-outline"
              size={30}
              color={theme.colors.textDisabled}
            />
            <Text style={styles.placeholderText}>No Image Available</Text>
          </View>
        )}

        <View style={styles.listingTypeBadge}>
          <Text style={styles.listingTypeText}>
            {property.listingType === "RENT" ? "For Rent" : "For Sale"}
          </Text>
        </View>

        {property.availability && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(property.availability) },
            ]}
          >
            {changePropertyStatusLoading && selectedProperty === property.id ? (
              <Ionicons name="sync-outline" size={14} color="#fff" />
            ) : (
              <Text style={styles.statusText}>
                {getStatusLabel(property.availability)}
              </Text>
            )}
          </View>
        )}

        {shouldShowSaveButton && (
          <TouchableOpacity
            style={[
              styles.saveButton,
              isFavorited ? styles.saveButtonActive : styles.saveButtonInactive,
            ]}
            onPress={handleFavoritePress}
            activeOpacity={0.7}
            disabled={isLoadingFavorite}
          >
            <IconComponent
              iconName={isFavorited ? "heart" : "heart-outline"}
              iconFamily={"Ionicons"}
              size={20}
              color={"#fff"}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.propertyDetails}>
        <View style={styles.propertyHeader}>
          <Text style={styles.propertyTitle} numberOfLines={2}>
            {property.title}
          </Text>
          {property.type && (
            <View style={styles.propertyTypeBadge}>
              <Text style={styles.propertyTypeText}>
                {getPropertyTypeLabel(property.type)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={theme.colors.primary}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {property.location
              ? property.location
              : `${property.city} , ${property.state}`}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <IconComponent
            iconName={"inr"}
            iconFamily={"FontAwesome"}
            color={theme.colors.primary}
            size={16}
          />
          <Text style={styles.priceValue}>
            {property.minimumPrice} - {property.maximumPrice}
          </Text>
        </View>

        <View style={styles.featuresRow}>
          <View style={styles.featureBadge}>
            <Ionicons
              name="water-outline"
              size={12}
              color={theme.colors.primary}
            />
            <Text style={styles.featureText}>
              {property?.amenities_count || property?.amenities?.length || 0}{" "}
              Amenities
            </Text>
          </View>
          {property.areaSize && (
            <View style={styles.featureBadge}>
              <Ionicons
                name="resize-outline"
                size={12}
                color={theme.colors.primary}
              />
              <Text style={styles.featureText}>{property.areaSize} sq ft</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.availabilityRow}>
            <Ionicons
              name="calendar-outline"
              size={12}
              color={theme.colors.primary}
            />
            <Text style={styles.availabilityText}>
              {property.availableFrom
                ? `Available from ${new Date(
                    property.availableFrom
                  ).toLocaleDateString()}`
                : "Availability date not specified"}
            </Text>
          </View>

          <View style={styles.viewDetailsIcon}>
            <Ionicons name="chevron-forward-outline" size={16} color={"#fff"} />
          </View>
        </View>

        {showOwnerActions && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEditPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name="pencil-outline"
                size={16}
                color={theme.colors.warning}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.warning },
                ]}
              >
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeletePress}
              activeOpacity={0.8}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={theme.colors.error}
              />
              <Text
                style={[styles.actionButtonText, { color: theme.colors.error }]}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {providerView && (showEditButton || showStatusButton) && (
          <View style={styles.providerActions}>
            {showEditButton && (
              <TouchableOpacity
                style={[styles.providerActionButton, styles.editActionButton]}
                onPress={handleEditPress}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="pencil-outline"
                  size={16}
                  color={theme.colors.blue}
                />
                <Text
                  style={[
                    styles.providerActionText,
                    { color: theme.colors.blue },
                  ]}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            )}

            {showStatusButton && (
              <TouchableOpacity
                style={[
                  styles.providerActionButton,
                  {
                    backgroundColor: theme.colors.primary + "20",
                    borderColor: theme.colors.primary + "30",
                  },
                ]}
                onPress={() =>
                  togglePropertyStatus(property.id, property.availability)
                }
                activeOpacity={0.8}
              >
                <EvilIcons
                  name="refresh"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={[styles.providerActionText]}>Change Status</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PropertyCard;

const styles = StyleSheet.create({
  propertyCard: {
    ...theme.components.card,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
    ...theme.shadows.sm,
    borderRadius: theme.borderRadius.xl,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  carousel: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  placeholderText: {
    color: theme.colors.textDisabled,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  statusBadge: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.normal,
  },
  listingTypeBadge: {
    position: "absolute",
    top: theme.spacing.md,
    left: theme.spacing.sm,
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  listingTypeText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.normal,
  },
  saveButton: {
    position: "absolute",
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonActive: {
    backgroundColor: theme.colors.primary,
    transform: [{ scale: 1 }],
  },
  saveButtonInactive: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    transform: [{ scale: 1 }],
  },
  propertyDetails: {
    position: "relative",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  propertyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  propertyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  propertyTypeBadge: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  propertyTypeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  locationText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.fontSize.sm,
    marginLeft: 6,
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  priceValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  featureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  featureText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  availabilityText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.fontSize.xs,
    marginLeft: 4,
  },
  viewDetailsIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border,
    flex: 1,
    marginHorizontal: 1,
    justifyContent: "center",
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: 2,
  },
  providerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  providerActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
  },
  editActionButton: {
    backgroundColor: theme.colors.blue + "15",
    borderColor: theme.colors.blue + "30",
  },
  providerActionText: {
    fontSize: theme.typography.fontSize.sm,
    marginLeft: theme.spacing.xs,
    color: theme.colors.primary,
  },
});
