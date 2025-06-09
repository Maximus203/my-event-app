import type { ToastMessage } from '@/types/toast';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';

import { ToastContext } from '@/contexts/ToastContext';

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-hide toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  }, [hideToast]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);  return (
    <ToastContext.Provider value={{ 
      toasts, 
      showToast, 
      addToast: showToast, // Alias pour compatibilité
      hideToast, 
      clearAllToasts 
    }}>
      {children}
    </ToastContext.Provider>
  );
};
