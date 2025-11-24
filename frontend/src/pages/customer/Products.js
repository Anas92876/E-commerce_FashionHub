import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ProductGridSkeleton } from '../../components/skeletons';
import LazyImage from '../../components/LazyImage';
import { EmptySearch } from '../../components/EmptyState';
import { API_URL, getImageUrl } from '../../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/categories`);
        setCategories(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 12,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (sortBy) params.sort = sortBy;

      const { data } = await axios.get(`${API_URL}/products`, { params });

      setProducts(Array.isArray(data?.data) ? data.data : []);
      setTotalPages(data?.pages || 1);
      setTotalProducts(data?.total || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Set defaults on error
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedCategory || sortBy;

  // Filters Component
  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex justify-between w-full py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <span className="font-semibold text-gray-900 dark:text-white">Category</span>
              <ChevronUpIcon className={`w-5 h-5 transition-transform text-gray-700 dark:text-gray-300 ${open ? '' : 'rotate-180'}`} />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.name ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen  overflow-x-hidden flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 transition-colors duration-300">
      <Navbar />

      {/* Header (clean transparent, no background or ring) */}
      <div className="relative pt-1 w-screen overflow-x-hidden">
        {/* Decorative gradient lights */}
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

          {/* Heading */}
          <motion.h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Collection
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-base sm:text-lg text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Discover{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{totalProducts}</span>{" "}
            amazing products curated just for you.
          </motion.p>

          {/* Accent bar & stat pill */}
          <div className="mt-6 flex items-center justify-between">
            <span className="inline-block h-1 w-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400" />
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              🛍️ <span className="font-medium">{totalProducts}</span> items
            </span>
          </div>
        </div>
      </div>






      {/* Main Content */}
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-28 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-sm dark:shadow-gray-900/50 ring-1 ring-gray-200 dark:ring-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h3>
              <FiltersContent />
            </div>
          </aside>

          {/* Mobile Filters Button */}
          <div className="lg:hidden -mt-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/90 dark:bg-gray-800/90 ring-1 ring-gray-200 dark:ring-gray-700 font-medium hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm text-gray-900 dark:text-white"
            >
              <FunnelIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Filters{' '}
              {hasActiveFilters &&
                `(${[searchTerm, selectedCategory, sortBy].filter(Boolean).length})`}
            </button>
          </div>

          {/* Main Products Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Showing <span className="font-semibold">{products.length}</span> of{' '}
                <span className="font-semibold">{totalProducts}</span> products
              </p>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
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

            {/* Products Grid */}
            {loading ? (
              <ProductGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <EmptySearch query={searchTerm || 'your criteria'} />
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
                      <Link
                        to={`/products/${product._id}`}
                        className="group block rounded-2xl bg-white/95 dark:bg-gray-800/95 shadow-sm dark:shadow-gray-900/50 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden hover:shadow-xl hover:ring-gray-300 dark:hover:ring-gray-600 transition-all"
                      >
                        {/* Image */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-700">
                          {product.image ? (
                            <LazyImage
                              src={getImageUrl(product.image)}
                              alt={product.name}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400 font-semibold">
                              No Image
                            </div>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute top-4 right-4 bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                              Out of Stock
                            </div>
                          )}
                          {product.stock > 0 && product.stock < 10 && (
                            <div className="absolute top-4 left-4 bg-yellow-500 dark:bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                              Low Stock
                            </div>
                          )}
                        </div>


                        {/* Product Info */}
                        <div className="p-5">
                          <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold mb-1">
                            {product.category}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                            {product.description}
                          </p>

                          {/* Sizes */}
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {product.sizes.slice(0, 4).map((size, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium"
                                >
                                  {size}
                                </span>
                              ))}
                              {product.sizes.length > 4 && (
                                <span className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium">
                                  +{product.sizes.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              ${product.price}
                            </span>
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                              View
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-6 mt-14">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
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
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
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
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 rounded-r-2xl shadow-2xl dark:shadow-gray-900/50 z-50 lg:hidden overflow-y-auto"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'tween' }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
                <FiltersContent />
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
