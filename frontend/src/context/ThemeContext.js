import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Theme can be: 'light', 'dark', or 'auto'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'auto';
  });

  // Actual applied theme ('light' or 'dark')
  const [appliedTheme, setAppliedTheme] = useState('light');

  // Apply theme to document
  useEffect(() => {
    let newAppliedTheme = theme;

    // If auto mode, detect system preference
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      newAppliedTheme = prefersDark ? 'dark' : 'light';
    }

    // Apply to document
    const root = window.document.documentElement;
    if (newAppliedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    setAppliedTheme(newAppliedTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      const newAppliedTheme = e.matches ? 'dark' : 'light';
      const root = window.document.documentElement;
      if (newAppliedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      setAppliedTheme(newAppliedTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme, // Current theme setting: 'light', 'dark', or 'auto'
    appliedTheme, // Actual applied theme: 'light' or 'dark'
    setTheme,
    isLight: appliedTheme === 'light',
    isDark: appliedTheme === 'dark',
    isAuto: theme === 'auto',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;

