import React from 'react';

/**
 * Badge Component
 *
 * Flexible badge component for status indicators, tags, counts, etc.
 *
 * @param {string} variant - 'primary', 'success', 'warning', 'danger', 'info', 'gray'
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {boolean} dot - Show dot indicator
 * @param {string} className - Additional classes
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = ''
}) {
  const variants = {
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'primary' ? 'bg-primary-600' :
            variant === 'success' ? 'bg-green-600' :
            variant === 'warning' ? 'bg-yellow-600' :
            variant === 'danger' ? 'bg-red-600' :
            variant === 'info' ? 'bg-blue-600' :
            'bg-gray-600'
          }`}
        />
      )}
      {children}
    </span>
  );
}

/**
 * StatusBadge Component
 *
 * Pre-configured badges for common order/product statuses
 */
export function StatusBadge({ status }) {
  const statusConfig = {
    // Order statuses
    pending: { variant: 'warning', label: 'Pending', dot: true },
    processing: { variant: 'info', label: 'Processing', dot: true },
    shipped: { variant: 'primary', label: 'Shipped', dot: true },
    delivered: { variant: 'success', label: 'Delivered', dot: false },
    cancelled: { variant: 'danger', label: 'Cancelled', dot: false },

    // Product statuses
    'in-stock': { variant: 'success', label: 'In Stock', dot: true },
    'low-stock': { variant: 'warning', label: 'Low Stock', dot: true },
    'out-of-stock': { variant: 'danger', label: 'Out of Stock', dot: false },

    // Message statuses
    new: { variant: 'danger', label: 'New', dot: true },
    read: { variant: 'info', label: 'Read', dot: false },
    replied: { variant: 'success', label: 'Replied', dot: false },
  };

  const config = statusConfig[status?.toLowerCase()] || {
    variant: 'gray',
    label: status,
    dot: false
  };

  return (
    <Badge variant={config.variant} dot={config.dot}>
      {config.label}
    </Badge>
  );
}

/**
 * CountBadge Component
 *
 * Circular badge for counts (like notification badges)
 */
export function CountBadge({ count, variant = 'danger', max = 99 }) {
  const displayCount = count > max ? `${max}+` : count;

  if (!count || count === 0) return null;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[20px] h-5 px-1.5
        text-xs font-bold rounded-full
        ${variant === 'danger' ? 'bg-red-500 text-white' : ''}
        ${variant === 'primary' ? 'bg-primary-600 text-white' : ''}
        ${variant === 'success' ? 'bg-green-500 text-white' : ''}
      `}
    >
      {displayCount}
    </span>
  );
}

/**
 * DiscountBadge Component
 *
 * Special badge for discounts/sales
 */
export function DiscountBadge({ percentage }) {
  return (
    <div className="inline-flex items-center gap-1 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
      -{percentage}%
    </div>
  );
}
