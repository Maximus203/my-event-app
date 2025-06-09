import { ThemeContext } from '@/context/ThemeContext';
import type { Theme } from '@/types/theme';
import Cookies from 'js-cookie';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

const THEME_COOKIE_NAME = 'my-event-theme';
const THEME_COOKIE_EXPIRES = 365; // 1 an

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Récupérer le thème depuis les cookies ou utiliser 'light' par défaut
    const savedTheme = Cookies.get(THEME_COOKIE_NAME) as Theme;
    return savedTheme || 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    Cookies.set(THEME_COOKIE_NAME, newTheme, { expires: THEME_COOKIE_EXPIRES });
    
    // Appliquer le thème au document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Appliquer le thème initial au chargement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
