import { Button, EventFilters, SearchBar, SearchResults } from '@/components/ui';
import { useSearch } from '@/hooks/useSearch';
import type { Event } from '@/types';
import { motion } from 'framer-motion';
import {
    SlidersHorizontal as AdjustmentsHorizontalIcon,
    Search as MagnifyingGlassIcon,
    X as XMarkIcon
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    query,
    filters,
    events,
    suggestions,
    searchHistory,
    isLoading,
    error,
    total,
    hasMore,
    activeFiltersCount,
    updateQuery,
    updateFilters,
    clearFilters,
    loadMore,
    clearSearch
  } = useSearch({
    enableSuggestions: true,
    enableHistory: true,
  });

  // Initialiser la recherche depuis les paramètres URL
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlCategory = searchParams.get('category');
    const urlCity = searchParams.get('city');
    const urlStartDate = searchParams.get('startDate');
    const urlEndDate = searchParams.get('endDate');
    const urlIsFree = searchParams.get('isFree');

    if (urlQuery && urlQuery !== query) {
      updateQuery(urlQuery);
    }

    const newFilters: any = {};
    if (urlCategory) newFilters.category = urlCategory;
    if (urlCity) newFilters.city = urlCity;
    if (urlStartDate) newFilters.startDate = urlStartDate;
    if (urlEndDate) newFilters.endDate = urlEndDate;
    if (urlIsFree) newFilters.isFree = urlIsFree === 'true';

    if (Object.keys(newFilters).length > 0) {
      updateFilters(newFilters);
    }
  }, []);

  // Mettre à jour l'URL quand la recherche change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (query) {
      params.set('q', query);
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        params.set(key, String(value));
      }
    });

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    if (newUrl !== window.location.search) {
      setSearchParams(params);
    }
  }, [query, filters, setSearchParams]);

  const handleResultsChange = (results: { events: Event[]; total: number; isLoading: boolean }) => {
    // Callback pour gérer les changements de résultats si nécessaire
    console.log('Results updated:', results);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* En-tête */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Rechercher des événements
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Découvrez des événements qui vous intéressent grâce à notre moteur de recherche avancé
            </p>
          </motion.div>

          {/* Barre de recherche */}
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
            <SearchBar
              placeholder="Rechercher par nom, description, lieu, organisateur..."
              onResultsChange={handleResultsChange}
              showFilters={false}
              className="mb-4"
            />
            
            {/* Contrôles de recherche */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant={showFilters ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  Filtres avancés
                  {activeFiltersCount > 0 && (
                    <span className="bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                {(query || activeFiltersCount > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearSearch();
                      setSearchParams({});
                    }}
                    className="text-red-600 hover:text-red-700 flex items-center gap-2"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Effacer la recherche
                  </Button>
                )}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                {total > 0 && (
                  <span>
                    {total} résultat{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Contenu principal */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filtres latéraux */}
              <motion.div
                variants={itemVariants}
                className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}
              >
                <div className="sticky top-8">
                  <EventFilters
                    filters={filters}
                    onFiltersChange={updateFilters}
                    onClearFilters={clearFilters}
                  />

                  {/* Historique de recherche */}
                  {searchHistory.length > 0 && (
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <MagnifyingGlassIcon className="w-4 h-4" />
                        Recherches récentes
                      </h3>
                      <div className="space-y-2">
                        {searchHistory.slice(0, 5).map((item, index) => (
                          <button
                            key={index}
                            onClick={() => updateQuery(item.query)}
                            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-900 dark:text-white truncate">
                                {item.query}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {item.resultsCount}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Résultats */}
              <motion.div variants={itemVariants} className="lg:col-span-3">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <p className="text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                )}

                <SearchResults
                  events={events}
                  total={total}
                  isLoading={isLoading}
                  query={query}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  showViewToggle={true}
                  emptyStateMessage={
                    !query ? 
                    "Commencez votre recherche en tapant des mots-clés ci-dessus." :
                    undefined
                  }
                />
              </motion.div>
            </div>
          </div>

          {/* Suggestions populaires */}
          {!query && !isLoading && events.length === 0 && (
            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recherches populaires
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Conférences tech',
                    'Formation marketing',
                    'Événements gratuits',
                    'Networking Paris',
                    'Ateliers créatifs',
                    'Séminaires business',
                    'Webinaires',
                    'Meetups développeurs'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => updateQuery(suggestion)}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>    </div>
  );
};

export default SearchPage;
