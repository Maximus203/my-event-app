import { useSearch } from '@/hooks/useSearch';
import type { SearchSuggestion } from '@/services/eventService';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Search as MagnifyingGlassIcon,
  MapPin as MapPinIcon,
  Tag as TagIcon,
  X as XMarkIcon
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Badge from './Badge';

interface SearchBarProps {
  placeholder?: string;
  onResultsChange?: (results: any) => void;
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  isLoading?: boolean;
  autoFocus?: boolean;
  className?: string;
  showFilters?: boolean;
  compact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Rechercher des événements...",
  onResultsChange,
  onSearch,
  value: externalValue,
  onChange: externalOnChange,
  isLoading: externalLoading,
  autoFocus,
  className = "",
  showFilters = true,
  compact = false
}) => {  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query: internalQuery,
    filters,
    suggestions,
    searchHistory,
    activeFiltersCount,
    updateQuery: internalUpdateQuery,
    updateFilters,
    clearFilters,
    clearSearch,
    removeFromHistory,
    events,
    total,
    isLoading: internalLoading
  } = useSearch({
    enableSuggestions: true,
    enableHistory: true,
  });

  // Utiliser les props externes ou les valeurs internes
  const currentQuery = externalValue !== undefined ? externalValue : internalQuery;
  const currentLoading = externalLoading !== undefined ? externalLoading : internalLoading;
  
  const handleQueryChange = (newQuery: string) => {
    if (externalOnChange) {
      externalOnChange(newQuery);
    } else {
      internalUpdateQuery(newQuery);
    }
    
    if (onSearch) {
      onSearch(newQuery);
    }
  };

  // Gérer les clics extérieurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowHistory(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifier les changements de résultats
  useEffect(() => {
    if (onResultsChange) {
      onResultsChange({ events, total, isLoading: currentLoading });
    }
  }, [events, total, currentLoading, onResultsChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleQueryChange(value);
    setShowSuggestions(value.length > 0 && suggestions.length > 0);
    setShowHistory(value.length === 0 && searchHistory.length > 0);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (currentQuery.length === 0 && searchHistory.length > 0) {
      setShowHistory(true);
    } else if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleQueryChange(suggestion.title);
    setShowSuggestions(false);
    setShowHistory(false);
    inputRef.current?.blur();
  };

  const handleHistoryClick = (historyItem: any) => {
    handleQueryChange(historyItem.query);
    setShowHistory(false);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClearSearch = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'location':
        return <MapPinIcon className="w-4 h-4" />;
      case 'category':
        return <TagIcon className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Barre de recherche principale */}
      <div className={`relative ${compact ? 'w-full max-w-md' : 'w-full max-w-2xl'}`}>
        <div className={`
          relative flex items-center
          ${isFocused ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-300'}
          ${compact ? 'rounded-lg' : 'rounded-xl'}
          bg-white dark:bg-gray-800 transition-all duration-200
        `}>
          <MagnifyingGlassIcon className="absolute left-3 w-5 h-5 text-gray-400" />
          
          <input
            ref={inputRef}
            type="text"
            value={currentQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className={`
              w-full pl-10 pr-12 text-gray-900 dark:text-white
              bg-transparent border-0 focus:outline-none placeholder-gray-500
              ${compact ? 'py-2 text-sm' : 'py-3 text-base'}
            `}
          />

          {(currentQuery || activeFiltersCount > 0) && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Indicateur de filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="absolute -top-2 -right-2">
            <Badge variant="primary" size="sm">
              {activeFiltersCount}
            </Badge>
          </div>
        )}
      </div>

      {/* Suggestions et historique */}
      <AnimatePresence>
        {(showSuggestions || showHistory) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              absolute top-full left-0 right-0 mt-2 z-50
              bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700
              max-h-80 overflow-y-auto
            `}
          >
            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Suggestions
                </div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-gray-400">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {suggestion.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {suggestion.category}
                      </div>
                    </div>
                    <Badge variant="secondary" size="sm">
                      {suggestion.type}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Historique */}
            {showHistory && searchHistory.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Recherches récentes
                  </span>
                  <button
                    onClick={() => {/* clearHistory() */}}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Effacer
                  </button>
                </div>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <button
                      onClick={() => handleHistoryClick(item)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.query}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.resultsCount} résultat{item.resultsCount !== 1 ? 's' : ''}
                      </div>
                    </button>
                    <button
                      onClick={() => removeFromHistory(item.query)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtres rapides */}
      {showFilters && !compact && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Filtres rapides:
          </span>
            <button
            onClick={() => updateFilters({ category: 'conference' })}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.category === 'conference'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Conférences
          </button>
            <button
            onClick={() => updateFilters({ category: 'workshop' })}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.category === 'workshop'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Ateliers
          </button>
          
          <button
            onClick={() => updateFilters({ isFree: true })}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.isFree
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Gratuit
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      )}

      {/* Indicateur de chargement */}
      {currentLoading && (
        <div className="absolute top-full left-0 right-0 mt-2">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              Recherche en cours...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
