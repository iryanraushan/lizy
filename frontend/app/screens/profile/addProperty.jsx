import {
  Dimensions,
  Alert,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocalSearchParams, router } from "expo-router";
import * as Location from "expo-location";

import { useAuth } from "../../../context/AuthContext";
import { useDatabase } from "../../../context/DatabaseContext";
import { useToast } from "../../../context/ToastContext";

import Header from "../../../components/Header";
import GuestRegisterPrompt from "../../../components/GuestRegisterPrompt";
import InputField from "../../../components/InputField";
import IconComponent from "../../../components/IconComponent";
import DatePicker from "../../../components/DatePicker";
import LocationPicker from "../../../components/LocationPicker";
import MapLocationPicker from "../../../components/MapLocationPicker";
import PropertyReviewCard from "../../../components/pages/PropertyReviewCard";
import ImagePickerComponent from "../../../components/ImagePickerComponent";

import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  COMMON_OPTIONS,
  AMENITIES,
  PROPERTY_HELPERS,
} from "../../../constants/property";
import { theme } from "../../../constants/theme";
import { formatName, convertToISODate } from "../../../utils/utils";

const { width } = Dimensions.get("window");

const AddProperty = () => {
  const { isGuest } = useAuth();
  const { showToast } = useToast();

  if (isGuest) {
    return <GuestRegisterPrompt feature="property management" />;
  }

  const params = useLocalSearchParams();
  const isEditMode = params.editMode === "true";
  const editPropertyId = params.propertyId;

  const editPropertyData = useMemo(() => {
    return params.propertyData ? JSON.parse(params.propertyData) : null;
  }, [params.propertyData]);

  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState({
    type: "",
    category: "",
    roomConfig: "",
    listingType: "",
    title: "",
    description: "",
    deposit: "",
    areaSize: "",
    location: "",
    city: "",
    state: "",
    country: "",
    latitude: "",
    longitude: "",
    availability: "",
    furnishingStatus: "",
    genderPreference: "",
    amenities: [],
    availableFrom: "",
    minimumPrice: 0,
    maximumPrice: 0,
  });

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [propertyImages, setPropertyImages] = useState([]);
  const [existingImageIds, setExistingImageIds] = useState([]);
  const [imageUploadFunction, setImageUploadFunction] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const { addProperty, updateProperty } = useDatabase();

  const [availableOptions, setAvailableOptions] = useState({
    propertyTypes: [],
    roomOptions: [],
    amenities: [],
  });

  const totalSteps = 8;

  useEffect(() => {
    setAvailableOptions((prev) => ({
      ...prev,
      propertyTypes: Object.values(PROPERTY_TYPES).flat(),
    }));
  }, []);

  useEffect(() => {
    if (propertyData.type) {
      const roomOptions = PROPERTY_HELPERS.getRoomOptions(propertyData.type);
      const amenities = PROPERTY_HELPERS.getAmenities(propertyData.type);

      setAvailableOptions((prev) => ({
        ...prev,
        roomOptions,
        amenities,
      }));
    }
  }, [propertyData.type]);

  useEffect(() => {
    if (isEditMode && editPropertyData) {
      setPropertyData({
        type: editPropertyData.type || "",
        category: editPropertyData.category || "",
        roomConfig: editPropertyData.roomConfig || "",
        listingType: editPropertyData.listingType || "",
        title: editPropertyData.title || "",
        description: editPropertyData.description || "",
        deposit: editPropertyData.deposit || "",
        areaSize: editPropertyData.areaSize || "",
        location: editPropertyData.location || "",
        city: editPropertyData.city || "",
        state: editPropertyData.state || "",
        country: editPropertyData.country || "",
        latitude: editPropertyData.latitude || "",
        longitude: editPropertyData.longitude || "",
        availability: editPropertyData.availability || "",
        furnishingStatus: editPropertyData.furnishingStatus || "",
        genderPreference: editPropertyData.genderPreference || "",
        amenities: editPropertyData.amenities || [],
        availableFrom: editPropertyData.availableFrom || "",
        minimumPrice: editPropertyData.minimumPrice || 0,
        maximumPrice: editPropertyData.maximumPrice || 0,
      });

      if (editPropertyData.imageUrls && editPropertyData.imageUrls.length > 0) {
        setPropertyImages(editPropertyData.imageUrls);
        if (editPropertyData.imageIds && editPropertyData.imageIds.length > 0) {
          setExistingImageIds(editPropertyData.imageIds);
        }
        setImageUploadFunction(() => async () => {
          const newImages = editPropertyData.imageUrls.filter(
            (uri) => !uri.startsWith("http")
          );
          return newImages.map((uri, idx) => ({
            uri,
            type: "image/jpeg",
            name: `property-image-${idx + 1}.jpg`,
          }));
        });
      }

      if (editPropertyData.latitude && editPropertyData.longitude) {
        setSelectedLocation({
          latitude: parseFloat(editPropertyData.latitude),
          longitude: parseFloat(editPropertyData.longitude),
        });
      }
    }
  }, [isEditMode, editPropertyData]);

  const updatePropertyData = (field, value) => {
    setPropertyData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      }
      if (field === "minimumPrice" || field === "maximumPrice") {
        const numericValue =
          value === "" ? 0 : parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
        return { ...prev, [field]: numericValue };
      }
      return { ...prev, [field]: value };
    });
  };

  const toggleAmenity = (amenityValue) => {
    setPropertyData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityValue)
        ? prev.amenities.filter((a) => a !== amenityValue)
        : [...prev.amenities, amenityValue],
    }));
  };

  const handleLocationSelect = (locationData) => {
    setPropertyData((prev) => ({
      ...prev,
      country: locationData.country,
      state: locationData.state,
      city: locationData.city,
      location: locationData.place || locationData.city, // Use place as specific location, fallback to city
    }));
  };

  const handleMapLocationSelect = async (locationData) => {
    if (!locationData) {
      setSelectedLocation(null);
      return;
    }

    const { coordinate, address } = locationData;
    setSelectedLocation(coordinate);

    if (address) {
      setPropertyData((prev) => ({
        ...prev,
        location: address.formattedAddress,
        city: address.city,
        state: address.state,
        country: address.country,
        latitude: coordinate.latitude.toString(),
        longitude: coordinate.longitude.toString(),
      }));
    } else {
      setPropertyData((prev) => ({
        ...prev,
        location: `Location at ${coordinate.latitude.toFixed(
          4
        )}, ${coordinate.longitude.toFixed(4)}`,
        latitude: coordinate.latitude.toString(),
        longitude: coordinate.longitude.toString(),
      }));
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Permission to access location was denied"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to get current location");
    }
  };

  const handlePropertyTypeSelect = (type) => {
    updatePropertyData("type", type.value);
    updatePropertyData("category", type.category);
    updatePropertyData("roomConfig", type.roomConfig || null);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return propertyData.type !== "";
      case 2:
        return propertyData.listingType !== "";
      case 3:
        return (
          propertyData.title.trim() !== "" &&
          propertyData.description.trim() !== ""
        );
      case 4:
        return (
          propertyData.minimumPrice > 0 &&
          propertyData.maximumPrice > 0 &&
          propertyData.minimumPrice <= propertyData.maximumPrice &&
          propertyData.availability !== "" &&
          propertyData.furnishingStatus !== ""
        );
      case 5:
        return (
          propertyData.country.trim() !== "" &&
          propertyData.state.trim() !== "" &&
          propertyData.city.trim() !== ""
        );
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      showToast(
        "Please complete the required fields before proceeding",
        "error"
      );
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const submitProperty = async () => {
    if (isSubmitting) return; // Prevent double submission

    try {
      setIsSubmitting(true);
      console.log("AddProperty: Starting property submission...");

      const finalPropertyData = {
        ...propertyData,
        roomConfig: propertyData.roomConfig
          ? propertyData.roomConfig.value || propertyData.roomConfig
          : null,
        availableFrom: convertToISODate(propertyData.availableFrom),
        price:
          propertyData.minimumPrice === propertyData.maximumPrice
            ? `${propertyData.minimumPrice}`
            : `${propertyData.minimumPrice} - ${propertyData.maximumPrice}`,
        minimumPrice: propertyData.minimumPrice,
        maximumPrice: propertyData.maximumPrice,
      };
      let result;
      let imagesToUpload = [];
      let hasNewImages = false;
      if (imageUploadFunction) {
        try {
          imagesToUpload = await imageUploadFunction();
          imagesToUpload = Array.isArray(imagesToUpload) ? imagesToUpload : [];
          hasNewImages = imagesToUpload.length > 0;

          if (hasNewImages) {
            setIsUploadingImages(true);
            showToast(
              `Preparing ${imagesToUpload.length} new images for upload...`,
              "info"
            );
          }
        } catch (error) {
          console.error("AddProperty: Image preparation failed:", error);
          showToast(
            "Image preparation failed, but property will be saved without new images",
            "warning"
          );
        } finally {
          setIsUploadingImages(false);
        }
      }
      if (isEditMode) {
        const existingImages = propertyImages.filter(
          (uri) => uri && uri.startsWith("http")
        );
        const keptImageIds = [];
        if (editPropertyData.imageUrls && editPropertyData.imageIds) {
          existingImages.forEach((imageUrl) => {
            const urlIndex = editPropertyData.imageUrls.indexOf(imageUrl);
            if (urlIndex >= 0 && editPropertyData.imageIds[urlIndex]) {
              keptImageIds.push(editPropertyData.imageIds[urlIndex]);
            }
          });
        }
        finalPropertyData.imageUrls = keptImageIds;

        result = await updateProperty(
          editPropertyId,
          finalPropertyData,
          imagesToUpload
        );
      } else {
        showToast("Saving property...", "info");
        result = await addProperty(finalPropertyData, imagesToUpload);
      }

      if (result && result.success !== false) {
        const successMessage = isEditMode
          ? `${propertyData?.category} updated successfully`
          : `${propertyData?.category} added successfully`;

        showToast(successMessage, "success");

        if (isEditMode) {
          router.back();
        } else {
          setPropertyData({
            type: "",
            category: "",
            roomConfig: "",
            listingType: "",
            title: "",
            description: "",
            deposit: "",
            areaSize: "",
            location: "",
            city: "",
            state: "",
            country: "",
            latitude: "",
            longitude: "",
            availability: "",
            furnishingStatus: "",
            genderPreference: "",
            amenities: [],
            availableFrom: "",
            minimumPrice: 0,
            maximumPrice: 0,
          });
          setSelectedLocation(null);
          setPropertyImages([]);
          setExistingImageIds([]);
          setImageUploadFunction(null);
          setCurrentStep(1);

          Alert.alert(
            "Success!",
            "Your property has been listed successfully!",
            [
              {
                text: "Add Another Property",
                style: "default",
              },
              {
                text: "View My Properties",
                onPress: () => router.push("/provider/listedProperties"),
              },
            ]
          );
        }
      } else {
        const errorMessage =
          result?.message ||
          result?.error ||
          `Failed to ${isEditMode ? "update" : "add"} property`;
        showToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("AddProperty: Property submission error:", error);
      showToast(
        `Failed to ${isEditMode ? "update" : "add"} property: ${error.message}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Choose Property Type</Text>
            <Text style={styles.stepDescription}>
              Select the type of property you want to add
            </Text>

            {Object.entries(PROPERTY_TYPES).map(
              ([categoryName, properties]) => (
                <View key={categoryName} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>
                    {formatName(categoryName, "capitalize")}
                  </Text>
                  <View style={styles.optionsGrid}>
                    {properties.map((property) => (
                      <TouchableOpacity
                        key={property.value}
                        style={[
                          styles.optionCard,
                          propertyData.type === property.value &&
                            styles.selectedOptionCard,
                        ]}
                        onPress={() => handlePropertyTypeSelect(property)}
                        activeOpacity={0.9}
                      >
                        <View
                          style={[
                            styles.optionIconContainer,
                            propertyData.type === property.value &&
                              styles.selectedOptionIconContainer,
                          ]}
                        >
                          <IconComponent
                            iconName={property.icon || "home"}
                            iconFamily={property.iconFamily || "Feather"}
                            size={24}
                            color={
                              propertyData.type === property.value
                                ? theme.colors.textPrimary
                                : theme.colors.primary
                            }
                          />
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            propertyData.type === property.value &&
                              styles.selectedOptionText,
                          ]}
                        >
                          {property.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Listing Type</Text>
            <Text style={styles.stepDescription}>
              Choose whether you want to rent or sell this property
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Listing Type <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.optionsGrid}>
                {Object.values(LISTING_TYPES).map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.smallOptionCard,
                      propertyData.listingType === option.value &&
                        styles.selectedSmallOptionCard,
                    ]}
                    onPress={() =>
                      updatePropertyData("listingType", option.value)
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.smallOptionContent}>
                      {option.icon && (
                        <IconComponent
                          iconName={option.icon}
                          iconFamily={option.iconFamily || "Feather"}
                          size={16}
                          color={
                            propertyData.listingType === option.value
                              ? theme.colors.primary
                              : theme.colors.textSecondary
                          }
                        />
                      )}
                      <Text
                        style={[
                          styles.smallOptionText,
                          propertyData.listingType === option.value &&
                            styles.selectedSmallOptionText,
                          option.icon && { marginLeft: theme.spacing.xs },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Property Details</Text>
            <Text style={styles.stepDescription}>
              Add basic information about your property
            </Text>

            <InputField
              label="Property Title"
              value={propertyData.title}
              onChangeText={(text) => updatePropertyData("title", text)}
              placeholder="e.g., Spacious 2BHK apartment in downtown"
              icon={"edit-3"}
              iconColor={theme.colors.primary}
              style={styles.inputField}
            />
            <InputField
              label="Description"
              value={propertyData.description}
              onChangeText={(text) => updatePropertyData("description", text)}
              placeholder="Describe your property, nearby amenities, etc."
              multiline
              style={styles.inputField}
            />

            {availableOptions.roomOptions.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Room Configuration</Text>
                <View style={styles.optionsGrid}>
                  {availableOptions.roomOptions.map((room) => (
                    <TouchableOpacity
                      key={room.value}
                      style={[
                        styles.smallOptionCard,
                        propertyData.roomConfig === room.value &&
                          styles.selectedSmallOptionCard,
                      ]}
                      onPress={() => updatePropertyData("roomConfig", room)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.smallOptionContent}>
                        {room.icon && (
                          <IconComponent
                            iconName={room.icon}
                            iconFamily={room.iconFamily || "Feather"}
                            size={16}
                            color={
                              propertyData.roomConfig?.value === room.value
                                ? theme.colors.primary
                                : theme.colors.textSecondary
                            }
                          />
                        )}
                        <Text
                          style={[
                            styles.smallOptionText,
                            propertyData.roomConfig?.value === room.value &&
                              styles.selectedSmallOptionText,
                            room.icon && { marginLeft: theme.spacing.xs },
                          ]}
                        >
                          {room.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {propertyData.category !== "room" &&
              propertyData.category !== "pg" && (
                <InputField
                  label="Area Size"
                  value={propertyData.areaSize}
                  onChangeText={(text) => updatePropertyData("areaSize", text)}
                  placeholder="e.g., 1200 sq ft"
                  icon="maximize-2"
                  iconFamily="Feather"
                  iconColor={theme.colors.primary}
                  style={styles.inputField}
                />
              )}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Pricing & Property Status</Text>
            <Text style={styles.stepDescription}>
              Set your property price and configure availability
            </Text>

            <View style={styles.priceRangeContainer}>
              <Text style={styles.inputLabel}>
                Price Range <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.priceInputsRow}>
                <View style={styles.priceInputWrapper}>
                  <InputField
                    label="Minimum Price"
                    value={
                      propertyData.minimumPrice > 0
                        ? propertyData.minimumPrice.toString()
                        : ""
                    }
                    onChangeText={(text) =>
                      updatePropertyData("minimumPrice", text)
                    }
                    placeholder="e.g., 5000"
                    icon="inr"
                    iconFamily="FontAwesome"
                    iconSize={18}
                    iconColor={theme.colors.primary}
                    keyboardType="numeric"
                    style={styles.inputField}
                  />
                </View>
                <View style={styles.priceSeparator}>
                  <Text style={styles.priceSeparatorText}>to</Text>
                </View>
                <View style={styles.priceInputWrapper}>
                  <InputField
                    label="Maximum Price"
                    value={
                      propertyData.maximumPrice > 0
                        ? propertyData.maximumPrice.toString()
                        : ""
                    }
                    onChangeText={(text) =>
                      updatePropertyData("maximumPrice", text)
                    }
                    placeholder="e.g., 6000"
                    icon="inr"
                    iconFamily="FontAwesome"
                    iconSize={18}
                    iconColor={theme.colors.primary}
                    keyboardType="numeric"
                    style={styles.inputField}
                  />
                </View>
              </View>
              {propertyData.minimumPrice > 0 &&
                propertyData.maximumPrice > 0 &&
                propertyData.minimumPrice > propertyData.maximumPrice && (
                  <Text style={styles.priceErrorText}>
                    Minimum price cannot be greater than maximum price
                  </Text>
                )}
            </View>

            {propertyData.listingType === "rent" && (
              <InputField
                label="Security Deposit"
                value={propertyData.deposit}
                onChangeText={(text) => updatePropertyData("deposit", text)}
                placeholder="e.g., 10000 or 2 months rent"
                icon="shield"
                iconFamily="Feather"
                iconColor={theme.colors.primary}
                style={styles.inputField}
              />
            )}

            <DatePicker
              label="Available From"
              value={propertyData.availableFrom}
              onDateChange={(date) => updatePropertyData("availableFrom", date)}
              placeholder="Select availability date"
              minimumDate={new Date()}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Availability Status <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.optionsGrid}>
                {COMMON_OPTIONS.AVAILABILITY.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.smallOptionCard,
                      propertyData.availability === option.value &&
                        styles.selectedSmallOptionCard,
                    ]}
                    onPress={() =>
                      updatePropertyData("availability", option.value)
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.smallOptionContent}>
                      {option.icon && (
                        <IconComponent
                          iconName={option.icon}
                          iconFamily={option.iconFamily || "Feather"}
                          size={16}
                          color={
                            propertyData.availability === option.value
                              ? theme.colors.primary
                              : theme.colors.textSecondary
                          }
                        />
                      )}
                      <Text
                        style={[
                          styles.smallOptionText,
                          propertyData.availability === option.value &&
                            styles.selectedSmallOptionText,
                          option.icon && { marginLeft: theme.spacing.xs },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Furnished Status <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.optionsGrid}>
                {COMMON_OPTIONS.FURNISHED_STATUS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.smallOptionCard,
                      propertyData.furnishingStatus === option.value &&
                        styles.selectedSmallOptionCard,
                    ]}
                    onPress={() =>
                      updatePropertyData("furnishingStatus", option.value)
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.smallOptionContent}>
                      {option.icon && (
                        <IconComponent
                          iconName={option.icon}
                          iconFamily={option.iconFamily || "Feather"}
                          size={16}
                          color={
                            propertyData.furnishingStatus === option.value
                              ? theme.colors.primary
                              : theme.colors.textSecondary
                          }
                        />
                      )}
                      <Text
                        style={[
                          styles.smallOptionText,
                          propertyData.furnishingStatus === option.value &&
                            styles.selectedSmallOptionText,
                          option.icon && { marginLeft: theme.spacing.xs },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {(propertyData.category === "pg" ||
              propertyData.category === "room") && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender Preference</Text>
                <View style={styles.optionsGrid}>
                  {COMMON_OPTIONS.GENDER_PREFERENCE.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.smallOptionCard,
                        propertyData.genderPreference === option.value &&
                          styles.selectedSmallOptionCard,
                      ]}
                      onPress={() =>
                        updatePropertyData("genderPreference", option.value)
                      }
                      activeOpacity={0.8}
                    >
                      <View style={styles.smallOptionContent}>
                        {option.icon && (
                          <IconComponent
                            iconName={option.icon}
                            iconFamily={option.iconFamily || "Feather"}
                            size={16}
                            color={
                              propertyData.genderPreference === option.value
                                ? theme.colors.primary
                                : theme.colors.textSecondary
                            }
                          />
                        )}
                        <Text
                          style={[
                            styles.smallOptionText,
                            propertyData.genderPreference === option.value &&
                              styles.selectedSmallOptionText,
                            option.icon && { marginLeft: theme.spacing.xs },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Location Details</Text>
            <Text style={styles.stepDescription}>
              Select your property location from the available options or use
              the map
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Choose Location Method <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.locationMethodContainer}>
                <TouchableOpacity
                  style={styles.locationMethodButton}
                  onPress={() => setShowLocationPicker(true)}
                  activeOpacity={0.9}
                >
                  <View style={styles.locationMethodContent}>
                    <IconComponent
                      iconName="list"
                      iconFamily="Feather"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <View style={styles.locationMethodText}>
                      <Text style={styles.locationMethodTitle}>
                        Select from List
                      </Text>
                      <Text style={styles.locationMethodSubtitle}>
                        Choose from predefined locations
                      </Text>
                    </View>
                    <IconComponent
                      iconName="chevron-right"
                      iconFamily="Feather"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.locationMethodButton}
                  onPress={() => {
                    getCurrentLocation();
                    setShowMapPicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.locationMethodContent}>
                    <IconComponent
                      iconName="map"
                      iconFamily="Feather"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <View style={styles.locationMethodText}>
                      <Text style={styles.locationMethodTitle}>
                        Select on Map
                      </Text>
                      <Text style={styles.locationMethodSubtitle}>
                        Pinpoint exact location with GPS coordinates
                      </Text>
                    </View>
                    <IconComponent
                      iconName="chevron-right"
                      iconFamily="Feather"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Current Location Display */}
            {propertyData.country &&
              propertyData.state &&
              propertyData.city && (
                <View style={styles.currentLocationContainer}>
                  <View style={styles.currentLocationHeader}>
                    <IconComponent
                      iconName="map-pin"
                      iconFamily="Feather"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.currentLocationTitle}>
                      Selected Location:
                    </Text>
                  </View>

                  <View style={styles.currentLocationContent}>
                    <Text style={styles.currentLocationText}>
                      {propertyData.location}
                    </Text>

                    <Text style={styles.currentLocationSubtext}>
                      {propertyData.city}, {propertyData.state},{" "}
                      {propertyData.country}
                    </Text>

                    {selectedLocation &&
                      propertyData.latitude !== "" &&
                      propertyData.longitude !== "" && (
                        <View style={styles.coordinatesDisplay}>
                          <Text style={styles.coordinatesLabel}>
                            GPS Coordinates:
                          </Text>
                          <Text style={styles.coordinatesValue}>
                            {parseFloat(propertyData.latitude).toFixed(6)},{" "}
                            {parseFloat(propertyData.longitude).toFixed(6)}
                          </Text>
                        </View>
                      )}
                  </View>

                  <TouchableOpacity
                    style={styles.clearLocationButton}
                    onPress={() => {
                      setPropertyData((prev) => ({
                        ...prev,
                        country: "",
                        state: "",
                        city: "",
                        location: "",
                        latitude: "",
                        longitude: "",
                      }));
                      setSelectedLocation(null);
                    }}
                  >
                    <IconComponent
                      iconName="x"
                      iconFamily="Feather"
                      size={16}
                      color={theme.colors.error}
                    />
                    <Text style={styles.clearLocationText}>Clear Location</Text>
                  </TouchableOpacity>
                </View>
              )}

            {propertyData.city && selectedLocation && (
              <View style={{ marginTop: theme.spacing.lg }}>
                <InputField
                  label="Additional Location Details (Optional)"
                  value={
                    propertyData.location !== propertyData.city
                      ? propertyData.location
                      : ""
                  }
                  onChangeText={(text) =>
                    updatePropertyData("location", text || propertyData.city)
                  }
                  placeholder="e.g., Near Metro Station, Landmark details"
                  icon="navigation"
                  iconFamily="Feather"
                  iconSize={18}
                  iconColor={theme.colors.primary}
                  style={styles.inputField}
                />
              </View>
            )}

            <View style={styles.infoBox}>
              <IconComponent
                iconName="info"
                iconFamily="Feather"
                size={16}
                color={theme.colors.primary}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={styles.infoText}>
                Using the map option provides GPS coordinates which helps
                potential tenants find your property more easily and accurately.
              </Text>
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Property Images</Text>
            <Text style={styles.stepDescription}>
              Add high-quality photos of your property. You can add multiple
              images to showcase your property better.
            </Text>

            <View style={styles.imageUploadContainer}>
              {/* Show current images */}
              <View style={styles.imagePickerGrid}>
                {[...Array(5)].map((_, index) => {
                  const currentImage = propertyImages[index];
                  return (
                    <View key={index} style={styles.imagePickerSlot}>
                      <ImagePickerComponent
                        onImageSelected={(imageUri) => {
                          if (imageUri) {
                            // Instead of replacing at index, we'll manage the array properly
                            const newImages = [...propertyImages];
                            if (index < newImages.length) {
                              // Replace existing image at this index
                              newImages[index] = imageUri;
                            } else {
                              // Add new image
                              newImages.push(imageUri);
                            }

                            setPropertyImages(newImages.filter(Boolean));

                            setImageUploadFunction(() => async () => {
                              // Only return new images (not existing URLs) for upload
                              return newImages
                                .filter((uri) => uri && !uri.startsWith("http")) // Exclude existing URLs
                                .map((uri, idx) => ({
                                  uri,
                                  type: "image/jpeg",
                                  name: `property-image-${idx + 1}.jpg`,
                                }));
                            });
                          }
                        }}
                        currentImage={currentImage}
                        placeholder={
                          currentImage ? undefined : `Image ${index + 1}`
                        }
                        size={80}
                        style={styles.imagePicker}
                      />
                      {/* Add remove button for existing images */}
                      {currentImage && (
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => {
                            const newImages = [...propertyImages];
                            newImages.splice(index, 1);
                            setPropertyImages(newImages);

                            setImageUploadFunction(() => async () => {
                              return newImages
                                .filter((uri) => uri && !uri.startsWith("http"))
                                .map((uri, idx) => ({
                                  uri,
                                  type: "image/jpeg",
                                  name: `property-image-${idx + 1}.jpg`,
                                }));
                            });
                          }}
                        >
                          <IconComponent
                            iconName="x"
                            iconFamily="Feather"
                            size={12}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={styles.imageUploadInfo}>
                <Text style={styles.imageUploadInfoText}>
                  {propertyImages.length}/5 images selected
                </Text>
                <Text style={styles.imageUploadHint}>
                  {isEditMode
                    ? "Modify images to update your property listing. Existing images will be kept unless replaced."
                    : "Add multiple angles and rooms to attract more potential tenants (Maximum 5 images)"}
                </Text>
              </View>
            </View>
          </View>
        );

      case 7:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Amenities</Text>
            <Text style={styles.stepDescription}>
              Choose amenities available for your property
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Amenities</Text>
              <Text style={styles.amenitiesSubtext}>
                Choose amenities available for your{" "}
                {PROPERTY_HELPERS.getPropertyType(
                  propertyData.type
                )?.label?.toLowerCase() || "property"}
              </Text>

              {Object.entries(AMENITIES).map(
                ([categoryKey, categoryAmenities]) => {
                  const availableCategoryAmenities = categoryAmenities.filter(
                    (amenity) =>
                      availableOptions.amenities.some(
                        (available) => available.value === amenity.value
                      )
                  );

                  if (availableCategoryAmenities.length === 0) return null;

                  const categoryDisplayMap = {
                    BASIC: "Basic Amenities",
                    PG_SPECIFIC: "PG Services",
                    APARTMENT_SPECIFIC: "Apartment Features",
                    HOUSE_SPECIFIC: "House Features",
                    COMMERCIAL_SPECIFIC: "Commercial Features",
                    LUXURY_AMENITIES: "Luxury & Recreation",
                    SAFETY_SECURITY: "Safety & Security",
                    CONNECTIVITY: "Connectivity",
                    ECO_FRIENDLY: "Eco-Friendly",
                    FURNISHING: "Furnishing",
                  };

                  return (
                    <View key={categoryKey} style={styles.amenityCategory}>
                      <Text style={styles.amenityCategoryTitle}>
                        {categoryDisplayMap[categoryKey] ||
                          categoryKey.replace("_", " ")}
                      </Text>
                      <View style={styles.amenitiesGrid}>
                        {availableCategoryAmenities.map((amenity) => (
                          <TouchableOpacity
                            key={amenity.value}
                            style={[
                              styles.amenityChip,
                              propertyData.amenities.includes(amenity.value) &&
                                styles.selectedAmenityChip,
                            ]}
                            onPress={() => toggleAmenity(amenity.value)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.amenityChipText,
                                propertyData.amenities.includes(
                                  amenity.value
                                ) && styles.selectedAmenityChipText,
                              ]}
                            >
                              {amenity.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  );
                }
              )}
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  If your amenity is not listed, you can mention it in the
                  description.
                </Text>
              </View>
            </View>
          </View>
        );

      case 8:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Review & Submit</Text>
            <Text style={styles.stepDescription}>
              Please review your property details before submitting
            </Text>

            <PropertyReviewCard
              propertyData={propertyData}
              images={propertyImages}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                (isSubmitting || isUploadingImages) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={submitProperty}
              activeOpacity={0.9}
              disabled={isSubmitting || isUploadingImages}
            >
              {isSubmitting || isUploadingImages ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={[styles.submitButtonText, styles.loadingText]}>
                    {isUploadingImages
                      ? "Preparing images..."
                      : isEditMode
                      ? "Updating..."
                      : "Submitting..."}
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditMode ? "Update Property" : "Submit Property"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={isEditMode ? "Edit Property" : "List Your Property"}
        noMarginTop={true}
      />

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              { width: `${(currentStep / totalSteps) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.navigationButton, styles.backButton]}
            onPress={prevStep}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {currentStep < totalSteps ? (
          <TouchableOpacity
            style={[
              styles.navigationButton,
              styles.nextButton,
              currentStep === 1 && styles.fullWidthButton,
            ]}
            onPress={nextStep}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <MapLocationPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleMapLocationSelect}
        initialLocation={selectedLocation}
        title="Select Location"
        saveButtonText="Save"
        enableCurrentLocation={true}
        initialRegion={
          userLocation || {
            latitude: 20.5937,
            longitude: 78.9629,
            latitudeDelta: 10.0,
            longitudeDelta: 10.0,
          }
        }
      />

      {/* Location Picker Modal */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        selectedLocation={{
          country: propertyData.country,
          state: propertyData.state,
          city: propertyData.city,
          place: propertyData.location,
        }}
      />
    </SafeAreaView>
  );
};

export default AddProperty;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backButtonPage: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  header: {
    marginTop: Platform.OS === "ios" ? 60 : 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  stepIndicatorContainer: {
    alignItems: "center",
  },
  stepIndicatorText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  stepTotalText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  progressBarContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.sm,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  stepContainer: {
    paddingVertical: theme.spacing.xl,
  },
  stepTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing["3xl"],
    lineHeight: theme.typography.lineHeight.normal,
  },
  categorySection: {
    marginBottom: theme.spacing["3xl"],
  },
  categoryTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  inputField: {
    borderRadius: theme.borderRadius.xl,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    minWidth: (width - 2 * theme.spacing.xl - theme.spacing.md) / 2,
    marginBottom: theme.spacing.md,
  },
  selectedOptionCard: {
    backgroundColor: `${theme.colors.primary}15`,
    borderColor: theme.colors.primary,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  selectedOptionIconContainer: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: theme.typography.lineHeight.tight,
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  inputGroup: {
    marginBottom: theme.spacing["2xl"],
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  currencySymbol: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  priceInput: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  smallOptionCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  smallOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedSmallOptionCard: {
    backgroundColor: `${theme.colors.primary}15`,
    borderColor: theme.colors.primary,
  },
  smallOptionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  selectedSmallOptionText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  amenitiesSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
    fontStyle: "italic",
  },
  amenityCategory: {
    marginBottom: theme.spacing["2xl"],
  },
  amenityCategoryTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  amenityChip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  selectedAmenityChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  amenityChipText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  selectedAmenityChipText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  mediaSection: {
    marginBottom: theme.spacing["3xl"],
  },
  mediaSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  mediaSectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  addMediaButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  disabledButton: {
    backgroundColor: theme.colors.textDisabled,
  },
  addMediaButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  mediaScrollView: {
    maxHeight: 150,
  },
  mediaGrid: {
    flexDirection: "row",
  },
  mediaItem: {
    position: "relative",
    marginRight: theme.spacing.md,
  },
  mediaPreview: {
    width: 120,
    height: 90,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceLight,
  },
  videoPreview: {
    position: "relative",
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  playIconText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    marginLeft: 2,
  },
  removeMediaButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  removeMediaButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
  },
  guidelinesContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  guidelinesTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  guidelineItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
    lineHeight: theme.typography.lineHeight.tight,
  },
  fileSummary: {
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  fileSummaryText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  warningText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    fontStyle: "italic",
    textAlign: "center",
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing["3xl"],
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  reviewLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.lg,
  },
  reviewValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    flex: 2,
    textAlign: "right",
    fontWeight: theme.typography.fontWeight.medium,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  submitButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
  },
  uploadProgressContainer: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  uploadProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  uploadProgressText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  uploadProgressSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    fontStyle: "italic",
  },
  debugToggle: {
    backgroundColor: theme.colors.warning,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  debugToggleText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: theme.typography.fontWeight.bold,
  },
  infoBox: {
    flexDirection: "row",
    justifyContent: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginTop: theme.spacing.md,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  navigationContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  navigationButton: {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  backButton: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
  },
  fullWidthButton: {
    flex: 1,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  nextButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  editModeIndicator: {
    textAlign: "center",
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.xs,
  },
  locationPickerButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  locationPickerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  locationPickerText: {
    flex: 1,
  },
  selectedLocationText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  selectedLocationSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  locationPickerPlaceholder: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textMuted,
  },
  locationPreview: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  locationPreviewTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  locationPreviewItems: {
    gap: theme.spacing.sm,
  },
  locationPreviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationPreviewLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  locationPreviewValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  locationMethodContainer: {
    gap: theme.spacing.md,
  },
  locationMethodButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  locationMethodContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  locationMethodText: {
    flex: 1,
  },
  locationMethodTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  locationMethodSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.tight,
  },
  currentLocationContainer: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginTop: theme.spacing.sm,
  },
  currentLocationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  currentLocationTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  currentLocationContent: {
    marginBottom: theme.spacing.md,
  },
  currentLocationText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.sm,
  },
  currentLocationSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  coordinatesDisplay: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  coordinatesLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  coordinatesValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    fontFamily: "monospace",
    fontWeight: theme.typography.fontWeight.medium,
  },
  clearLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    alignSelf: "flex-start",
  },
  clearLocationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
  priceRangeContainer: {
    marginBottom: theme.spacing.xl,
  },
  priceInputsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.md,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceSeparator: {
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  priceSeparatorText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  priceErrorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    fontStyle: "italic",
  },
  geocodingLoadingContainer: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: "center",
  },
  geocodingLoadingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  geocodingLoadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  imageUploadPlaceholder: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    padding: theme.spacing["3xl"],
    alignItems: "center",
    justifyContent: "center",
    marginVertical: theme.spacing.lg,
  },
  imageUploadText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: "center",
    fontWeight: theme.typography.fontWeight.medium,
  },
  imageUploadSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSubtle,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  imageUploadContainer: {
    marginVertical: theme.spacing.lg,
  },
  imagePickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  imagePickerSlot: {
    width: "48%",
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  imagePicker: {
    width: "100%",
    height: 120,
    borderRadius: theme.borderRadius.md,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  imageUploadInfo: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  imageUploadInfoText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  imageUploadHint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSubtle,
    textAlign: "center",
  },
});
