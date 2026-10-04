import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

// Campaign photo (Linen Midi Dress, Unsplash license), stored with the app in
// three widths so each screen downloads only what it needs.
const HERO_IMAGE = '/images/hero/linen-midi-dress';
const HERO_SRCSET = [640, 960, 1280].map((w) => `${HERO_IMAGE}-${w}.webp ${w}w`).join(', ');

// "Autumn 2026" from today's date (northern-hemisphere seasons)
export const seasonLabel = (date = new Date()) => {
  const season = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'][date.getMonth()];
  return `${season} ${date.getFullYear()}`;
};

/**
 * Editorial home hero: one campaign photo, a short headline, one primary
 * action. Every number shown comes from the store (`summary`), and the
 * caption links to the product in the photo only if it exists (`featured`).
 */
const HeroSection = ({ summary, featured }) => (
  <section aria-labelledby="hero-heading" className="bg-canvas dark:bg-gray-950">
    <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pb-20 lg:pt-10">
      {/* Copy */}
      <div className="lg:col-span-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-gray-400">
          {seasonLabel()} collection
        </p>
        <h1
          id="hero-heading"
          className="mt-5 text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.035em] text-ink dark:text-white sm:text-6xl xl:text-7xl"
        >
          Wardrobe essentials, made to last.
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-stone-600 dark:text-gray-300 sm:text-lg">
          Everyday staples and considered statement pieces
          {summary ? ` — ${summary.products} styles across ${summary.categories} categories` : ''}, delivered free to
          your door.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <Link
            to="/products?sort=newest"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary-600 px-7 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Shop New Arrivals
          </Link>
          <a
            href="#categories"
            className="group inline-flex items-center justify-center gap-2 text-sm font-semibold text-ink underline-offset-4 hover:underline focus:outline-none focus-visible:underline dark:text-white sm:justify-start"
          >
            Browse categories
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
          </a>
        </div>

        {summary?.reviews > 0 && (
          <p className="mt-10 flex items-center gap-2 border-t border-stone-200 pt-6 text-sm text-stone-600 dark:border-gray-800 dark:text-gray-400">
            <StarIcon className="h-4 w-4 text-ink dark:text-white" aria-hidden="true" />
            <span>
              <span className="font-semibold text-ink dark:text-white">{summary.averageRating.toFixed(1)}</span> average from{' '}
              {summary.reviews} customer reviews
            </span>
          </p>
        )}
      </div>

      {/* Campaign photo */}
      <figure className="lg:col-span-7">
        <div className="relative overflow-hidden rounded-lg bg-stone-200 dark:bg-gray-800 max-lg:aspect-[4/5] sm:max-lg:aspect-[5/4] lg:h-[min(44rem,calc(100vh-8rem))]">
          <img
            src={`${HERO_IMAGE}-960.webp`}
            srcSet={HERO_SRCSET}
            sizes="(min-width: 1280px) 760px, (min-width: 1024px) 56vw, 100vw"
            alt="A woman in a white linen midi dress standing in a field of red poppies"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[50%_45%]"
          />
        </div>
        {featured && (
          <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm">
            <span className="text-stone-500 dark:text-gray-400">In the photo</span>
            <Link
              to={`/products/${featured._id}`}
              className="group inline-flex items-center gap-2 font-medium text-ink hover:underline focus:outline-none focus-visible:underline dark:text-white"
            >
              {featured.name} — ${Number(featured.price).toFixed(2)}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </figcaption>
        )}
      </figure>
    </div>
  </section>
);

export default HeroSection;
