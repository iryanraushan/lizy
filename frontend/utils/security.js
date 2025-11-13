import { authAPI, tokenStorage, isAuthenticated } from '../services/api';

export const securityUtils = {
  /**
   * Initialize app security - validate token and user on app start
   */
  async initializeAppSecurity() {
    try {
      console.log('Initializing app security...');
      
      // Initialize token cache
      await tokenStorage.initializeCache();
      
      const token = await tokenStorage.getToken();
      const user = await tokenStorage.getUser();
      
      if (!token || !user) {
        console.log('No token or user found, user not authenticated');
        return { isAuthenticated: false, user: null };
      }
      
      // Only validate token with backend if we have both token and user
      try {
        const validationResult = await authAPI.validateToken();
        console.log('Token validation successful');
        return { 
          isAuthenticated: true, 
          user: validationResult.user,
          requiresVerification: !validationResult.user.is_verified
        };
      } catch (error) {
        console.log('Token validation failed:', error.message);
        await tokenStorage.clearAuthData();
        return { isAuthenticated: false, user: null, error: error.message };
      }
      
    } catch (error) {
      console.error('Security initialization failed:', error);
      await tokenStorage.clearAuthData();
      return { isAuthenticated: false, user: null, error: error.message };
    }
  },

  /**
   * Quick authentication check without backend validation
   */
  async quickAuthCheck() {
    try {
      await tokenStorage.initializeCache();
      const token = await tokenStorage.getToken();
      const user = await tokenStorage.getUser();
      return !!(token && user);
    } catch (error) {
      return false;
    }
  },

  /**
   * Secure logout - clear all auth data
   */
  async secureLogout() {
    try {
      await tokenStorage.clearAuthData();
      console.log('Secure logout completed');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },

  /**
   * Check if user needs verification
   */
  async checkVerificationStatus() {
    try {
      const user = await tokenStorage.getUser();
      return user ? !user.is_verified : true;
    } catch (error) {
      return true;
    }
  },

  /**
   * Validate current session
   */
  async validateCurrentSession() {
    try {
      const result = await authAPI.validateToken();
      return { valid: true, user: result.user };
    } catch (error) {
      await tokenStorage.clearAuthData();
      return { valid: false, error: error.message };
    }
  }
};

export default securityUtils;