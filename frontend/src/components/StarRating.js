import React from 'react';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Read-only row of 5 stars (rating rounded to whole stars)
const StarRating = ({ rating = 0, className = 'w-4 h-4' }) => {
  const filled = Math.round(Number(rating) || 0);
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${Number(rating).toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) =>
        i < filled ? (
          <StarIconSolid key={i} className={`${className} text-yellow-400`} aria-hidden="true" />
        ) : (
          <StarIconOutline key={i} className={`${className} text-gray-300 dark:text-gray-600`} aria-hidden="true" />
        )
      )}
    </span>
  );
};

export default StarRating;
