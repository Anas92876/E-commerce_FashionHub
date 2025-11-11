const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private
 */
exports.createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Check if user has purchased this product (verified purchase)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': product,
      status: { $in: ['Delivered', 'Shipped'] } // Only count delivered or shipped orders
    });

    // Create review
    const review = await Review.create({
      product,
      user: req.user._id,
      rating,
      comment,
      verifiedPurchase: !!hasPurchased
    });

    // Populate user info
    await review.populate('user', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sort = '-createdAt' } = req.query;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get reviews
    const reviews = await Review.find({ product: productId })
      .populate('user', 'firstName lastName')
      .sort(sort);

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: product.rating || 0,
      ratingDistribution,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's reviews
 * @route   GET /api/reviews/my-reviews
 * @access  Private
 */
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name images price')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Find review
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    await review.populate('user', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate product rating
    await Review.calculateAverageRating(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

/**
 * @desc    Check if user can review a product
 * @route   GET /api/reviews/can-review/:productId
 * @access  Private
 */
exports.canReview = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'already_reviewed',
        message: 'You have already reviewed this product'
      });
    }

    // Anyone can review, but we check if they purchased for verification badge
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      status: { $in: ['Delivered', 'Shipped'] }
    });

    res.status(200).json({
      success: true,
      canReview: true,
      hasPurchased: !!hasPurchased
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking review eligibility',
      error: error.message
    });
  }
};
