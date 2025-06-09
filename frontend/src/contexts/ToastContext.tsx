import type { ToastContextType } from '@/types/toast';
import { createContext } from 'react';

export const ToastContext = createContext<ToastContextType | undefined>(undefined);