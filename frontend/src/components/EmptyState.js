import React from 'react';
import { motion } from 'framer-motion';

/**
 * EmptyState Component
 *
 * Beautiful empty state with icon, title, description and optional action
 *
 * @param {string} icon - Emoji or icon character
 * @param {string} title - Main heading
 * @param {string} description - Supporting text
 * @param {ReactNode} action - Optional action button/link
 */
export default function EmptyState({
  icon = '📭',
  title = 'No items found',
  description,
  action
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Icon */}
      <motion.div
        className="text-8xl mb-6 opacity-30"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-2xl font-bold text-gray-900 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          className="text-gray-600 mb-6 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {description}
        </motion.p>
      )}

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * EmptyCart Component
 *
 * Pre-configured empty state for cart
 */
export function EmptyCart() {
  return (
    <EmptyState
      icon="🛒"
      title="Your cart is empty"
      description="Looks like you haven't added any items to your cart yet. Start shopping now!"
      action={
        <a
          href="/products"
          className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg inline-block"
        >
          Start Shopping
        </a>
      }
    />
  );
}

/**
 * EmptyOrders Component
 *
 * Pre-configured empty state for orders
 */
export function EmptyOrders({ onShopNow }) {
  return (
    <EmptyState
      icon="📦"
      title="No orders yet"
      description="You haven't placed any orders. Browse our collection and find something you love!"
      action={
        <button onClick={onShopNow} className="btn-primary">
          Browse Products
        </button>
      }
    />
  );
}

/**
 * EmptySearch Component
 *
 * Pre-configured empty state for search results
 */
export function EmptySearch({ query }) {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description={`We couldn't find any products matching "${query}". Try different keywords or browse our categories.`}
    />
  );
}

/**
 * EmptyWishlist Component
 *
 * Pre-configured empty state for wishlist
 */
export function EmptyWishlist({ onShopNow }) {
  return (
    <EmptyState
      icon="❤️"
      title="Your wishlist is empty"
      description="Save items you love so you can find them easily later!"
      action={
        <button onClick={onShopNow} className="btn-primary">
          Explore Products
        </button>
      }
    />
  );
}

/**
 * NoData Component
 *
 * Generic no data component for admin sections
 */
export function NoData({ title, description, action }) {
  return (
    <EmptyState
      icon="📊"
      title={title || 'No data available'}
      description={description || 'There is no data to display at this moment.'}
      action={action}
    />
  );
}
