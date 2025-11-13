import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const getBaseURL = () => {
  if (__DEV__) {
    // "http://192.168.1.11:8080",
    // "http://192.168.1.107:8080", 
    return "http://10.201.69.100:8000";
  }
  return "https://your-production-domain.com"; 
};

const BASE_URL = getBaseURL();

console.log("API: Current BASE_URL:", BASE_URL);
console.log("API: __DEV__ flag:", __DEV__);

const apiClient = axios.create({
  baseURL: BASE_URL,
});

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";

let memoryCache = {
  token: null,
  refreshToken: null,
  user: null,
  isInitialized: false,
};

export const tokenStorage = {
  async initializeCache() {
    if (memoryCache.isInitialized) return;

    try {
      const [token, refreshToken, userString] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      memoryCache.token = token;
      memoryCache.refreshToken = refreshToken;
      memoryCache.user = userString ? JSON.parse(userString) : null;
      memoryCache.isInitialized = true;
    } catch (error) {
      memoryCache.isInitialized = true;
    }
  },

  async getToken() {
    try {
      if (!memoryCache.isInitialized) {
        await this.initializeCache();
      }
      return memoryCache.token;
    } catch (error) {
      return null;
    }
  },

  async setToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      memoryCache.token = token;
    } catch (error) {
      console.error("Error storing token", error);
    }
  },

  async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      memoryCache.token = null;
    } catch (error) {
      console.error("Error removing token", error);
    }
  },

  async getRefreshToken() {
    try {
      if (!memoryCache.isInitialized) {
        await this.initializeCache();
      }
      return memoryCache.refreshToken;
    } catch (error) {
      return null;
    }
  },

  async setRefreshToken(refreshToken) {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      memoryCache.refreshToken = refreshToken;
    } catch (error) {
      console.error("Error storing refresh token", error);
    }
  },

  async removeRefreshToken() {
    try {
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      memoryCache.refreshToken = null;
    } catch (error) {
      console.error("Error removing refresh token", error);
    }
  },

  async getUser() {
    try {
      if (!memoryCache.isInitialized) {
        await this.initializeCache();
      }
      return memoryCache.user;
    } catch (error) {
      return null;
    }
  },

  async setUser(user) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      memoryCache.user = user;
    } catch (error) {
      console.error("Error storing user data", error);
    }
  },

  async removeUser() {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      memoryCache.user = null;
    } catch (error) {
      console.error("Error removing user data", error);
    }
  },

  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
      memoryCache.token = null;
      memoryCache.refreshToken = null;
      memoryCache.user = null;
    } catch (error) {
      console.error("Error clearing auth data", error);
    }
  },
};

apiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes("/auth/login")) {
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors[0]);
        } else if (errorData.error) {
          throw new Error(errorData.error);
        }
      }
      throw new Error("Login failed. Please try again.");
    }
    if (error.response?.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        await tokenStorage.clearAuthData();
        throw new Error("Session expired. Please login again.");
      }
    }

    // Handle Django error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.error) {
        throw new Error(errorData.error);
      } else if (errorData.message) {
        throw new Error(errorData.message);
      } else if (errorData.detail) {
        throw new Error(errorData.detail);
      }
    }

    if (!error.response) {
      console.error("API: Network error details:", {
        code: error.code,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
        },
      });

      throw new Error("Network error. Please check your internet connection.");
    }

    throw error;
  }
);

export const authAPI = {
  async register(userData) {
    try {
      const response = await apiClient.post("/api/auth/register/", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.password,
        role: userData.role.toLowerCase(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await apiClient.post("/api/auth/login/", {
        email,
        password,
      });
      
      if (response.data.access && response.data.refresh) {
        await tokenStorage.setToken(response.data.access);
        await tokenStorage.setRefreshToken(response.data.refresh);
        await tokenStorage.setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async verifyOtp(email, otp) {
    try {
      const response = await apiClient.post("/api/auth/verify-otp/", {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async resendOtp(email) {
    try {
      const response = await apiClient.post("/api/auth/resend-otp/", {
        email,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await apiClient.put("/api/auth/update-user/", profileData);
      
      if (response.data.user) {
        await tokenStorage.setUser(response.data.user);
      }
      
      return {
        success: true,
        data: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      throw error;
    }
  },

  async updateProfileWithImage(formData) {
    try {
      const response = await apiClient.put("/api/auth/update-user/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.user) {
        await tokenStorage.setUser(response.data.user);
      }
      
      return {
        success: true,
        data: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      throw error;
    }
  },

  async validateToken() {
    try {
      const response = await apiClient.get("/api/auth/validate-token/");
      if (response.data.user) {
        await tokenStorage.setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      await tokenStorage.clearAuthData();
      throw error;
    }
  },

  async logout() {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      
      if (refreshToken) {
        try {
          await apiClient.post("/api/auth/logout/", {
            refresh: refreshToken,
          });
        } catch (error) {
          console.log("Backend logout failed, clearing local data anyway:", error.message);
        }
      }
      
      await tokenStorage.clearAuthData();
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      await tokenStorage.clearAuthData();
      throw error;
    }
  },

  async forgotPassword(email) {
    try {
      const response = await apiClient.post("/api/auth/forgot-password/", {
        email,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async verifyResetOtp(email, otp) {
    try {
      const response = await apiClient.post("/api/auth/verify-reset-otp/", {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(email, newPassword) {
    try {
      const response = await apiClient.post("/api/auth/reset-password/", {
        email,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post("/api/auth/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteAccount(password) {
    try {
      const response = await apiClient.post("/api/auth/delete-account/", {
        password,
      });
      await tokenStorage.clearAuthData();
      return response.data;
    } catch (error) {
      throw error;
    }
  },

};

export const propertyAPI = {
  async createProperty(propertyData) {
    try {
      const response = await apiClient.post("/api/properties/create/", propertyData);
      return {
        success: true,
        data: response.data,
        message: "Property created successfully"
      };
    } catch (error) {
      console.error("API: Error in createProperty:", error);
      throw error;
    }
  },

  async getProperties(page = 1, size = 10, sortBy = "createdAt", sortDirection = "desc") {
    try {
      const response = await apiClient.get("/api/properties/", {
        params: { page, page_size: size, ordering: sortDirection === 'desc' ? `-${sortBy}` : sortBy },
      });
      
      const properties = response.data.results || response.data;
      return {
        success: true,
        data: {
          properties: properties.map(property => ({
            ...property,
            imageLoadingStates: property.imageIds
              ? property.imageIds.reduce(
                  (acc, imageId) => ({
                    ...acc,
                    [imageId]: { loading: true, url: null, error: null },
                  }),
                  {}
                )
              : {},
            imagesLoading: true,
          })),
          totalElements: response.data.count || properties.length,
          totalPages: response.data.count ? Math.ceil(response.data.count / size) : 1,
          currentPage: page,
        }
      };
    } catch (error) {
      console.error("API: Error in getProperties:", error);
      throw error;
    }
  },

  async getPropertyById(id) {
    try {
      const response = await apiClient.get(`/api/properties/${id}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("API: Error in getPropertyById:", error);
      throw error;
    }
  },

  async getPropertiesByListingType(listingType, page = 0, size = 10) {
    try {
      const response = await apiClient.get(
        `/api/properties/listing-type/${listingType}`,
        {
          params: { page, size },
        }
      );

      if (response.data?.data?.properties) {
        response.data.data.properties = response.data.data.properties.map(
          (property) => ({
            ...property,
            imageLoadingStates: property.imageIds
              ? property.imageIds.reduce(
                  (acc, imageId) => ({
                    ...acc,
                    [imageId]: { loading: true, url: null, error: null },
                  }),
                  {}
                )
              : {},
            imagesLoading: true,
          })
        );
      }

      return response.data;
    } catch (error) {
      console.error("API: Error in getPropertiesByListingType:", error);
      throw error;
    }
  },

  async searchProperties(searchCriteria) {
    try {
      console.log("API: Searching properties with criteria:", searchCriteria);
      const params = new URLSearchParams();
      
      Object.keys(searchCriteria).forEach(key => {
        if (searchCriteria[key] !== undefined && searchCriteria[key] !== null && searchCriteria[key] !== '') {
          if (key === 'search') {
            params.append('search', searchCriteria[key]);
          } else {
            params.append(key, searchCriteria[key]);
          }
        }
      });
      
      const response = await apiClient.get(`/api/properties/search/?${params.toString()}`);
      
      const properties = Array.isArray(response.data) ? response.data : [];
      return {
        success: true,
        data: {
          properties: properties.map(property => ({
            ...property,
            imageLoadingStates: property.imageIds
              ? property.imageIds.reduce(
                  (acc, imageId) => ({
                    ...acc,
                    [imageId]: { loading: true, url: null, error: null },
                  }),
                  {}
                )
              : {},
            imagesLoading: true,
          })),
          totalElements: properties.length,
        }
      };
    } catch (error) {
      console.error("API: Error in searchProperties:", error);
      throw error;
    }
  },

  async updateProperty(id, propertyData, images = null) {
    try {
      const response = await apiClient.put(`/api/properties/${id}/update/`, propertyData);
      
      console.log("API: Property updated successfully:", response.data);
      return {
        success: true,
        data: response.data,
        message: "Property updated successfully"
      };
    } catch (error) {
      console.error("API: Error in updateProperty:", error);
      throw error;
    }
  },


  async updatePropertyStatus(id, status) {
    try {
      const validStatuses = [
        "Available",
        "Occupied",
        "Maintenance",
        "Coming_Soon",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      const response = await apiClient.put(`/api/properties/${id}/update/`, {
        availability: status,
      });
      console.log("API: Property status updated successfully:", response.data);
      return {
        success: true,
        data: response.data,
        message: "Property status updated successfully"
      };
    } catch (error) {
      console.error("API: Error in updatePropertyStatus:", error);
      throw error;
    }
  },

  async deleteProperty(id) {
    try {
      const response = await apiClient.delete(`/api/properties/${id}/delete/`);
      return {
        success: true,
        message: "Property deleted successfully"
      };
    } catch (error) {
      console.error("API: Error in deleteProperty:", error);
      throw error;
    }
  },

  async getPropertyFilters() {
    try {
      const response = await apiClient.get("/api/properties/filters/");
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("API: Error in getPropertyFilters:", error);
      throw error;
    }
  },

  async getProviderAnalytics() {
    try {
      const response = await apiClient.get("/api/properties/analytics/");
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("API: Error in getProviderAnalytics:", error);
      throw error;
    }
  },

  async getPropertyAnalytics(propertyId) {
    try {
      const response = await apiClient.get(`/api/properties/${propertyId}/analytics/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("API: Error in getPropertyAnalytics:", error);
      throw error;
    }
  },

  /**
   * Get distinct cities for location filtering
   */
  async getCities() {
    try {
      const response = await apiClient.get("/api/properties/cities");
      return response.data;
    } catch (error) {
      console.error("API: Error in getCities:", error);
      throw error;
    }
  },

  /**
   * Get distinct states for location filtering
   */
  async getStates() {
    try {
      const response = await apiClient.get("/api/properties/states");
      return response.data;
    } catch (error) {
      console.error("API: Error in getStates:", error);
      throw error;
    }
  },

  /**
   * Get property count for current user
   */
  async getMyPropertyCount() {
    console.log("API: Fetching my property count");
    try {
      const response = await apiClient.get(
        "/api/properties/my-properties/count"
      );
      return response.data;
    } catch (error) {
      console.error("API: Error in getMyPropertyCount:", error);
      throw error;
    }
  },

  /**
   * Upload multiple property images with progress tracking
   */
  async uploadPropertyImages(images, onProgress = null) {
    try {
      if (!images || images.length === 0) {
        throw new Error("No images provided");
      }

      if (images.length > 5) {
        throw new Error("Maximum 5 images allowed");
      }

      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append("images", image);
      });

      const response = await apiClient.post("/api/images/property", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      console.log("API: Property images uploaded successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("API: Error in uploadPropertyImages:", error);
      throw error;
    }
  },

  /**
   * Upload temporary property images for draft properties
   */
  async uploadTempPropertyImages(images, onProgress = null) {
    try {
      if (!images || images.length === 0) {
        throw new Error("No images provided");
      }

      if (images.length > 5) {
        throw new Error("Maximum 5 images allowed");
      }

      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append("images", image);
      });

      const response = await apiClient.post(
        "/api/images/property/temp",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      console.log(
        "API: Temporary property images uploaded successfully:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("API: Error in uploadTempPropertyImages:", error);
      throw error;
    }
  },

  /**
   * Generate property image URLs in background
   */
  async generatePropertyImageUrls(imageIds, folder = "images") {
    try {
      if (!imageIds || imageIds.length === 0) {
        return {};
      }

      const response = await apiClient.post("/api/images/urls", {
        imageIds,
        folder,
      });

      return response.data?.data?.imageUrls || {};
    } catch (error) {
      console.error("API: Error in generatePropertyImageUrls:", error);
      return {};
    }
  },

  /**
   * Delete multiple property images
   */
  async deletePropertyImages(imageUrls) {
    try {
      if (!imageUrls || imageUrls.length === 0) {
        return { success: true, message: "No images to delete" };
      }

      const response = await apiClient.delete("/api/images/delete/multiple", {
        data: imageUrls,
      });

      console.log("API: Property images deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("API: Error in deletePropertyImages:", error);
      throw error;
    }
  },
};

export const favoritesAPI = {
  async addToFavorites(propertyId) {
    try {
      console.log("API: Adding to favorites, propertyId:", propertyId);
      const response = await apiClient.post(`/api/properties/${propertyId}/favorite/`);
      console.log("API: Add to favorites response:", response.data);
      return {
        success: true,
        data: response.data,
        message: "Property added to favorites"
      };
    } catch (error) {
      console.error(
        "API: Add to favorites error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async removeFromFavorites(propertyId) {
    try {
      const response = await apiClient.delete(`/api/properties/${propertyId}/unfavorite/`);
      return {
        success: true,
        message: "Property removed from favorites"
      };
    } catch (error) {
      throw error;
    }
  },

  async toggleFavorite(propertyId) {
    try {
      console.log("API: Toggling favorite, propertyId:", propertyId);
      const response = await apiClient.post(
        `/api/properties/${propertyId}/toggle-favorite/`
      );
      console.log("API: Toggle favorite response:", response.data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(
        "API: Toggle favorite error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async getFavoriteStatus(propertyId) {
    try {
      const response = await apiClient.get(
        `/api/properties/${propertyId}/favorite-status/`
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw error;
    }
  },

  async getFavoriteProperties(page = 1, size = 10) {
    try {
      const params = {};
      if (page >= 1 && size > 0) {
        params.page = page;
        params.page_size = size;
      }

      const response = await apiClient.get("/api/properties/favorites/", { params });
      const favorites = response.data.results || response.data;
      return {
        success: true,
        data: {
          favorites: favorites,
          properties: favorites, // For backward compatibility
          totalElements: response.data.count || favorites.length,
        }
      };
    } catch (error) {
      throw error;
    }
  },

  async getFavoritesCount() {
    try {
      const response = await apiClient.get("/api/properties/favorites/");
      const count = response.data.count || (response.data.results ? response.data.results.length : 0);
      return {
        success: true,
        data: count
      };
    } catch (error) {
      throw error;
    }
  },

  async getPropertyFavoritesCount(propertyId) {
    try {
      const response = await apiClient.get(
        `/api/properties/${propertyId}/favorite-count/`
      );
      return {
        success: true,
        data: response.data.count
      };
    } catch (error) {
      throw error;
    }
  },
};

export const supportAPI = {
  async reportProblem(problemData) {
    try {
      const response = await apiClient.post("/api/support/report-problem/", problemData);
      return {
        success: true,
        data: response.data,
        message: response.data.message || "Problem reported successfully"
      };
    } catch (error) {
      console.error("API: Error in reportProblem:", error);
      throw error;
    }
  },
};

export const chatAPI = {
  async getChats() {
    try {
      const response = await apiClient.get('/api/chats/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API: Error in getChats:', error);
      throw error;
    }
  },

  async createChat(otherUserId) {
    try {
      const response = await apiClient.post('/api/chats/create/', {
        other_user_id: otherUserId
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API: Error in createChat:', error);
      throw error;
    }
  },

  async getMessages(roomId) {
    try {
      const response = await apiClient.get(`/api/chats/${roomId}/messages/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API: Error in getMessages:', error);
      throw error;
    }
  },

  async sendMessage(roomId, content) {
    try {
      const response = await apiClient.post(`/api/chats/${roomId}/messages/create/`, {
        content
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API: Error in sendMessage:', error);
      throw error;
    }
  },

  async deleteMessage(roomId, messageId) {
    try {
      const response = await apiClient.put(`/api/chats/${roomId}/messages/${messageId}/delete/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API: Error in deleteMessage:', error);
      throw error;
    }
  },
};

export const imageAPI = {
  async uploadProfileImage(imageData) {
    try {
      const formData = new FormData();

      formData.append("image", {
        uri: imageData.uri,
        type: imageData.type || "image/jpeg",
        name: imageData.name || "profile-image.jpg",
      });

      const response = await apiClient.post(
        "/api/images/profile/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("API: Error in uploadProfileImage:", error);
      throw error;
    }
  },

  async updateProfileImage(imageData) {
    try {
      const formData = new FormData();

      formData.append("image", {
        uri: imageData.uri,
        type: imageData.type || "image/jpeg",
        name: imageData.name || "profile-image.jpg",
      });

      const response = await apiClient.put(
        "/api/images/profile/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("API: Error in updateProfileImage:", error);
      throw error;
    }
  },

  async removeProfileImage() {
    try {
      const response = await apiClient.delete("/api/images/profile/remove");
      return response.data;
    } catch (error) {
      console.error("API: Error in removeProfileImage:", error);
      throw error;
    }
  },

  async getProfileImageUrl() {
    try {
      const response = await apiClient.get("/api/images/profile/url");
      return response.data;
    } catch (error) {
      console.error("API: Error in getProfileImageUrl:", error);
      throw error;
    }
  },

  async handleProfileImageOperation(croppedUri, hasCurrentImage = false) {
    try {
      const imageData = {
        uri: croppedUri,
        type: "image/jpeg",
        name: "profile-image.jpg",
      };

      let response;
      if (hasCurrentImage) {
        response = await this.updateProfileImage(imageData);
      } else {
        response = await this.uploadProfileImage(imageData);
      }

      // Return both imageId (for database) and imageUrl (for display)
      return {
        success: response.success,
        data: {
          imageId: response.data?.imageId,
          imageUrl: response.data?.imageUrl,
        },
      };
    } catch (error) {
      console.error("API: Error in handleProfileImageOperation:", error);
      throw error;
    }
  },
};

export default apiClient;

export const isAuthenticated = async () => {
  try {
    if (!memoryCache.isInitialized) {
      await tokenStorage.initializeCache();
    }
    
    const token = memoryCache.token;
    const user = memoryCache.user;
    
    if (!token || !user) {
      return false;
    }
    
    // Validate token with backend
    try {
      await authAPI.validateToken();
      return true;
    } catch (error) {
      console.log('Token validation failed:', error.message);
      return false;
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = await tokenStorage.getToken();
    if (!token) {
      return null;
    }
    return await tokenStorage.getUser();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return await tokenStorage.getUser();
  }
};
