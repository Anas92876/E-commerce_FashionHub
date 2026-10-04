import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../../utils/api';
import SectionHeader from './SectionHeader';

// Smallest width that still looks sharp in a tile (tiles are ~400px wide)
const MIN_SHARP_WIDTH = 600;

/**
 * Cover photo for a category: the admin-uploaded image when it's large enough,
 * otherwise the category's best-rated product photo, so every tile is sharp.
 */
const CategoryPhoto = ({ category }) => {
  const [src, setSrc] = useState(category.coverImage || category.productImage);

  // Swap to the product photo if the loaded image is too small to look sharp
  const checkSize = useCallback(
    (img) => {
      if (img?.complete && img.naturalWidth > 0 && img.naturalWidth < MIN_SHARP_WIDTH && category.productImage && src !== category.productImage) {
        setSrc(category.productImage);
      }
    },
    [category.productImage, src]
  );

  if (!src) return null;

  return (
    <img
      ref={checkSize} // also covers images that were already cached before onLoad
      src={getImageUrl(src)}
      alt=""
      loading="lazy"
      decoding="async"
      onLoad={(e) => checkSize(e.currentTarget)}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  );
};

/**
 * Every real category with its cover photo and live product count.
 * Same 4:5 frame and treatment for every image so mixed sources still read
 * as one set.
 */
const CategoryGrid = ({ categories, loading }) => {
  if (!loading && categories.length === 0) return null;

  return (
    <section id="categories" aria-labelledby="categories-heading" className="scroll-mt-20 bg-canvas py-16 dark:bg-gray-950 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader id="categories-heading" title="Shop by category" linkTo="/products" linkLabel="All products" />

        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i} aria-hidden="true">
                  <div className="aspect-[4/5] animate-pulse rounded-lg bg-stone-200/70 dark:bg-gray-800 lg:aspect-[5/4]" />
                  <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-stone-200/70 dark:bg-gray-800" />
                </li>
              ))
            : categories.map((category) => (
                <li key={category._id}>
                  <Link
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-stone-200 dark:bg-gray-800 lg:aspect-[5/4]">
                      <CategoryPhoto category={category} />
                      {/* subtle shared tone so photos from different sources sit together */}
                      <div aria-hidden="true" className="absolute inset-0 bg-stone-900/[0.04]" />
                    </div>
                    <div className="mt-3 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                      <h3 className="text-base font-semibold text-ink dark:text-white">{category.name}</h3>
                      <span className="inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap text-sm text-stone-500 dark:text-gray-400">
                        {category.productCount} {category.productCount === 1 ? 'style' : 'styles'}
                        <ArrowRightIcon className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
};

export default CategoryGrid;
