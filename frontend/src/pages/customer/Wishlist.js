import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import ProductCard from '../../components/ProductCard';
import { ProductGridSkeleton } from '../../components/skeletons';
import { EmptyWishlist } from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { API_URL } from '../../utils/api';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isSaved } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/wishlist' } } });
      return;
    }

    axios
      .get(`${API_URL}/wishlist`)
      .then(({ data }) => setProducts(data.data || []))
      .catch((error) => console.error('Error loading wishlist:', error))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  // Hide products un-hearted on this page right away
  const visible = products.filter((product) => isSaved(product._id));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 transition-colors duration-300">
      <SEO title="My Wishlist" description="Products you saved for later." />
      <Navbar />

      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-gray-700 dark:hover:text-gray-300">Home</Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300 font-medium">Wishlist</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">My Wishlist</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {loading ? 'Loading your saved products…' : `${visible.length} saved ${visible.length === 1 ? 'product' : 'products'}`}
        </p>

        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : visible.length === 0 ? (
          <EmptyWishlist onShopNow={() => navigate('/products')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visible.map((product, index) => (
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
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
