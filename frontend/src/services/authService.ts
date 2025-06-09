import type { ChangePasswordData, LoginCredentials, RegisterData, User } from '@/types';
import type { ApiResponse } from './apiService';
import { apiService } from './apiService';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface UserStats {
  eventsCreated: number;
  eventsAttended: number;
  profileViews: number;
  socialConnections: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  eventUpdates: boolean;
  eventReminders: boolean;
  promotionalEmails: boolean;
  weeklyDigest: boolean;
}

class AuthService {
  // Connexion
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      localStorage.setItem('auth-token', response.data.token);
      localStorage.setItem('refresh-token', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  // Inscription
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    
    if (response.success && response.data) {
      localStorage.setItem('auth-token', response.data.token);
      localStorage.setItem('refresh-token', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  // Déconnexion
  async logout(): Promise<ApiResponse<void>> {
    const refreshToken = localStorage.getItem('refresh-token');
    
    if (refreshToken) {
      await apiService.post('/auth/logout', { refreshToken });
    }
    
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
    localStorage.removeItem('user');
    
    return { success: true };
  }

  // Rafraîchir le token
  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    const refreshToken = localStorage.getItem('refresh-token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiService.post<{ token: string; refreshToken: string }>('/auth/refresh', {
      refreshToken
    });
    
    if (response.success && response.data) {
      localStorage.setItem('auth-token', response.data.token);
      localStorage.setItem('refresh-token', response.data.refreshToken);
    }
    
    return response;
  }

  // Récupérer le profil utilisateur
  async getProfile(): Promise<ApiResponse<User>> {
    return apiService.get<User>('/auth/profile');
  }

  // Mettre à jour le profil
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiService.put<User>('/auth/profile', data);
    
    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response;
  }

  // Changer le mot de passe
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/change-password', data);
  }

  // Demander la réinitialisation du mot de passe
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/forgot-password', { email });
  }

  // Réinitialiser le mot de passe
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/reset-password', { token, newPassword });
  }

  // Vérifier l'email
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/verify-email', { token });
  }

  // Renvoyer l'email de vérification
  async resendVerificationEmail(): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/resend-verification');
  }
  // Upload de l'avatar
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiService.upload<{ avatarUrl: string }>('/auth/upload-avatar', formData);
    
    if (response.success && response.data) {
      // Mettre à jour les données utilisateur locales
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, avatar: response.data.avatarUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    
    return response;
  }

  // Mettre à jour l'avatar (avec FormData)
  async updateAvatar(formData: FormData): Promise<ApiResponse<User>> {
    const response = await apiService.post<User>('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    if (response.success && response.data) {
      // Mettre à jour les données utilisateur locales
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response;
  }

  // Supprimer l'avatar
  async deleteAvatar(): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>('/auth/avatar');
    
    if (response.success) {
      // Mettre à jour les données utilisateur locales
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, avatar: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    
    return response;
  }

  // Récupérer les statistiques de l'utilisateur
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return apiService.get<UserStats>('/auth/stats');
  }

  // Récupérer les paramètres de notification
  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    return apiService.get<NotificationSettings>('/auth/notification-settings');
  }

  // Mettre à jour les paramètres de notification
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
    return apiService.put<NotificationSettings>('/auth/notification-settings', settings);
  }

  // Supprimer le compte
  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>('/auth/account', {
      data: { password }
    });
    
    if (response.success) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
      localStorage.removeItem('user');
    }
    
    return response;
  }

  // Obtenir les activités récentes
  async getRecentActivity(limit: number = 10): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>(`/auth/activity?limit=${limit}`);
  }

  // Obtenir les sessions actives
  async getActiveSessions(): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>('/auth/sessions');
  }

  // Révoquer une session
  async revokeSession(sessionId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/auth/sessions/${sessionId}`);
  }

  // Révoquer toutes les sessions sauf la courante
  async revokeAllSessions(): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/revoke-all-sessions');
  }

  // Utilitaires locaux
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh-token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role || false;
  }

  canManageEvent(event: any): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return event.organizerId === user.id || this.hasRole('admin') || this.hasRole('moderator');
  }
}

export const authService = new AuthService();

// Re-export des types pour la compatibilité
export type { ChangePasswordData, LoginCredentials, RegisterData, User } from '@/types';

