import type { SearchSuggestion } from '@/services/eventService';
import { eventService } from '@/services/eventService';
import type { Event, EventFilters } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';

export interface UseSearchOptions {
  debounceMs?: number;
  minSearchLength?: number;
  enableSuggestions?: boolean;
  enableHistory?: boolean;
}

export interface SearchResult {
  events: Event[];
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
}

export interface SearchHistory {
  query: string;
  timestamp: Date;
  resultsCount: number;
}

export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    debounceMs = 300,
    minSearchLength = 2,
    enableSuggestions = true,
    enableHistory = true,
  } = options;

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<EventFilters>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  const debouncedQuery = useDebounce(query, debounceMs);

  // Charger l'historique depuis localStorage
  useEffect(() => {
    if (enableHistory) {
      const savedHistory = localStorage.getItem('search-history');
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          setSearchHistory(parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          })));
        } catch (error) {
          console.error('Error loading search history:', error);
        }
      }
    }
  }, [enableHistory]);

  // Sauvegarder l'historique dans localStorage
  const saveSearchHistory = useCallback((searchQuery: string, resultsCount: number) => {
    if (!enableHistory || searchQuery.length < minSearchLength) return;

    setSearchHistory(prev => {
      const newHistory = [
        { query: searchQuery, timestamp: new Date(), resultsCount },
        ...prev.filter(item => item.query !== searchQuery).slice(0, 19) // Garder les 20 dernières recherches
      ];
      
      localStorage.setItem('search-history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, [enableHistory, minSearchLength]);

  // Recherche principale
  const performSearch = useCallback(async (
    searchQuery: string = debouncedQuery,
    searchFilters: EventFilters = filters,
    page: number = 1,
    reset: boolean = true
  ) => {
    if (searchQuery.length < minSearchLength && !Object.keys(searchFilters).length) {
      if (reset) {
        setEvents([]);
        setSuggestions([]);
        setTotal(0);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await eventService.getEvents({
        search: searchQuery,
        filters: searchFilters,
        pagination: { page, limit: 12 }
      });

      if (response.success && response.data) {
        const newEvents = response.data.events;
        
        if (reset || page === 1) {
          setEvents(newEvents);
        } else {
          setEvents(prev => [...prev, ...newEvents]);
        }

        setTotal(response.data.total);
        setCurrentPage(page);

        // Sauvegarder dans l'historique
        if (searchQuery.length >= minSearchLength) {
          saveSearchHistory(searchQuery, response.data.total);
        }
      } else {
        setError(response.message || 'Erreur lors de la recherche');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, filters, minSearchLength, saveSearchHistory]);

  // Recherche de suggestions
  const loadSuggestions = useCallback(async (searchQuery: string) => {
    if (!enableSuggestions || searchQuery.length < minSearchLength) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await eventService.getSearchSuggestions(searchQuery);
      if (response.success && response.data) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  }, [enableSuggestions, minSearchLength]);

  // Effet pour déclencher la recherche automatique
  useEffect(() => {
    performSearch();
  }, [debouncedQuery, filters]);

  // Effet pour charger les suggestions
  useEffect(() => {
    if (query !== debouncedQuery) {
      loadSuggestions(query);
    }
  }, [query, loadSuggestions]);

  // Fonctions utilitaires
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setCurrentPage(1);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      performSearch(debouncedQuery, filters, currentPage + 1, false);
    }
  }, [isLoading, currentPage, debouncedQuery, filters, performSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({});
    setEvents([]);
    setSuggestions([]);
    setError(null);
    setTotal(0);
    setCurrentPage(1);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('search-history');
  }, []);

  const removeFromHistory = useCallback((queryToRemove: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item.query !== queryToRemove);
      localStorage.setItem('search-history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // Valeurs calculées
  const hasMore = useMemo(() => {
    return events.length < total;
  }, [events.length, total]);

  const hasResults = useMemo(() => {
    return events.length > 0;
  }, [events.length]);

  const hasQuery = useMemo(() => {
    return query.length >= minSearchLength || Object.keys(filters).length > 0;
  }, [query.length, minSearchLength, filters]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  return {
    // État
    query,
    filters,
    events,
    suggestions,
    isLoading,
    error,
    total,
    currentPage,
    searchHistory,
    
    // Valeurs calculées
    hasMore,
    hasResults,
    hasQuery,
    activeFiltersCount,
    
    // Actions
    updateQuery,
    updateFilters,
    clearFilters,
    loadMore,
    clearSearch,
    clearHistory,
    removeFromHistory,
    performSearch: () => performSearch(debouncedQuery, filters, 1, true),
  };
};
