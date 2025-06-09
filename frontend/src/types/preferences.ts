import type { Theme } from './theme';

export interface UserPreferences {
  theme: Theme;
  language: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderTime: number; // heures avant l'événement
}

export interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}
