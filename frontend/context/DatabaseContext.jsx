import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { authAPI, propertyAPI, favoritesAPI } from "../services/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { getStatusLabel } from "../utils/utils";

const DatabaseContext = createContext(null);

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}

export function DatabaseProvider({ children }) {
  const { currentUser, isGuest } = useAuth();
  const { showToast } = useToast();

  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [myPropertyCount, setMyPropertyCount] = useState(0);
  const [changePropertyStatusLoading, setChangePropertyStatusLoading] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const [error, setError] = useState(null);

  const updateUser = async (userData) => {
    if (isGuest) {
      throw new Error("Please login to update profile");
    }
    try {
      const response = await authAPI.updateProfile(userData);
      console.log("Update user response:", response);
      if (response.success) {
        showToast("Profile updated successfully", "success");
        return response;
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to update profile";
      setError(errorMessage);
      showToast(errorMessage, "error");
      throw error;
    }
  };

  const cacheRef = useRef({
    lastPropertiesFetch: 0,
    lastFavoritesFetch: 0,
    lastMyPropertiesFetch: 0,
    imageUrlCache: new Map(),
    propertyFiltersCache: new Map(),
  });

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current = {
      lastPropertiesFetch: 0,
      lastFavoritesFetch: 0,
      lastMyPropertiesFetch: 0,
      imageUrlCache: new Map(),
      propertyFiltersCache: new Map(),
    };
    setProperties([]);
    setFavorites([]);
    setMyProperties([]);
    setMyPropertyCount(0);
    setError(null);
  }, []);

  const generateImageUrls = useCallback(async (propertiesList) => {
    if (!propertiesList?.length) return;

    const propertiesWithImages = propertiesList.filter(
      (p) => p.imageIds?.length > 0
    );

    for (const property of propertiesWithImages) {
      try {
        // Check cache first
        const cacheKey = property.imageIds.join(",");
        if (cacheRef.current.imageUrlCache.has(cacheKey)) {
          continue;
        }

        const imageUrls = await propertyAPI.generatePropertyImageUrls(
          property.imageIds
        );
        if (imageUrls && Object.keys(imageUrls).length > 0) {
          // Cache the result
          cacheRef.current.imageUrlCache.set(cacheKey, imageUrls);

          // Update property with image URLs
          setProperties((prev) =>
            prev.map((p) =>
              p.id === property.id
                ? {
                    ...p,
                    imageUrls: property.imageIds
                      .map((id) => imageUrls[id])
                      .filter(Boolean),
                    imagesLoading: false,
                    imageLoadingStates: Object.fromEntries(
                      property.imageIds.map((id) => [
                        id,
                        { loading: false, url: imageUrls[id], error: null },
                      ])
                    ),
                  }
                : p
            )
          );
        }
      } catch (error) {
        console.warn(
          `Failed to generate image URLs for property ${property.id}:`,
          error
        );
        // Mark images as failed to load
        setProperties((prev) =>
          prev.map((p) =>
            p.id === property.id
              ? {
                  ...p,
                  imagesLoading: false,
                  imageLoadingStates: Object.fromEntries(
                    property.imageIds.map((id) => [
                      id,
                      { loading: false, url: null, error: error.message },
                    ])
                  ),
                }
              : p
          )
        );
      }
    }
  }, []);

  const getPropertyById = useCallback(async (propertyId) => {
    try {
      setLoading(true);
      clearError();

      const response = await propertyAPI.getPropertyById(propertyId);
      console.log("Get property by ID response:", response);

      return response;
    } catch (error) {
      console.error("Error getting property by ID:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addProperty = useCallback(
    async (propertyData, images) => {
      if (isGuest) {
        throw new Error("Please login to add properties");
      }

      if (currentUser?.role !== "provider") {
        throw new Error("Only providers can add properties");
      }

      try {
        setLoading(true);
        clearError();

        const response = await propertyAPI.createProperty(propertyData);

        if (response.success) {
          const newProperty = response.data;

          // Update local state
          setProperties((prev) => [newProperty, ...prev]);
          setMyProperties((prev) => [newProperty, ...prev]);
          setMyPropertyCount((prev) => prev + 1);

          // Generate image URLs in background
          if (newProperty.imageIds?.length > 0) {
            generateImageUrls([newProperty]);
          }

          showToast("Property added successfully", "success");
          return newProperty;
        } else {
          throw new Error(response.message || "Failed to add property");
        }
      } catch (error) {
        const errorMessage = error.message || "Failed to add property";
        setError(errorMessage);
        showToast(errorMessage, "error");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isGuest, currentUser, showToast, clearError, generateImageUrls]
  );

  const fetchProperties = useCallback(async (filters = {}, forceRefresh = false) => {
    try {
      setPropertiesLoading(true);
      clearError();
      const filterKey = JSON.stringify(filters);
      const cached = cacheRef.current.propertyFiltersCache.get(filterKey);
      const now = Date.now();
      
      // Use cache only if not forcing refresh and cache is valid
      if (!forceRefresh && cached && now - cached.timestamp < CACHE_DURATION) {
        setProperties(cached.data.properties);
        return cached.data;
      }

      const response =
        filters.search || Object.keys(filters).length > 2
          ? await propertyAPI.searchProperties(filters)
          : await propertyAPI.getProperties(
              filters.page || 1,
              filters.size || 10,
              filters.sortBy || "createdAt",
              filters.sortDirection || "desc"
            );

      if (response.success && response.data) {
        const { properties: fetchedProperties, ...paginationData } =
          response.data;
        if (!filters.page || filters.page === 1) {
          setProperties(fetchedProperties);
        } else {
          setProperties((prev) => [...prev, ...fetchedProperties]);
        }
        cacheRef.current.propertyFiltersCache.set(filterKey, {
          data: response.data,
          timestamp: now,
        });
        generateImageUrls(fetchedProperties);
        cacheRef.current.lastPropertiesFetch = now;
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch properties");
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to fetch properties";
      setError(errorMessage);
      console.error("Fetch properties error:", error);
      throw error;
    } finally {
      setPropertiesLoading(false);
    }
  }, []);

  const updateProperty = useCallback(
    async (propertyId, updatedData, images = null) => {
      if (isGuest) {
        throw new Error("Please login to update properties");
      }

      try {
        setLoading(true);
        clearError();

        const response = await propertyAPI.updateProperty(
          propertyId,
          updatedData,
          images
        );

        if (response.success) {
          const updatedProperty = response.data;
          const updatePropertyInArray = (prev) =>
            prev.map((p) => (p.id === propertyId ? updatedProperty : p));

          setProperties(updatePropertyInArray);
          setMyProperties(updatePropertyInArray);
          setFavorites((prev) =>
            prev.map((fav) =>
              fav.property?.id === propertyId
                ? { ...fav, property: updatedProperty }
                : fav
            )
          );

          if (updatedProperty.imageIds?.length > 0) {
            generateImageUrls([updatedProperty]);
          }

          showToast("Property updated successfully", "success");
          return updatedProperty;
        } else {
          throw new Error(response.message || "Failed to update property");
        }
      } catch (error) {
        const errorMessage = error.message || "Failed to update property";
        setError(errorMessage);
        showToast(errorMessage, "error");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isGuest, showToast, clearError, generateImageUrls]
  );

  const updatePropertyStatus = useCallback(
    async (propertyId, status) => {
      if (isGuest) {
        throw new Error("Please login to update property status");
      }

      try {
        setChangePropertyStatusLoading(true);
        clearError();
        const response = await propertyAPI.updatePropertyStatus(
          propertyId,
          status
        );

        if (response.success) {
          const updatedProperty = response.data;

          const updatePropertyInArray = (prev) =>
            prev.map((p) => (p.id === propertyId ? updatedProperty : p));

          setProperties(updatePropertyInArray);
          setMyProperties(updatePropertyInArray);
          setFavorites((prev) =>
            prev.map((fav) =>
              fav.property?.id === propertyId
                ? { ...fav, property: updatedProperty }
                : fav
            )
          );

          showToast(
            `Property status updated to ${getStatusLabel(status)}`,
            "success"
          );
          return updatedProperty;
        } else {
          throw new Error(
            response.message || "Failed to update property status"
          );
        }
      } catch (error) {
        const errorMessage =
          error.message || "Failed to update property status";
        setError(errorMessage);
        showToast(errorMessage, "error");
        throw error;
      } finally {
        setChangePropertyStatusLoading(false);
      }
    },
    [isGuest, showToast, clearError]
  );

  const addToFavorites = useCallback(
    async (propertyId) => {
      if (isGuest) {
        throw new Error("Please login to add favorites");
      }

      if (currentUser?.role !== "seeker") {
        throw new Error("Only seekers can add favorites");
      }

      try {
        // Optimistic update
        const property = properties.find((p) => p.id === propertyId);
        if (property) {
          const optimisticFavorite = {
            id: Date.now(), // Temporary ID
            propertyId,
            property,
            createdAt: new Date().toISOString(),
          };
          setFavorites((prev) => [optimisticFavorite, ...prev]);
        }

        const response = await favoritesAPI.addToFavorites(propertyId);

        if (response.success) {
          const newFavorite = response.data;

          // Replace optimistic update with real data
          setFavorites((prev) =>
            prev.map((fav) =>
              fav.propertyId === propertyId &&
              typeof fav.id === "number" &&
              fav.id > 1000000000000
                ? newFavorite
                : fav
            )
          );

          showToast("Added to favorites", "success");
          return newFavorite;
        } else {
          throw new Error(response.message || "Failed to add to favorites");
        }
      } catch (error) {
        // Revert optimistic update on error
        setFavorites((prev) =>
          prev.filter((fav) => fav.propertyId !== propertyId)
        );

        const errorMessage = error.message || "Failed to add to favorites";
        setError(errorMessage);
        showToast(errorMessage, "error");
        throw error;
      }
    },
    [isGuest, currentUser, properties, showToast]
  );

  const removeFromFavorites = useCallback(
    async (propertyId) => {
      if (isGuest) {
        throw new Error("Please login to manage favorites");
      }

      if (currentUser?.role !== "seeker") {
        throw new Error("Only seekers can manage favorites");
      }

      try {
        // Optimistic update
        const originalFavorites = favorites;
        setFavorites((prev) =>
          prev.filter((fav) => fav.propertyId !== propertyId)
        );

        const response = await favoritesAPI.removeFromFavorites(propertyId);

        if (response.success) {
          showToast("Removed from favorites", "success");
        } else {
          throw new Error(
            response.message || "Failed to remove from favorites"
          );
        }
      } catch (error) {
        // Revert optimistic update on error
        setFavorites(originalFavorites);

        const errorMessage = error.message || "Failed to remove from favorites";
        setError(errorMessage);
        showToast(errorMessage, "error");
        throw error;
      }
    },
    [isGuest, favorites, showToast]
  );

  const fetchMyPropertyCount = useCallback(async () => {
    // try {
    //   const response = await propertyAPI.getMyPropertyCount();
    //   if (response.success && typeof response.data === "number") {
    //     setMyPropertyCount(response.data);
    //   }
    // } catch (error) {
    //   console.error("Failed to fetch property count:", error);
    // }
  }, [isGuest, currentUser]);

  const fetchFavorites = useCallback(async () => {
    if (isGuest || currentUser?.role !== "seeker") {
      return;
    }

    try {
      const now = Date.now();
      if (now - cacheRef.current.lastFavoritesFetch < CACHE_DURATION) {
        return; // Use cached data
      }

      setFavoritesLoading(true);
      const response = await favoritesAPI.getFavoriteProperties(0, 100);

      if (response.success && response.data) {
        const favoritesWithProperties =
          response.data.favorites || response.data.properties || [];
        setFavorites(favoritesWithProperties);

        // Generate image URLs for favorite properties
        const propertiesWithImages = favoritesWithProperties
          .map((fav) => fav.property)
          .filter(Boolean);
        generateImageUrls(propertiesWithImages);

        cacheRef.current.lastFavoritesFetch = now;
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setFavoritesLoading(false);
    }
  }, [isGuest, generateImageUrls]);

  // Auto-fetch data when user logs in
  // useEffect(() => {
  //   if (!isGuest && currentUser) {
  //     fetchFavorites();
  //     if (currentUser.role === "provider") {
  //       fetchMyPropertyCount();
  //     }
  //   } else {
  //     clearCache();
  //   }
  // }, [
  //   isGuest,
  //   currentUser,
  //   fetchFavorites,
  //   fetchMyPropertyCount,
  //   clearCache,
  // ]);

  // Delete property functionality
  const deleteProperty = useCallback(
    async (propertyId) => {
      if (isGuest) {
        throw new Error("Please login to delete properties");
      }
      try {
        setLoading(true);
        clearError();

        const response = await propertyAPI.deleteProperty(propertyId);

        if (response.success) {
          // Update state only after successful API call
          setProperties((prev) => prev.filter((p) => p.id !== propertyId));
          setMyProperties((prev) => prev.filter((p) => p.id !== propertyId));
          setMyPropertyCount((prev) => (prev > 0 ? prev - 1 : 0));
          setFavorites((prev) =>
            prev.filter((fav) => fav.property?.id !== propertyId)
          );

          showToast("Property deleted successfully", "success");
          return true;
        } else {
          throw new Error(response.message || "Failed to delete property");
        }
      } catch (error) {
        setError(error.message || "Failed to delete property");
        showToast(error.message || "Failed to delete property", "error");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [isGuest, showToast, clearError]
  );

  // Context value
  const contextValue = {
    // State
    properties,
    favorites,
    myProperties,
    myPropertyCount,
    loading,
    changePropertyStatusLoading,
    propertiesLoading,
    favoritesLoading,
    error,
    cache: cacheRef.current,

    updateUser,

    addProperty,
    fetchProperties,
    updateProperty,
    updatePropertyStatus,
    getPropertyById,
    deleteProperty,

    // Favorites methods
    addToFavorites,
    removeFromFavorites,

    // Fetch methods
    fetchMyPropertyCount,
    fetchFavorites,

    // Utility methods
    clearCache,
    clearError,
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
}

export default DatabaseProvider;
