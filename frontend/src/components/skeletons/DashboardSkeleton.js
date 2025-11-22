import React from 'react';

/**
 * StatCardSkeleton Component
 *
 * Loading skeleton for dashboard stat cards
 */
export function StatCardSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse" />
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

/**
 * TableSkeleton Component
 *
 * Loading skeleton for data tables
 */
export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * DashboardSkeleton Component
 *
 * Complete dashboard loading skeleton
 */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="card p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse" />
        <TableSkeleton />
      </div>
    </div>
  );
}
