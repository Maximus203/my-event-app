import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Download, Filter, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Button, Input, LoadingSpinner } from '.';

export interface Column<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  selectable?: boolean;
  actions?: (row: T, index: number) => React.ReactNode;
}

type SortDirection = 'asc' | 'desc' | null;

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  sortable = true,
  filterable = false,
  exportable = false,
  pageSize = 10,
  emptyMessage = 'Aucune donnée disponible',
  onRowClick,
  className,
  rowClassName,
  selectedRows = [],
  onSelectionChange,
  selectable = false,
  actions
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Données filtrées et triées
  const processedData = useMemo(() => {
    let result = [...data];

    // Recherche
    if (searchTerm.trim()) {
      result = result.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          return value && 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Tri
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue === bValue) return 0;
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else {
          comparison = aValue < bValue ? -1 : 1;
        }
        
        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection, columns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = processedData.slice(startIndex, endIndex);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    if (sortColumn === column.key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column.key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedRows.length === paginatedData.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...paginatedData]);
    }
  };

  const handleSelectRow = (row: T) => {
    if (!onSelectionChange) return;
    
    const isSelected = selectedRows.some(selected => 
      JSON.stringify(selected) === JSON.stringify(row)
    );
    
    if (isSelected) {
      onSelectionChange(selectedRows.filter(selected => 
        JSON.stringify(selected) !== JSON.stringify(row)
      ));
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const isRowSelected = (row: T) => {
    return selectedRows.some(selected => 
      JSON.stringify(selected) === JSON.stringify(row)
    );
  };

  const handleExport = () => {
    // TODO: Implémenter l'export CSV/Excel
    console.log('Export data:', processedData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={clsx('bg-white dark:bg-gray-800 rounded-lg shadow', className)}>
      {/* Header avec recherche et actions */}
      {(searchable || filterable || exportable) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {searchable && (
              <div className="flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              {filterable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<Filter className="h-4 w-4" />}
                >
                  Filtres
                </Button>
              )}
              
              {exportable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  icon={<Download className="h-4 w-4" />}
                >
                  Exporter
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && sortColumn === column.key && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={clsx(
                            'h-3 w-3',
                            sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'
                          )}
                        />
                        <ChevronDown 
                          className={clsx(
                            'h-3 w-3 -mt-1',
                            sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={clsx(
                    'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                    onRowClick && 'cursor-pointer',
                    isRowSelected(row) && 'bg-blue-50 dark:bg-blue-900/20',
                    rowClassName && rowClassName(row, startIndex + index)
                  )}
                  onClick={() => onRowClick && onRowClick(row, startIndex + index)}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isRowSelected(row)}
                        onChange={() => handleSelectRow(row)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td 
                      key={column.key}
                      className={clsx(
                        'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
                        column.className
                      )}
                    >
                      {column.render 
                        ? column.render(row[column.key], row, startIndex + index)
                        : row[column.key]
                      }
                    </td>
                  ))}
                  
                  {actions && (
                    <td className="px-4 py-3 text-right text-sm">
                      <div onClick={(e) => e.stopPropagation()}>
                        {actions(row, startIndex + index)}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de {startIndex + 1} à {Math.min(endIndex, processedData.length)} sur {processedData.length} résultats
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Précédent
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    Math.abs(page - currentPage) <= 2
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] < page - 1 && (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={clsx(
                          'px-3 py-1 rounded text-sm',
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))
                }
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
