import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import axios from 'axios';
import { ArrowRightIcon, TruckIcon, BanknotesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { API_URL, getImageUrl } from '../../utils/api';
import { productImage, productPrice } from '../ProductCard';

// "Autumn 2026" etc. from today's date (northern-hemisphere seasons)
const seasonLabel = (date = new Date()) => {
  const season = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'][date.getMonth()];
  return `${season} ${date.getFullYear()}`;
};

const TRUST = [
  { icon: TruckIcon, label: 'Free shipping on every order' },
  { icon: BanknotesIcon, label: 'Cash on delivery' },
  { icon: ArrowPathIcon, label: '30-day easy returns' },
];

// One photo tile of the collage, linking to its product
const PhotoTile = ({ product, className, eager, label }) => (
  <Link
    to={`/products/${product._id}`}
    className={`group relative block overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 ${className}`}
  >
    <img
      src={getImageUrl(productImage(product))}
      alt={product.name}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
    />
    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <span className="absolute bottom-3 left-3 right-3 truncate text-sm font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      {label || product.name}
    </span>
  </Link>
);

const HeroSection = ({ categories = [] }) => {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const [featured, setFeatured] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      axios.get(`${API_URL}/products`, { params: { sort: 'rating-desc', limit: 8 } }).catch(() => null),
      axios.get(`${API_URL}/products/summary`).catch(() => null),
    ]).then(([productsRes, summaryRes]) => {
      if (cancelled) return;
      const withPhotos = (productsRes?.data?.data || []).filter((p) => productImage(p));
      setFeatured(withPhotos.slice(0, 3));
      setSummary(summaryRes?.data?.data || null);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Entrance animation (skipped for people who prefer reduced motion)
  const rise = (delay = 0) =>
    reduceMotion
      ? {}
      : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } };

  const [main, second, third] = featured;
  const stats = summary
    ? [
        { value: summary.products, label: 'Products' },
        { value: summary.categories, label: 'Categories' },
        { value: `${summary.averageRating.toFixed(1)}★`, label: `${summary.reviews} reviews` },
      ]
    : null;

  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-300" aria-labelledby="hero-heading">
      {/* soft brand glow behind the photos */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-900/30" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-12rem] left-[-8rem] h-[24rem] w-[24rem] rounded-full bg-primary-100/50 blur-3xl dark:bg-primary-900/20" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* ---------------- Copy */}
          <div className="lg:col-span-6">
            <motion.p {...rise(0)} className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3.5 py-1.5 text-sm font-semibold text-primary-700 ring-1 ring-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-800">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className={`absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-60 ${reduceMotion ? '' : 'animate-ping'}`} />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-600" />
              </span>
              {seasonLabel()} collection
            </motion.p>

            <motion.h1
              {...rise(0.08)}
              id="hero-heading"
              className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Style that
              <br />
              feels like{' '}
              <span className="relative inline-block whitespace-nowrap text-primary-600 dark:text-primary-400">
                you.
                <svg aria-hidden="true" viewBox="0 0 220 18" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full text-primary-300 dark:text-primary-700">
                  <path d="M2 13 C 50 3, 120 3, 218 11" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            <motion.p {...rise(0.16)} className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Everyday essentials and statement pieces, picked for quality and made to last.
              Find your fit in tees, denim, dresses, jackets and shoes — delivered free to your door.
            </motion.p>

            <motion.div {...rise(0.24)} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300"
              >
                Shop the collection
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-base font-semibold text-gray-900 ring-1 ring-gray-300 transition hover:bg-gray-50 hover:ring-gray-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-800"
                >
                  Create account
                </Link>
              )}
            </motion.div>

            {/* Category quick links */}
            {categories.length > 0 && (
              <motion.nav {...rise(0.32)} aria-label="Shop by category" className="mt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Shop by category</p>
                <ul className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <li key={category._id}>
                      <Link
                        to={`/products?category=${encodeURIComponent(category.name)}`}
                        className="inline-block rounded-full bg-gray-100 px-3.5 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-primary-50 hover:text-primary-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-primary-900/40 dark:hover:text-primary-300"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.nav>
            )}

            {/* Real store numbers (fixed height while loading - no layout shift) */}
            <motion.dl {...rise(0.4)} className="mt-10 grid min-h-[4.5rem] max-w-lg grid-cols-3 divide-x divide-gray-200 border-t border-gray-200 pt-6 dark:divide-gray-700 dark:border-gray-700">
              {(stats || [0, 1, 2]).map((stat, i) =>
                stats ? (
                  <div key={stat.label} className={i === 0 ? 'pr-4' : 'px-4'}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="font-heading text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{stat.value}</dd>
                    <dd className="text-sm text-gray-500 dark:text-gray-400" aria-hidden="true">{stat.label}</dd>
                  </div>
                ) : (
                  <div key={stat} className={i === 0 ? 'pr-4' : 'px-4'} aria-hidden="true">
                    <div className="h-7 w-14 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="mt-2 h-4 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                )
              )}
            </motion.dl>
          </div>

          {/* ---------------- Photo collage */}
          <motion.div
            {...(reduceMotion ? {} : { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] } })}
            className="relative lg:col-span-6"
          >
            <div className="grid h-[380px] grid-cols-5 grid-rows-2 gap-3 sm:h-[480px] sm:gap-4 lg:h-[560px]">
              {main ? (
                <>
                  <PhotoTile product={main} eager className="col-span-3 row-span-2" />
                  {second && <PhotoTile product={second} className="col-span-2" />}
                  {third && <PhotoTile product={third} className="col-span-2" />}
                </>
              ) : (
                <>
                  {/* loading / empty store: calm placeholders in the same layout */}
                  <div className={`col-span-3 row-span-2 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-800 dark:to-gray-700 ${loaded ? '' : 'animate-pulse'}`} />
                  <div className={`col-span-2 rounded-3xl bg-gray-100 dark:bg-gray-800 ${loaded ? '' : 'animate-pulse'}`} />
                  <div className={`col-span-2 rounded-3xl bg-gray-100 dark:bg-gray-800 ${loaded ? '' : 'animate-pulse'}`} />
                </>
              )}
            </div>

            {/* Floating product card for the main photo */}
            {main && (
              <motion.div
                {...(reduceMotion ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.6 } })}
                className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:-left-6"
              >
                <Link
                  to={`/products/${main._id}`}
                  className="flex max-w-[16rem] items-center gap-3 rounded-2xl bg-white/95 p-2.5 pr-4 shadow-xl ring-1 ring-black/5 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl dark:bg-gray-800/95 dark:ring-white/10"
                >
                  <img
                    src={getImageUrl(productImage(main))}
                    alt=""
                    className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{main.name}</p>
                    <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white">${productPrice(main).toFixed(2)}</span>
                      {main.numReviews > 0 && (
                        <span className="inline-flex items-center gap-0.5">
                          <StarIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                          {Number(main.rating).toFixed(1)}
                          <span className="sr-only"> out of 5 stars</span>
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Top-rated label */}
            {main && (
              <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur sm:left-4 sm:top-4">
                Top rated
              </span>
            )}
          </motion.div>
        </div>

        {/* Trust strip */}
        <motion.ul
          {...rise(0.5)}
          className="mt-12 grid grid-cols-1 gap-4 border-t border-gray-200 pt-8 dark:border-gray-800 sm:grid-cols-3 lg:mt-16"
        >
          {TRUST.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 sm:justify-center">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              {label}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

export default HeroSection;
