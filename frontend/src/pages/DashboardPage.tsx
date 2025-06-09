import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  Heart,
  MapPin,
  Plus,
  Star,
  Trash2,
  TrendingUp,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

// Import des services et contextes modernes
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { eventService } from '../services/eventService';
import type { Event } from '../types/event';

// Types pour le dashboard
interface DashboardStats {
  totalEventsCreated: number;
  totalEventsAttended: number;
  totalParticipants: number;
  totalViews: number;
  totalLikes: number;
  registeredEvents: number;
  upcomingEvents: number;
  pastEvents: number;
}

interface EventStats {
  eventId: string;
  title: string;
  views: number;
  likes: number;
  registrations: number;
  date: string;
}

interface RecentActivity {
  id: string;
  type: 'registration' | 'like' | 'comment' | 'event_created';
  eventId: string;
  eventTitle: string;
  timestamp: string;
  userInfo?: {
    username: string;
    avatar?: string;
  };
}

type TabType = 'overview' | 'my-events' | 'registered' | 'analytics';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { notifications, addNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalEventsCreated: 0,
    totalEventsAttended: 0,
    totalParticipants: 0,
    totalViews: 0,
    totalLikes: 0,
    registeredEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0
  });
  
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [eventAnalytics, setEventAnalytics] = useState<EventStats[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer toutes les données du dashboard en parallèle
      const [
        allEvents,
        userStats,
        activities,
        analytics
      ] = await Promise.all([
        eventService.getAllEvents(),
        fetchUserStats(),
        fetchRecentActivity(),
        fetchEventAnalytics()
      ]);
        // Extraire les données d'événements de la réponse API
      const eventsData = allEvents.data || [];
      
      // Filtrer les événements créés par l'utilisateur
      const userCreatedEvents = eventsData.filter(event => event.organizerId === user?.id);
        // Filtrer les événements où l'utilisateur s'est inscrit
      const userRegisteredEvents = eventsData.filter(event => 
        event.attendees?.includes(user?.id || '') && event.organizerId !== user?.id
      );
      
      setMyEvents(userCreatedEvents);
      setRegisteredEvents(userRegisteredEvents);
      setRecentActivity(activities);
      setEventAnalytics(analytics);
        // Calculer les statistiques
      const now = new Date();
      const upcomingCreated = userCreatedEvents.filter(event => 
        event.date && new Date(event.date) > now
      ).length;
      const pastCreated = userCreatedEvents.filter(event => 
        event.date && new Date(event.date) <= now
      ).length;
      const upcomingRegistered = userRegisteredEvents.filter(event => 
        event.date && new Date(event.date) > now
      ).length;

      const totalParticipants = userCreatedEvents.reduce((sum, event) => 
        sum + (event.attendees?.length || 0), 0
      );
      
      setStats({
        totalEventsCreated: userCreatedEvents.length,
        totalEventsAttended: userRegisteredEvents.length,
        totalParticipants,
        totalViews: analytics.reduce((sum, stat) => sum + stat.views, 0),
        totalLikes: analytics.reduce((sum, stat) => sum + stat.likes, 0),
        registeredEvents: upcomingRegistered,
        upcomingEvents: upcomingCreated,
        pastEvents: pastCreated
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    // Données simulées - à remplacer par l'API réelle
    return {
      totalEvents: 5,
      totalParticipants: 150,
      totalViews: 1250,
      totalLikes: 89
    };
  };

  const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
    // Données simulées - à remplacer par l'API réelle
    return [
      {
        id: '1',
        type: 'registration',
        eventId: 'event1',
        eventTitle: 'Conférence Tech 2025',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // Il y a 1h
        userInfo: {
          username: 'Marie Dubois',
          avatar: '/avatars/marie.jpg'
        }
      },
      {
        id: '2',
        type: 'like',
        eventId: 'event2',
        eventTitle: 'Atelier Cuisine',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // Il y a 2h
        userInfo: {
          username: 'Pierre Martin'
        }
      },
      {
        id: '3',
        type: 'event_created',
        eventId: 'event3',
        eventTitle: 'Marathon de Bordeaux',
        timestamp: new Date(Date.now() - 86400000).toISOString() // Il y a 1 jour
      }
    ];
  };

  const fetchEventAnalytics = async (): Promise<EventStats[]> => {
    // Données simulées - à remplacer par l'API réelle
    return [
      {
        eventId: 'event1',
        title: 'Conférence Tech 2025',
        views: 450,
        likes: 32,
        registrations: 156,
        date: '2025-03-15'
      },
      {
        eventId: 'event2',
        title: 'Atelier Cuisine',
        views: 280,
        likes: 18,
        registrations: 12,
        date: '2025-02-20'
      }
    ];
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId);
      toast.success('Événement supprimé avec succès');
      
      // Mettre à jour la liste des événements
      setMyEvents(prev => prev.filter(event => event._id !== eventId));
      
      addNotification({
        type: 'success',
        title: 'Événement supprimé',
        message: 'L\'événement a été supprimé avec succès'
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      toast.error(errorMessage);
    }
    
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await eventService.leaveEvent(eventId);
      toast.success('Désinscription réussie');
      
      // Mettre à jour la liste des événements inscrits
      setRegisteredEvents(prev => prev.filter(event => event._id !== eventId));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la désinscription';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'registration':
        return <Users className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4" />;
      case 'comment':
        return <Clock className="h-4 w-4" />;
      case 'event_created':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityMessage = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'registration':
        return `${activity.userInfo?.username || 'Un utilisateur'} s'est inscrit à`;
      case 'like':
        return `${activity.userInfo?.username || 'Un utilisateur'} a aimé`;
      case 'comment':
        return `${activity.userInfo?.username || 'Un utilisateur'} a commenté`;
      case 'event_created':
        return 'Vous avez créé';
      default:
        return 'Activité sur';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-500 mb-4">
              <AlertCircle className="mx-auto h-16 w-16" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête du dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bonjour, {user?.name} 👋
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Gérez vos événements et suivez vos activités
              </p>
            </div>
            <Link
              to="/events/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Créer un événement</span>
            </Link>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Événements créés</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalEventsCreated}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.upcomingEvents} à venir
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participants total</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalParticipants}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Dans vos événements
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vues totales</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalViews}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Sur vos événements
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Événements suivis</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalEventsAttended}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.registeredEvents} à venir
            </p>
          </motion.div>
        </div>

        {/* Navigation par onglets */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'my-events', label: 'Mes événements', icon: Calendar },
              { id: 'registered', label: 'Inscriptions', icon: CheckCircle2 },
              { id: 'analytics', label: 'Analytiques', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 px-3 py-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Activité récente</h2>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map(activity => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 p-2 bg-gray-100 rounded-full">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">
                                {getActivityMessage(activity)}
                              </span>
                              {' '}
                              <Link
                                to={`/events/${activity.eventId}`}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                {activity.eventTitle}
                              </Link>
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="mx-auto h-8 w-8 mb-2" />
                        <p>Aucune activité récente</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'my-events' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Mes événements</h2>
                    <Link
                      to="/events/new"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nouveau</span>
                    </Link>
                  </div>
                  
                  {myEvents.length > 0 ? (
                    <div className="space-y-4">
                      {myEvents.map(event => (
                        <div key={event._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{event.title}</h3>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(event.date)}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {event.location}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {event.attendees.length} participants
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/events/${event._id}`}
                                className="text-blue-600 hover:text-blue-700 p-2"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                to={`/events/${event._id}/edit`}
                                className="text-gray-600 hover:text-gray-700 p-2"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => {
                                  setEventToDelete(event._id || event.id);
                                  setDeleteModalOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700 p-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="mx-auto h-12 w-12 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucun événement créé</h3>
                      <p className="mb-4">Commencez par créer votre premier événement</p>
                      <Link
                        to="/events/new"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Créer un événement
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'registered' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Mes inscriptions</h2>
                  
                  {registeredEvents.length > 0 ? (
                    <div className="space-y-4">
                      {registeredEvents.map(event => (
                        <div key={event._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{event.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Organisé par {event.organizer.username}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(event.date)}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {event.location}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/events/${event._id}`}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Voir détails
                              </Link>
                              <button
                                onClick={() => handleLeaveEvent(event._id || event.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Se désinscrire
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <CheckCircle2 className="mx-auto h-12 w-12 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucune inscription</h3>
                      <p className="mb-4">Découvrez des événements intéressants</p>
                      <Link
                        to="/events"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Parcourir les événements
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Performances des événements</h2>
                  
                  {eventAnalytics.length > 0 ? (
                    <div className="space-y-4">
                      {eventAnalytics.map(stat => (
                        <div key={stat.eventId} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-3">{stat.title}</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{stat.views}</p>
                              <p className="text-sm text-gray-600">Vues</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{stat.registrations}</p>
                              <p className="text-sm text-gray-600">Inscriptions</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-600">{stat.likes}</p>
                              <p className="text-sm text-gray-600">Likes</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucune donnée disponible</h3>
                      <p>Créez des événements pour voir les statistiques</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications récentes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Notifications</h3>
              <div className="space-y-3">
                {notifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      notification.type === 'success' ? 'bg-green-50 border border-green-200' :
                      notification.type === 'error' ? 'bg-red-50 border border-red-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    {notification.message && (
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    )}
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Aucune notification</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <Link
                  to="/events/new"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Créer un événement</span>
                </Link>
                <Link
                  to="/events"
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Parcourir les événements</span>
                </Link>
                <Link
                  to="/profile"
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Modifier le profil</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {deleteModalOpen && eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteEvent(eventToDelete)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
