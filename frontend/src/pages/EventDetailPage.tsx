import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Heart,
  Mail,
  MapPin,
  Share2,
  Trash2,
  User,
  Users,
  X
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

// Import des services et contextes modernes
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { eventService } from '../services/eventService';
import type { Event, Participant } from '../types/index';

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
  const { addNotification } = useNotifications();  // States
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [stats, setStats] = useState<EventStats>({
    views: 0,
    likes: 0,
    shares: 0,
    comments: 0
  });
    // Nouveaux states pour les participants et le modal
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [modalType, setModalType] = useState<'subscribe' | 'unsubscribe'>('subscribe');

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
          setEvent(data);          // Vérifier si l'utilisateur est inscrit
          if (isAuthenticated && user) {
            const userIsRegistered = data.participants?.some((participantId) => 
              participantId === user.id
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
    };    loadEvent();
  }, [id, navigate, isAuthenticated, user]);
  // Chargement des participants (pour le propriétaire)
  const loadParticipants = useCallback(async () => {
    if (!event || !user || user.id !== event.createdById) return;
    
    try {
      setParticipantsLoading(true);
      const response = await eventService.getEventParticipants(event.id);
      if (response.success && response.data) {
        setParticipants(response.data.participants);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
      toast.error('Erreur lors du chargement des participants');
    } finally {
      setParticipantsLoading(false);
    }
  }, [event, user]);

  // Charger les participants après avoir chargé l'événement
  useEffect(() => {
    if (event && user && user.id === event.createdById) {
      loadParticipants();
    }
  }, [event, user, loadParticipants]);
  // Gestion de l'inscription/désinscription par email
  const handleEmailSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !subscribeEmail.trim()) return;

    try {
      setSubscribing(true);
      
      if (modalType === 'subscribe') {
        const response = await eventService.subscribeToEvent(event.id, {email: subscribeEmail.trim(), name: subscribeName || ''});
        if (response.success) {
          toast.success('Inscription réussie !');
          setShowSubscribeModal(false);
          setSubscribeEmail('');
          
          // Recharger les participants si c'est le propriétaire
          if (user && user.id === event.createdById) {
            loadParticipants();
          }
          
          // Mettre à jour le compteur de participants
          setEvent(prev => prev ? {
            ...prev,
            participants: [...(prev.participants || []), response.data?.id || '']
          } : null);
        }
      } else {
        const response = await eventService.unsubscribeFromEvent(event.id, subscribeEmail.trim());
        if (response.success) {
          toast.success('Désinscription réussie !');
          setShowSubscribeModal(false);
          setSubscribeEmail('');
          
          // Recharger les participants si c'est le propriétaire
          if (user && user.id === event.createdById) {
            loadParticipants();
          }
          
          // Mettre à jour le compteur de participants
          setEvent(prev => prev ? {
            ...prev,
            participants: (prev.participants || []).slice(0, -1) // Retirer un participant
          } : null);
        }
      }
    } catch (error) {
      console.error(`Erreur lors de l'${modalType === 'subscribe' ? 'inscription' : 'désinscription'}:`, error);
      toast.error(`Erreur lors de l'${modalType === 'subscribe' ? 'inscription' : 'désinscription'}`);
    } finally {
      setSubscribing(false);
    }
  };

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!event || !window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await eventService.deleteEvent(event.id);
      toast.success('Événement supprimé avec succès');
      navigate('/events');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      toast.error('Erreur lors de la suppression de l\'événement');
    }
  };  // Gestion de l'inscription
  const handleRegister = async () => {
    if (!isAuthenticated || !user?.email) {
      // Pour les utilisateurs non connectés, ouvrir le modal d'inscription par email
      setModalType('subscribe');
      setShowSubscribeModal(true);
      return;
    }

    if (!event) return;

    try {
      // Utiliser l'email de l'utilisateur connecté pour l'inscription
      const response = await eventService.subscribeToEvent(event.id, {email: user.email, name: user.name || ''});
      if (response.success) {
        setIsRegistered(true);
        toast.success('Inscription réussie !');
        // Ajouter une notification
        addNotification({
          title: 'Inscription réussie',
          type: 'success',
          message: `Vous êtes inscrit à l'événement "${event.title}"`,
        });

        // Recharger les participants si c'est le propriétaire
        if (user.id === event.createdById) {
          loadParticipants();
        }
        
        // Mettre à jour le compteur de participants
        setEvent(prev => prev ? {
          ...prev,
          participants: [...(prev.participants || []), response.data?.id || '']
        } : null);
      }
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      toast.error('Erreur lors de l\'inscription');
    }
  };

  // Ouvrir le modal de désinscription par email
  const handleUnsubscribeByEmail = () => {
    setModalType('unsubscribe');
    setShowSubscribeModal(true);
  };
  // Gestion de la désinscription
  const handleUnregister = async () => {
    if (!event || !user?.email) return;

    try {
      const response = await eventService.unsubscribeFromEvent(event.id, user.email);
      if (response.success) {
        setIsRegistered(false);
        toast.success('Désinscription réussie');
        
        // Recharger les participants si c'est le propriétaire
        if (user.id === event.createdById) {
          loadParticipants();
        }
        
        // Mettre à jour le compteur de participants
        setEvent(prev => prev ? {
          ...prev,
          participants: (prev.participants || []).slice(0, -1)
        } : null);
      }
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
      <div className="min-h-screen   dark:from-gray-950 dark:to-blue-950 dark:bg-gradient-to-br bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen   dark:from-gray-950 dark:to-blue-950 dark:bg-gradient-to-br bg-gray-50 flex items-center justify-center">
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
  console.log("Event details:", event);
  console.log("User details:", user);

  return (
    <div className="min-h-screen bg-gray-50 dark:from-gray-950 dark:to-blue-950 dark:bg-gradient-to-br">
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
              className="bg-white dark:bg-blue-900 dark:text-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <div className="prose max-w-none text-gray-700  dark:text-gray-300">
                {event.description}
              </div>
            </motion.div>

            {/* Organisateur */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-blue-900 dark:text-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Organisateur</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600 dark:text-blue-950 " />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-300">
                    {event.createdBy?.firstName} {event.createdBy?.lastName}
                  </h3>                  <p className="text-gray-600 dark:text-gray-400">{event.createdBy?.email}</p>
                </div>
              </div>
            </motion.div>

            {/* Liste des participants - visible seulement pour le propriétaire */}
            {isOwner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white dark:bg-blue-900 dark:text-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Participants ({participants.length})
                  </h2>
                  {participantsLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </div>
                
                {participantsLoading ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Chargement des participants...
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun participant inscrit pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-700 rounded-full flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {participant.name || participant.email}
                            </p>
                            {participant.name && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {participant.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(participant.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-blue-900 dark:text-white rounded-xl shadow-lg p-6"
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
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors dark:hover:bg-red-400 dark:bg-red-500"
                      >
                        Se désinscrire
                      </button>
                    ) : (
                      <button
                        onClick={ () => setShowSubscribeModal(true)}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors dark:hover:bg-blue-400 dark:bg-blue-500"
                      >                        S'inscrire
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
                        ? 'bg-red-50 border-red-200 text-red-600  dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:text-gray-300'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:text-gray-300'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    {stats.likes}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
              className="bg-white rounded-xl shadow-lg p-6 dark:bg-blue-900 dark:text-white"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-300">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lieu</p>
                    <p className="font-medium text-gray-900 dark:text-gray-300">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
                    <p className="font-medium text-gray-900 dark:text-gray-300">
                      {event.participants?.length || 0}
                      {event.maxParticipants && ` / ${event.maxParticipants}`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>          </div>
        </div>
      </div>

      {/* Modal d'inscription par email */}
      {showSubscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md"
          >            {/* Header du modal */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {modalType === 'subscribe' ? "S'inscrire à l'événement" : "Se désinscrire de l'événement"}
              </h3>
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Informations de l'événement */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {event?.title}
              </h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event?.date || '').toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event?.location}</span>
                </div>
              </div>
            </div>

            {/* Formulaire d'inscription */}
            <form onSubmit={handleEmailSubscribe} className="space-y-4">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="arona.tounkara@gmail.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
                            <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  value={subscribeName}
                  onChange={(e) => setSubscribeName(e.target.value)}
                  placeholder="Arona Tounkara"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  {modalType === 'subscribe' 
                    ? "Vous recevrez un email de confirmation et des rappels pour cet événement."
                    : "Entrez l'email avec lequel vous vous êtes inscrit pour vous désinscrire de l'événement."
                  }
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubscribeModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 
                           hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={subscribing || !subscribeEmail.trim()}
                  className={`flex-1 px-4 py-2 text-white rounded-lg 
                           hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-colors flex items-center justify-center gap-2 ${
                             modalType === 'subscribe' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                           }`}
                >
                  {subscribing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{modalType === 'subscribe' ? 'Inscription...' : 'Désinscription...'}</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>{modalType === 'subscribe' ? "S'inscrire" : "Se désinscrire"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
