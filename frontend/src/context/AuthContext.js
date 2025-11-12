import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

const AuthContext = createContext();



// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user from token
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { data } = await axios.get(
            `${API_URL}/auth/me`
          );
          if (data?.user) {
            setUser(data.user);
          } else {
            console.error('Invalid user data received');
            setToken(null);
          }
        } catch (error) {
          console.error('Load user error:', error);
          // Only clear token if it's an authentication error (401/403)
          if (error.response?.status === 401 || error.response?.status === 403) {
            setToken(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Refresh user data (useful when role is updated in database)
  const refreshUser = async () => {
    if (token) {
      try {
        const { data } = await axios.get(`${API_URL}/auth/me`);
        if (data?.user) {
          setUser(data.user);
          console.log('User data refreshed:', data.user);
          return { success: true, user: data.user };
        }
      } catch (error) {
        console.error('Refresh user error:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'No token available' };
  };

  // Expose refreshUser to window for console access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshUserData = refreshUser;
    }
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/auth/register`,
        userData
      );
      setToken(data.token);
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/auth/login`,
        credentials
      );
      setToken(data.token);
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('cart'); // Clear cart on logout

    // Dispatch custom event to notify CartContext
    window.dispatchEvent(new CustomEvent('clearCart'));
  };

  // Update user
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    loading,
    token,
    register,
    login,
    logout,
    updateUser,
    isAdmin,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
