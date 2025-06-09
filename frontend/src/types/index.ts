// Types principaux pour l'application My Event

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  photo?: string;
  role: 'user' | 'admin' | 'organizer';
  isEmailVerified: boolean;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Event types
export interface Event {
  id: string;
  _id?: string; // Pour compatibilité MongoDB/legacy
  title: string;
  description: string;
  imageUrl?: string;
  bannerImage?: string;
  date: string; // Date principale (requis)
  startDate: string; // Date de début (requis)
  endDate: string; // Date de fin (requis)
  location: string;
  categories?: string[]; // Pour compatibilité avec certains écrans
  maxParticipants?: number;
  maxAttendees?: number; // Pour compatibilité
  currentParticipants?: number;
  participants?: string[];
  attendees?: string[]; // Pour compatibilité
  createdBy: User;
  createdById?: string;
  isPublic: boolean;
  registrationDeadline?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  featured?: boolean;
  isFeatured?: boolean;
  views?: number;
  viewsCount?: number;
  likes?: number;
  likesCount?: number;
  shares?: number;
  isLiked?: boolean;
  isRegistered?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  isActive?: boolean;
  reminderSent?: boolean;
  // Ajout pour compatibilité avec les analytics et dashboard
  attendeesCount?: number;
  commentsCount?: number;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
  maxParticipants?: number;
}

export interface EventFilters {
  category?: EventCategory;
  categories?: string[]; // Pour compatibilité avec certains composants
  dateRange?: {
    start: string;
    end: string;
  };
  startDate?: string; // Pour compatibilité avec certains composants
  endDate?: string;   // Pour compatibilité avec certains composants
  location?: string;
  city?: string;      // Pour compatibilité avec certains composants
  priceRange?: {
    min: number;
    max: number;
  };
  minPrice?: number;  // Pour compatibilité avec certains composants
  maxPrice?: number;  // Pour compatibilité avec certains composants
  isFree?: boolean;   // Pour compatibilité avec certains composants
  format?: string;    // Pour compatibilité avec certains composants
  tags?: string[];
  isPublic?: boolean;
}

export type EventCategory = 
  | 'conference'
  | 'workshop'
  | 'meetup'
  | 'webinar'
  | 'social'
  | 'sport'
  | 'culture'
  | 'education'
  | 'business'
  | 'technology'
  | 'other';

// API types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'event_update'
  | 'event_reminder'
  | 'new_message';

// Preferences types
export interface UserPreferences {
  theme: Theme;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    eventReminders: boolean;
    eventUpdates: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showEvents: boolean;
  };
}

export type Theme = 'light' | 'dark' | 'system';

// Search types
export interface SearchSuggestion {
  id: string;
  type: 'event' | 'user' | 'location' | 'category';
  title: string;
  subtitle?: string;
  data?: any;
}

// Registration types
export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  event: Event;
  user: User;
  status: 'confirmed' | 'pending' | 'cancelled';
  registeredAt: string;
  notes?: string;
}

// Comment types
export interface Comment {
  id: string;
  eventId: string;
  userId: string;
  user: User;
  content: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Participant types (aligné avec le backend)
export interface Participant {
  id: string;
  email: string;
  name?: string;
  eventId: string;
  event?: Event;
  notified: boolean;
  reminderSent: boolean;
  createdAt: string;
}

// Statistics types
export interface EventStats {
  totalEvents: number;
  totalParticipants: number;
  upcomingEvents: number;
  completedEvents: number;
  averageParticipants: number;
  topCategories: Array<{
    category: EventCategory;
    count: number;
  }>;
}

export interface UserStats {
  eventsCreated: number;
  eventsAttended: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  recentActivity: Array<{
    type: 'created' | 'attended' | 'liked' | 'shared';
    eventId: string;
    eventTitle: string;
    date: string;
  }>;
}

// Form types
export interface FormErrors {
  [key: string]: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Auth types
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
