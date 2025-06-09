import { useNotifications } from '@/hooks/useNotifications';
import { formatTimeAgo } from '@/utils/formatters';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Archive,
  Bell,
  Calendar,
  Check,
  Clock,
  Filter,
  MessageSquare,
  Settings,
  Trash2,
  Users
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

type NotificationFilter = 'all' | 'unread' | 'events' | 'social' | 'reminders' | 'system';

export const NotificationsPage: React.FC = () => {  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,    removeNotification, 
    isLoading
  } = useNotifications();
  
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  // Filtres de notifications
  const filters = [
    { key: 'all' as const, label: 'Toutes', icon: Bell, count: notifications.length },
    { key: 'unread' as const, label: 'Non lues', icon: AlertCircle, count: unreadCount },
    { key: 'events' as const, label: 'Événements', icon: Calendar, count: notifications.filter(n => n.type === 'event_update' || n.type === 'event_reminder').length },
    { key: 'social' as const, label: 'Social', icon: Users, count: notifications.filter(n => n.type === 'new_message').length },
    { key: 'reminders' as const, label: 'Rappels', icon: Clock, count: notifications.filter(n => n.type === 'event_reminder').length },
    { key: 'system' as const, label: 'Système', icon: Settings, count: notifications.filter(n => n.type === 'info' || n.type === 'warning' || n.type === 'error').length },
  ];

  // Notifications filtrées
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'events':
        filtered = filtered.filter(n => n.type === 'event_update' || n.type === 'event_reminder');
        break;
      case 'social':
        filtered = filtered.filter(n => n.type === 'new_message');
        break;
      case 'reminders':
        filtered = filtered.filter(n => n.type === 'event_reminder');
        break;
      case 'system':
        filtered = filtered.filter(n => n.type === 'info' || n.type === 'warning' || n.type === 'error');
        break;
      default:
        // 'all' - pas de filtre supplémentaire
        break;
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, selectedFilter]);

  // Gestion de la sélection multiple
  const handleNotificationSelect = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  // Actions groupées
  const handleBulkMarkAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id => markAsRead(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };
  const handleBulkDelete = async () => {
    const promises = Array.from(selectedNotifications).map(id => removeNotification(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  const handleBulkArchive = async () => {
    // Pour cette fonction, on peut simplement supprimer les notifications
    // car il n'y a pas de fonction d'archivage dans useNotifications
    const promises = Array.from(selectedNotifications).map(id => removeNotification(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };
  // Obtenir l'icône selon le type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_update':
      case 'event_reminder':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'new_message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'info':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {unreadCount > 0 
                  ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Aucune notification non lue'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Bouton tout marquer comme lu */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Tout marquer comme lu
                </button>
              )}
              
              {/* Bouton filtres */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </button>
                
                {/* Menu des filtres */}
                <AnimatePresence>
                  {showFilterMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    >
                      <div className="py-1">
                        {filters.map((filter) => {
                          const Icon = filter.icon;
                          return (
                            <button
                              key={filter.key}
                              onClick={() => {
                                setSelectedFilter(filter.key);
                                setShowFilterMenu(false);
                                setSelectedNotifications(new Set());
                              }}
                              className={`flex items-center w-full px-4 py-2 text-sm ${
                                selectedFilter === filter.key
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                              }`}
                            >
                              <Icon className="h-4 w-4 mr-3" />
                              <span className="flex-1 text-left">{filter.label}</span>
                              {filter.count > 0 && (
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                  selectedFilter === filter.key
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                  {filter.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Actions groupées */}
          {selectedNotifications.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} sélectionnée{selectedNotifications.size > 1 ? 's' : ''}
                </p>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    {selectedNotifications.size === filteredNotifications.length ? 'Désélectionner tout' : 'Tout sélectionner'}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkMarkAsRead}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Marquer comme lues
                    </button>
                    
                    <button
                      onClick={handleBulkArchive}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Archiver
                    </button>
                    
                    <button
                      onClick={handleBulkDelete}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Liste des notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune notification
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedFilter === 'all' 
                  ? 'Vous n\'avez aucune notification pour le moment.'
                  : `Aucune notification dans la catégorie "${filters.find(f => f.key === selectedFilter)?.label}".`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox de sélection */}
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.has(notification.id)}
                          onChange={() => handleNotificationSelect(notification.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>

                      {/* Icône */}
                      <div className="flex-shrink-0 pt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm ${
                              !notification.read 
                                ? 'font-semibold text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                title="Marquer comme lu"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                              title="Archiver"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-red-400 hover:text-red-500"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Badge de non lu */}
                        {!notification.read && (
                          <div className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer avec statistiques */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <p>
              {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''} affichée{filteredNotifications.length > 1 ? 's' : ''}
            </p>
            <button
              onClick={() => window.location.href = '/settings/notifications'}
              className="inline-flex items-center text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              <Settings className="h-4 w-4 mr-1" />
              Paramètres de notification
            </button>
          </div>
        </div>
      </motion.div>
    </div>  );
};

export default NotificationsPage;
