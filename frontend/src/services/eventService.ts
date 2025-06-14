import type { Event, EventFilters, PaginationParams, Participant } from '@/types';
import type { CreateEventDto, UpdateEventDto } from '@/types/event';
import type { ApiResponse } from './apiService';
import { apiService } from './apiService';
import { uploadService } from './uploadService';

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalParticipants: number;
  upcomingEvents: number;
  pastEvents: number;
}

export interface SearchSuggestion {
  id: string;
  title: string;
  category: string;
  type: 'event' | 'category' | 'location';
}

class EventService {  // Récupérer tous les événements avec filtres et pagination
  async getEvents(params?: {
    filters?: EventFilters;
    pagination?: PaginationParams;
    search?: string;
  }): Promise<ApiResponse<EventsResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    if (params?.pagination) {
      queryParams.append('page', String(params.pagination.page));
      queryParams.append('limit', String(params.pagination.limit));
    }
    
    const url = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<EventsResponse>(url);
  }  // Récupérer tous les événements (alias pour compatibilité)
  async getAllEvents(): Promise<ApiResponse<Event[]>> {
    const response = await this.getEvents();
    return {
      ...response,
      data: response?.data || [],
    };
  }

  // Récupérer un événement par ID
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    return apiService.get<Event>(`/events/${id}`);
  }
  // Créer un nouvel événement
  async createEvent(data: CreateEventDto): Promise<ApiResponse<Event>> {
    return apiService.post<Event>('/events', data);
  }

  // Mettre à jour un événement
  async updateEvent(id: string, data: Partial<UpdateEventDto>): Promise<ApiResponse<Event>> {
    return apiService.put<Event>(`/events/${id}`, data);
  }

  // Supprimer un événement
  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/events/${id}`);
  }

  // Publier/dépublier un événement
  async toggleEventPublication(id: string): Promise<ApiResponse<Event>> {
    return apiService.post<Event>(`/events/${id}/toggle-publication`);
  }  // S'inscrire à un événement (utilisateur connecté - nécessite email aussi)
  async registerForEvent(eventId: string, email?: string): Promise<ApiResponse<void>> {
    // Pour les utilisateurs connectés, utiliser l'email de leur profil si disponible
    return apiService.post<void>(`/events/${eventId}/subscribe`, { email: email || '' });
  }

  // Se désinscrire d'un événement (utilisateur connecté)
  async unregisterFromEvent(eventId: string, email?: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`/events/${eventId}/unsubscribe`, { email: email || '' });
  }

  // Alias pour compatibility
  async joinEvent(eventId: string): Promise<ApiResponse<void>> {
    return this.registerForEvent(eventId);
  }

  // Alias pour compatibility
  async leaveEvent(eventId: string): Promise<ApiResponse<void>> {
    return this.unregisterFromEvent(eventId);
  }

  // Liker/unliker un événement
  async toggleEventLike(eventId: string): Promise<ApiResponse<{ isLiked: boolean; likesCount: number }>> {
    return apiService.post<{ isLiked: boolean; likesCount: number }>(`/events/${eventId}/like`);
  }

  // Récupérer les événements de l'utilisateur connecté
  async getMyEvents(params?: {
    status?: 'all' | 'published' | 'draft';
    pagination?: PaginationParams;
  }): Promise<ApiResponse<EventsResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    
    if (params?.pagination) {
      queryParams.append('page', String(params.pagination.page));
      queryParams.append('limit', String(params.pagination.limit));
    }
    
    const url = `/events/my-events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<EventsResponse>(url);
  }

  // Récupérer les événements auxquels l'utilisateur est inscrit
  async getMyRegistrations(params?: {
    status?: 'upcoming' | 'past' | 'all';
    pagination?: PaginationParams;
  }): Promise<ApiResponse<EventsResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    
    if (params?.pagination) {
      queryParams.append('page', String(params.pagination.page));
      queryParams.append('limit', String(params.pagination.limit));
    }
    
    const url = `/events/my-registrations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<EventsResponse>(url);
  }

  // Récupérer les statistiques des événements
  async getEventStats(): Promise<ApiResponse<EventStats>> {
    return apiService.get<EventStats>('/events/stats');
  }

  // Recherche avec suggestions
  async searchEvents(query: string, limit: number = 10): Promise<ApiResponse<Event[]>> {
    return apiService.get<Event[]>(`/events/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  // Obtenir des suggestions de recherche
  async getSearchSuggestions(query: string): Promise<ApiResponse<SearchSuggestion[]>> {
    return apiService.get<SearchSuggestion[]>(`/events/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  // Récupérer les événements recommandés
  async getRecommendedEvents(limit: number = 6): Promise<ApiResponse<Event[]>> {
    return apiService.get<Event[]>(`/events/recommendations?limit=${limit}`);
  }

  // Récupérer les événements populaires
  async getPopularEvents(limit: number = 6): Promise<ApiResponse<Event[]>> {
    return apiService.get<Event[]>(`/events/popular?limit=${limit}`);
  }

  // Récupérer les événements à venir
  async getUpcomingEvents(limit: number = 6): Promise<ApiResponse<Event[]>> {
    return apiService.get<Event[]>(`/events/upcoming?limit=${limit}`);
  }

  // Dupliquer un événement
  async duplicateEvent(id: string): Promise<ApiResponse<Event>> {
    return apiService.post<Event>(`/events/${id}/duplicate`);
  }

  // Exporter les participants d'un événement
  async exportParticipants(eventId: string, format: 'csv' | 'excel' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiService.get<{ downloadUrl: string }>(`/events/${eventId}/participants/export?format=${format}`);
  }

  // Envoyer une notification aux participants
  async notifyParticipants(eventId: string, data: {
    subject: string;
    message: string;
    type: 'email' | 'push' | 'both';
  }): Promise<ApiResponse<void>> {
    return apiService.post<void>(`/events/${eventId}/notify`, data);
  }
  // Récupérer les participants d'un événement (pour le propriétaire)
  async getEventParticipants(eventId: string): Promise<ApiResponse<Participant[]>> {
    return apiService.get<Participant[]>(`/events/${eventId}`);
  }
  // S'inscrire à un événement (nouvelle méthode avec email)
  async subscribeToEvent(eventId: string, {email, name}: {email: string, name: string}): Promise<ApiResponse<Participant>> {
    return apiService.post<Participant>(`/events/${eventId}/subscribe`, { email, name });
  }

  // Se désinscrire d'un événement (nouvelle méthode avec email)
  async unsubscribeFromEvent(eventId: string, email: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`/events/${eventId}/unsubscribe`, { email });
  }
  // Créer un nouvel événement avec upload de fichiers
  async createEventWithFiles(
    data: CreateEventDto,
    files?: {
      imageUrl?: File;
      bannerImage?: File;
      videoUrl?: File;
    }
  ): Promise<ApiResponse<Event>> {
    const eventData = { ...data };

    // Uploader les fichiers d'abord si ils existent
    if (files && Object.keys(files).some(key => files[key as keyof typeof files])) {
      const filesToUpload: { [key: string]: File } = {};
      
      if (files.imageUrl) filesToUpload.imageUrl = files.imageUrl;
      if (files.bannerImage) filesToUpload.bannerImage = files.bannerImage;
      if (files.videoUrl) filesToUpload.videoUrl = files.videoUrl;

      const uploadResponse = await uploadService.uploadEventMedia(filesToUpload);
      
      // Mettre à jour les URLs dans les données de l'événement
      if (uploadResponse.imageUrl) eventData.imageUrl = uploadResponse.imageUrl.url;
      if (uploadResponse.bannerImage) eventData.bannerImage = uploadResponse.bannerImage.url;
      if (uploadResponse.videoUrl) eventData.videoUrl = uploadResponse.videoUrl.url;
    }

    return this.createEvent(eventData);
  }

  // Mettre à jour un événement avec upload de fichiers
  async updateEventWithFiles(
    id: string,
    data: Partial<UpdateEventDto>,
    files?: {
      imageUrl?: File;
      bannerImage?: File;
      videoUrl?: File;
    }
  ): Promise<ApiResponse<Event>> {
    const eventData = { ...data };

    // Uploader les nouveaux fichiers si ils existent
    if (files && Object.keys(files).some(key => files[key as keyof typeof files])) {
      const filesToUpload: { [key: string]: File } = {};
      
      if (files.imageUrl) filesToUpload.imageUrl = files.imageUrl;
      if (files.bannerImage) filesToUpload.bannerImage = files.bannerImage;
      if (files.videoUrl) filesToUpload.videoUrl = files.videoUrl;

      const uploadResponse = await uploadService.uploadEventMedia(filesToUpload);
      
      // Mettre à jour les URLs dans les données de l'événement
      if (uploadResponse.imageUrl) eventData.imageUrl = uploadResponse.imageUrl.url;
      if (uploadResponse.bannerImage) eventData.bannerImage = uploadResponse.bannerImage.url;
      if (uploadResponse.videoUrl) eventData.videoUrl = uploadResponse.videoUrl.url;
    }

    return this.updateEvent(id, eventData);
  }
}

export const eventService = new EventService();
