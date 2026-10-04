import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
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

/**
 * Product tile used on the home page, product listing and wishlist.
 * The whole card links to the product (stretched link); the heart button sits
 * above that link so it can be pressed on its own.
 */
const ProductCard = ({ product, eager = false }) => {
  const image = productImage(product);
  const stock = product.totalStock ?? product.stock ?? 0;
  const colors = (product.variants || []).filter((v) => v.isActive !== false && v.color?.hex);
  const status = stock === 0 ? 'Sold out' : stock < 10 ? 'Low stock' : null;

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-stone-100 dark:bg-gray-800">
        {image ? (
          // native lazy loading; the 4:5 frame reserves the space so nothing jumps
          <img
            src={getImageUrl(image)}
            alt={product.name}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-stone-400">No image</div>
        )}

        {status && (
          <span
            className={`absolute left-3 top-3 rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ${
              stock === 0 ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'bg-white/90 text-ink dark:bg-gray-900/90 dark:text-white'
            }`}
          >
            {status}
          </span>
        )}

        <WishlistButton productId={product._id} className="absolute right-3 top-3 z-10" />
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-medium text-ink dark:text-white">
        <Link
          to={`/products/${product._id}`}
          className="focus:outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-primary-600 focus-visible:after:ring-offset-2"
        >
          {product.name}
        </Link>
      </h3>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <p className="truncate text-sm text-stone-500 dark:text-gray-400">{product.category}</p>
        <p className="flex-shrink-0 text-sm font-semibold text-ink dark:text-white">
          {product.hasVariablePricing && <span className="mr-1 font-normal text-stone-500 dark:text-gray-400">from</span>}
          ${productPrice(product).toFixed(2)}
        </p>
      </div>

      {(colors.length > 0 || product.numReviews > 0) && (
        <div className="mt-2 flex items-center justify-between gap-3">
          {colors.length > 0 ? (
            <ul className="flex items-center gap-1.5" aria-label={`Colors: ${colors.map((c) => c.color.name).join(', ')}`}>
              {colors.slice(0, 5).map((v) => (
                <li
                  key={v.sku}
                  title={v.color.name}
                  className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/15 dark:ring-white/20"
                  style={{ backgroundColor: v.color.hex }}
                />
              ))}
              {colors.length > 5 && <li className="text-xs text-stone-500">+{colors.length - 5}</li>}
            </ul>
          ) : (
            <span />
          )}
          {product.numReviews > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-stone-600 dark:text-gray-400">
              <StarIcon className="h-3.5 w-3.5 text-ink dark:text-white" aria-hidden="true" />
              {Number(product.rating).toFixed(1)}
              <span className="text-stone-400">({product.numReviews})</span>
              <span className="sr-only">out of 5 stars, {product.numReviews} reviews</span>
            </span>
          )}
        </div>
      )}
    </article>
  );
};

export default ProductCard;
