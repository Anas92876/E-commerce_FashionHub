import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../StarRating';
import SectionHeader from './SectionHeader';

// Three of the latest real reviews (from /reviews/recent): positive, verified
// purchases first, and from three different customers about different products
const pickReviews = (reviews) => {
  const picked = [];
  const people = new Set();
  const products = new Set();
  [...reviews]
    .filter((r) => r.comment && r.rating >= 4)
    .sort((a, b) => Number(b.verifiedPurchase) - Number(a.verifiedPurchase))
    .forEach((r) => {
      const person = r.user?.name || r._id;
      const product = r.product?._id || r._id;
      if (picked.length < 3 && !people.has(person) && !products.has(product)) {
        picked.push(r);
        people.add(person);
        products.add(product);
      }
    });
  return picked;
};

const CustomerReviews = ({ reviews, summary }) => {
  const picked = pickReviews(reviews);
  if (picked.length === 0) return null;

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
        />

        <ul className="grid gap-x-10 gap-y-10 md:grid-cols-3">
          {picked.map((review) => (
            <li key={review._id} className="border-t border-stone-200 pt-6 dark:border-gray-800">
              <figure>
                <StarRating rating={review.rating} className="h-4 w-4" />
                <blockquote className="mt-4 text-lg leading-relaxed text-ink dark:text-white">
                  “{review.comment}”
                </blockquote>
                <figcaption className="mt-5 text-sm text-stone-600 dark:text-gray-400">
                  <span className="font-semibold text-ink dark:text-white">{review.user?.name || 'Customer'}</span>
                  {review.verifiedPurchase && <span> · Verified purchase</span>}
                  {review.product?._id && (
                    <>
                      {' '}on{' '}
                      <Link to={`/products/${review.product._id}`} className="underline underline-offset-4 hover:text-ink dark:hover:text-white">
                        {review.productName}
                      </Link>
                    </>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CustomerReviews;
