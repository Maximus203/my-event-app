import { useCallback, useEffect, useState } from 'react';
import { useToast } from './useToast';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'event_update' | 'event_reminder' | 'new_message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  metadata?: {
    eventId?: string;
    userId?: string;
    [key: string]: any;
  };
}

export interface UseNotificationsOptions {
  enableRealTime?: boolean;
  enableBrowserNotifications?: boolean;
  maxNotifications?: number;
  autoMarkAsRead?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const {
    enableRealTime = true,
    enableBrowserNotifications = false,
    maxNotifications = 50,
    autoMarkAsRead = false
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  const { showToast } = useToast();

  // Initialiser les permissions de notification du navigateur
  useEffect(() => {
    if (enableBrowserNotifications && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [enableBrowserNotifications]);

  // Demander la permission pour les notifications du navigateur
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('Les notifications ne sont pas supportées par ce navigateur');
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  // Afficher une notification du navigateur
  const showBrowserNotification = useCallback((notification: Notification) => {
    if (permission === 'granted' && enableBrowserNotifications) {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.imageUrl || '/favicon.ico',
        tag: notification.id,
        requireInteraction: false,
      });

      browserNotification.onclick = () => {
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank');
        }
        browserNotification.close();
      };

      // Auto-fermer après 5 secondes
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }, [permission, enableBrowserNotifications]);

  // Ajouter une nouvelle notification
  const addNotification = useCallback((newNotification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...newNotification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, maxNotifications);
      return updated;
    });

    setUnreadCount(prev => prev + 1);    // Afficher un toast pour les notifications importantes
    if (['error', 'warning', 'event_reminder'].includes(notification.type)) {
      showToast({ type: notification.type as any, title: notification.message });
    }

    // Afficher une notification du navigateur
    showBrowserNotification(notification);

    return notification.id;
  }, [maxNotifications, showToast, showBrowserNotification]);

  // Marquer une notification comme lue
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      const updated = prev.filter(n => n.id !== notificationId);
      
      if (notification && !notification.read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return updated;
    });
  }, []);

  // Supprimer toutes les notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Récupérer les notifications depuis le serveur
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simuler un appel API - remplacer par un vrai appel
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des notifications');
      }

      const data = await response.json();
      
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Marquer une notification comme lue sur le serveur
  const markAsReadOnServer = useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Simuler l'arrivée de nouvelles notifications en temps réel
  useEffect(() => {
    if (!enableRealTime) return;

    // Simuler WebSocket ou Server-Sent Events
    const interval = setInterval(() => {
      // Simuler l'arrivée aléatoire de notifications
      if (Math.random() < 0.1) { // 10% de chance toutes les 10 secondes
        const sampleNotifications = [
          {
            type: 'event_update' as const,
            title: 'Événement mis à jour',
            message: 'Un événement auquel vous êtes inscrit a été modifié',
            actionUrl: '/events/123',
            actionLabel: 'Voir les détails'
          },
          {
            type: 'event_reminder' as const,
            title: 'Rappel d\'événement',
            message: 'Votre événement "Conférence Tech" commence dans 1 heure',
            actionUrl: '/events/456',
            actionLabel: 'Voir l\'événement'
          },
          {
            type: 'new_message' as const,
            title: 'Nouveau message',
            message: 'Vous avez reçu un nouveau message de l\'organisateur',
            actionUrl: '/messages',
            actionLabel: 'Lire le message'
          }
        ];

        const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
        addNotification(randomNotification);
      }
    }, 10000); // Toutes les 10 secondes

    return () => clearInterval(interval);
  }, [enableRealTime, addNotification]);

  // Charger les notifications au montage
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Auto-marquer comme lues si activé
  useEffect(() => {
    if (autoMarkAsRead && notifications.some(n => !n.read)) {
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 3000); // Marquer comme lues après 3 secondes

      return () => clearTimeout(timer);
    }
  }, [notifications, autoMarkAsRead, markAllAsRead]);

  // Filtres utiles
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);
  const notificationsByType = (type: Notification['type']) => 
    notifications.filter(n => n.type === type);

  // Statistiques
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    read: notifications.length - unreadCount,
    byType: {
      info: notificationsByType('info').length,
      success: notificationsByType('success').length,
      warning: notificationsByType('warning').length,
      error: notificationsByType('error').length,
      event_update: notificationsByType('event_update').length,
      event_reminder: notificationsByType('event_reminder').length,
      new_message: notificationsByType('new_message').length,
    }
  };

  return {
    // État
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
    error,
    permission,
    stats,

    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    fetchNotifications,
    requestNotificationPermission,

    // Filtres
    notificationsByType,
  };
};
