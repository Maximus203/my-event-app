import clsx from 'clsx';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import React from 'react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  showQuickJump?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  showQuickJump = false,
  maxVisiblePages = 7,
  className
}) => {
  // Calculer les pages visibles
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - halfVisible, 1);
    const end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    const pages = [];
    
    // Toujours inclure la première page
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    // Pages du milieu
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Toujours inclure la dernière page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleQuickJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      const page = parseInt(target.value);
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
        target.value = '';
      }
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={clsx('flex items-center justify-between', className)}>
      {/* Informations */}
      {showInfo && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Affichage de <span className="font-medium">{startItem}</span> à{' '}
          <span className="font-medium">{endItem}</span> sur{' '}
          <span className="font-medium">{totalItems}</span> résultats
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center space-x-2">
        {/* Bouton Précédent */}        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handlePageClick(currentPage - 1)}
          icon={<ChevronLeft className="h-4 w-4" />}
          className="px-2"
        >
          <span className="sr-only">Précédent</span>
        </Button>

        {/* Pages */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <div className="px-3 py-1 text-gray-500 dark:text-gray-400">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              ) : (
                <button
                  onClick={() => handlePageClick(page)}
                  className={clsx(
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    page === currentPage
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bouton Suivant */}        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => handlePageClick(currentPage + 1)}
          icon={<ChevronRight className="h-4 w-4" />}
          className="px-2"
        >
          <span className="sr-only">Suivant</span>
        </Button>

        {/* Saut rapide */}
        {showQuickJump && totalPages > 10 && (
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Aller à :
            </span>
            <input
              type="number"
              min="1"
              max={totalPages}
              placeholder="Page"
              onKeyPress={handleQuickJump}
              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
