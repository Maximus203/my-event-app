export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void; // Alias pour compatibilité
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}
