import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const response = await api.getCurrentUser();
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid token
        localStorage.removeItem("token");
        api.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      const { token, user: userData } = response.data;

      // Store token and set user
      api.setToken(token);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const response = await api.signup(userData);
      const { token, user: newUser } = response.data;

      // Store token and set user
      api.setToken(token);
      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      return {
        success: false,
        error: error.message || "Signup failed",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if user is authenticated
      if (isAuthenticated) {
        await api.logout();
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      setIsAuthenticated(false);
      api.removeToken();
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.updateProfile(profileData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error("Profile update failed:", error);
      return {
        success: false,
        error: error.message || "Profile update failed",
      };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await api.getCurrentUser();
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error("User refresh failed:", error);
      return {
        success: false,
        error: error.message || "User refresh failed",
      };
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
