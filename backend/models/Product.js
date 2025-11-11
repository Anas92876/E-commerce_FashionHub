const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },

  // Base price for the product (can be overridden per variant)
  basePrice: {
    type: Number,
    min: [0, 'Price cannot be negative'],
  },

  category: {
    type: String,
    required: [true, 'Product category is required'],
  },

  // ===== NEW: VARIANTS SYSTEM =====
  variants: [{
    // Unique identifier for this variant
    sku: {
      type: String,
      required: true,
      index: true
    },

    // Color information
    color: {
      name: {
        type: String,
        required: true,
      },
      hex: {
        type: String,
        required: true,
        match: /^#[0-9A-Fa-f]{6}$/
      },
      code: {
        type: String,
        required: true,
        index: true
      }
    },

    // Images for this color variant (0-5 images, optional)
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 5;
        },
        message: 'Each variant can have up to 5 images'
      }
    },

    // Optional price override (if this color costs more)
    priceOverride: {
      type: Number,
      default: null,
      min: [0, 'Price cannot be negative']
    },

    // Sizes available for this color
    sizes: [{
      size: {
        type: String,
        required: true,
      },
      stock: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Stock cannot be negative']
      },
      sku: {
        type: String,
        required: true,
        index: true
      },
      lowStockThreshold: {
        type: Number,
        default: 5
      }
    }],

    // Can disable entire color variant
    isActive: {
      type: Boolean,
      default: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // ===== LEGACY FIELDS (For Backward Compatibility) =====
  // These fields are deprecated but kept for migration rollback
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
  },
  image: {
    type: String,
    default: '',
  },
  sizes: {
    type: [String],
    default: [],
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },

  // ===== RATINGS & REVIEWS =====
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5'],
  },
  numReviews: {
    type: Number,
    default: 0,
    min: [0, 'Number of reviews cannot be negative'],
  },

  // ===== STATUS =====
  isActive: {
    type: Boolean,
    default: true,
  },

  // ===== TIMESTAMPS =====
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ===== VIRTUAL FIELDS =====

// Total stock across all variants
productSchema.virtual('totalStock').get(function() {
  if (!this.variants || this.variants.length === 0) {
    return this.stock; // Legacy fallback
  }

  return this.variants.reduce((total, variant) => {
    return total + variant.sizes.reduce((sum, size) => sum + size.stock, 0);
  }, 0);
});

// Display price (minimum price across all active variants)
productSchema.virtual('displayPrice').get(function() {
  if (this.variants && this.variants.length > 0) {
    const prices = this.variants
      .filter(v => v.isActive)
      .map(v => v.priceOverride || this.basePrice || this.price);

    if (prices.length > 0) {
      return Math.min(...prices);
    }
  }
  return this.basePrice || this.price; // Legacy fallback
});

// Check if product has multiple prices
productSchema.virtual('hasVariablePricing').get(function() {
  if (!this.variants || this.variants.length === 0) return false;

  const prices = this.variants
    .filter(v => v.isActive)
    .map(v => v.priceOverride || this.basePrice || this.price);

  const uniquePrices = [...new Set(prices)];
  return uniquePrices.length > 1;
});

// ===== INSTANCE METHODS =====

// Get availability matrix for frontend
productSchema.methods.getAvailabilityMatrix = function() {
  if (!this.variants || this.variants.length === 0) {
    // Legacy product without variants
    return {
      hasVariants: false,
      price: this.price,
      sizes: this.sizes.map(size => ({
        size,
        available: this.stock > 0
      }))
    };
  }

  return {
    hasVariants: true,
    basePrice: this.basePrice || this.price,
    hasVariablePricing: this.hasVariablePricing,
    colors: this.variants
      .filter(v => v.isActive)
      .map(variant => {
        const totalStock = variant.sizes.reduce((sum, s) => sum + s.stock, 0);

        return {
          sku: variant.sku,
          name: variant.color.name,
          hex: variant.color.hex,
          code: variant.color.code,
          image: variant.images[0] || '',
          allImages: variant.images,
          price: variant.priceOverride || this.basePrice || this.price,
          isAvailable: totalStock > 0,
          sizes: variant.sizes.map(size => ({
            size: size.size,
            stock: size.stock,
            sku: size.sku,
            available: size.stock > 0,
            lowStock: size.stock > 0 && size.stock <= size.lowStockThreshold
          }))
        };
      })
  };
};

// Check if specific variant + size is available
productSchema.methods.checkAvailability = function(variantSku, size) {
  if (!this.variants || this.variants.length === 0) {
    // Legacy product
    return {
      available: this.stock > 0 && this.sizes.includes(size),
      stock: this.stock
    };
  }

  const variant = this.variants.find(v => v.sku === variantSku && v.isActive);
  if (!variant) {
    return { available: false, stock: 0, error: 'Variant not found' };
  }

  const sizeObj = variant.sizes.find(s => s.size === size);
  if (!sizeObj) {
    return { available: false, stock: 0, error: 'Size not found' };
  }

  return {
    available: sizeObj.stock > 0,
    stock: sizeObj.stock,
    lowStock: sizeObj.stock <= sizeObj.lowStockThreshold
  };
};

// Update stock for specific variant + size
productSchema.methods.updateStock = async function(variantSku, size, quantity, operation = 'decrement') {
  if (!this.variants || this.variants.length === 0) {
    // Legacy product
    if (operation === 'decrement') {
      if (this.stock < quantity) {
        throw new Error('Insufficient stock');
      }
      this.stock -= quantity;
    } else {
      this.stock += quantity;
    }
    return await this.save();
  }

  const variant = this.variants.find(v => v.sku === variantSku);
  if (!variant) {
    throw new Error('Variant not found');
  }

  const sizeObj = variant.sizes.find(s => s.size === size);
  if (!sizeObj) {
    throw new Error('Size not found');
  }

  if (operation === 'decrement') {
    if (sizeObj.stock < quantity) {
      throw new Error(`Insufficient stock. Only ${sizeObj.stock} available`);
    }
    sizeObj.stock -= quantity;
  } else {
    sizeObj.stock += quantity;
  }

  return await this.save();
};

// ===== INDEXES FOR PERFORMANCE =====
productSchema.index({ 'variants.sku': 1 });
productSchema.index({ 'variants.color.code': 1 });
productSchema.index({ 'variants.sizes.sku': 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });

// ===== PRE-SAVE HOOK =====
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Ensure basePrice is set from price if not already set
  if (!this.basePrice && this.price) {
    this.basePrice = this.price;
  }

  next();
});

// ===== ENSURE VIRTUALS ARE INCLUDED IN JSON =====
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
