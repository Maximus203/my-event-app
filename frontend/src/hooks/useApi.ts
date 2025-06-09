import { useToast } from '@/hooks/useToast';
import { useCallback, useState } from 'react';
import { useErrorHandler } from './useErrorHandler';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Opération réussie'
  } = options;

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      
      setData(result);
      
      if (showSuccessToast) {
        showToast({
          type: 'success',
          title: 'Succès',
          message: successMessage
        });
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      
      if (showErrorToast) {
        handleError(errorObj);
      }
      
      if (onError) {
        onError(errorObj);
      }
      
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, showToast, handleError]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

// Hook spécialisé pour les requêtes avec pagination
interface UsePaginatedApiOptions<T> extends UseApiOptions<T> {
  pageSize?: number;
  initialPage?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const usePaginatedApi = <T = any>(
  apiFunction: (page: number, pageSize: number, ...args: any[]) => Promise<PaginatedResponse<T>>,
  options: UsePaginatedApiOptions<PaginatedResponse<T>> = {}
) => {
  const { pageSize = 10, initialPage = 1, ...apiOptions } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const { data, loading, error, execute, reset } = useApi(
    (page: number, size: number, ...args: any[]) => apiFunction(page, size, ...args),
    apiOptions
  );

  const loadPage = useCallback(async (page: number, ...args: any[]) => {
    setCurrentPage(page);
    return execute(page, pageSize, ...args);
  }, [execute, pageSize]);

  const nextPage = useCallback((...args: any[]) => {
    if (data && currentPage < data.totalPages) {
      return loadPage(currentPage + 1, ...args);
    }
    return Promise.resolve(data);
  }, [data, currentPage, loadPage]);

  const previousPage = useCallback((...args: any[]) => {
    if (currentPage > 1) {
      return loadPage(currentPage - 1, ...args);
    }
    return Promise.resolve(data);
  }, [currentPage, loadPage, data]);

  const goToPage = useCallback((page: number, ...args: any[]) => {
    if (page >= 1 && (!data || page <= data.totalPages)) {
      return loadPage(page, ...args);
    }
    return Promise.resolve(data);
  }, [data, loadPage]);

  return {
    data: data?.data || [],
    pagination: {
      current: currentPage,
      total: data?.total || 0,
      pageSize,
      totalPages: data?.totalPages || 0
    },
    loading,
    error,
    loadPage,
    nextPage,
    previousPage,
    goToPage,
    reset
  };
};
