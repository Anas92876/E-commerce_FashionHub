import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

// Campaign photo (Linen Midi Dress, Unsplash license) stored with the app,
// plus a detail crop from the same photo.
const HERO_IMAGE = '/images/hero/linen-midi-dress';
const HERO_SRCSET = [640, 960, 1280].map((w) => `${HERO_IMAGE}-${w}.webp ${w}w`).join(', ');
const DETAIL_IMAGE = `${HERO_IMAGE}-detail-480.webp`;

// "Autumn 2026" from today's date (northern-hemisphere seasons)
export const seasonLabel = (date = new Date()) => {
  const season = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'][date.getMonth()];
  return `${season} ${date.getFullYear()}`;
};

// "Look 01 — Linen Midi Dress, $69.99" link to the product in the photo
const LookCaption = ({ featured, className = '' }) => (
  <Link
    to={`/products/${featured._id}`}
    aria-label={`Shop the look: ${featured.name}, $${Number(featured.price).toFixed(2)}`}
    className={`group inline-flex flex-col text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-4 focus-visible:ring-offset-canvas ${className}`}
  >
    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-gray-400">Look 01</span>
    <span className="mt-1 font-medium text-ink dark:text-white">{featured.name}</span>
    <span className="mt-0.5 inline-flex items-center gap-1.5 text-stone-600 dark:text-gray-300">
      ${Number(featured.price).toFixed(2)}
      <span aria-hidden="true" className="text-stone-300 dark:text-gray-600">·</span>
      <span className="font-medium text-ink underline-offset-4 group-hover:underline dark:text-white">Shop the look</span>
      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
    </span>
  </Link>
);

/**
 * Editorial campaign hero.
 * Desktop: the photo bleeds to the right edge for the full hero height; the
 * headline's last line ("made to last.") crosses onto it; a detail crop of the
 * same photo straddles the photo's edge with the product caption beside it.
 * Mobile/tablet: copy first, then the photo edge to edge, caption below.
 */
const HeroSection = ({ summary, featured }) => (
  <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-canvas dark:bg-gray-950">
    <div className="relative mx-auto flex max-w-7xl flex-col px-4 sm:px-6 lg:flex-row lg:min-h-[max(40rem,min(calc(100vh-6.25rem),52rem))] lg:px-8">
      {/* ---------------- Campaign photo (first in the DOM so the headline paints over it) */}
      <figure className="relative order-2 -mx-4 sm:-mx-6 lg:absolute lg:inset-y-0 lg:left-1/2 lg:right-0 lg:mx-0 lg:w-auto lg:[margin-right:calc((100%-100vw)/2)]">
        <div className="relative overflow-hidden bg-stone-200 motion-safe:animate-hero-reveal dark:bg-gray-800 max-lg:aspect-[4/5] sm:max-lg:aspect-[4/3] lg:absolute lg:inset-0">
          <img
            src={`${HERO_IMAGE}-960.webp`}
            srcSet={HERO_SRCSET}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="A woman in a white linen midi dress standing in a field of red poppies"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[50%_58%] motion-safe:animate-hero-settle lg:object-[42%_50%]"
          />
        </div>

        {/* campaign marker */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85 [writing-mode:vertical-rl] sm:right-6 sm:top-8"
        >
          FashionHub — {seasonLabel()}
        </p>

        {/* detail crop: inside the photo on tablet, straddling its edge on desktop */}
        <div className="absolute bottom-6 left-6 hidden w-36 sm:block lg:bottom-14 lg:left-0 lg:w-44 lg:-translate-x-1/2 xl:w-52">
          <div className="overflow-hidden ring-[6px] ring-canvas dark:ring-gray-950">
            <img src={DETAIL_IMAGE} alt="" width="480" height="600" decoding="async" className="aspect-[4/5] w-full object-cover" />
          </div>
        </div>
      </figure>

      {/* ---------------- Copy (stops before the detail photo on desktop) */}
      <div className="relative order-1 flex flex-col pb-10 pt-10 sm:pt-14 lg:w-[calc(50%-8rem)] lg:justify-between lg:gap-12 lg:py-14 xl:w-[calc(50%-9rem)]">
        <div className="lg:pt-[clamp(0.5rem,5vh,3.5rem)]">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-gray-400">
            <span aria-hidden="true" className="h-px w-8 bg-stone-400 dark:bg-gray-600" />
            {seasonLabel()} Collection
          </p>

          <h1 id="hero-heading" className="mt-6 text-ink dark:text-white">
            <span className="block font-heading text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-[clamp(3.25rem,5.2vw,4.75rem)]">
              Wardrobe
              <br />
              essentials,
            </span>
            {/* the editorial accent: indented, and on desktop it crosses onto the photo */}
            <span className="mt-1 block pl-[12%] font-serif text-[2.9rem] font-normal italic leading-[1.05] tracking-[-0.02em] sm:text-[4rem] lg:whitespace-nowrap dark:lg:mix-blend-difference lg:pl-[46%] lg:text-[clamp(4rem,6.9vw,6.5rem)]">
              made to last.
            </span>
          </h1>

          <p className="mt-7 max-w-[22rem] text-base leading-relaxed text-stone-600 dark:text-gray-300">
            Everyday staples and considered statement pieces
            {summary ? ` — ${summary.products} styles across ${summary.categories} categories` : ''}, delivered free to
            your door.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              to="/products?sort=newest"
              className="group inline-flex h-12 items-center gap-2 rounded-md bg-primary-600 px-7 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              Shop New Arrivals
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
            <a
              href="#categories"
              className="text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink focus:outline-none focus-visible:text-ink dark:text-gray-300 dark:decoration-gray-600 dark:hover:text-white"
            >
              Browse categories
            </a>
          </div>

          {summary?.reviews > 0 && (
            <p className="mt-8 flex items-center gap-2 text-sm text-stone-600 dark:text-gray-400">
              <StarIcon className="h-4 w-4 text-ink dark:text-white" aria-hidden="true" />
              <span>
                <span className="font-semibold text-ink dark:text-white">{summary.averageRating.toFixed(1)}</span> average from{' '}
                {summary.reviews} customer reviews
              </span>
            </p>
          )}
        </div>

        {/* Desktop caption: bottom of the copy column, beside the detail photo */}
        {featured && <LookCaption featured={featured} className="hidden self-end text-right lg:flex lg:items-end" />}
      </div>


      {/* Mobile/tablet caption below the photo */}
      {featured && (
        <div className="order-3 py-5 lg:hidden">
          <LookCaption featured={featured} />
        </div>
      )}
    </div>
  </section>
);

export default HeroSection;
