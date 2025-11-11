import React from 'react';

/**
 * ProductDetailsSkeleton Component
 *
 * Loading skeleton for product details page
 */
export default function ProductDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery Skeleton */}
        <div>
          {/* Main Image */}
          <div className="aspect-square rounded-2xl bg-gray-200 animate-pulse mb-4" />

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          {/* Badges and Rating */}
          <div className="flex items-center gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <div className="h-12 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="flex gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="flex gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex gap-4">
            <div className="w-32 h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 rounded-xl">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mt-12 space-y-6">
        <div className="flex gap-6 border-b">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="mt-12">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
