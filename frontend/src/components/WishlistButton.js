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
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:bg-gray-900/90 dark:text-white dark:hover:bg-gray-900 ${className}`}
    >
      <Icon className={`${iconSize} ${saved ? 'text-red-600' : 'text-ink dark:text-white'}`} />
    </button>
  );
};

export default WishlistButton;
