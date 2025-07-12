import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { name: Theme; label: string; colors: ThemeColors }[];
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

const themes = [
  {
    name: 'light' as Theme,
    label: 'Light',
    colors: {
      primary: '#3B82F6',
      secondary: '#F3F4F6',
      accent: '#E5E7EB',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB'
    }
  },
  {
    name: 'dark' as Theme,
    label: 'Dark',
    colors: {
      primary: '#60A5FA',
      secondary: '#374151',
      accent: '#4B5563',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
      border: '#374151'
    }
  },
  {
    name: 'blue' as Theme,
    label: 'Ocean',
    colors: {
      primary: '#0EA5E9',
      secondary: '#E0F2FE',
      accent: '#BAE6FD',
      background: '#F0F9FF',
      surface: '#FFFFFF',
      text: '#0C4A6E',
      textSecondary: '#0369A1',
      border: '#BAE6FD'
    }
  },
  {
    name: 'green' as Theme,
    label: 'Forest',
    colors: {
      primary: '#10B981',
      secondary: '#D1FAE5',
      accent: '#A7F3D0',
      background: '#ECFDF5',
      surface: '#FFFFFF',
      text: '#064E3B',
      textSecondary: '#047857',
      border: '#A7F3D0'
    }
  },
  {
    name: 'purple' as Theme,
    label: 'Royal',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EDE9FE',
      accent: '#DDD6FE',
      background: '#FAF5FF',
      surface: '#FFFFFF',
      text: '#4C1D95',
      textSecondary: '#7C3AED',
      border: '#DDD6FE'
    }
  },
  {
    name: 'orange' as Theme,
    label: 'Sunset',
    colors: {
      primary: '#F59E0B',
      secondary: '#FEF3C7',
      accent: '#FDE68A',
      background: '#FFFBEB',
      surface: '#FFFFFF',
      text: '#92400E',
      textSecondary: '#D97706',
      border: '#FDE68A'
    }
  }
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (selectedTheme: Theme) => {
    const themeColors = themes.find(t => t.name === selectedTheme)?.colors;
    if (!themeColors) return;

    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Update Tailwind classes
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${selectedTheme}`);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}; 