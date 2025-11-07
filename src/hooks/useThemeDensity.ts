import { useState, useEffect } from 'react';
import type { Theme, Density } from '../types';

const THEME_KEY = 'marketai_theme';
const DENSITY_KEY = 'marketai_density';

export function useThemeDensity() {
  // Initialize from localStorage or defaults
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return (saved as Theme) || 'light';
  });

  const [density, setDensity] = useState<Density>(() => {
    const saved = localStorage.getItem(DENSITY_KEY);
    return (saved as Density) || 'comfort';
  });

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Persist density
  useEffect(() => {
    localStorage.setItem(DENSITY_KEY, density);
  }, [density]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleDensity = () => {
    setDensity((prev) => (prev === 'comfort' ? 'compact' : 'comfort'));
  };

  // Get padding classes based on density
  const getPadding = () => {
    return density === 'comfort' ? 'p-4' : 'p-3';
  };

  const getCardPadding = () => {
    return density === 'comfort' ? 'p-6' : 'p-4';
  };

  const getSpacing = () => {
    return density === 'comfort' ? 'space-y-4' : 'space-y-3';
  };

  return {
    theme,
    density,
    toggleTheme,
    toggleDensity,
    getPadding,
    getCardPadding,
    getSpacing,
  };
}
