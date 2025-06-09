import { motion } from 'framer-motion';
import React from 'react';

interface TabOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  options: TabOption[];
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  value,
  onChange,
  options,
  variant = 'default',
  size = 'md',
  className = '',
  fullWidth = false
}) => {
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  const getTabClasses = (option: TabOption, isActive: boolean) => {
    const baseClasses = `
      relative font-medium transition-all duration-200 cursor-pointer
      ${sizeClasses[size]}
      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${fullWidth ? 'flex-1 text-center' : ''}
    `;

    switch (variant) {
      case 'pills':
        return `
          ${baseClasses}
          rounded-full
          ${isActive 
            ? 'bg-primary-500 text-white shadow-md' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        `;
      
      case 'underline':
        return `
          ${baseClasses}
          border-b-2 pb-2
          ${isActive 
            ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
          }
        `;
      
      default:
        return `
          ${baseClasses}
          rounded-lg
          ${isActive 
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        `;
    }
  };

  const containerClasses = `
    flex gap-1
    ${variant === 'default' ? 'bg-gray-100 dark:bg-gray-800 p-1 rounded-lg' : ''}
    ${variant === 'underline' ? 'border-b border-gray-200 dark:border-gray-700' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <div className={containerClasses}>
      {options.map((option) => {
        const isActive = value === option.value;
        
        return (
          <div
            key={option.value}
            className={getTabClasses(option, isActive)}
            onClick={() => !option.disabled && onChange(option.value)}
          >
            {/* Indicateur actif pour variant underline */}
            {variant === 'underline' && isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            
            {/* Indicateur actif pour variant pills */}
            {variant === 'pills' && isActive && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 bg-primary-500 rounded-full -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            
            {/* Indicateur actif pour variant default */}
            {variant === 'default' && isActive && (
              <motion.div
                layoutId="activeDefault"
                className="absolute inset-0 bg-primary-100 dark:bg-primary-900 rounded-lg -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            
            <div className="flex items-center gap-2 relative z-10">
              {option.icon && (
                <span className="flex-shrink-0">
                  {option.icon}
                </span>
              )}
              
              <span>{option.label}</span>
              
              {option.badge && (
                <span className={`
                  inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full
                  ${isActive 
                    ? 'bg-white/20 text-current' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {option.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Tabs;
