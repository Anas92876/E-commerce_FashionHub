import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * LazyImage Component
 *
 * Optimized lazy-loading image with:
 * - Intersection Observer for lazy loading
 * - Skeleton placeholder while loading
 * - Fade-in animation when loaded
 * - Automatic Unsplash optimization
 *
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Tailwind classes
 * @param {boolean} optimize - Auto-optimize Unsplash URLs
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  optimize = true,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before image enters viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Optimize Unsplash URLs
  const optimizedSrc = optimize && src?.includes('unsplash')
    ? `${src}${src.includes('?') ? '&' : '?'}w=800&q=80&fm=webp&fit=crop`
    : src;

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Skeleton Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {/* Actual Image */}
      {isInView && (
        <motion.img
          src={optimizedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
}

/**
 * ResponsiveImage Component
 *
 * Image with srcset for responsive loading
 */
export function ResponsiveImage({ src, alt, className }) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate responsive srcset for Unsplash
  const generateSrcSet = (baseUrl) => {
    if (!baseUrl?.includes('unsplash')) return '';

    const sizes = [400, 800, 1200, 1600];
    return sizes
      .map(size => `${baseUrl}?w=${size}&q=80&fm=webp ${size}w`)
      .join(', ');
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <img
        src={`${src}?w=800&q=80&fm=webp`}
        srcSet={generateSrcSet(src)}
        sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px"
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
      />
    </div>
  );
}

/**
 * BlurImage Component
 *
 * Image with blur placeholder (for hero sections)
 */
export function BlurImage({ src, alt, className, blurDataURL }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur Placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110"
        />
      )}

      {/* Actual Image */}
      <motion.img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className="relative w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

/**
 * ImageWithFallback Component
 *
 * Image with fallback if loading fails
 */
export function ImageWithFallback({
  src,
  fallback = '/placeholder-image.jpg',
  alt,
  className
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setImgSrc(fallback)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
