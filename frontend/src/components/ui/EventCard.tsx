import type { Event } from '@/types';
import { formatDate, formatPrice } from '@/utils/formatters';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Eye as EyeIcon,
  Heart as HeartIcon,
  Heart as HeartSolidIcon,
  MapPin as MapPinIcon,
  Share2 as ShareIcon,
  Users as UsersIcon
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import { Button } from './Button';

interface EventCardProps {
  event: Event;
  variant?: 'vertical' | 'horizontal' | 'compact';
  showActions?: boolean;
  onLike?: (eventId: string) => void;
  onShare?: (event: Event) => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'vertical',
  showActions = true,
  onLike,
  onShare,
  className = ""
}) => {
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLike) {
      onLike(event.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onShare) {
      onShare(event);
    }
  };
  const getStatusBadge = () => {
    const now = new Date();
    const startDate = event.startDate ? new Date(event.startDate) : new Date(event.date || '');
    const endDate = event.endDate ? new Date(event.endDate) : new Date(event.date || '');

    if (now < startDate) {
      return <Badge variant="primary" size="sm">À venir</Badge>;
    } else if (now >= startDate && now <= endDate) {
      return <Badge variant="success" size="sm">En cours</Badge>;
    } else {
      return <Badge variant="secondary" size="sm">Terminé</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      conferences: '🎤',
      workshops: '🛠️',
      networking: '🤝',
      seminars: '📚',
      webinars: '💻',
      meetups: '👥',
      sports: '⚽',
      culture: '🎭',
      music: '🎵',
      food: '🍽️'
    };
    return icons[category] || '📅';
  };

  if (variant === 'compact') {
    return (
      <Link to={`/events/${event.id}`} className={`block ${className}`}>
        <motion.div
          whileHover={{ y: -2 }}
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
        >
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {event.title}
            </h3>            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-4 h-4" />
              <span className="truncate">{formatDate(event.startDate || event.date || '')}</span>
            </div>
          </div>
          {getStatusBadge()}
        </motion.div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/events/${event.id}`} className={`block ${className}`}>
        <motion.div
          whileHover={{ y: -2 }}
          className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
        >
          {/* Image */}
          {event.imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getCategoryIcon(event.category)}</span>
                  <Badge variant="secondary" size="sm">
                    {event.category}
                  </Badge>
                  {getStatusBadge()}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                  {event.title}
                </h3>
              </div>
              {showActions && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className="p-1"
                  >
                    {event.isLiked ? (
                      <HeartSolidIcon className="w-4 h-4 text-red-500" />
                    ) : (
                      <HeartIcon className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="p-1"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
              {event.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(event.startDate || event.date || '')}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="truncate max-w-32">{event.location}</span>
                  </div>
                )}                <div className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  <span>{(event.participants?.length || event.currentParticipants || 0)}/{event.maxParticipants || '∞'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {event.price && event.price > 0 ? (
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatPrice(event.price)}
                  </span>
                ) : (
                  <Badge variant="success" size="sm">Gratuit</Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Variant vertical (par défaut)
  return (
    <Link to={`/events/${event.id}`} className={`block ${className}`}>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* Image */}
        {event.imageUrl && (
          <div className="relative">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="text-xl bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center">
                {getCategoryIcon(event.category)}
              </span>
              {getStatusBadge()}
            </div>
            {showActions && (
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white p-2"
                >
                  {event.isLiked ? (
                    <HeartSolidIcon className="w-4 h-4 text-red-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white p-2"
                >
                  <ShareIcon className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Contenu */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" size="sm">
              {event.category}
            </Badge>
            {event.isFeatured && (
              <Badge variant="warning" size="sm">⭐ Recommandé</Badge>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
            {event.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
            {event.description}
          </p>

          <div className="space-y-2 mb-4">            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(event.startDate || event.date || '')}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPinIcon className="w-4 h-4" />
                <span className="truncate">{event.location}</span>
              </div>
            )}            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <UsersIcon className="w-4 h-4" />
              <span>{(event.participants?.length || event.currentParticipants || 0)}/{event.maxParticipants || '∞'} participants</span>
            </div>
          </div>

          <div className="flex items-center justify-between">            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              {(event.likesCount ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <HeartIcon className="w-4 h-4" />
                  <span>{event.likesCount}</span>
                </div>
              )}
              {(event.viewsCount ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{event.viewsCount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              {event.price && event.price > 0 ? (
                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                  {formatPrice(event.price)}
                </span>
              ) : (
                <Badge variant="success">Gratuit</Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
