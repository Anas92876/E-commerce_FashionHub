import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { ProductGridSkeleton } from '../../components/skeletons';
import { EmptySearch } from '../../components/EmptyState';
import ProductCard from '../../components/ProductCard';
import ProductFilters from '../../components/ProductFilters';
import SearchBox from '../../components/SearchBox';
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
    />
  );

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 transition-colors duration-300">
      <SEO
        title={filters.search ? `Search: ${filters.search}` : filters.category || 'Shop All Products'}
        description="Browse our collection of premium fashion. Filter by size, color and price."
      />
      <Navbar />

      {/* Header */}
      <div className="relative pt-1 w-screen overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Products</span>
          </div>

          <motion.h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Collection
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Discover <span className="font-semibold text-gray-900 dark:text-white">{totalProducts}</span> amazing products curated just for you.
          </motion.p>

          <SearchBox initialValue={filters.search} className="mt-6 max-w-xl" />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-28 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-sm dark:shadow-gray-900/50 ring-1 ring-gray-200 dark:ring-gray-700 p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h2>
              {filtersPanel}
            </div>
          </aside>

          {/* Mobile Filters Button */}
          <div className="lg:hidden -mt-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/90 dark:bg-gray-800/90 ring-1 ring-gray-200 dark:ring-gray-700 font-medium hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm text-gray-900 dark:text-white"
            >
              <FunnelIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {/* Main Products Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Showing <span className="font-semibold">{products.length}</span> of{' '}
                <span className="font-semibold">{totalProducts}</span> products
              </p>

              <label className="sr-only" htmlFor="sort-by">Sort by</label>
              <select
                id="sort-by"
                value={filters.sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="px-4 py-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition text-sm font-medium shadow-sm text-gray-900 dark:text-white"
              >
                <option value="">Sort By: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Best Rating</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Active filter chips */}
            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => removeChip(chip.key)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    {chip.label}
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                ))}
                <button onClick={clearFilters} className="text-sm text-gray-500 dark:text-gray-400 underline hover:text-gray-700 dark:hover:text-gray-200">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-6 mt-14">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-6 py-3 rounded-xl bg-white/90 dark:bg-gray-800/90 ring-1 ring-gray-200 dark:ring-gray-700 font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      ← Previous
                    </button>

                    <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                      Page <span className="font-semibold">{currentPage}</span> of{' '}
                      <span className="font-semibold">{totalPages}</span>
                    </span>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-6 py-3 rounded-xl bg-white/90 dark:bg-gray-800/90 ring-1 ring-gray-200 dark:ring-gray-700 font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-gray-800 rounded-r-2xl shadow-2xl dark:shadow-gray-900/50 z-50 lg:hidden overflow-y-auto"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'tween' }}
              role="dialog"
              aria-label="Filters"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
                {filtersPanel}
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
