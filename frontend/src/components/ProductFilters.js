import React, { useEffect, useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, CheckIcon } from '@heroicons/react/24/outline';

const optionClass = (selected) =>
  `block w-full py-1.5 text-left text-sm transition-colors ${
    selected
      ? 'font-semibold text-ink underline underline-offset-4 dark:text-white'
      : 'text-stone-600 hover:text-ink dark:text-gray-400 dark:hover:text-white'
  }`;

const inputClass =
  'h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-ink focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white';

const Section = ({ title, children }) => (
  <Disclosure as="div" defaultOpen className="border-b border-stone-200 dark:border-gray-800">
    {({ open }) => (
      <>
        <Disclosure.Button className="flex w-full items-center justify-between py-4 text-left focus:outline-none focus-visible:underline">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink dark:text-white">{title}</span>
          <ChevronUpIcon className={`h-4 w-4 text-stone-500 transition-transform motion-reduce:transition-none dark:text-gray-400 ${open ? '' : 'rotate-180'}`} aria-hidden="true" />
        </Disclosure.Button>
        <Disclosure.Panel className="pb-5">{children}</Disclosure.Panel>
      </>
    )}
  </Disclosure>
);

/**
 * Sidebar filters. `filters` holds the current values (strings, from the URL);
 * `onChange(patch)` updates some of them; `options` comes from /products/filters.
 */
const ProductFilters = ({ filters, options, categories, onChange, onClear, hasActiveFilters, showCategories = true }) => {
  // Price inputs apply on "Apply"/Enter so typing doesn't refetch every keystroke
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');

  useEffect(() => {
    setMinPrice(filters.minPrice || '');
    setMaxPrice(filters.maxPrice || '');
  }, [filters.minPrice, filters.maxPrice]);

  const applyPrice = (e) => {
    e.preventDefault();
    onChange({ minPrice, maxPrice });
  };

  return (
    <div className="border-t border-stone-200 dark:border-gray-800">
      {showCategories && (
      <Section title="Category">
        <div>
          <button onClick={() => onChange({ category: '' })} className={optionClass(!filters.category)}>
            All Products
          </button>
          {categories.map((cat) => (
            <button key={cat._id} onClick={() => onChange({ category: cat.name })} className={optionClass(filters.category === cat.name)}>
              {cat.name}
            </button>
          ))}
        </div>
      </Section>
      )}

      <Section title="Price">
        <form onSubmit={applyPrice} className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="min-price">Minimum price</label>
            <input
              id="min-price"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder={options?.minPrice ? `$${Math.floor(options.minPrice)}` : 'Min'}
              className={inputClass}
            />
            <span className="text-gray-400">–</span>
            <label className="sr-only" htmlFor="max-price">Maximum price</label>
            <input
              id="max-price"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={options?.maxPrice ? `$${Math.ceil(options.maxPrice)}` : 'Max'}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="h-10 w-full rounded-md border border-ink text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-ink"
          >
            Apply price
          </button>
        </form>
      </Section>

      {options?.sizes?.length > 0 && (
        <Section title="Size">
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((size) => {
              const selected = filters.size === size;
              return (
                <button
                  key={size}
                  onClick={() => onChange({ size: selected ? '' : size })}
                  aria-pressed={selected}
                  className={`h-10 min-w-[2.75rem] rounded-md border px-3 text-sm font-medium transition-colors ${
                    selected
                      ? 'border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-ink'
                      : 'border-stone-300 bg-white text-ink hover:border-ink dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-white'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {options?.colors?.length > 0 && (
        <Section title="Color">
          <div className="flex flex-wrap gap-3">
            {options.colors.map((color) => {
              const selected = filters.color?.toLowerCase() === color.name.toLowerCase();
              return (
                <button
                  key={color.name}
                  onClick={() => onChange({ color: selected ? '' : color.name })}
                  aria-pressed={selected}
                  aria-label={color.name}
                  title={color.name}
                  className={`relative w-9 h-9 rounded-full ring-2 ring-offset-2 ring-offset-canvas dark:ring-offset-gray-950 transition ${
                    selected ? 'ring-ink dark:ring-white' : 'ring-stone-200 hover:ring-stone-400 dark:ring-gray-700'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {selected && (
                    <CheckIcon className="absolute inset-0 m-auto w-5 h-5 text-white mix-blend-difference" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <label className="flex cursor-pointer items-center gap-3 border-b border-stone-200 py-4 dark:border-gray-800">
        <input
          type="checkbox"
          checked={filters.inStock === 'true'}
          onChange={(e) => onChange({ inStock: e.target.checked ? 'true' : '' })}
          className="h-4 w-4 rounded border-stone-400 text-ink focus:ring-primary-600 dark:border-gray-600"
        />
        <span className="text-sm font-medium text-ink dark:text-white">In stock only</span>
      </label>

      {hasActiveFilters && (
        <button
          onClick={onClear}
          type="button"
          className="mt-5 text-sm font-medium text-stone-600 underline underline-offset-4 hover:text-ink dark:text-gray-400 dark:hover:text-white"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default ProductFilters;
