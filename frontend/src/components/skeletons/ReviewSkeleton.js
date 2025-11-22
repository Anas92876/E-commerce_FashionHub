import React from 'react';

/**
 * ReviewSkeleton Component
 *
 * Loading skeleton for individual review
 */
export default function ReviewSkeleton() {
  return (
    <div className="card p-6 mb-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />

        <div className="flex-1 space-y-3">
          {/* User Info & Rating */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              {/* User Name */}
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
              {/* Date */}
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            </div>

            {/* Rating Stars */}
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />

          {/* Review Comment */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
          </div>

          {/* Verified Badge (optional) */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-32 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * ReviewListSkeleton Component
 *
 * Shows multiple review skeletons
 */
export function ReviewListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <ReviewSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * ReviewFormSkeleton Component
 *
 * Loading skeleton for review form
 */
export function ReviewFormSkeleton() {
  return (
    <div className="card p-6">
      <div className="space-y-4">
        {/* Title */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />

        {/* Rating Input */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Review Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
        </div>

        {/* Review Comment */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * ReviewStatsSkeleton Component
 *
 * Loading skeleton for review statistics
 */
export function ReviewStatsSkeleton() {
  return (
    <div className="card p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Rating */}
        <div className="text-center space-y-3">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto animate-pulse" />
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mx-auto animate-pulse" />
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
