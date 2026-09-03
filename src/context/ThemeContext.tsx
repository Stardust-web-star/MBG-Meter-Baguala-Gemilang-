import React, { createContext, useContext, useState, useEffect } from 'react';

export type DashboardTheme = 'default' | 'dark';

interface ThemeContextType {
  theme: DashboardTheme;
  isDark: boolean;
  setTheme: (theme: DashboardTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<DashboardTheme>(() => {
    try {
      const savedTheme = localStorage.getItem('mbg_theme');
      if (savedTheme === 'dark' || savedTheme === 'default') {
        return savedTheme;
      }
    } catch {
      // ignore
    }
    return 'default';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    try {
      localStorage.setItem('mbg_theme', theme);
    } catch {
      // ignore
    }

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  const setTheme = (newTheme: DashboardTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'default' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
