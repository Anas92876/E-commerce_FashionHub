import React from 'react';
import { motion } from 'framer-motion';
import { InlineLoader } from './LoadingSpinner';

/**
 * Button Component
 *
 * Flexible button with variants, sizes, icons, and loading states
 *
 * @param {string} variant - 'primary', 'secondary', 'outline', 'ghost', 'danger'
 * @param {string} size - 'sm', 'md', 'lg', 'xl'
 * @param {boolean} loading - Show loading state
 * @param {boolean} disabled - Disabled state
 * @param {ReactNode} leftIcon - Icon before text
 * @param {ReactNode} rightIcon - Icon after text
 * @param {boolean} fullWidth - Full width button
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      {...props}
    >
      {loading && <InlineLoader />}
      {!loading && leftIcon && <span>{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span>{rightIcon}</span>}
    </motion.button>
  );
}

/**
 * IconButton Component
 *
 * Square button with just an icon
 */
export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <motion.button
      className={`
        inline-flex items-center justify-center
        rounded-lg font-medium
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variant === 'primary' ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500' : ''}
        ${variant === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500' : ''}
        ${variant === 'outline' ? 'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-gray-400 focus:ring-gray-500' : ''}
        ${variant === 'ghost' ? 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500' : ''}
        ${variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' : ''}
        ${sizes[size]}
        ${className}
      `}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      {...props}
    >
      {icon}
    </motion.button>
  );
}

/**
 * ButtonGroup Component
 *
 * Group buttons together with connected borders
 */
export function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!child) return null;

        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;

        return React.cloneElement(child, {
          className: `
            ${child.props.className || ''}
            ${!isFirst ? '-ml-px' : ''}
            ${!isFirst && !isLast ? 'rounded-none' : ''}
            ${isFirst ? 'rounded-r-none' : ''}
            ${isLast ? 'rounded-l-none' : ''}
          `,
        });
      })}
    </div>
  );
}

/**
 * SocialButton Component
 *
 * Pre-styled buttons for social media login
 */
export function SocialButton({ provider, children, ...props }) {
  const providerStyles = {
    google: 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50',
    facebook: 'bg-[#1877F2] text-white hover:bg-[#166FE5]',
    twitter: 'bg-[#1DA1F2] text-white hover:bg-[#1a8cd8]',
    github: 'bg-[#24292e] text-white hover:bg-[#1b1f23]',
  };

  return (
    <Button
      variant="outline"
      className={providerStyles[provider]}
      fullWidth
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * FloatingActionButton Component
 *
 * Circular FAB for primary actions (mobile-friendly)
 */
export function FloatingActionButton({ icon, onClick, className = '' }) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        bg-primary-600 text-white
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        focus:outline-none focus:ring-4 focus:ring-primary-300
        ${className}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {icon}
    </motion.button>
  );
}
