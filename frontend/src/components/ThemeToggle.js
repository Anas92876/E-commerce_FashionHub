import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme, isDark, isAuto } = useTheme();

  // Cycle through themes: light → dark → auto → light
  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  // Get icon based on current theme
  const getIcon = () => {
    if (isAuto) {
      return <ComputerDesktopIcon className="w-5 h-5" />;
    } else if (isDark) {
      return <MoonIcon className="w-5 h-5" />;
    } else {
      return <SunIcon className="w-5 h-5" />;
    }
  };

  // Get label for current theme
  const getLabel = () => {
    if (isAuto) return 'Auto mode (system)';
    if (isDark) return 'Dark mode';
    return 'Light mode';
  };

  // Get next theme name for accessibility
  const getNextTheme = () => {
    if (theme === 'light') return 'dark';
    if (theme === 'dark') return 'auto';
    return 'light';
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative rounded-md p-2 text-stone-600 transition-colors duration-200 hover:bg-stone-100 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
      aria-label={`${getLabel()}. Click to switch to ${getNextTheme()} mode`}
      title={`${getLabel()}. Click to switch to ${getNextTheme()} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -10, opacity: 0, rotate: -180 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 10, opacity: 0, rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="relative w-5 h-5"
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
