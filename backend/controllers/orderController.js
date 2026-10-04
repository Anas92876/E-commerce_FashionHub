const { supabase } = require('../config/supabase');
const { toApi, check, normalizeId } = require('../utils/db');
const { priceItems } = require('../utils/pricing');

const ORDER_WITH_USER = '*, user:users(id, first_name, last_name, email)';

// Row -> API order. `user` is the populated user when embedded, else the user id.
const toOrder = (row) => {
  if (!row) return row;
  const order = toApi(row, ['user']);
  order.user = order.user || order.userId;
  delete order.userId;
  return order;
};

const findOrder = async (id, columns = ORDER_WITH_USER) => {
  const orderId = normalizeId(id);
  if (!orderId) return null;
  return check(await supabase.from('orders').select(columns).eq('id', orderId).maybeSingle());
};

const orderNotFound = (res) =>
  res.status(404).json({
    success: false,
    message: 'Order not found'
  });

const ownerId = (row) => row.user_id || row.user?.id;

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    // itemsPrice / shippingPrice / totalPrice from the client are ignored;
    // prices come from the database and the coupon is applied in create_order
    const { shippingAddress, paymentMethod, notes, couponCode } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    const { fullName, phone, address, city, postalCode } = shippingAddress;
    if (!fullName || !phone || !address || !city || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is incomplete'
      });
    }

    let priced;
    try {
      priced = await priceItems(req.body.items);
    } catch (error) {
      if (!error.statusCode) throw error;
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    // Reduce stock, apply the coupon and create the order in a single transaction
    const { data, error } = await supabase.rpc('create_order', {
      p_user_id: req.user.id,
      p_order: {
        items: priced.items,
        shippingAddress: {
          fullName,
          phone,
          address,
          city,
          postalCode,
          country: shippingAddress.country || 'Pakistan',
        },
        paymentMethod: paymentMethod || 'Cash on Delivery',
        itemsPrice: priced.itemsPrice,
        shippingPrice: priced.shippingPrice,
        couponCode: couponCode || null,
        notes,
      },
    });

    if (error) {
      console.error('Create order error:', error);
      // Stock changed since the check, or the coupon is no longer valid
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      data: toOrder(data)
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
    const rows = check(
      await supabase
        .from('orders')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows.map(toOrder)
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
    const row = await findOrder(req.params.id);

    if (!row) {
      return orderNotFound(res);
    }

    // Check if user is authorized to view this order
    if (ownerId(row) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: toOrder(row)
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

    let query = supabase.from('orders').select(ORDER_WITH_USER, { count: 'exact' });

    // Filter by status
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    // Filter by payment status
    if (req.query.isPaid !== undefined) {
      query = query.eq('is_paid', req.query.isPaid === 'true');
    }

    // Filter by delivery status
    if (req.query.isDelivered !== undefined) {
      query = query.eq('is_delivered', req.query.isDelivered === 'true');
    }

    // Search by (partial) order ID
    if (req.query.search) {
      query = query.ilike('id_text', `%${req.query.search}%`);
    }

    const result = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);
    const rows = check(result);
    const total = result.count || 0;

    res.status(200).json({
      success: true,
      count: rows.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rows.map(toOrder)
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

    const order = await findOrder(req.params.id, 'id');

    if (!order) {
      return orderNotFound(res);
    }

    const updates = { status };

    // If status is Delivered, mark as delivered
    if (status === 'Delivered') {
      updates.is_delivered = true;
      updates.delivered_at = new Date().toISOString();
    }

    const row = check(
      await supabase.from('orders').update(updates).eq('id', order.id).select(ORDER_WITH_USER).single()
    );

    res.status(200).json({
      success: true,
      data: toOrder(row)
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
    const order = await findOrder(req.params.id, 'id');

    if (!order) {
      return orderNotFound(res);
    }

    const row = check(
      await supabase
        .from('orders')
        .update({ is_paid: true, paid_at: new Date().toISOString() })
        .eq('id', order.id)
        .select('*')
        .single()
    );

    res.status(200).json({
      success: true,
      data: toOrder(row)
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
    const order = await findOrder(req.params.id);

    if (!order) {
      return orderNotFound(res);
    }

    // Check if user is authorized
    if (ownerId(order) !== req.user.id && req.user.role !== 'admin') {
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

    // Mark as cancelled first (only if still cancellable) so stock is never restored twice
    const row = check(
      await supabase
        .from('orders')
        .update({ status: 'Cancelled' })
        .eq('id', order.id)
        .in('status', ['Pending', 'Processing'])
        .select(ORDER_WITH_USER)
        .maybeSingle()
    );

    if (!row) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order at this stage'
      });
    }

    // Give the coupon use back
    if (order.coupon_code) {
      const { error } = await supabase.rpc('release_coupon', { p_code: order.coupon_code });
      if (error) console.error('Error releasing coupon:', error.message);
    }

    // Restore product stock
    for (const item of order.items) {
      const productId = normalizeId(item.product);
      if (!productId) continue;

      const { error } = await supabase.rpc('adjust_stock', {
        p_product_id: productId,
        p_variant_sku: item.variantSku && item.size ? item.variantSku : null,
        p_size: item.size,
        p_delta: item.quantity,
      });

      if (error) {
        // Continue with cancellation even if stock restoration fails (e.g. product deleted)
        console.error('Error restoring stock:', error.message);
      }
    }

    res.status(200).json({
      success: true,
      data: toOrder(row)
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
    const order = await findOrder(req.params.id, 'id');

    if (!order) {
      return orderNotFound(res);
    }

    check(await supabase.from('orders').delete().eq('id', order.id));

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (error) {
    next(error);
  }
};
