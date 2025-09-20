import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

const ThemeToggle = () => {
  // Initialize theme state with proper fallback logic
  const getInitialTheme = () => {
    try {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        return savedTheme;
      }
      
      // Check document class
      if (document.documentElement.classList.contains('dark')) {
        return 'dark';
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      
      return 'light';
    } catch (error) {
      console.warn('Error reading theme preference:', error);
      return 'light';
    }
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [isReady, setIsReady] = useState(false);

  // Apply theme changes to document and localStorage
  const applyTheme = (newTheme) => {
    try {
      const root = document.documentElement;
      
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
      
      // Dispatch custom event for other components that might need to know
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
      
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  // Initialize theme on component mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsReady(true);
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (isReady) {
      applyTheme(theme);
    }
  }, [theme, isReady]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Only apply system theme if no user preference is saved
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        setTheme(systemTheme);
      }
    };

    // Add listener for system theme changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Don't render until theme is properly initialized
  if (!isReady) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="w-9 h-9 p-0 dark:text-gray-400 text-white opacity-50"
        aria-label="Loading theme toggle"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0 dark:text-gray-400 text-white dark:hover:text-white hover:text-blue-100 dark:hover:bg-slate-700 hover:bg-sky-600/50 transition-colors duration-200"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      data-testid="theme-toggle"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
};

export default ThemeToggle;