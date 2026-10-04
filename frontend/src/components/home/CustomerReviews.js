import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import StarRating from '../StarRating';
import SectionHeader from './SectionHeader';

const MAX_REVIEWS = 12;

// Latest real reviews (from /reviews/recent): positive ones with a comment,
// verified purchases first, one per customer + product pair, and customers
// who haven't been picked yet before repeat reviewers
export const pickReviews = (reviews) => {
  const candidates = [...reviews]
    .filter((r) => r.comment && r.rating >= 4)
    .sort((a, b) => Number(b.verifiedPurchase) - Number(a.verifiedPurchase));

  const picked = [];
  const pairs = new Set();
  const people = new Set();
  for (const pass of ['new people', 'anyone']) {
    for (const r of candidates) {
      if (picked.length >= MAX_REVIEWS) break;
      const person = r.user?.name || r._id;
      const pair = `${person}|${r.product?._id || r._id}`;
      if (pairs.has(pair) || (pass === 'new people' && people.has(person))) continue;
      picked.push(r);
      pairs.add(pair);
      people.add(person);
    }
  }
  return picked;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const ArrowButton = ({ label, onClick, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-stone-300 disabled:hover:bg-transparent disabled:hover:text-ink dark:border-gray-700 dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-ink dark:disabled:hover:bg-transparent dark:disabled:hover:text-white"
  >
    {children}
  </button>
);

/**
 * Review slider: 3 cards per view on desktop, 2 on tablets, 1 on phones.
 * A native scroll-snap track (swipe / trackpad / keyboard scroll all work);
 * the arrows and dots move it one page at a time.
 */
const CustomerReviews = ({ reviews, summary }) => {
  const picked = pickReviews(reviews);
  const track = useRef(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  // Card geometry: how many cards fit in view and the distance between them
  const geometry = () => {
    const el = track.current;
    const cards = el ? el.children : [];
    if (!el || cards.length === 0 || !el.clientWidth) return null;
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : el.clientWidth;
    const gap = step - cards[0].offsetWidth;
    const perView = Math.max(1, Math.round((el.clientWidth + gap) / step));
    return { el, cards, step, perView, pages: Math.max(1, Math.ceil(cards.length / perView)) };
  };

  // Page count and current page from the track's scroll position
  const measure = useCallback(() => {
    const g = geometry();
    if (!g) return;
    setPages(g.pages);
    const atEnd = g.el.scrollLeft + g.el.clientWidth >= g.el.scrollWidth - 4;
    setPage(atEnd ? g.pages - 1 : Math.min(g.pages - 1, Math.round(g.el.scrollLeft / g.step / g.perView)));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, picked.length]);

  const goTo = (target) => {
    const g = geometry();
    if (!g) return;
    const next = Math.min(Math.max(target, 0), g.pages - 1);
    const card = g.cards[next * g.perView];
    g.el.scrollTo({ left: card.offsetLeft - g.cards[0].offsetLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  if (picked.length === 0) return null;
  const sliding = pages > 1;

  return (
    <section aria-labelledby="reviews-heading" className="bg-white py-16 dark:bg-gray-900 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          id="reviews-heading"
          title="What customers say"
          description={
            summary?.reviews > 0
              ? `${summary.averageRating.toFixed(1)} out of 5 across ${summary.reviews} reviews.`
              : undefined
          }
          action={
            sliding && (
              <div className="hidden flex-shrink-0 gap-2 sm:flex">
                <ArrowButton label="Previous reviews" onClick={() => goTo(page - 1)} disabled={page === 0}>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </ArrowButton>
                <ArrowButton label="Next reviews" onClick={() => goTo(page + 1)} disabled={page >= pages - 1}>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </ArrowButton>
              </div>
            )
          }
        />

        <ul
          ref={track}
          onScroll={measure}
          aria-label="Customer reviews"
          className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {picked.map((review, i) => (
            <li
              key={review._id}
              aria-label={`Review ${i + 1} of ${picked.length}`}
              className="w-[85%] flex-shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            >
              <figure className="flex h-full flex-col border border-stone-200 bg-canvas p-7 dark:border-gray-800 dark:bg-gray-950 sm:p-8">
                <StarRating rating={review.rating} className="h-4 w-4" />
                <blockquote className="mt-5 flex-1 font-serif text-xl leading-snug text-ink dark:text-white">
                  “{review.comment}”
                </blockquote>
                <figcaption className="mt-6 border-t border-stone-200 pt-5 text-sm text-stone-600 dark:border-gray-800 dark:text-gray-400">
                  <span className="font-semibold text-ink dark:text-white">{review.user?.name || 'Customer'}</span>
                  {review.verifiedPurchase && <span> · Verified purchase</span>}
                  {review.product?._id && (
                    <span className="mt-1 block">
                      on{' '}
                      <Link to={`/products/${review.product._id}`} className="underline underline-offset-4 hover:text-ink dark:hover:text-white">
                        {review.productName}
                      </Link>
                    </span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {sliding && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show review page ${i + 1} of ${pages}`}
                aria-current={i === page ? 'true' : undefined}
                className="group flex h-6 items-center px-1 focus:outline-none"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all motion-reduce:transition-none group-focus-visible:ring-2 group-focus-visible:ring-primary-600 group-focus-visible:ring-offset-2 ${
                    i === page ? 'w-8 bg-ink dark:bg-white' : 'w-1.5 bg-stone-300 group-hover:bg-stone-500 dark:bg-gray-700'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomerReviews;
