import type { User } from './user';

// Types pour les événements (aligné avec le backend TypeORM)
export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string; // Date principale de l'événement (backend utilise Date, frontend string pour JSON)
  location?: string;
  maxParticipants?: number;
  imageUrl?: string;
  bannerImage?: string;
  videoUrl?: string;
  isActive: boolean;
  createdBy: User; // L'organisateur (correspond à createdBy du backend)
  createdById: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  
  // Propriétés calculées côté frontend pour compatibilité
  organizer?: User; // Alias pour createdBy
  organizerId?: string; // Alias pour createdById
  attendees?: string[]; // IDs des participants extraits de participants[]
  currentParticipants?: number; // Calculé à partir de participants.length
}

export interface CreateEventDto {
  title: string;
  description?: string;
  date: string;
  location?: string;
  maxParticipants?: number;
  imageUrl?: string;
  bannerImage?: string;
  videoUrl?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  maxParticipants?: number;
  imageUrl?: string;
  bannerImage?: string;
  videoUrl?: string;
}

// Types pour les participants
export interface Participant {
  id: string;
  user: User;
  userId: string;
  event: Event;
  eventId: string;
  registrationDate: string;
  isActive: boolean;
}
