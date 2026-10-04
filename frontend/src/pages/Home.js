import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ProductGridSkeleton } from '../components/skeletons';
import LazyImage from '../components/LazyImage';
import ProductCard from '../components/ProductCard';
import HeroSection from '../components/home/HeroSection';
import BusinessCenters from '../components/home/BusinessCenters';
import ReviewCarousel from '../components/home/ReviewCarousel';
import ContactSection from '../components/home/ContactSection';
import { API_URL, getImageUrl } from '../utils/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allReviews, setAllReviews] = useState([]);

  // Featured products, categories and recent reviews in parallel
  useEffect(() => {
    const list = (res) => (Array.isArray(res?.data?.data) ? res.data.data : []);
    const fail = (what) => (error) => {
      console.error(`Error fetching ${what}:`, error);
      return null;
    };

    Promise.all([
      axios.get(`${API_URL}/products`, { params: { limit: 8, sort: 'newest' } }).catch(fail('products')),
      axios.get(`${API_URL}/categories`).catch(fail('categories')),
      axios.get(`${API_URL}/reviews/recent`, { params: { limit: 12 } }).catch(fail('reviews')),
    ]).then(([productsRes, categoriesRes, reviewsRes]) => {
      setFeaturedProducts(list(productsRes));
      setCategories(list(categoriesRes));
      setAllReviews(list(reviewsRes));
      setLoading(false);
    });
  }, []);

  return (
    <div className="home-container pt-16 bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />

      <HeroSection />

      {/* Modern Categories Section */}
      {categories.length > 0 && (
        <section className="py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-4xl font-bold text-center mb-12 font-heading text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Shop by Category
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -8 }}
                >
                  <Link
                    to={`/products?category=${category.name}`}
                    className="group relative h-96 block overflow-hidden rounded-2xl"
                  >
                    {category.image ? (
                      <LazyImage
                        src={getImageUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500 via-primary-700 to-gray-900 transition-transform duration-500 group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2 font-heading">{category.name}</h3>
                      <p className="text-gray-200 font-sans">Explore Collection</p>
                      <motion.div
                        className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={false}
                      >
                        <span className="inline-flex items-center gap-2 text-accent-400 font-semibold">
                          Shop Now
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-4xl font-bold text-center mb-12 font-heading text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Trending Now
          </motion.h2>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <motion.button
                  onClick={() => navigate('/products')}
                  className="px-8 py-4 bg-primary-600 dark:bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Products
                </motion.button>
              </div>
            </>
          ) : (
            <p className="text-center text-xl text-gray-600 dark:text-gray-400 py-12">
              No products available at the moment.
            </p>
          )}
        </div>
      </section>

      <BusinessCenters />

      {/* Customer Reviews Section */}
      <section className="py-20 bg-gradient-to-br from-white via-primary-50 to-accent-50 dark:from-gray-900 dark:via-primary-900/20 dark:to-accent-900/20 relative overflow-hidden transition-colors duration-300">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-200 dark:bg-primary-800 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-200 dark:bg-accent-800 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real experiences from our valued customers who love our products
            </p>
          </motion.div>

          {allReviews.length > 0 ? (
            <ReviewCarousel reviews={allReviews} />
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 mb-4">
                <svg className="w-10 h-10 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">No reviews yet</p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>

      <ContactSection />

      <Footer />
    </div>
  );
};

export default Home;
