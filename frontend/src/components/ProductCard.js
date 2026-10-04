import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import LazyImage from './LazyImage';
import WishlistButton from './WishlistButton';
import { getImageUrl } from '../utils/api';

// Main image: legacy `image`, else the first image of the first active variant
export const productImage = (product) =>
  product.image ||
  product.variants?.find((v) => v.isActive !== false && v.images?.length)?.images?.[0] ||
  '';

// Price shown on cards: lowest variant price for variant products
export const productPrice = (product) =>
  Number(product.displayPrice ?? product.basePrice ?? product.price ?? 0);

// Size labels: from active variants, else legacy sizes
const productSizes = (product) => {
  const fromVariants = (product.variants || [])
    .filter((v) => v.isActive !== false)
    .flatMap((v) => (v.sizes || []).map((s) => s.size));
  return [...new Set(fromVariants.length ? fromVariants : product.sizes || [])];
};

const ProductCard = ({ product }) => {
  const image = productImage(product);
  const stock = product.totalStock ?? product.stock ?? 0;
  const sizes = productSizes(product);
  const colors = (product.variants || []).filter((v) => v.isActive !== false && v.color?.hex);

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block h-full rounded-2xl bg-white/95 dark:bg-gray-800/95 shadow-sm dark:shadow-gray-900/50 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden hover:shadow-xl hover:ring-gray-300 dark:hover:ring-gray-600 transition-all"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-700">
        {image ? (
          <LazyImage
            src={getImageUrl(image)}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400 font-semibold">
            No Image
          </div>
        )}

        <WishlistButton productId={product._id} className="absolute top-3 right-3" />

        {stock === 0 && (
          <div className="absolute top-4 left-4 bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            Out of Stock
          </div>
        )}
        {stock > 0 && stock < 10 && (
          <div className="absolute top-4 left-4 bg-yellow-500 dark:bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            Low Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold">
            {product.category}
          </p>
          {product.numReviews > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
              <StarIcon className="w-4 h-4 text-yellow-400" aria-hidden="true" />
              {Number(product.rating).toFixed(1)}
              <span className="text-gray-400">({product.numReviews})</span>
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3" aria-label={`Colors: ${colors.map((c) => c.color.name).join(', ')}`}>
            {colors.slice(0, 6).map((v) => (
              <span
                key={v.sku}
                title={v.color.name}
                className="w-4 h-4 rounded-full ring-1 ring-gray-300 dark:ring-gray-600"
                style={{ backgroundColor: v.color.hex }}
              />
            ))}
            {colors.length > 6 && <span className="text-xs text-gray-500">+{colors.length - 6}</span>}
          </div>
        )}

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {sizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium"
              >
                {size}
              </span>
            ))}
            {sizes.length > 4 && (
              <span className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium">
                +{sizes.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {product.hasVariablePricing && <span className="text-sm font-medium mr-1">from</span>}
            ${productPrice(product).toFixed(2)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
            View
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
