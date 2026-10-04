import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdjustmentsHorizontalIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { ProductGridSkeleton } from '../../components/skeletons';
import { EmptySearch } from '../../components/EmptyState';
import ProductCard from '../../components/ProductCard';
import ProductFilters from '../../components/ProductFilters';
import PageHeader from '../../components/PageHeader';
import { API_URL } from '../../utils/api';

// All filters live in the URL (?search=&category=&size=...), so links like
// /products?category=Jeans work and filtered pages can be shared.
const FILTER_KEYS = ['search', 'category', 'minPrice', 'maxPrice', 'size', 'color', 'inStock', 'sort'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const filters = useMemo(
    () => Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams.get(key) || ''])),
    [searchParams]
  );
  const currentPage = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);
  const queryString = searchParams.toString();

  // Categories + filter options once
  useEffect(() => {
    axios
      .get(`${API_URL}/categories`)
      .then(({ data }) => setCategories(Array.isArray(data?.data) ? data.data : []))
      .catch((error) => console.error('Error fetching categories:', error));
    axios
      .get(`${API_URL}/products/filters`)
      .then(({ data }) => setFilterOptions(data?.data || null))
      .catch((error) => console.error('Error fetching filter options:', error));
  }, []);

  // Products whenever the URL changes
  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 12 };
        FILTER_KEYS.forEach((key) => {
          if (filters[key]) params[key] = filters[key];
        });

        const { data } = await axios.get(`${API_URL}/products`, { params });
        if (cancelled) return;
        setProducts(Array.isArray(data?.data) ? data.data : []);
        setTotalPages(data?.pages || 1);
        setTotalProducts(data?.total || 0);
      } catch (error) {
        console.error('Error fetching products:', error);
        if (cancelled) return;
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
    // queryString captures every filter + page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  // Update some filters; any filter change goes back to page 1
  const updateFilters = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete('page');
    setSearchParams(next);
  };

  const goToPage = (page) => {
    const next = new URLSearchParams(searchParams);
    if (page > 1) next.set('page', String(page));
    else next.delete('page');
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => setSearchParams({});

  const activeFilterCount = FILTER_KEYS.filter((key) => key !== 'sort' && filters[key]).length;
  const hasActiveFilters = activeFilterCount > 0 || Boolean(filters.sort);

  // Removable chips for the active filters
  const chips = [
    filters.search && { key: 'search', label: `"${filters.search}"` },
    filters.category && { key: 'category', label: filters.category },
    (filters.minPrice || filters.maxPrice) && {
      key: 'price',
      label: `$${filters.minPrice || 0} – ${filters.maxPrice ? `$${filters.maxPrice}` : 'any'}`,
    },
    filters.size && { key: 'size', label: `Size ${filters.size}` },
    filters.color && { key: 'color', label: filters.color },
    filters.inStock && { key: 'inStock', label: 'In stock' },
  ].filter(Boolean);

  const removeChip = (key) =>
    updateFilters(key === 'price' ? { minPrice: '', maxPrice: '' } : { [key]: '' });

  const filtersPanel = (
    <ProductFilters
      filters={filters}
      options={filterOptions}
      categories={categories}
      onChange={updateFilters}
      onClear={clearFilters}
      hasActiveFilters={hasActiveFilters}
      showCategories={false}
    />
  );

  const heading = filters.search
    ? { eyebrow: 'Search', title: 'Results for', accent: `“${filters.search}”` }
    : filters.category
      ? { eyebrow: 'Category', title: filters.category, accent: '' }
      : { eyebrow: 'Shop', title: 'The', accent: 'collection.' };

  const categoryTabClass = (selected) =>
    `whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors focus:outline-none focus-visible:text-ink ${
      selected
        ? 'border-ink text-ink dark:border-white dark:text-white'
        : 'border-transparent text-stone-500 hover:text-ink dark:text-gray-400 dark:hover:text-white'
    }`;

  const pageButtonClass =
    'flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-stone-300 disabled:hover:bg-transparent disabled:hover:text-ink dark:border-gray-700 dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-ink dark:disabled:hover:bg-transparent dark:disabled:hover:text-white';

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-canvas pt-16 dark:bg-gray-950">
      <SEO
        title={filters.search ? `Search: ${filters.search}` : filters.category || 'Shop All Products'}
        description="Browse our collection of premium fashion. Filter by size, color and price."
      />
      <Navbar />

      {/* Header */}
      <header className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <PageHeader
            eyebrow={heading.eyebrow}
            title={heading.title}
            accent={heading.accent}
            intro={
              loading && !totalProducts
                ? 'Everyday staples and considered statement pieces.'
                : `${totalProducts} ${totalProducts === 1 ? 'style' : 'styles'} — everyday staples and considered statement pieces, delivered free.`
            }
          />
        </div>

        {/* Category tabs */}
        <nav aria-label="Categories" className="mt-10 border-b border-stone-200 dark:border-gray-800">
          <ul className="-mb-px flex gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <li>
              <button
                type="button"
                onClick={() => updateFilters({ category: '' })}
                aria-current={!filters.category ? 'page' : undefined}
                className={categoryTabClass(!filters.category)}
              >
                All
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <button
                  type="button"
                  onClick={() => updateFilters({ category: cat.name })}
                  aria-current={filters.category === cat.name ? 'page' : undefined}
                  className={categoryTabClass(filters.category === cat.name)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden w-64 flex-shrink-0 lg:block" aria-label="Filters">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
              <h2 className="text-2xl font-medium text-ink dark:text-white">Filters</h2>
              <div className="mt-4">{filtersPanel}</div>
            </div>
          </aside>

          {/* Main Products Area */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-stone-300 px-4 text-sm font-semibold text-ink transition-colors hover:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:border-gray-700 dark:text-white dark:hover:border-white lg:hidden"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" aria-hidden="true" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
                <p className="text-sm text-stone-600 dark:text-gray-400" aria-live="polite">
                  {loading ? 'Loading…' : (
                    <>
                      Showing <span className="font-semibold text-ink dark:text-white">{products.length}</span> of{' '}
                      <span className="font-semibold text-ink dark:text-white">{totalProducts}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-sm text-stone-600 dark:text-gray-400">
                  Sort by
                </label>
                <select
                  id="sort-by"
                  value={filters.sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="h-11 rounded-md border border-stone-300 bg-white pl-3 pr-9 text-sm font-medium text-ink focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Featured</option>
                  <option value="newest">Newest first</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="rating-desc">Best rating</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {chips.length > 0 && (
              <div className="mb-8 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeChip(chip.key)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-white"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    {chip.label}
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-1 text-sm font-medium text-stone-600 underline underline-offset-4 hover:text-ink dark:text-gray-400 dark:hover:text-white"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <ProductGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <EmptySearch query={filters.search || 'your filters'} />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav aria-label="Pagination" className="mt-16 flex items-center justify-center gap-6">
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                      className={pageButtonClass}
                    >
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <span className="text-sm text-stone-600 dark:text-gray-400">
                      Page <span className="font-semibold text-ink dark:text-white">{currentPage}</span> of{' '}
                      <span className="font-semibold text-ink dark:text-white">{totalPages}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      aria-label="Next page"
                      className={pageButtonClass}
                    >
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-canvas shadow-2xl dark:bg-gray-950 lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'tween' }}
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-medium text-ink dark:text-white">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    className="rounded-full p-2 text-ink transition-colors hover:bg-sand dark:text-white dark:hover:bg-gray-800"
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                {filtersPanel}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="mt-8 h-12 w-full rounded-md bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Show {totalProducts} {totalProducts === 1 ? 'style' : 'styles'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Products;
