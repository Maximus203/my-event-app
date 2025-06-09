import type { ThemeContextType } from '@/types/theme';
import { createContext } from 'react';

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
