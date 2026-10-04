import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  ArrowRightIcon,
  TruckIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import CategoryIcon from '../CategoryIcon';
import { API_URL, getImageUrl } from '../../utils/api';
import { productImage, productPrice } from '../ProductCard';

const SLIDE_MS = 6000;

const TRUST = [
  { icon: TruckIcon, title: 'Free Shipping', text: 'On every order' },
  { icon: BanknotesIcon, title: 'Cash on Delivery', text: 'Pay when it arrives' },
  { icon: ArrowPathIcon, title: '30-Day Returns', text: 'Easy exchanges' },
  { icon: ChatBubbleLeftRightIcon, title: 'Friendly Support', text: 'We reply fast', to: '/contact' },
];

// Soft card backgrounds for the category tiles (cycled)
const TILE_TINTS = [
  'bg-primary-50 dark:bg-primary-900/20',
  'bg-amber-50 dark:bg-amber-900/10',
  'bg-slate-100 dark:bg-gray-800',
  'bg-sky-50 dark:bg-sky-900/20',
];

const discountTitle = (c) =>
  c.discountType === 'percent' ? `${Number(c.discountValue)}% OFF` : `$${Number(c.discountValue)} OFF`;

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code);
    toast.success(`Code ${code} copied`);
  } catch {
    toast(`Use code ${code} at checkout`);
  }
};

// ---------------------------------------------------------------- building blocks

const Photo = ({ product, className = '', eager = false }) =>
  product ? (
    <img
      src={getImageUrl(productImage(product))}
      alt={product.name}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      className={`object-cover ${className}`}
    />
  ) : (
    <div className={`bg-primary-100 dark:bg-gray-700 ${className}`} />
  );

const CodePill = ({ code }) => (
  <button
    type="button"
    onClick={() => copyCode(code)}
    className="relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:ring-amber-800"
    title="Copy code"
  >
    <span className="sr-only">Code</span>
    {code}
    <ClipboardDocumentIcon className="h-3.5 w-3.5" aria-hidden="true" />
    <span className="sr-only">(copy)</span>
  </button>
);

// One banner slide: text on the left, product photo on the right
const Slide = ({ slide, eager }) => (
  <div className="grid h-full grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-center gap-4 p-6 sm:gap-8 sm:p-10">
    <div className="min-w-0">
      {slide.code ? (
        <CodePill code={slide.code} />
      ) : (
        <span className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
          {slide.eyebrow}
        </span>
      )}
      <h2 className="mt-4 font-heading text-3xl font-extrabold leading-[1.05] tracking-tight text-gray-900 dark:text-white sm:text-5xl xl:text-6xl">
        {slide.title}
      </h2>
      <p className="mt-3 line-clamp-2 max-w-xs text-sm text-gray-600 dark:text-gray-300 sm:text-base">{slide.text}</p>
      <Link
        to={slide.to}
        className="group mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300 sm:px-6 sm:py-3"
      >
        {slide.cta}
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </div>
    <div className="relative mx-auto h-44 w-full max-w-[16rem] sm:h-64 sm:max-w-[18rem] lg:h-[17rem]">
      {/* soft "stage" shadow under the photo */}
      <div aria-hidden="true" className="absolute inset-x-4 -bottom-3 h-8 rounded-[100%] bg-primary-900/10 blur-md dark:bg-black/40" />
      <Photo product={slide.product} eager={eager} className="relative h-full w-full rounded-[1.75rem] shadow-2xl shadow-primary-900/10 ring-4 ring-white dark:ring-gray-700" />
    </div>
  </div>
);

// Small promo card (right of the banner); the whole card is clickable
const PromoCard = ({ tint, eyebrow, eyebrowClass, title, text, to, cta, product, code }) => (
  <div className={`relative flex h-full items-center gap-4 overflow-hidden rounded-3xl p-5 transition hover:shadow-md sm:p-6 ${tint}`}>
    <div className="min-w-0 flex-1">
      {code ? (
        <CodePill code={code} />
      ) : (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${eyebrowClass}`}>{eyebrow}</span>
      )}
      <h3 className="mt-2 line-clamp-2 font-heading text-lg font-bold leading-snug text-gray-900 dark:text-white sm:text-xl xl:text-lg">{title}</h3>
      {text && <p className="mt-0.5 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{text}</p>}
      <Link to={to} className="group mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-300">
        {cta}
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        <span className="absolute inset-0" aria-hidden="true" />
      </Link>
    </div>
    <Photo product={product} className="h-24 w-24 flex-shrink-0 rounded-2xl shadow-lg ring-4 ring-white/80 dark:ring-gray-700 sm:h-28 sm:w-28 xl:h-24 xl:w-24" />
  </div>
);

// ---------------------------------------------------------------- hero

const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const get = (url, params) => axios.get(`${API_URL}${url}`, { params }).then((r) => r.data?.data || []).catch(() => []);
    Promise.all([
      get('/categories', { stats: 'true' }),
      get('/coupons/featured'),
      get('/products', { sort: 'rating-desc', limit: 8 }),
      get('/products', { sort: 'newest', limit: 4 }),
    ]).then(([categories, coupons, topRated, newest]) => {
      if (cancelled) return;
      const withPhoto = (list) => list.filter((p) => productImage(p));
      setData({ categories, coupons, topRated: withPhoto(topRated), newest: withPhoto(newest) });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- content built from real data
  const categories = data?.categories || [];
  const coupons = data?.coupons || [];
  const top = data?.topRated || [];
  const newest = data?.newest || [];

  const slides = [];
  if (coupons[0] && top[0]) {
    slides.push({
      code: coupons[0].code,
      title: discountTitle(coupons[0]),
      text: coupons[0].description || 'Use this code at checkout.',
      to: '/products',
      cta: 'Shop now',
      product: top[0],
    });
  }
  const freshProduct = newest.find((p) => !top.slice(0, 3).some((t) => t._id === p._id)) || newest[0];
  if (freshProduct) {
    slides.push({
      eyebrow: 'New arrival',
      title: 'Fresh In',
      text: `${freshProduct.name} — $${productPrice(freshProduct).toFixed(2)}`,
      to: `/products/${freshProduct._id}`,
      cta: 'Discover it',
      product: freshProduct,
    });
  }
  const loved = coupons[0] ? top[3] || top[0] : top[0];
  if (loved) {
    slides.push({
      eyebrow: 'Customer favorite',
      title: 'Loved by You',
      text: `${loved.name} · ★ ${Number(loved.rating).toFixed(1)} from ${loved.numReviews} reviews`,
      to: `/products/${loved._id}`,
      cta: 'Shop favorite',
      product: loved,
    });
  }

  const sideCoupon = coupons[1];
  const sideProduct = top[1] || top[0];
  const favorite = top[2] || top[1];

  const popular = [...categories].sort((a, b) => (b.productCount || 0) - (a.productCount || 0)).slice(0, 4);
  const mostPopular = popular[0]?._id;
  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  // ---- carousel behaviour
  const count = slides.length;
  const go = useCallback((i) => count && setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return undefined;
    const timer = setTimeout(() => go(index + 1), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [index, count, paused, reduceMotion, go]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [index, count]);

  const loading = !data;
  const categoryLink = (c) => (c._id === 'all' ? '/products' : `/products?category=${encodeURIComponent(c.name)}`);

  return (
    <section aria-labelledby="hero-heading" className="bg-gray-50 transition-colors duration-300 dark:bg-gray-900">
      <h1 id="hero-heading" className="sr-only">FashionHub - shop clothing, shoes and accessories</h1>

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        {/* Mobile / tablet: categories as a swipeable row */}
        <nav aria-label="Categories" className="-mx-4 mb-5 overflow-x-auto px-4 pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-2">
            {[{ _id: 'all', name: 'All' }, ...categories].map((c) => (
              <li key={c._id} className="flex-shrink-0">
                <Link
                  to={categoryLink(c)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:text-primary-700 hover:ring-primary-300 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                >
                  <CategoryIcon name={c._id === 'all' ? 'all' : c.name} className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-6">
          {/* ---------------- Category sidebar (desktop) */}
          <aside className="hidden flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 dark:bg-gray-800 dark:ring-gray-700 lg:flex">
            <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Categories</h2>
            <span aria-hidden="true" className="mt-1.5 block h-0.5 w-8 rounded-full bg-primary-600" />
            <nav aria-label="Categories" className="mt-4">
              <ul className="space-y-1">
                {loading
                  ? [0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <li key={i} className="flex items-center gap-3 px-3 py-2.5" aria-hidden="true">
                        <span className="h-8 w-8 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700" />
                        <span className="h-3 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
                      </li>
                    ))
                  : [{ _id: 'all', name: 'All Products', productCount: totalProducts }, ...categories].map((c) => (
                      <li key={c._id}>
                        <Link
                          to={categoryLink(c)}
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-primary-900/30 dark:hover:text-primary-300"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition group-hover:bg-white group-hover:text-primary-600 dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-800">
                            <CategoryIcon name={c._id === 'all' ? 'all' : c.name} className="h-[18px] w-[18px]" />
                          </span>
                          <span className="flex-1 truncate">{c.name}</span>
                          {c.productCount > 0 && <span className="text-xs text-gray-400 dark:text-gray-500">{c.productCount}</span>}
                        </Link>
                      </li>
                    ))}
              </ul>
            </nav>

            <Link
              to="/contact"
              className="group mt-auto block rounded-2xl bg-primary-50 p-4 transition hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm dark:bg-gray-800 dark:text-primary-400">
                <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="mt-3 block text-sm font-semibold text-gray-900 dark:text-white">Need help?</span>
              <span className="block text-xs text-gray-600 dark:text-gray-300">Sizing, orders or returns — we reply fast.</span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
                Contact us
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          </aside>

          <div className="min-w-0 space-y-6">
            {/* ---------------- Banner + promo cards */}
            <div className="grid gap-4 sm:gap-6 xl:grid-cols-3">
              {/* Banner carousel */}
              <div
                role="region"
                aria-roledescription="carousel"
                aria-label="Promotions"
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-white to-primary-100 shadow-sm ring-1 ring-primary-100 dark:from-gray-800 dark:via-gray-800 dark:to-primary-900/30 dark:ring-gray-700 xl:col-span-2"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                onTouchStart={(e) => {
                  touchX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (touchX.current === null) return;
                  const dx = e.changedTouches[0].clientX - touchX.current;
                  if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
                  touchX.current = null;
                }}
              >
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-200/50 blur-3xl dark:bg-primary-800/20" />
                <div className="relative h-[17rem] sm:h-[22rem]">
                  {loading || count === 0 ? (
                    <div className="grid h-full grid-cols-2 items-center gap-6 p-6 sm:p-10" aria-hidden="true">
                      <div className="space-y-4">
                        <div className="h-6 w-28 animate-pulse rounded-full bg-primary-100 dark:bg-gray-700" />
                        <div className="h-12 w-full animate-pulse rounded-xl bg-primary-100 dark:bg-gray-700" />
                        <div className="h-4 w-40 animate-pulse rounded bg-primary-100 dark:bg-gray-700" />
                      </div>
                      <div className="mx-auto h-44 w-full max-w-[16rem] animate-pulse rounded-[1.75rem] bg-primary-100 dark:bg-gray-700 sm:h-64" />
                    </div>
                  ) : (
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={index}
                        className="absolute inset-0"
                        initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        aria-roledescription="slide"
                        aria-label={`${index + 1} of ${count}`}
                      >
                        <Slide slide={slides[index]} eager={index === 0} />
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>

                {count > 1 && (
                  <div className="absolute bottom-4 left-6 flex items-center gap-2 sm:bottom-6 sm:left-10">
                    {slides.map((s, i) => (
                      <button
                        key={s.title}
                        type="button"
                        onClick={() => go(i)}
                        aria-label={`Show slide ${i + 1}: ${s.title}`}
                        aria-current={i === index}
                        className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-primary-600' : 'w-2 bg-primary-200 hover:bg-primary-300 dark:bg-gray-600'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Promo cards */}
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-1">
                {loading ? (
                  [0, 1].map((i) => <div key={i} className="h-36 animate-pulse rounded-3xl bg-white ring-1 ring-gray-200/70 dark:bg-gray-800 dark:ring-gray-700 xl:h-auto" aria-hidden="true" />)
                ) : (
                  <>
                    {sideCoupon ? (
                      <PromoCard
                        tint="bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-100 dark:from-gray-800 dark:to-gray-800 dark:ring-gray-700"
                        code={sideCoupon.code}
                        title={`Get ${discountTitle(sideCoupon).replace(' OFF', '')} off`}
                        text={sideCoupon.description}
                        to="/products"
                        cta="Shop now"
                        product={sideProduct}
                      />
                    ) : (
                      <PromoCard
                        tint="bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-100 dark:from-gray-800 dark:to-gray-800 dark:ring-gray-700"
                        eyebrow="Free shipping"
                        eyebrowClass="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        title="Delivered free"
                        text="On every order, no minimum"
                        to="/products"
                        cta="Start shopping"
                        product={sideProduct}
                      />
                    )}
                    {favorite && (
                      <PromoCard
                        tint="bg-gradient-to-br from-sky-50 to-primary-100 ring-1 ring-primary-100 dark:from-gray-800 dark:to-primary-900/30 dark:ring-gray-700"
                        eyebrow="Top rated"
                        eyebrowClass="bg-primary-600 text-white"
                        title={favorite.name}
                        text={
                          <span className="inline-flex items-center gap-1">
                            <StarIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                            {Number(favorite.rating).toFixed(1)} · ${productPrice(favorite).toFixed(2)}
                          </span>
                        }
                        to={`/products/${favorite._id}`}
                        cta="Shop now"
                        product={favorite}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ---------------- Popular categories */}
            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Explore popular categories</h2>
                <Link to="/products" className="group inline-flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  See all
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {loading
                  ? [0, 1, 2, 3].map((i) => (
                      <li key={i} className="h-52 animate-pulse rounded-3xl bg-white ring-1 ring-gray-200/70 dark:bg-gray-800 dark:ring-gray-700" aria-hidden="true" />
                    ))
                  : popular.map((c, i) => (
                      <li key={c._id}>
                        <Link
                          to={categoryLink(c)}
                          className={`group relative flex h-full flex-col items-center rounded-3xl p-4 text-center ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg dark:ring-white/5 ${TILE_TINTS[i % TILE_TINTS.length]}`}
                        >
                          {c._id === mostPopular && (
                            <span className="absolute left-3 top-3 z-10 rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-bold text-white">Popular</span>
                          )}
                          <div className="h-28 w-full overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-700/40 sm:h-32">
                            {c.coverImage ? (
                              <img src={getImageUrl(c.coverImage)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-primary-500">
                                <CategoryIcon name={c.name} className="h-12 w-12" />
                              </div>
                            )}
                          </div>
                          <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {c.productCount} {c.productCount === 1 ? 'item' : 'items'}
                          </p>
                        </Link>
                      </li>
                    ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ---------------- Trust strip */}
        <ul className="mt-6 grid grid-cols-2 gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 dark:bg-gray-800 dark:ring-gray-700 sm:p-6 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, text, to }) => {
            const content = (
              <>
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 sm:text-sm">{text}</span>
                </span>
              </>
            );
            return (
              <li key={title}>
                {to ? (
                  <Link to={to} className="flex items-center gap-3 rounded-2xl transition hover:opacity-80">{content}</Link>
                ) : (
                  <div className="flex items-center gap-3">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default HeroSection;
