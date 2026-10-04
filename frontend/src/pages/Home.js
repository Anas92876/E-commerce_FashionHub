import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import OfferBar from '../components/home/OfferBar';
import HeroSection from '../components/home/HeroSection';
import NewArrivals from '../components/home/NewArrivals';
import CategoryGrid from '../components/home/CategoryGrid';
import CustomerReviews from '../components/home/CustomerReviews';
import Benefits from '../components/home/Benefits';
import { API_URL } from '../utils/api';

const Home = () => {
  const [data, setData] = useState({ products: [], categories: [], reviews: [], summary: null, coupon: null });
  const [loading, setLoading] = useState(true);

  // Everything the page needs, in parallel; a failed request only hides its section
  useEffect(() => {
    let cancelled = false;
    const get = (url, params) =>
      axios
        .get(`${API_URL}${url}`, { params })
        .then((res) => res.data?.data)
        .catch((error) => {
          console.error(`Error fetching ${url}:`, error);
          return null;
        });

    Promise.all([
      get('/products', { sort: 'newest', limit: 8 }),
      get('/categories', { stats: 'true' }),
      get('/reviews/recent', { limit: 30 }),
      get('/products/summary'),
      get('/coupons/featured'),
    ]).then(([products, categories, reviews, summary, coupons]) => {
      if (cancelled) return;
      setData({
        products: products || [],
        categories: categories || [],
        reviews: reviews || [],
        summary,
        // prefer a welcome-style offer (no minimum order) for the announcement
        coupon: (coupons || []).find((c) => !Number(c.minOrderAmount)) || coupons?.[0] || null,
      });
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-canvas pt-16 dark:bg-gray-950">
      <SEO />
      <Navbar />

      <main>
        <OfferBar coupon={data.coupon} />
        <HeroSection summary={data.summary} />
        <NewArrivals products={data.products} loading={loading} />
        <CategoryGrid categories={data.categories} loading={loading} />
        <CustomerReviews reviews={data.reviews} summary={data.summary} />
        <Benefits />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
