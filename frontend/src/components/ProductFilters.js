import React, { useEffect, useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, CheckIcon } from '@heroicons/react/24/outline';

const optionClass = (selected) =>
  `w-full text-left px-3 py-2 rounded-lg transition-colors ${
    selected
      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
  }`;

const Section = ({ title, children }) => (
  <Disclosure defaultOpen>
    {({ open }) => (
      <>
        <Disclosure.Button className="flex justify-between w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
          <ChevronUpIcon className={`w-5 h-5 transition-transform text-gray-700 dark:text-gray-300 ${open ? '' : 'rotate-180'}`} />
        </Disclosure.Button>
        <Disclosure.Panel className="px-4 pt-4 pb-2">{children}</Disclosure.Panel>
      </>
    )}
  </Disclosure>
);

/**
 * Sidebar filters. `filters` holds the current values (strings, from the URL);
 * `onChange(patch)` updates some of them; `options` comes from /products/filters.
 */
const ProductFilters = ({ filters, options, categories, onChange, onClear, hasActiveFilters }) => {
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
    <div className="space-y-6">
      <Section title="Category">
        <div className="space-y-2">
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
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
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
                  className={`min-w-[2.75rem] px-3 py-2 rounded-lg text-sm font-medium ring-1 transition-colors ${
                    selected
                      ? 'bg-primary-600 text-white ring-primary-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 ring-gray-200 dark:ring-gray-600 hover:ring-primary-400'
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
                  className={`relative w-9 h-9 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 transition ${
                    selected ? 'ring-primary-600' : 'ring-gray-200 dark:ring-gray-600 hover:ring-primary-300'
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

      <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.inStock === 'true'}
          onChange={(e) => onChange({ inStock: e.target.checked ? 'true' : '' })}
          className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
        />
        <span className="font-semibold text-gray-900 dark:text-white">In stock only</span>
      </label>

      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default ProductFilters;
