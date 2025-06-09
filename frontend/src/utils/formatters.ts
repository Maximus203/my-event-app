/**
 * Utilitaires de formatage pour l'application
 */

/**
 * Formate une date en format français
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(dateObj);
};

/**
 * Formate une date avec l'heure
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate une date de façon relative (il y a X jours, dans X jours)
 */
export const formatRelativeDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Aujourd'hui";
  } else if (diffInDays === 1) {
    return "Demain";
  } else if (diffInDays === -1) {
    return "Hier";
  } else if (diffInDays > 0 && diffInDays <= 7) {
    return `Dans ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInDays < 0 && diffInDays >= -7) {
    return `Il y a ${Math.abs(diffInDays)} jour${Math.abs(diffInDays) > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateObj);
  }
};

/**
 * Formate un prix en euros
 */
export const formatPrice = (price: number, options?: Intl.NumberFormatOptions): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    ...options
  };

  return new Intl.NumberFormat('fr-FR', defaultOptions).format(price);
};

/**
 * Formate un nombre avec séparateurs de milliers
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('fr-FR').format(number);
};

/**
 * Formate une durée en heures et minutes
 */
export const formatDuration = (startDate: string | Date, endDate: string | Date): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffInMs = end.getTime() - start.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  }
};

/**
 * Formate un nom de fichier en supprimant l'extension et en capitalisant
 */
export const formatFileName = (fileName: string): string => {
  return fileName
    .replace(/\.[^/.]+$/, '') // Supprime l'extension
    .replace(/[-_]/g, ' ') // Remplace les tirets et underscores par des espaces
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalise chaque mot
};

/**
 * Formate un texte en slug URL
 */
export const formatSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9 -]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Supprime les tirets multiples
    .replace(/^-|-$/g, ''); // Supprime les tirets en début et fin
};

/**
 * Formate une taille de fichier en format lisible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${Math.round(percentage)}%`;
};

/**
 * Formate un temps écoulé depuis une date
 */
export const formatTimeAgo = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return 'À l\'instant';
  } else if (minutes < 60) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (hours < 24) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (days < 7) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else if (weeks < 4) {
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  } else if (months < 12) {
    return `Il y a ${months} mois`;
  } else {
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  }
};

/**
 * Formate un nom d'utilisateur pour l'affichage
 */
export const formatUsername = (firstName?: string, lastName?: string, email?: string): string => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (email) {
    return email.split('@')[0];
  } else {
    return 'Utilisateur';
  }
};

/**
 * Formate les initiales d'un utilisateur
 */
export const formatInitials = (firstName?: string, lastName?: string, email?: string): string => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  } else if (email) {
    return email.slice(0, 2).toUpperCase();
  } else {
    return 'U';
  }
};

/**
 * Tronque un texte avec ellipses
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Formate une adresse pour l'affichage
 */
export const formatAddress = (address: {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}): string => {
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.postalCode && address.city) {
    parts.push(`${address.postalCode} ${address.city}`);
  } else if (address.city) {
    parts.push(address.city);
  }
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};
