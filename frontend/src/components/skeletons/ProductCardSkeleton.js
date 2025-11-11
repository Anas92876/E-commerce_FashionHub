import React from 'react';

/**
 * ProductCardSkeleton Component
 *
 * Loading skeleton for product cards
 * Shows while product data is being fetched
 */
export default function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />

        {/* Product name */}
        <div className="h-4 bg-gray-200 rounded animate-pulse" />

        {/* Rating */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>

        {/* Price and button */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-28 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * ProductGridSkeleton Component
 *
 * Shows a grid of skeleton product cards
 */
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
