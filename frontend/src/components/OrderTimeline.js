import React from 'react';
import {
  CheckIcon,
  ClockIcon,
  CogIcon,
  TruckIcon,
  HomeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const STEPS = [
  { status: 'Pending', label: 'Order placed', icon: ClockIcon },
  { status: 'Processing', label: 'Processing', icon: CogIcon },
  { status: 'Shipped', label: 'Shipped', icon: TruckIcon },
  { status: 'Delivered', label: 'Delivered', icon: HomeIcon },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/**
 * Order progress: Placed -> Processing -> Shipped -> Delivered, with the time
 * each step happened (from order.statusHistory). Cancelled orders show where
 * they stopped.
 */
const OrderTimeline = ({ order }) => {
  const history = order.statusHistory || [];
  // Latest time each status was reached
  const reachedAt = {};
  history.forEach((entry) => {
    reachedAt[entry.status] = entry.at;
  });
  if (!reachedAt.Pending) reachedAt.Pending = order.createdAt;

  const cancelled = order.status === 'Cancelled';
  // Furthest step reached (for cancelled orders: the last step before cancelling)
  const currentIndex = cancelled
    ? Math.max(...STEPS.map((step, i) => (reachedAt[step.status] ? i : 0)))
    : Math.max(STEPS.findIndex((step) => step.status === order.status), 0);

  return (
    <div>
      <ol className="flex items-start" aria-label="Order progress">
        {STEPS.map((step, i) => {
          const done = i <= currentIndex;
          const isCurrent = i === currentIndex && !cancelled;
          const Icon = done && !isCurrent ? CheckIcon : step.icon;
          const when = reachedAt[step.status];

          return (
            <li key={step.status} className="relative flex-1 flex flex-col items-center text-center">
              {/* connector to the next step */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    i < currentIndex ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ring-4 ring-gray-50 dark:ring-gray-900 ${
                  done
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className={`mt-2 text-xs sm:text-sm font-semibold ${done ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {step.label}
                <span className="sr-only">{done ? ' (done)' : ' (not yet)'}</span>
              </span>
              <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 min-h-[1rem]">
                {done && when ? formatDate(when) : ''}
              </span>
            </li>
          );
        })}
      </ol>

      {cancelled && (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
          Cancelled{reachedAt.Cancelled ? ` on ${formatDate(reachedAt.Cancelled)}` : ''}
        </p>
      )}
    </div>
  );
};

export default OrderTimeline;
