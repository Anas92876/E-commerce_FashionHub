import React from 'react';

/**
 * CartItemSkeleton Component
 *
 * Loading skeleton for individual cart items
 */
export function CartItemSkeleton() {
  return (
    <div className="card p-6 mb-4">
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0" />

        {/* Product Info */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              {/* Product Name */}
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
              {/* Category */}
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              {/* Size & Color */}
              <div className="flex gap-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
              </div>
            </div>

            {/* Delete Button */}
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>

          {/* Price & Quantity */}
          <div className="flex justify-between items-center pt-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-12 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CartSkeleton Component
 *
 * Complete cart page loading skeleton
 */
export default function CartSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          </div>

          {/* Cart Items */}
          {[...Array(3)].map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6 animate-pulse" />

            {/* Summary Items */}
            <div className="space-y-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t dark:border-gray-700 my-4" />

            {/* Total */}
            <div className="flex justify-between mb-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse" />
            </div>

            {/* Checkout Button */}
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4" />

            {/* Continue Shopping */}
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

            {/* Features */}
            <div className="mt-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
