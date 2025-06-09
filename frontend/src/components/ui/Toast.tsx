import { useToast } from '@/hooks/useToast';
import type { ToastMessage, ToastType } from '@/types/toast';
import { clsx } from 'clsx';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import React, { useEffect } from 'react';
import { Button } from './Button';

interface ToastProps {
  toast: ToastMessage;
}

const toastIcons: Record<ToastType, React.ReactElement> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
};

const Toast = ({ toast }: ToastProps) => {
  const { hideToast } = useToast();

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        hideToast(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, hideToast]);

  return (
    <div
      className={clsx(
        'flex items-start p-4 border rounded-lg shadow-lg max-w-md w-full transform transition-all duration-300 ease-in-out',
        toastStyles[toast.type]
      )}
    >
      <div className="flex-shrink-0 mr-3">
        {toastIcons[toast.type]}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="mt-1 text-sm opacity-80">{toast.message}</p>
        )}
        {toast.action && (
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={toast.action.onClick}
              className="text-xs"
            >
              {toast.action.label}
            </Button>
          </div>
        )}
      </div>
      
      <button
        onClick={() => hideToast(toast.id)}
        className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
