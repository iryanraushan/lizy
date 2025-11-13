import { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import locationsData from '../constants/locations.json';
import { theme } from '../constants/theme';
import IconComponent from './IconComponent';

const LocationPicker = ({ 
  visible, 
  onClose, 
  onLocationSelect, 
  selectedLocation = {}, 
  placeholder = "Select Location" 
}) => {
  const [step, setStep] = useState('country'); // country, state, city, place
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(selectedLocation.country || '');
  const [selectedState, setSelectedState] = useState(selectedLocation.state || '');
  const [selectedCity, setSelectedCity] = useState(selectedLocation.city || '');
  const [selectedPlace, setSelectedPlace] = useState(selectedLocation.place || '');
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Initialize with existing location data
  useEffect(() => {
    if (selectedLocation.country) {
      setSelectedCountry(selectedLocation.country);
      if (selectedLocation.state) {
        setSelectedState(selectedLocation.state);
        setStep('city');
        if (selectedLocation.city) {
          setSelectedCity(selectedLocation.city);
          setStep('place');
          if (selectedLocation.place) {
            setSelectedPlace(selectedLocation.place);
          }
        }
      }
    }
  }, [selectedLocation]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setStep('country');
      setSearchQuery('');
      setCustomInput('');
      setShowCustomInput(false);
    }
  }, [visible]);

  // Get filtered data based on current step and search query
  const filteredData = useMemo(() => {
    let data = [];
    const query = searchQuery.toLowerCase();

    switch (step) {
      case 'country':
        data = Object.keys(locationsData).map(country => ({
          key: country,
          label: country,
          value: country
        }));
        break;
      
      case 'state':
        if (selectedCountry && locationsData[selectedCountry]) {
          data = Object.keys(locationsData[selectedCountry]).map(state => ({
            key: state,
            label: state,
            value: state
          }));
        }
        break;
      
      case 'city':
        if (selectedCountry && selectedState && 
            locationsData[selectedCountry] && 
            locationsData[selectedCountry][selectedState]) {
          data = Object.keys(locationsData[selectedCountry][selectedState]).map(city => ({
            key: city,
            label: city,
            value: city
          }));
        }
        break;
      
      case 'place':
        if (selectedCountry && selectedState && selectedCity &&
            locationsData[selectedCountry] && 
            locationsData[selectedCountry][selectedState] &&
            locationsData[selectedCountry][selectedState][selectedCity]) {
          data = locationsData[selectedCountry][selectedState][selectedCity].map(place => ({
            key: place,
            label: place,
            value: place
          }));
        }
        break;
    }

    // Filter by search query
    if (query) {
      data = data.filter(item => 
        item.label.toLowerCase().includes(query)
      );
    }

    // Always add "Other" option at the end if not already present
    if (!data.find(item => item.value === 'Other')) {
      data.push({
        key: 'Other',
        label: 'Other (Type custom)',
        value: 'Other'
      });
    }

    return data;
  }, [step, searchQuery, selectedCountry, selectedState, selectedCity]);

  const handleItemSelect = (item) => {
    if (item.value === 'Other') {
      setShowCustomInput(true);
      return;
    }

    switch (step) {
      case 'country':
        setSelectedCountry(item.value);
        setSelectedState('');
        setSelectedCity('');
        setSelectedPlace('');
        setStep('state');
        break;
      
      case 'state':
        setSelectedState(item.value);
        setSelectedCity('');
        setSelectedPlace('');
        setStep('city');
        break;
      
      case 'city':
        setSelectedCity(item.value);
        setSelectedPlace('');
        setStep('place');
        break;
      
      case 'place':
        setSelectedPlace(item.value);
        handleConfirmLocation();
        break;
    }
    
    setSearchQuery('');
  };

  const handleCustomInput = () => {
    if (!customInput.trim()) return;

    switch (step) {
      case 'country':
        setSelectedCountry(customInput.trim());
        setSelectedState('');
        setSelectedCity('');
        setSelectedPlace('');
        setStep('state');
        break;
      
      case 'state':
        setSelectedState(customInput.trim());
        setSelectedCity('');
        setSelectedPlace('');
        setStep('city');
        break;
      
      case 'city':
        setSelectedCity(customInput.trim());
        setSelectedPlace('');
        setStep('place');
        break;
      
      case 'place':
        setSelectedPlace(customInput.trim());
        handleConfirmLocation();
        break;
    }
    
    setCustomInput('');
    setShowCustomInput(false);
    setSearchQuery('');
  };

  const handleConfirmLocation = () => {
    const locationData = {
      country: selectedCountry,
      state: selectedState,
      city: selectedCity,
      place: selectedPlace || selectedCity, // Use city as fallback for place
      fullLocation: `${selectedPlace || selectedCity}, ${selectedCity !== selectedPlace ? selectedCity + ', ' : ''}${selectedState}, ${selectedCountry}`
    };
    
    onLocationSelect(locationData);
    onClose();
  };

  const handleBack = () => {
    setSearchQuery('');
    setShowCustomInput(false);
    setCustomInput('');
    
    switch (step) {
      case 'state':
        setStep('country');
        setSelectedState('');
        setSelectedCity('');
        setSelectedPlace('');
        break;
      case 'city':
        setStep('state');
        setSelectedCity('');
        setSelectedPlace('');
        break;
      case 'place':
        setStep('city');
        setSelectedPlace('');
        break;
      default:
        onClose();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'country': return 'Select Country';
      case 'state': return 'Select State';
      case 'city': return 'Select City';
      case 'place': return 'Select Area/Place';
      default: return 'Select Location';
    }
  };

  const getBreadcrumb = () => {
    const parts = [];
    if (selectedCountry) parts.push(selectedCountry);
    if (selectedState) parts.push(selectedState);
    if (selectedCity && step === 'place') parts.push(selectedCity);
    return parts.join(' > ');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleItemSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.listItemText}>{item.label}</Text>
      <IconComponent
        iconName="chevron-right"
        iconFamily="Feather"
        size={20}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <IconComponent
                iconName="arrow-left"
                iconFamily="Feather"
                size={24}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{getStepTitle()}</Text>
              {getBreadcrumb() && (
                <Text style={styles.breadcrumb}>{getBreadcrumb()}</Text>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <IconComponent
                iconName="x"
                iconFamily="Feather"
                size={24}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          {!showCustomInput && (
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <IconComponent
                  iconName="search"
                  iconFamily="Feather"
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${step}...`}
                  placeholderTextColor={theme.colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="words"
                />
                {searchQuery && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    activeOpacity={0.7}
                  >
                    <IconComponent
                      iconName="x"
                      iconFamily="Feather"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Custom Input */}
          {showCustomInput && (
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputLabel}>
                Enter custom {step}:
              </Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder={`Enter ${step} name`}
                  placeholderTextColor={theme.colors.textMuted}
                  value={customInput}
                  onChangeText={setCustomInput}
                  autoCapitalize="words"
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleCustomInput}
                  activeOpacity={0.7}
                >
                  <IconComponent
                    iconName="check"
                    iconFamily="Feather"
                    size={20}
                    color={theme.colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.cancelCustomButton}
                onPress={() => {
                  setShowCustomInput(false);
                  setCustomInput('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelCustomText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List */}
          {!showCustomInput && (
            <FlatList
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={(item) => item.key}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}

          {/* Skip to confirmation for completed selections */}
          {selectedCountry && selectedState && selectedCity && step === 'place' && (
            <View style={styles.confirmContainer}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleConfirmLocation}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>
                  Use "{selectedCity}" as final location
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  breadcrumb: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  customInputContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  customInputLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  customInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelCustomButton: {
    marginTop: theme.spacing.sm,
    alignSelf: 'center',
  },
  cancelCustomText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  listItemText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 1,
  },
  confirmContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  skipButton: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skipButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default LocationPicker;