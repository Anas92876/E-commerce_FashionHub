import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

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
            `${process.env.REACT_APP_API_URL}/auth/me`
          );
          setUser(data.user);
        } catch (error) {
          console.error('Load user error:', error);
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
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
        `${process.env.REACT_APP_API_URL}/auth/login`,
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
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
