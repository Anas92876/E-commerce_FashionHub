const { supabase } = require('../config/supabase');
const { toApi, check, normalizeId, UNIQUE_VIOLATION } = require('../utils/db');

// Note: products.rating / num_reviews are kept in sync by a database trigger
// (see supabase/schema.sql -> refresh_product_rating).

const REVIEW_WITH_USER = '*, user:users(id, first_name, last_name)';

// Row -> API review (`user` / `product` are populated objects when embedded, else ids)
const toReview = (row) => {
  const review = toApi(row, ['user', 'product']);
  if (review.user && typeof review.user === 'object') {
    review.user.name = `${review.user.firstName} ${review.user.lastName}`.trim();
  }
  review.user = review.user || review.userId;
  review.product = review.product || review.productId;
  delete review.userId;
  delete review.productId;
  return review;
};

const REVIEW_SORT_COLUMNS = { createdAt: 'created_at', rating: 'rating', updatedAt: 'updated_at' };

// Has the user bought this product in a shipped/delivered order? (verified purchase)
const hasPurchased = async (userId, productId) => {
  const result = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['Delivered', 'Shipped'])
    .filter('items', 'cs', JSON.stringify([{ product: productId }])); // jsonb @> containment
  check(result);
  return result.count > 0;
};

const productExists = async (productId) =>
  productId &&
  check(await supabase.from('products').select('id, rating').eq('id', productId).maybeSingle());

const findReview = async (id) => {
  const reviewId = normalizeId(id);
  if (!reviewId) return null;
  return check(await supabase.from('reviews').select('*').eq('id', reviewId).maybeSingle());
};

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private
 */
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = normalizeId(req.body.product);

    // Check if product exists
    if (!(await productExists(productId))) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const ratingValue = Number(rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!comment || !String(comment).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a review comment'
      });
    }

    if (String(comment).trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Review cannot be more than 500 characters'
      });
    }

    // Create review (unique (product_id, user_id) prevents duplicates)
    const row = check(
      await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: req.user.id,
          rating: ratingValue,
          comment: String(comment).trim(),
          verified_purchase: await hasPurchased(req.user.id, productId),
        })
        .select(REVIEW_WITH_USER)
        .single()
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: toReview(row)
    });
  } catch (error) {
    if (error.code === UNIQUE_VIOLATION) {
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
    const productId = normalizeId(req.params.productId);
    const { sort = '-createdAt' } = req.query;

    // Check if product exists
    const product = await productExists(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Sort like Mongoose: "-createdAt" = newest first
    const descending = sort.startsWith('-');
    const column = REVIEW_SORT_COLUMNS[sort.replace(/^-/, '')] || 'created_at';

    const rows = check(
      await supabase
        .from('reviews')
        .select(REVIEW_WITH_USER)
        .eq('product_id', productId)
        .order(column, { ascending: !descending })
    );

    // Rating distribution: [{ _id: 5, count: 12 }, { _id: 4, count: 3 }, ...]
    const counts = {};
    for (const row of rows) {
      counts[row.rating] = (counts[row.rating] || 0) + 1;
    }
    const ratingDistribution = Object.entries(counts)
      .map(([value, count]) => ({ _id: Number(value), count }))
      .sort((a, b) => b._id - a._id);

    res.status(200).json({
      success: true,
      count: rows.length,
      averageRating: Number(product.rating) || 0,
      ratingDistribution,
      data: rows.map(toReview)
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
    const rows = check(
      await supabase
        .from('reviews')
        .select('*, product:products(id, name, image, price)')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows.map(toReview)
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

    const review = await findReview(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const updates = {};
    if (rating) {
      const ratingValue = Number(rating);
      if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      updates.rating = ratingValue;
    }
    if (comment) {
      if (String(comment).trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Review cannot be more than 500 characters'
        });
      }
      updates.comment = String(comment).trim();
    }

    const row = check(
      await supabase.from('reviews').update(updates).eq('id', review.id).select(REVIEW_WITH_USER).single()
    );

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: toReview(row)
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
    const review = await findReview(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin
    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    check(await supabase.from('reviews').delete().eq('id', review.id));

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
    const productId = normalizeId(req.params.productId);

    if (!productId) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed
    const existingReview = check(
      await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', req.user.id)
        .maybeSingle()
    );

    if (existingReview) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'already_reviewed',
        message: 'You have already reviewed this product'
      });
    }

    // Anyone can review, but we check if they purchased for verification badge
    res.status(200).json({
      success: true,
      canReview: true,
      hasPurchased: await hasPurchased(req.user.id, productId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking review eligibility',
      error: error.message
    });
  }
};
