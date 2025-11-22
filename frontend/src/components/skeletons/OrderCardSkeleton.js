import React from 'react';

/**
 * OrderCardSkeleton Component
 *
 * Loading skeleton for order cards
 */
export default function OrderCardSkeleton() {
  return (
    <div className="card p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          {/* Order ID */}
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          {/* Date */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        </div>
        <div className="space-y-2">
          {/* Status badge */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse" />
          {/* Price */}
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse ml-auto" />
        </div>
      </div>

      {/* Order items */}
      <div className="space-y-3 border-t dark:border-gray-700 pt-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4 pt-4 border-t dark:border-gray-700">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * OrderListSkeleton Component
 *
 * Shows multiple order card skeletons
 */
export function OrderListSkeleton({ count = 3 }) {
  return (
    <div>
      {[...Array(count)].map((_, index) => (
        <OrderCardSkeleton key={index} />
      ))}
    </div>
  );
}
