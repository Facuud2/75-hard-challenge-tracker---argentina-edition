import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = '75hard_theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    
    // Update document class for Tailwind
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
}
