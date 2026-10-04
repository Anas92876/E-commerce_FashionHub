import React from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useWishlist } from '../context/WishlistContext';

// Heart toggle for saving a product. Safe to place inside a <Link> card:
// it stops the click from navigating.
const WishlistButton = ({ productId, className = '', size = 'md' }) => {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(productId);
  const iconSize = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const Icon = saved ? HeartSolid : HeartOutline;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`inline-flex items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 p-2 shadow-md ring-1 ring-gray-200 dark:ring-gray-700 hover:scale-110 transition-transform ${className}`}
    >
      <Icon className={`${iconSize} ${saved ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`} />
    </button>
  );
};

export default WishlistButton;
