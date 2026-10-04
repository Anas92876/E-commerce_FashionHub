import React from 'react';
import ProductCard from '../ProductCard';
import SectionHeader from './SectionHeader';

// Newest products (sorted by the date they were added to the store)
const NewArrivals = ({ products, loading }) => {
  if (!loading && products.length === 0) return null;

  return (
    <section aria-labelledby="new-arrivals-heading" className="bg-white py-16 dark:bg-gray-900 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          id="new-arrivals-heading"
          title="New arrivals"
          description="The latest additions to the store."
          linkTo="/products?sort=newest"
          linkLabel="View all"
        />

        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }, (_, i) => (
                <li key={i} aria-hidden="true">
                  <div className="aspect-[4/5] animate-pulse rounded-lg bg-stone-100 dark:bg-gray-800" />
                  <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-stone-100 dark:bg-gray-800" />
                  <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-stone-100 dark:bg-gray-800" />
                </li>
              ))
            : products.map((product) => (
                <li key={product._id}>
                  <ProductCard product={product} />
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
};

export default NewArrivals;
