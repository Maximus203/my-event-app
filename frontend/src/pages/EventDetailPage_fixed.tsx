import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Edit,
    Heart,
    MapPin,
    Share2,
    Trash2,
    User,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

// Import des services et contextes modernes
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { eventService } from '../services/eventService';

// Type pour les données d'événement du backend
interface BackendEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  maxParticipants?: number;
  imageUrl?: string;
  bannerImage?: string;
  videoUrl?: string;
  isActive: boolean;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdById: string;
  participants: Array<{
    id: string;
    email: string;
    name?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Types pour les interactions
interface EventStats {
  views: number;
  likes: number;
  shares: number;
  comments: number;
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  // States
  const [event, setEvent] = useState<BackendEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [stats, setStats] = useState<EventStats>({
    views: 0,
    likes: 0,
    shares: 0,
    comments: 0
  });

  // Chargement de l'événement
  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        navigate('/events');
        return;
      }

      try {
        setLoading(true);
        const response = await eventService.getEventById(id);
        
        if (response.success && response.data) {
          const data = response.data;
          setEvent(data);
          
          // Vérifier si l'utilisateur est inscrit
          if (isAuthenticated && user) {
            const userIsRegistered = data.participants?.some((p) => 
              p.id === user.id || p.email === user.email
            ) || false;
            setIsRegistered(userIsRegistered);
          }
          
          // Stats factices pour la démo
          setStats({
            views: Math.floor(Math.random() * 500) + 100,
            likes: data.participants?.length || 0,
            shares: Math.floor(Math.random() * 50),
            comments: Math.floor(Math.random() * 20)
          });
        } else {
          toast.error('Événement non trouvé');
          navigate('/events');
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'événement:', err);
        toast.error('Erreur lors du chargement de l\'événement');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, navigate, isAuthenticated, user]);

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!event || !window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await eventService.deleteEvent(event.id);
      toast.success('Événement supprimé avec succès');
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      toast.error('Erreur lors de la suppression de l\'événement');
    }
  };

  // Gestion de l'inscription
  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour vous inscrire');
      navigate('/login');
      return;
    }

    if (!event) return;

    try {
      await eventService.registerForEvent(event.id);
      setIsRegistered(true);
      toast.success('Inscription réussie !');
      
      // Ajouter une notification
      addNotification({
        title: 'Inscription réussie',
        type: 'success',
        message: `Vous êtes inscrit à l'événement "${event.title}"`,
      });
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      toast.error('Erreur lors de l\'inscription');
    }
  };

  // Gestion de la désinscription
  const handleUnregister = async () => {
    if (!event) return;

    try {
      await eventService.unregisterFromEvent(event.id);
      setIsRegistered(false);
      toast.success('Désinscription réussie');
    } catch (err) {
      console.error('Erreur lors de la désinscription:', err);
      toast.error('Erreur lors de la désinscription');
    }
  };

  // Gestion du like
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour aimer un événement');
      return;
    }

    setIsLiked(!isLiked);
    setStats(prev => ({ ...prev, likes: isLiked ? prev.likes - 1 : prev.likes + 1 }));
  };

  // Gestion du partage
  const handleShare = async () => {
    try {
      await navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
      setStats(prev => ({ ...prev, shares: prev.shares + 1 }));
    } catch {
      // Fallback pour les navigateurs qui ne supportent pas l'API Share
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  // Statut de l'inscription
  const getRegistrationStatus = () => {
    if (!event) return 'unknown';
    if (event.participants && event.maxParticipants && event.participants.length >= event.maxParticipants) return 'full';
    return 'open';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Événement non trouvé</h2>
          <Link to="/events" className="text-blue-600 hover:text-blue-800">
            Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  const registrationStatus = getRegistrationStatus();
  const isOwner = user && user.id === event.createdById;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec image */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-700">
        <img
          src={event.imageUrl || '/placeholder-event.jpg'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Navigation */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
        </div>

        {/* Actions pour le propriétaire */}
        {isOwner && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Link
              to={`/events/${event.id}/edit`}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        )}

        {/* Titre de l'événement */}
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <Calendar className="h-5 w-5" />
                <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-5 w-5" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-5 w-5" />
                <span>{event.participants?.length || 0} participants</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none text-gray-700">
                {event.description}
              </div>
            </motion.div>

            {/* Organisateur */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Organisateur</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {event.createdBy?.firstName} {event.createdBy?.lastName}
                  </h3>
                  <p className="text-gray-600">{event.createdBy?.email}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="space-y-4">
                {/* Bouton d'inscription */}
                {!isOwner && (
                  <div>
                    {registrationStatus === 'full' ? (
                      <button
                        disabled
                        className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg cursor-not-allowed"
                      >
                        Événement complet
                      </button>
                    ) : isRegistered ? (
                      <button
                        onClick={handleUnregister}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Se désinscrire
                      </button>
                    ) : (
                      <button
                        onClick={handleRegister}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        S'inscrire
                      </button>
                    )}
                  </div>
                )}

                {/* Actions sociales */}
                <div className="flex gap-2">
                  <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
                      isLiked
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    {stats.likes}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    {stats.shares}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Informations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(event.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Lieu</p>
                    <p className="font-medium text-gray-900">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="font-medium text-gray-900">
                      {event.participants?.length || 0}
                      {event.maxParticipants && ` / ${event.maxParticipants}`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
