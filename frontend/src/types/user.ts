// Types pour les utilisateurs
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // Nom complet (firstName + lastName)
  username?: string; // Nom d'utilisateur
  email: string;
  phone?: string; // Numéro de téléphone
  location?: string; // Localisation
  bio?: string; // Biographie
  birthDate?: string; // Date de naissance
  profileImage?: string;
  socialLinks?: { // Liens vers les réseaux sociaux
    website?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  preferences?: UserPreferences; // Préférences utilisateur
  stats?: UserStats; // Statistiques utilisateur
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  eventsCreated: number;
  eventsAttended: number;
  totalViews: number;
  totalLikes: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    emailVisible: boolean;
    phoneVisible: boolean;
  };
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
