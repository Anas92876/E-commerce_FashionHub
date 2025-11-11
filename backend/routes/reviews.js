const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  canReview
} = require('../controllers/reviewController');

/**
 * Review Routes
 */

// Public routes
router.get('/product/:productId', getProductReviews); // Get all reviews for a product

// Protected routes (require authentication)
router.post('/', protect, createReview); // Create a new review
router.get('/my-reviews', protect, getMyReviews); // Get user's reviews
router.get('/can-review/:productId', protect, canReview); // Check if user can review
router.put('/:id', protect, updateReview); // Update user's review
router.delete('/:id', protect, deleteReview); // Delete user's review (or admin)

module.exports = router;
