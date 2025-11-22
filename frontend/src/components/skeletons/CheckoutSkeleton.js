import React from 'react';

/**
 * CheckoutSkeleton Component
 *
 * Loading skeleton for checkout page
 */
export default function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Page Title */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse mb-8" />

          {/* Shipping Address Section */}
          <div className="card p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6 animate-pulse" />

            <div className="space-y-4">
              {/* Form Fields */}
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="card p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6 animate-pulse" />

            <div className="space-y-3">
              {/* Payment Options */}
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border dark:border-gray-700 rounded-lg">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
                  </div>
                  <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Order Notes Section */}
          <div className="card p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4 animate-pulse" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6 animate-pulse" />

            {/* Order Items */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t dark:border-gray-700 my-4" />

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
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

            {/* Place Order Button */}
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

            {/* Security Note */}
            <div className="mt-4 flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
