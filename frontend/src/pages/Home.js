import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ProductGridSkeleton } from '../components/skeletons';
import ProductCard from '../components/ProductCard';
import HeroSection from '../components/home/HeroSection';
import BusinessCenters from '../components/home/BusinessCenters';
import ReviewCarousel from '../components/home/ReviewCarousel';
import ContactSection from '../components/home/ContactSection';
import { API_URL } from '../utils/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allReviews, setAllReviews] = useState([]);

  // Featured products and recent reviews in parallel (the hero loads its own data)
  useEffect(() => {
    const list = (res) => (Array.isArray(res?.data?.data) ? res.data.data : []);
    const fail = (what) => (error) => {
      console.error(`Error fetching ${what}:`, error);
      return null;
    };

    Promise.all([
      axios.get(`${API_URL}/products`, { params: { limit: 8, sort: 'newest' } }).catch(fail('products')),
      axios.get(`${API_URL}/reviews/recent`, { params: { limit: 12 } }).catch(fail('reviews')),
    ]).then(([productsRes, reviewsRes]) => {
      setFeaturedProducts(list(productsRes));
      setAllReviews(list(reviewsRes));
      setLoading(false);
    });
  }, []);

  return (
    <div className="home-container pt-16 bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />

      <HeroSection />

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
