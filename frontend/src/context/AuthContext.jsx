import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Check if user already logged in on load
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          if (res.success) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Validation error, logging out', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkLogin();
  }, []);

  // Theme effect
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        localStorage.setItem('token', res.token);
        // Res.data format is returned from login API as email, role, etc.
        // Let's call /auth/profile immediately to fetch populated data or just use res directly.
        const profileRes = await api.get('/auth/profile');
        if (profileRes.success) {
          setUser(profileRes.data);
          return { success: true };
        }
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = {
    user,
    loading,
    theme,
    login,
    logout,
    toggleTheme,
    isAdmin: user?.role === 'Admin',
    employeeProfile: user?.employeeProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
