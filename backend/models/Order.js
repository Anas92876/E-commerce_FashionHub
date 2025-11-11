const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // User who placed the order
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Order items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    size: {
      type: String,
      required: true
    },
    image: {
      type: String
    },

    // ===== NEW: VARIANT INFORMATION =====
    variantSku: {
      type: String,
      default: null  // For orders with color variants
    },
    color: {
      name: {
        type: String,
        default: null
      },
      hex: {
        type: String,
        default: null
      },
      code: {
        type: String,
        default: null
      }
    },
    sizeSku: {
      type: String,
      default: null  // Specific size SKU for stock tracking
    }
  }],

  // Shipping address
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'Pakistan'
    }
  },

  // Payment info
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash on Delivery', 'COD'],
    default: 'Cash on Delivery'
  },

  // Pricing
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },

  // Order status
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },

  // Payment status (for COD, marked as paid when customer pays on delivery)
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },

  // Delivery status
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },

  // Notes
  notes: {
    type: String
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
