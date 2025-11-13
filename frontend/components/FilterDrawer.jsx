import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ALL_AMENITIES,
  ALL_PROPERTY_TYPES,
  COMMON_OPTIONS,
  LISTING_TYPES,
} from "../constants/property";
import { theme } from "../constants/theme";

const { width: screenWidth } = Dimensions.get("window");

const FilterDrawer = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}) => {
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenWidth,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleAmenity = (amenity) => {
    const updatedAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];

    updateFilter("amenities", updatedAmenities);
  };

  const renderFilterSection = (title, children) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderDropdownFilter = (
    title,
    value,
    options,
    onSelect,
    valueKey = "value",
    labelKey = "label"
  ) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.optionsScroll}
      >
        <TouchableOpacity
          style={[styles.optionChip, !value && styles.optionChipActive]}
          onPress={() => onSelect("")}
        >
          <Text style={[styles.optionText, !value && styles.optionTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {options.map((option) => (
          <TouchableOpacity
            key={option[valueKey]}
            style={[
              styles.optionChip,
              value === option[valueKey] && styles.optionChipActive,
            ]}
            onPress={() => onSelect(option[valueKey])}
          >
            <Text
              style={[
                styles.optionText,
                value === option[valueKey] && styles.optionTextActive,
              ]}
            >
              {option[labelKey]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const handleApply = () => {
    onApplyFilters();
    onClose();
  };

  const handleClear = () => {
    onClearFilters();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Properties</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Filters Content */}
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {renderFilterSection(
                "Property Type",
                renderDropdownFilter(
                  "Select Type",
                  filters.type,
                  ALL_PROPERTY_TYPES,
                  (value) => updateFilter("type", value)
                )
              )}

              {renderFilterSection(
                "Listing Type",
                renderDropdownFilter(
                  "For Rent or Sale",
                  filters.listingType,
                  Object.values(LISTING_TYPES),
                  (value) => updateFilter("listingType", value)
                )
              )}

              {renderFilterSection(
                "Price Range",
                <View style={styles.priceRangeContainer}>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceInputLabel}>Min Price</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="0"
                      placeholderTextColor="#64748b"
                      value={filters.minPrice}
                      onChangeText={(value) => updateFilter("minPrice", value)}
                      keyboardType="numeric"
                    />
                  </View>
                  <Text style={styles.priceRangeSeparator}>-</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceInputLabel}>Max Price</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="∞"
                      placeholderTextColor="#64748b"
                      value={filters.maxPrice}
                      onChangeText={(value) => updateFilter("maxPrice", value)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {renderFilterSection(
                "Location",
                <TextInput
                  style={styles.locationInput}
                  placeholder="Enter city name..."
                  placeholderTextColor="#64748b"
                  value={filters.city}
                  onChangeText={(value) => updateFilter("city", value)}
                />
              )}

              {renderFilterSection(
                "Furnished Status",
                renderDropdownFilter(
                  "Furnished",
                  filters.furnished,
                  COMMON_OPTIONS.FURNISHED_STATUS,
                  (value) => updateFilter("furnished", value)
                )
              )}

              {renderFilterSection(
                "Gender Preference",
                renderDropdownFilter(
                  "Gender",
                  filters.genderPreference,
                  COMMON_OPTIONS.GENDER_PREFERENCE,
                  (value) => updateFilter("genderPreference", value)
                )
              )}

              {renderFilterSection(
                "Amenities",
                <View style={styles.amenitiesContainer}>
                  {ALL_AMENITIES.slice(0, 12).map((amenity) => (
                    <TouchableOpacity
                      key={amenity.value}
                      style={[
                        styles.amenityChip,
                        filters.amenities.includes(amenity.value) &&
                          styles.amenityChipActive,
                      ]}
                      onPress={() => toggleAmenity(amenity.value)}
                    >
                      <Text
                        style={[
                          styles.amenityText,
                          filters.amenities.includes(amenity.value) &&
                            styles.amenityTextActive,
                        ]}
                      >
                        {amenity.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  drawer: {
    width: screenWidth * 0.9,
    height: "100%",
    backgroundColor: theme.colors.background,
    paddingTop: 27,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xl,
  },
  filterSection: {
    marginBottom: theme.spacing.xl,
  },
  filterSectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  dropdownContainer: {
    marginBottom: theme.spacing.md,
  },
  dropdownLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  optionsScroll: {
    flexDirection: "row",
  },
  optionChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  optionTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  priceRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  priceInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
  },
  priceRangeSeparator: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: 20,
  },
  locationInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  amenityChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  amenityChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  amenityText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  amenityTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  footer: {
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  clearButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearButtonText: {
    color: theme.colors.textSubtle,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  applyButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  applyButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default FilterDrawer;
