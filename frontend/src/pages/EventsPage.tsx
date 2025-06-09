import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EventCard } from '../components/ui/EventCard';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { useSearch } from '../hooks/useSearch';
import { eventService } from '../services/eventService';
import type { Event } from '../types';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());

  // Utiliser le contexte d'authentification moderne
  const { user, isAuthenticated } = useAuth();
    // Hook de recherche avancée
  const {
    query: searchTerm,
    updateQuery: setSearchTerm,
    events: searchResults,
    isLoading: isSearching,
    hasQuery: hasSearched
  } = useSearch({
    debounceMs: 300
  });

  // Debounce pour les filtres
  const debouncedCategory = useDebounce(selectedCategory, 300);
  const debouncedSortBy = useDebounce(sortBy, 300);

  useEffect(() => {
    fetchEvents();
    loadLikedEvents();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, debouncedCategory, debouncedSortBy]);
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getAllEvents();
      const eventsData = response.data || [];
      console.log('Événements récupérés:', response
      );
      setEvents(eventsData);
      
      // Extraire les catégories uniques
      const uniqueCategories = Array.from(
        new Set(eventsData.flatMap((event: Event) => event.categories || []))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des événements';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadLikedEvents = () => {
    if (isAuthenticated && user) {
      const saved = localStorage.getItem(`liked_events_${user.id}`);
      if (saved) {
        setLikedEvents(new Set(JSON.parse(saved)));
      }
    }
  };
  const filterAndSortEvents = () => {
    let filtered = [...events];

  // Filtrage par catégorie
    if (debouncedCategory) {
      filtered = filtered.filter(event =>
        event.categories?.includes(debouncedCategory)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (debouncedSortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'location':
          return a.location.localeCompare(b.location);

        case 'popularity':
          return (b.attendees?.length || 0) - (a.attendees?.length || 0);
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });

    // Si on a une recherche active, utiliser les résultats de recherche
    if (hasSearched && searchTerm.trim()) {
      return; // Les résultats de recherche sont gérés par le hook useSearch
    }
  };
  const handleLikeEvent = async (eventId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Vous devez être connecté pour aimer un événement');
      return;
    }

    try {
      const newLikedEvents = new Set(likedEvents);
      const isLiked = likedEvents.has(eventId);

      if (isLiked) {
        newLikedEvents.delete(eventId);
        toast.success('Événement retiré des favoris');
      } else {
        newLikedEvents.add(eventId);
        toast.success('Événement ajouté aux favoris');
      }

      setLikedEvents(newLikedEvents);
      localStorage.setItem(`liked_events_${user.id}`, JSON.stringify([...newLikedEvents]));
    } catch {
      toast.error('Erreur lors de la mise à jour des favoris');
    }
  };  const handleShareEvent = async (event: Event) => {
    const shareUrl = `${window.location.origin}/events/${event._id || event.id}`;
    const shareText = `Découvrez cet événement : ${event.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Événement partagé !');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback si le partage natif échoue
          navigator.clipboard.writeText(shareUrl).then(() => {
            toast.success('Lien copié dans le presse-papiers !');
          }).catch(() => {
            toast.error('Impossible de copier le lien');
          });
        }
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas navigator.share
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Lien copié dans le presse-papiers !');
      }).catch(() => {
        toast.error('Impossible de copier le lien');
      });
    }
  };
  const getDisplayEvents = () => {
    if (hasSearched && searchTerm.trim()) {
      return searchResults;
    }
    
    let filtered = [...events];

    // Filtrage par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(event =>
        event.categories?.includes(selectedCategory)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'location':
          return a.location.localeCompare(b.location);
        case 'popularity':
          return (b.attendees?.length || 0) - (a.attendees?.length || 0);
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br dark:from-blue-950 dark:to-indigo-950 from-blue-50 to-indigo-100 pt-16">
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
      <div className="min-h-screen dark:from-blue-950 dark:to-indigo-950 bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchEvents}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayEvents = getDisplayEvents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 pt-16 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête moderne */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
            Découvrez les <span className="text-blue-600 dark:text-blue-400">Événements</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Trouvez et participez aux événements qui vous passionnent. 
            Connectez-vous avec votre communauté locale.
          </p>
        </div>

          {displayEvents.length > 0 ? (
          <div className={
            view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
          }>
            {displayEvents.map((event: Event) => (
              <EventCard
                key={event._id || event.id}
                event={event}
                variant={view === 'grid' ? 'vertical' : 'horizontal'}
                onLike={() => handleLikeEvent(event._id || event.id)}
                onShare={() => handleShareEvent(event)}
              />
            ))}
          </div>):(<div>
            <div className="text-center text-xl mt-14">Aucun événement trouvé</div>
          </div>)}
      </div>
    </div>
  );
};

export default EventsPage;
