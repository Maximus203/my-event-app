import type { Event } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
    SlidersHorizontal as AdjustmentsHorizontalIcon,
    List as ListBulletIcon,
    Search as MagnifyingGlassIcon,
    Grid3X3 as Squares2X2Icon
} from 'lucide-react';
import React from 'react';
import Badge from './Badge';
import { Button } from './Button';
import { EventCard } from './EventCard';
import { LoadingSpinner } from './LoadingSpinner';

interface SearchResultsProps {
  events: Event[];
  total: number;
  isLoading: boolean;
  query: string;
  hasMore: boolean;
  onLoadMore: () => void;
  className?: string;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showViewToggle?: boolean;
  emptyStateMessage?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  events,
  total,
  isLoading,
  query,
  hasMore,
  onLoadMore,
  className = "",
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true,
  emptyStateMessage
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading && events.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Recherche en cours...
        </p>
      </div>
    );
  }

  if (!isLoading && events.length === 0 && query) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Aucun résultat trouvé
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {emptyStateMessage || `Nous n'avons trouvé aucun événement correspondant à "${query}". Essayez de modifier vos critères de recherche.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary">Vérifiez l'orthographe</Badge>
          <Badge variant="secondary">Utilisez des mots-clés plus généraux</Badge>
          <Badge variant="secondary">Essayez différents filtres</Badge>
        </div>
      </div>
    );
  }

  if (!isLoading && events.length === 0 && !query) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <AdjustmentsHorizontalIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Commencez votre recherche
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Utilisez la barre de recherche ci-dessus pour trouver des événements qui vous intéressent.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* En-tête des résultats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {total} événement{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
            </h2>
            {query && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Pour la recherche "{query}"
              </p>
            )}
          </div>
        </div>

        {/* Contrôles d'affichage */}
        {showViewToggle && onViewModeChange && (
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="Vue grille"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="Vue liste"
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        <AnimatePresence>
          {events.map((event) => (
            <motion.div
              key={event.id}
              variants={itemVariants}
              layout
              className={viewMode === 'list' ? 'w-full' : ''}
            >
              <EventCard
                event={event}
                variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
                className="h-full"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Bouton "Charger plus" */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="min-w-32"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Chargement...
              </>
            ) : (
              `Charger plus d'événements`
            )}
          </Button>
        </div>
      )}

      {/* Indicateur de chargement pendant le chargement de plus d'éléments */}
      {isLoading && events.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <LoadingSpinner size="sm" />
            Chargement d'événements supplémentaires...
          </div>
        </div>
      )}

      {/* Message de fin */}
      {!hasMore && events.length > 0 && !isLoading && (
        <div className="flex justify-center mt-8">
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full">
            Vous avez vu tous les événements disponibles
          </div>
        </div>
      )}
    </div>
  );
};
