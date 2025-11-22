const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      notes
    } = req.body;

    console.log('Creating order with data:', { itemsCount: items?.length, shippingAddress, paymentMethod });

    // Validation
    if (!items || items.length === 0) {
      console.log('Validation failed: No items');
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    if (!shippingAddress) {
      console.log('Validation failed: No shipping address');
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Verify all products exist and have enough stock
    for (const item of items) {
      console.log('Checking product:', item.product, 'variantSku:', item.variantSku, 'size:', item.size);
      const product = await Product.findById(item.product);

      if (!product) {
        console.log('Product not found:', item.product);
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`
        });
      }

      // Check availability using the Product model method
      let availability;
      if (item.variantSku && item.size) {
        // New variant system
        availability = product.checkAvailability(item.variantSku, item.size);
        if (availability.error) {
          return res.status(404).json({
            success: false,
            message: `${availability.error} for ${product.name}`
          });
        }
      } else {
        // Legacy product without variants
        availability = {
          available: product.stock >= item.quantity,
          stock: product.stock
        };
      }

      if (!availability.available || availability.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (${item.size}). Available: ${availability.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Create order
    console.log('Creating order in database...');
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      itemsPrice,
      shippingPrice,
      totalPrice,
      notes
    });
    console.log('Order created successfully:', order._id);

    // Reduce product stock
    for (const item of items) {
      const product = await Product.findById(item.product);

      try {
        if (item.variantSku && item.size) {
          // New variant system - use model method
          await product.updateStock(item.variantSku, item.size, item.quantity, 'decrement');
        } else {
          // Legacy system - simple decrement
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } }
          );
        }
      } catch (stockError) {
        // If stock update fails, we should ideally rollback the order
        console.error('Stock update error:', stockError);
        return res.status(500).json({
          success: false,
          message: `Error updating stock: ${stockError.message}`
        });
      }
    }

    // Send order confirmation email (non-blocking - don't fail order if email fails)
    try {
      const fullUser = await User.findById(req.user._id);
      if (fullUser && fullUser.emailPreferences?.orderUpdates !== false) {
        await sendEmail(
          fullUser.email,
          `Order Confirmation #${order._id}`,
          'orderConfirmation',
          { order, user: fullUser }
        );
      }
    } catch (emailError) {
      // Log error but don't fail the order creation
      console.error('Error sending order confirmation email:', emailError.message);
      // Order is still created successfully, just email failed
    }

    res.status(201).json({
      success: true,
      data: order
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for logged-in user
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by payment status
    if (req.query.isPaid !== undefined) {
      query.isPaid = req.query.isPaid === 'true';
    }

    // Filter by delivery status
    if (req.query.isDelivered !== undefined) {
      query.isDelivered = req.query.isDelivered === 'true';
    }

    // Search by order ID
    if (req.query.search) {
      query._id = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email emailPreferences');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;

    // If status is Delivered, mark as delivered
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();

    // Send email notifications based on status change
    if (order.user.emailPreferences?.orderUpdates !== false) {
      if (status === 'Shipped') {
        await sendEmail(
          order.user.email,
          'Your Order Has Been Shipped!',
          'orderShipped',
          { order, user: order.user, tracking: order.trackingNumber }
        );
      } else if (status === 'Delivered') {
        await sendEmail(
          order.user.email,
          'Your Order Has Been Delivered!',
          'orderDelivered',
          { order, user: order.user }
        );
      }
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Mark order as paid (Admin - when customer pays COD)
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
exports.markOrderAsPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email emailPreferences');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel if order is Pending or Processing
    if (order.status !== 'Pending' && order.status !== 'Processing') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order at this stage'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);

      if (product) {
        try {
          if (item.variantSku && item.size) {
            // New variant system - use model method to restore stock
            await product.updateStock(item.variantSku, item.size, item.quantity, 'increment');
          } else {
            // Legacy system - simple increment
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: item.quantity } }
            );
          }
        } catch (stockError) {
          console.error('Error restoring stock:', stockError);
          // Continue with cancellation even if stock restoration fails
        }
      }
    }

    order.status = 'Cancelled';
    await order.save();

    // Send order cancellation email
    if (order.user.emailPreferences?.orderUpdates !== false) {
      await sendEmail(
        order.user.email,
        'Order Cancellation Confirmation',
        'orderCancelled',
        { order, user: order.user, reason: req.body.reason || 'Cancelled by user request' }
      );
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (error) {
    next(error);
  }
};
