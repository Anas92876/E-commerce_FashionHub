import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingSpinner Component
 *
 * Animated loading spinner with different sizes
 * Uses Framer Motion for smooth animation
 *
 * @param {string} size - 'sm', 'md', 'lg', 'xl'
 * @param {string} className - Additional Tailwind classes
 */
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-[6px]',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} border-primary-200 border-t-primary-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

/**
 * LoadingOverlay Component
 *
 * Full-page loading overlay with spinner
 */
export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-center mt-4 text-gray-700 font-medium">{message}</p>
        )}
      </motion.div>
    </motion.div>
  );
}

/**
 * InlineLoader Component
 *
 * Small inline spinner for buttons or inline content
 */
export function InlineLoader() {
  return (
    <motion.div
      className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

/**
 * PageLoader Component
 *
 * Centered page loading state
 */
export function PageLoader({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        {message && (
          <motion.p
            className="mt-6 text-xl text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
}

/**
 * DotsLoader Component
 *
 * Three dots loading animation
 */
export function DotsLoader() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 },
  };

  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-primary-600 rounded-full"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}
