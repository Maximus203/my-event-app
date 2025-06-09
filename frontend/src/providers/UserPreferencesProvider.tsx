import type { UserPreferences, UserPreferencesContextType } from '@/types/preferences';
import Cookies from 'js-cookie';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

const PREFERENCES_COOKIE_NAME = 'my-event-preferences';
const PREFERENCES_COOKIE_EXPIRES = 365; // 1 an

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'fr',
  emailNotifications: true,
  smsNotifications: false,
  reminderTime: 24, // 24h avant
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(
  undefined
);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider = ({ children }: UserPreferencesProviderProps) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Récupérer les préférences depuis les cookies
    const savedPreferences = Cookies.get(PREFERENCES_COOKIE_NAME);
    if (savedPreferences) {
      try {
        return { ...defaultPreferences, ...JSON.parse(savedPreferences) };
      } catch (error) {
        console.error('Erreur lors du parsing des préférences:', error);
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, ...updates };
      Cookies.set(
        PREFERENCES_COOKIE_NAME, 
        JSON.stringify(newPreferences), 
        { expires: PREFERENCES_COOKIE_EXPIRES }
      );
      return newPreferences;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    Cookies.remove(PREFERENCES_COOKIE_NAME);
  }, []);

  return (
    <UserPreferencesContext.Provider 
      value={{ preferences, updatePreferences, resetPreferences }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
