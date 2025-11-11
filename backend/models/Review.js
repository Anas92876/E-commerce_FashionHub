const mongoose = require('mongoose');

/**
 * Review Schema
 * Stores product reviews and ratings from customers
 */
const reviewSchema = new mongoose.Schema({
  // Reference to the product being reviewed
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  // Reference to the user who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },

  // Review comment/text
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    trim: true,
    maxlength: [500, 'Review cannot be more than 500 characters']
  },

  // Whether the user purchased this product (verified purchase)
  verifiedPurchase: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

/**
 * Index to ensure one review per user per product
 * A user can only review a product once
 */
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/**
 * Static method to calculate average rating for a product
 */
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await this.model('Product').findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        numReviews: stats[0].numReviews
      });
    } else {
      // No reviews, reset to 0
      await this.model('Product').findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

/**
 * Middleware to update product rating after saving a review
 */
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.product);
});

/**
 * Middleware to update product rating after removing a review
 */
reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
