import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ButtonSize, ButtonVariant } from './Button';

interface ButtonLinkProps {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent',
  success: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border-transparent',
  info: 'bg-cyan-600 hover:bg-cyan-700 text-white border-transparent',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border-transparent',
  outline: 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

export const ButtonLink = ({
  to,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  children,
}: ButtonLinkProps) => {
  return (
    <Link
      to={to}
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center font-medium rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        // Variant styles
        buttonVariants[variant],
        // Size styles
        buttonSizes[size],
        // State styles
        {
          'w-full': fullWidth,
        },
        className
      )}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </Link>
  );
};
