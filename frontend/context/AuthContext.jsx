import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import {
  authAPI,
  tokenStorage,
  isAuthenticated,
  getCurrentUser,
} from "../services/api";
import { securityUtils } from "../utils/security";
import { useToast } from "./ToastContext";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthContextProvider({ children }) {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  async function signup(
    email,
    password,
    role,
    name,
    confirmPassword,
    phone,
    bio
  ) {
    try {
      // Frontend validation for password confirmation
      if (password !== confirmPassword) {
        showToast("Passwords don't match", "error");
        throw new Error("Passwords don't match");
      }

      const userData = {
        name,
        email,
        password,
        confirm_password: confirmPassword,
        role,
        phone,
      };

      const response = await authAPI.register(userData);

      console.log("Signup response:", response);
      if (response.message) {
        showToast("Verification code sent to email.", "success");

        return {
          success: true,
          message: response.message,
          email: response.email,
        };
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      throw error;
    }
  }

  async function loginAsGuest() {
    try {
      setIsGuest(true);
      setCurrentUser(null);
      await AsyncStorage.clear();
      await AsyncStorage.setItem("isGuest", "true");
      return { isGuest: true };
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const response = await authAPI.login(email, password);

      if (response.access && response.user) {
        setCurrentUser(response.user);
        setIsGuest(false);
        await AsyncStorage.removeItem("isGuest");

        showToast("You are logged in!", "success");

        return {
          success: true,
          user: response.user,
        };
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      if (!isGuest) {
        await authAPI.logout();
      }
      
      await securityUtils.secureLogout();
      setCurrentUser(null);
      setIsGuest(false);
      await AsyncStorage.removeItem("isGuest");

      showToast("Logged out successfully", "info");
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      // Even if backend logout fails, clear local data
      await securityUtils.secureLogout();
      setCurrentUser(null);
      setIsGuest(false);
      await AsyncStorage.removeItem("isGuest");
      showToast("Logged out successfully", "info");
      return true;
    }
  }

  async function verifyEmail(email, otp) {
    try {
      const response = await authAPI.verifyOtp(email, otp);
      
      if (response.message) {
        showToast("Account verified successfully!", "success");
        return {
          success: true,
          message: response.message,
        };
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (error) {
      throw error;
    }
  }
  
  async function resendOtp(email) {
    try {
      const response = await authAPI.resendOtp(email);
      
      if (response.message) {
        showToast("New OTP sent successfully!", "success");
        return {
          success: true,
          message: response.message,
        };
      } else {
        throw new Error("Failed to resend OTP");
      }
    } catch (error) {
      throw error;
    }
  }



  async function updateUserProfile(profileData) {
    try {
      const response = await authAPI.updateProfile(profileData);

      if (response.success) {
        const updatedUser = response.data;
        setCurrentUser(updatedUser);
        await tokenStorage.setUser(updatedUser);
        showToast("Profile updated successfully!", "success");
        return {
          success: true,
          user: updatedUser,
        };
      } else {
        throw new Error(response.message || "Profile update failed");
      }
    } catch (error) {
      showToast(error.message || "Failed to update profile", "error");
      throw error;
    }
  }

  async function refreshCurrentUser() {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      throw error;
    }
  }

  async function forgotPassword(email) {
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.message) {
        showToast("Reset OTP sent to your email", "success");
        return { success: true, message: response.message };
      }
      throw new Error("Failed to send reset email");
    } catch (error) {
      throw error;
    }
  }

  async function verifyResetOtp(email, otp) {
    try {
      const response = await authAPI.verifyResetOtp(email, otp);
      if (response.message) {
        showToast("OTP verified successfully", "success");
        return { success: true, message: response.message };
      }
      throw new Error("OTP verification failed");
    } catch (error) {
      throw error;
    }
  }

  async function resetPassword(email, newPassword) {
    try {
      const response = await authAPI.resetPassword(email, newPassword);
      if (response.message) {
        showToast("Password reset successfully", "success");
        return { success: true, message: response.message };
      }
      throw new Error("Password reset failed");
    } catch (error) {
      throw error;
    }
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      if (response.message) {
        showToast("Password changed successfully", "success");
        return { success: true, message: response.message };
      }
      throw new Error("Password change failed");
    } catch (error) {
      throw error;
    }
  }

  async function deleteAccount(password) {
    try {
      const response = await authAPI.deleteAccount(password);
      if (response.message) {
        await securityUtils.secureLogout();
        setCurrentUser(null);
        setIsGuest(false);
        showToast("Account deleted successfully", "info");
        return { success: true, message: response.message };
      }
      throw new Error("Account deletion failed");
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        const guestStatus = await AsyncStorage.getItem("isGuest");
        if (guestStatus === "true") {
          setIsGuest(true);
          setCurrentUser(null);
          return;
        }

        // Use security utilities for comprehensive security check
        const securityResult = await securityUtils.initializeAppSecurity();
        
        if (securityResult.isAuthenticated) {
          setCurrentUser(securityResult.user);
          setIsGuest(false);
          
          if (securityResult.requiresVerification) {
            showToast("Please verify your account", "warning");
          }
        } else {
          setCurrentUser(null);
          setIsGuest(false);
          
          if (securityResult.error) {
            console.log("Authentication failed:", securityResult.error);
          }
        }
        
      } catch (error) {
        console.error("Auth initialization error:", error);
        await securityUtils.secureLogout();
        setCurrentUser(null);
        setIsGuest(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  console.log("AuthContext render:", { currentUser, isGuest, loading });

  const value = {
    currentUser,
    isGuest,
    loading,
    setLoading,
    signup,
    login,
    loginAsGuest,
    logout,
    verifyEmail,
    resendOtp,
    updateUserProfile,
    refreshCurrentUser,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    changePassword,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}