import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './useToast';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

// Storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

export const useAuth = (): AuthContextType => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  const navigate = useNavigate();
  const { addToast } = useToast();

  // Initialisation de l'auth au chargement
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (token && storedUser) {
        const user = JSON.parse(storedUser);
        
        // Vérifier si le token est encore valide
        const isValid = await validateToken(token);
        
        if (isValid) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          // Token invalide, essayer de le rafraîchir
          await refreshToken();
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth:', error);
      clearAuthData();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }, []);

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      const data = await response.json();
      const { user, token, refreshToken } = data;

      // Stocker les données d'auth
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      addToast({ type: 'success', title: `Bienvenue, ${user.name} !` });
      
    } catch (error) {      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      addToast({ type: 'error', title: errorMessage });
      throw error;
    }
  }, [addToast]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      const responseData = await response.json();
      const { user, token, refreshToken } = responseData;

      // Stocker les données d'auth
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      addToast({ type: 'success', title: 'Inscription réussie ! Bienvenue !' });
      
    } catch (error) {      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      addToast({ type: 'error', title: errorMessage });
      throw error;
    }
  }, [addToast]);

  const logout = useCallback(() => {
    clearAuthData();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    addToast({ type: 'info', title: 'Vous êtes déconnecté' });
    navigate('/');
  }, [addToast, navigate]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...userData };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      return {
        ...prev,
        user: updatedUser
      };
    });
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshTokenValue) {
        throw new Error('Aucun token de rafraîchissement disponible');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });

      if (!response.ok) {
        throw new Error('Impossible de rafraîchir le token');
      }

      const data = await response.json();
      const { token, refreshToken: newRefreshToken, user } = data;

      // Mettre à jour les tokens
      localStorage.setItem(TOKEN_KEY, token);
      if (newRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      }
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      setAuthState(prev => ({
        ...prev,
        user: user || prev.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));

    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      clearAuthData();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    clearError
  };
};

// Hook pour obtenir le token d'auth
export const useAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Hook pour les requêtes authentifiées
export const useAuthenticatedRequest = () => {
  const token = useAuthToken();
  
  const getAuthHeaders = useCallback(() => {
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, [token]);

  return { getAuthHeaders, isAuthenticated: !!token };
};
