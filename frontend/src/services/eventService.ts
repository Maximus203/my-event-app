import type { Event, EventFilters, EventFormData, PaginationParams } from '@/types';
import type { ApiResponse } from './apiService';
import { apiService } from './apiService';

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
  }

  // Récupérer tous les événements (alias pour compatibilité)
  async getAllEvents(): Promise<ApiResponse<any[]>> {
    const response = await this.getEvents();
    console.log("Event Service: ", response);
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
  async createEvent(data: EventFormData): Promise<ApiResponse<Event>> {
    return apiService.post<Event>('/events', data);
  }

  // Mettre à jour un événement
  async updateEvent(id: string, data: Partial<EventFormData>): Promise<ApiResponse<Event>> {
    return apiService.put<Event>(`/events/${id}`, data);
  }

  // Supprimer un événement
  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/events/${id}`);
  }

  // Publier/dépublier un événement
  async toggleEventPublication(id: string): Promise<ApiResponse<Event>> {
    return apiService.post<Event>(`/events/${id}/toggle-publication`);
  }
  // S'inscrire à un événement
  async registerForEvent(eventId: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`/events/${eventId}/register`);
  }

  // Se désinscrire d'un événement
  async unregisterFromEvent(eventId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/events/${eventId}/register`);
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
}

export const eventService = new EventService();
