import React from 'react';

/**
 * ProfileSkeleton Component
 *
 * Loading skeleton for user profile page
 */
export default function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />

          <div className="flex-1 space-y-3">
            {/* Name */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
            {/* Email */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse" />
            {/* Role Badge */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="card p-6">
        <div className="space-y-6">
          {/* Section Title */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />

          {/* Form Fields */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="card p-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * ProfileHeaderSkeleton Component
 *
 * Compact skeleton for profile header only
 */
export function ProfileHeaderSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
