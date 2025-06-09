import type { EventFilters as IEventFilters } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  SlidersHorizontal as AdjustmentsHorizontalIcon,
  Calendar as CalendarIcon,
  Euro as CurrencyEuroIcon,
  MapPin as MapPinIcon,
  Tag as TagIcon,
  X as XMarkIcon
} from 'lucide-react';
import React, { useState } from 'react';
import Badge from './Badge';
import { Button } from './Button';
import { Input } from './Input';

interface EventFiltersProps {
  filters: IEventFilters;
  onFiltersChange: (filters: Partial<IEventFilters>) => void;
  onClearFilters: () => void;
  className?: string;
  compact?: boolean;
}

const EVENT_CATEGORIES = [
  { value: 'conferences', label: 'Conférences', icon: '🎤' },
  { value: 'workshops', label: 'Ateliers', icon: '🛠️' },
  { value: 'networking', label: 'Networking', icon: '🤝' },
  { value: 'seminars', label: 'Séminaires', icon: '📚' },
  { value: 'webinars', label: 'Webinaires', icon: '💻' },
  { value: 'meetups', label: 'Meetups', icon: '👥' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'culture', label: 'Culture', icon: '🎭' },
  { value: 'music', label: 'Musique', icon: '🎵' },
  { value: 'food', label: 'Gastronomie', icon: '🍽️' },
];

const EVENT_FORMATS = [
  { value: 'in-person', label: 'En présentiel' },
  { value: 'online', label: 'En ligne' },
  { value: 'hybrid', label: 'Hybride' },
];

const PRICE_RANGES = [
  { value: 'free', label: 'Gratuit', min: 0, max: 0 },
  { value: 'low', label: '1€ - 50€', min: 1, max: 50 },
  { value: 'medium', label: '51€ - 200€', min: 51, max: 200 },
  { value: 'high', label: '201€ - 500€', min: 201, max: 500 },
  { value: 'premium', label: '500€+', min: 501, max: null },
];

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = "",
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && value !== '' && value !== false
  ).length;

  const handleFilterChange = (key: keyof IEventFilters, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    handleFilterChange('categories', newCategories.length > 0 ? newCategories : undefined);
  };

  const handlePriceRangeChange = (range: typeof PRICE_RANGES[0]) => {
    if (range.value === 'free') {
      handleFilterChange('isFree', true);
      handleFilterChange('minPrice', undefined);
      handleFilterChange('maxPrice', undefined);
    } else {
      handleFilterChange('isFree', false);
      handleFilterChange('minPrice', range.min);
      handleFilterChange('maxPrice', range.max);
    }
  };

  const getSelectedPriceRange = () => {
    if (filters.isFree) return 'free';
    
    const { minPrice, maxPrice } = filters;
    if (!minPrice && !maxPrice) return null;
    
    return PRICE_RANGES.find(range => 
      range.min === minPrice && range.max === maxPrice
    )?.value || 'custom';
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge variant="primary" size="sm" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Filtres
                  </h3>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-red-600 hover:text-red-700"
                      >
                        Effacer
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Contenu des filtres compacts */}
                <div className="space-y-4">
                  {/* Catégories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégories
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {EVENT_CATEGORIES.slice(0, 6).map((category) => (
                        <button
                          key={category.value}
                          onClick={() => handleCategoryToggle(category.value)}
                          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                            filters.categories?.includes(category.value)
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          <span>{category.icon}</span>
                          <span className="truncate">{category.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prix */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prix
                    </label>
                    <div className="space-y-2">
                      {PRICE_RANGES.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => handlePriceRangeChange(range)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                            getSelectedPriceRange() === range.value
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          <span>{range.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            Filtres
          </h3>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="primary">{activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700"
              >
                Effacer tout
              </Button>
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { id: 'categories', label: 'Catégories', icon: TagIcon },
            { id: 'location', label: 'Lieu', icon: MapPinIcon },
            { id: 'date', label: 'Date', icon: CalendarIcon },
            { id: 'price', label: 'Prix', icon: CurrencyEuroIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {activeTab === 'categories' && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {EVENT_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryToggle(category.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      filters.categories?.includes(category.value)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ville
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Paris, Lyon, Marseille..."
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Format
                </label>
                <div className="space-y-2">
                  {EVENT_FORMATS.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => handleFilterChange('format', 
                        filters.format === format.value ? undefined : format.value
                      )}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                        filters.format === format.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'date' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de début
                </label>
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                />
              </div>
            </div>
          )}

          {activeTab === 'price' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Gamme de prix
                </label>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handlePriceRangeChange(range)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                        getSelectedPriceRange() === range.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{range.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Prix personnalisé
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      placeholder="Min (€)"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', 
                        e.target.value ? Number(e.target.value) : undefined
                      )}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Max (€)"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', 
                        e.target.value ? Number(e.target.value) : undefined
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
