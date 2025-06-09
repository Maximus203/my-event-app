import { useToast } from '@/hooks/useToast';
import { useCallback, useState } from 'react';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface UseErrorHandlerReturn {
  error: ApiError | null;
  setError: (error: ApiError | null) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
  showErrorToast: (message: string, title?: string) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ApiError | null>(null);
  const { showToast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown) => {
    let apiError: ApiError;

    if (error instanceof Error) {
      apiError = {
        message: error.message,
        status: (error as any).status,
        code: (error as any).code,
      };
    } else if (typeof error === 'string') {
      apiError = { message: error };
    } else if (error && typeof error === 'object' && 'message' in error) {
      apiError = error as ApiError;
    } else {
      apiError = { message: 'Une erreur inattendue s\'est produite' };
    }

    setError(apiError);
    showToast({
      type: 'error',
      title: 'Erreur',
      message: apiError.message,
    });
  }, [showToast]);

  const showErrorToast = useCallback((message: string, title = 'Erreur') => {
    showToast({
      type: 'error',
      title,
      message,
    });
  }, [showToast]);

  return {
    error,
    setError,
    clearError,
    handleError,
    showErrorToast,
  };
};
