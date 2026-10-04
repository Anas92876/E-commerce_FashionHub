import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import StarRating from '../StarRating';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/api';

/**
 * Reviews list + "write a review" form for one product.
 * The parent controls whether the form is open (so a button elsewhere on the
 * page can open it) and is told when the user can review / has reviewed.
 */
const ProductReviews = ({ productId, rating, numReviews, formOpen, setFormOpen, onCanReviewChange, onReviewAdded }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/reviews/product/${productId}`);
      setReviews(data.data || []);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!user) {
      setCanReview(false);
      onCanReviewChange?.(false);
      return;
    }
    axios
      .get(`${API_URL}/reviews/can-review/${productId}`)
      .then(({ data }) => {
        setCanReview(data.canReview);
        onCanReviewChange?.(data.canReview);
      })
      .catch(() => {
        setCanReview(false);
        onCanReviewChange?.(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }
    if (!reviewData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/reviews`, {
        product: productId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      toast.success('Review submitted successfully!');
      setFormOpen(false);
      setReviewData({ rating: 5, comment: '' });
      setCanReview(false);
      onCanReviewChange?.(false);
      await fetchReviews();
      onReviewAdded?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h3>
          {numReviews > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <StarRating rating={rating} />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{Number(rating).toFixed(1)} out of 5</span>
              <span className="text-gray-500 dark:text-gray-400">({numReviews} reviews)</span>
            </div>
          )}
        </div>
        {canReview && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Form */}
      {formOpen && canReview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Write Your Review</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Rating</legend>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    aria-pressed={star === reviewData.rating}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                  >
                    {star <= reviewData.rating ? (
                      <StarIconSolid className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <StarIconOutline className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Your Review
              </label>
              <textarea
                id="review-comment"
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Share your thoughts about this product..."
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{reviewData.comment.length}/500</p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <div className="mb-3">
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {review.user?.name || 'Anonymous'}
                  {review.verifiedPurchase && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      ✓ Verified purchase
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={review.rating} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <StarIconOutline className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">No reviews yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Be the first to review this product</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
