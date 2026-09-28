import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccentColor } from '../types';

export type Theme = 'dark' | 'light';

export interface AccentColorOption {
  id: AccentColor;
  name: string;
  nameEs: string;
  hex: string;
  twBg: string;
  twBorder: string;
  twText: string;
}

export const ACCENT_COLOR_OPTIONS: AccentColorOption[] = [
  {
    id: 'emerald',
    name: 'Emerald Green',
    nameEs: 'Verde Esmeralda',
    hex: '#10b981',
    twBg: 'bg-emerald-500',
    twBorder: 'border-emerald-500',
    twText: 'text-emerald-400',
  },
  {
    id: 'indigo',
    name: 'Electric Indigo',
    nameEs: 'Azul Índigo',
    hex: '#6366f1',
    twBg: 'bg-indigo-500',
    twBorder: 'border-indigo-500',
    twText: 'text-indigo-400',
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    nameEs: 'Azul Océano',
    hex: '#3b82f6',
    twBg: 'bg-blue-500',
    twBorder: 'border-blue-500',
    twText: 'text-blue-400',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    nameEs: 'Púrpura Imperial',
    hex: '#a855f7',
    twBg: 'bg-purple-500',
    twBorder: 'border-purple-500',
    twText: 'text-purple-400',
  },
  {
    id: 'teal',
    name: 'Modern Teal',
    nameEs: 'Turquesa',
    hex: '#14b8a6',
    twBg: 'bg-teal-500',
    twBorder: 'border-teal-500',
    twText: 'text-teal-400',
  },
  {
    id: 'rose',
    name: 'Rose Red',
    nameEs: 'Rosa Carmín',
    hex: '#f43f5e',
    twBg: 'bg-rose-500',
    twBorder: 'border-rose-500',
    twText: 'text-rose-400',
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    nameEs: 'Ámbar Cálido',
    hex: '#f59e0b',
    twBg: 'bg-amber-500',
    twBorder: 'border-amber-500',
    twText: 'text-amber-400',
  },
  {
    id: 'orange',
    name: 'Vibrant Orange',
    nameEs: 'Naranja Vivo',
    hex: '#f97316',
    twBg: 'bg-orange-500',
    twBorder: 'border-orange-500',
    twText: 'text-orange-400',
  },
];

export const ACCENT_COLOR_DEFINITIONS: Record<
  AccentColor,
  {
    primary: string;
    hover: string;
    active: string;
    subtle: string;
    text: string;
    textLight: string;
    border: string;
    borderSubtle: string;
    lightBg: string;
    lightBorder: string;
    shadow: string;
  }
> = {
  emerald: {
    primary: '#10b981',
    hover: '#059669',
    active: '#047857',
    subtle: 'rgba(6, 78, 59, 0.4)',
    text: '#34d399',
    textLight: '#059669',
    border: '#10b981',
    borderSubtle: 'rgba(16, 185, 129, 0.4)',
    lightBg: '#ecfdf5',
    lightBorder: '#a7f3d0',
    shadow: 'rgba(6, 78, 59, 0.5)',
  },
  indigo: {
    primary: '#6366f1',
    hover: '#4f46e5',
    active: '#4338ca',
    subtle: 'rgba(49, 46, 129, 0.45)',
    text: '#818cf8',
    textLight: '#4f46e5',
    border: '#6366f1',
    borderSubtle: 'rgba(99, 102, 241, 0.4)',
    lightBg: '#eef2ff',
    lightBorder: '#c7d2fe',
    shadow: 'rgba(49, 46, 129, 0.5)',
  },
  blue: {
    primary: '#3b82f6',
    hover: '#2563eb',
    active: '#1d4ed8',
    subtle: 'rgba(30, 58, 138, 0.45)',
    text: '#60a5fa',
    textLight: '#2563eb',
    border: '#3b82f6',
    borderSubtle: 'rgba(59, 130, 246, 0.4)',
    lightBg: '#eff6ff',
    lightBorder: '#bfdbfe',
    shadow: 'rgba(30, 58, 138, 0.5)',
  },
  purple: {
    primary: '#a855f7',
    hover: '#9333ea',
    active: '#7e22ce',
    subtle: 'rgba(88, 28, 135, 0.45)',
    text: '#c084fc',
    textLight: '#9333ea',
    border: '#a855f7',
    borderSubtle: 'rgba(168, 85, 247, 0.4)',
    lightBg: '#faf5ff',
    lightBorder: '#e9d5ff',
    shadow: 'rgba(88, 28, 135, 0.5)',
  },
  teal: {
    primary: '#14b8a6',
    hover: '#0d9488',
    active: '#0f766e',
    subtle: 'rgba(19, 78, 74, 0.45)',
    text: '#2dd4bf',
    textLight: '#0d9488',
    border: '#14b8a6',
    borderSubtle: 'rgba(20, 184, 166, 0.4)',
    lightBg: '#f0fdfa',
    lightBorder: '#99f6e4',
    shadow: 'rgba(19, 78, 74, 0.5)',
  },
  rose: {
    primary: '#f43f5e',
    hover: '#e11d48',
    active: '#be123c',
    subtle: 'rgba(136, 19, 55, 0.45)',
    text: '#fb7185',
    textLight: '#e11d48',
    border: '#f43f5e',
    borderSubtle: 'rgba(244, 63, 94, 0.4)',
    lightBg: '#fff1f2',
    lightBorder: '#fecdd3',
    shadow: 'rgba(136, 19, 55, 0.5)',
  },
  amber: {
    primary: '#f59e0b',
    hover: '#d97706',
    active: '#b45309',
    subtle: 'rgba(120, 53, 15, 0.45)',
    text: '#fbbf24',
    textLight: '#d97706',
    border: '#f59e0b',
    borderSubtle: 'rgba(245, 158, 11, 0.4)',
    lightBg: '#fffbeb',
    lightBorder: '#fde68a',
    shadow: 'rgba(120, 53, 15, 0.5)',
  },
  orange: {
    primary: '#f97316',
    hover: '#ea580c',
    active: '#c2410c',
    subtle: 'rgba(124, 45, 18, 0.45)',
    text: '#fb923c',
    textLight: '#ea580c',
    border: '#f97316',
    borderSubtle: 'rgba(249, 115, 22, 0.4)',
    lightBg: '#fff7ed',
    lightBorder: '#fed7aa',
    shadow: 'rgba(124, 45, 18, 0.5)',
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
  accentColorOption: AccentColorOption;
  availableAccentColors: AccentColorOption[];
}

const THEME_STORAGE_KEY = 'smartshop_terminal_theme_v1';
const ACCENT_STORAGE_KEY = 'smartshop_terminal_accent_v1';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    try {
      const saved = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor;
      if (saved && ACCENT_COLOR_OPTIONS.some((opt) => opt.id === saved)) {
        return saved;
      }
      // Check store settings in localStorage as fallback
      const storeInfoRaw = localStorage.getItem('smartshop_pos_store_settings_v1');
      if (storeInfoRaw) {
        const parsed = JSON.parse(storeInfoRaw);
        if (parsed.accentColor && ACCENT_COLOR_OPTIONS.some((opt) => opt.id === parsed.accentColor)) {
          return parsed.accentColor;
        }
      }
      return 'emerald';
    } catch {
      return 'emerald';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage', e);
    }

    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, accentColor);
    } catch (e) {
      console.warn('Unable to persist accent to localStorage', e);
    }

    const root = document.documentElement;
    root.setAttribute('data-accent', accentColor);

    const option = ACCENT_COLOR_OPTIONS.find((opt) => opt.id === accentColor) || ACCENT_COLOR_OPTIONS[0];
    const vars = ACCENT_COLOR_DEFINITIONS[accentColor] || ACCENT_COLOR_DEFINITIONS.emerald;

    root.style.setProperty('--accent-color', option.hex);
    root.style.setProperty('--accent-primary', vars.primary);
    root.style.setProperty('--accent-hover', vars.hover);
    root.style.setProperty('--accent-active', vars.active);
    root.style.setProperty('--accent-subtle', vars.subtle);
    root.style.setProperty('--accent-text', vars.text);
    root.style.setProperty('--accent-text-light', vars.textLight);
    root.style.setProperty('--accent-border', vars.border);
    root.style.setProperty('--accent-border-subtle', vars.borderSubtle);
    root.style.setProperty('--accent-light-bg', vars.lightBg);
    root.style.setProperty('--accent-light-border', vars.lightBorder);
    root.style.setProperty('--accent-shadow', vars.shadow);
  }, [accentColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setAccentColor = (newAccent: AccentColor) => {
    setAccentColorState(newAccent);
  };

  const accentColorOption =
    ACCENT_COLOR_OPTIONS.find((opt) => opt.id === accentColor) || ACCENT_COLOR_OPTIONS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        accentColor,
        setAccentColor,
        accentColorOption,
        availableAccentColors: ACCENT_COLOR_OPTIONS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
