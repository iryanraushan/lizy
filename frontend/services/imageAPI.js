import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.107:8000/api/accounts';

const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const imageAPI = {
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

  async uploadProfileImage(imageData) {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append("image", {
        uri: imageData.uri,
        type: imageData.type || "image/jpeg",
        name: imageData.name || "profile-image.jpg",
      });

      const response = await fetch(`${API_BASE_URL}/images/profile/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error("API: Error in uploadProfileImage:", error);
      throw error;
    }
  },

  async updateProfileImage(imageData) {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append("image", {
        uri: imageData.uri,
        type: imageData.type || "image/jpeg",
        name: imageData.name || "profile-image.jpg",
      });

      const response = await fetch(`${API_BASE_URL}/images/profile/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      return data;
    } catch (error) {
      console.error("API: Error in updateProfileImage:", error);
      throw error;
    }
  },

  async removeProfileImage() {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/images/profile/remove/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Remove failed');
      }

      return data;
    } catch (error) {
      console.error("API: Error in removeProfileImage:", error);
      throw error;
    }
  },

  async getProfileImageUrl() {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/images/profile/url/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile image URL');
      }

      return data;
    } catch (error) {
      console.error("API: Error in getProfileImageUrl:", error);
      throw error;
    }
  },
};