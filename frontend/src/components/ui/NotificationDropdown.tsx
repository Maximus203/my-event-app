import type { Notification } from '@/hooks/useNotifications';
import { useNotifications } from '@/hooks/useNotifications';
import { formatTimeAgo } from '@/utils/formatters';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell as BellIcon,
  BellIcon as BellSolidIcon,
  Check as CheckIcon,
  Clock as ClockIcon,
  Eye as EyeIcon,
  Trash2 as TrashIcon,
  X as XMarkIcon
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Badge from './Badge';
import { Button } from './Button';

interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
                                                         className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    requestNotificationPermission,
    permission,
    stats
  } = useNotifications({
    enableRealTime: true,
    enableBrowserNotifications: true
  });

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = filter === 'unread' 
    ? unreadNotifications 
    : notifications;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'event_update':
        return '📅';
      case 'event_reminder':
        return '⏰';
      case 'new_message':
        return '💬';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'event_update':
        return 'text-blue-600 dark:text-blue-400';
      case 'event_reminder':
        return 'text-blue-600 dark:text-blue-400';
      case 'new_message':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleRequestPermission = async () => {
    try {
      await requestNotificationPermission();
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        title={`${unreadCount} notification${unreadCount !== 1 ? 's' : ''} non lue${unreadCount !== 1 ? 's' : ''}`}
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="w-6 h-6" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <Badge
            variant="primary"
            size="sm"
            className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 flex flex-col"
          >
            {/* En-tête */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Statistiques et filtres */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stats.total} au total, {stats.unread} non lues
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      filter === 'all'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Toutes
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      filter === 'unread'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Non lues ({unreadCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Demande de permission */}
            {permission === 'default' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600 dark:text-blue-400">
                    <BellIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Activez les notifications du navigateur pour ne rien manquer
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleRequestPermission}
                  >
                    Activer
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            {filteredNotifications.length > 0 && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckIcon className="w-3 h-3 mr-1" />
                    Tout marquer comme lu
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearAllNotifications}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-3 h-3 mr-1" />
                  Tout supprimer
                </Button>
              </div>
            )}

            {/* Liste des notifications */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chargement des notifications...
                  </p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group relative p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icône */}
                        <div className={`text-lg ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                  title="Marquer comme lu"
                                >
                                  <EyeIcon className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="p-1 text-red-600 hover:text-red-700 dark:text-red-400"
                                title="Supprimer"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            
                            {notification.actionLabel && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {notification.actionLabel} →
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Indicateur non lu */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BellIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                  </p>
                </div>
              )}
            </div>

            {/* Pied de page */}
            {filteredNotifications.length > 5 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <button
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  onClick={() => {
                    // Naviguer vers une page complète de notifications
                    window.location.href = '/notifications';
                  }}
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
