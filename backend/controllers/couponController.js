const { supabase } = require('../config/supabase');
const { toApi, check, normalizeId, UNIQUE_VIOLATION } = require('../utils/db');
const { priceItems, roundMoney } = require('../utils/pricing');

const badRequest = (res, message) => res.status(400).json({ success: false, message });

const toNumberOrNull = (value) =>
  value === null || value === undefined || value === '' ? null : Number(value);

// Validate and normalize admin input -> database row (throws message strings)
const buildCoupon = (body, partial = false) => {
  const row = {};

  if (!partial || body.code !== undefined) {
    const code = String(body.code || '').trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
      throw new Error('Code must be 3-30 letters, numbers, - or _');
    }
    row.code = code;
  }

  if (!partial || body.discountType !== undefined) {
    if (!['percent', 'fixed'].includes(body.discountType)) {
      throw new Error('Discount type must be "percent" or "fixed"');
    }
    row.discount_type = body.discountType;
  }

  if (!partial || body.discountValue !== undefined) {
    const value = Number(body.discountValue);
    if (!(value > 0)) throw new Error('Discount value must be greater than 0');
    const type = row.discount_type || body.discountType;
    if (type === 'percent' && value > 100) throw new Error('A percent discount cannot be more than 100');
    row.discount_value = value;
  }

  if (body.description !== undefined) row.description = String(body.description).trim();

  if (body.minOrderAmount !== undefined) {
    const min = toNumberOrNull(body.minOrderAmount) ?? 0;
    if (!(min >= 0)) throw new Error('Minimum order cannot be negative');
    row.min_order_amount = min;
  }

  if (body.maxUses !== undefined) {
    const max = toNumberOrNull(body.maxUses);
    if (max !== null && !(Number.isInteger(max) && max > 0)) throw new Error('Max uses must be a whole number above 0');
    row.max_uses = max;
  }

  for (const [field, column] of [['startsAt', 'starts_at'], ['expiresAt', 'expires_at']]) {
    if (body[field] !== undefined) {
      if (!body[field]) {
        row[column] = null;
      } else {
        const date = new Date(body[field]);
        if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${field}`);
        row[column] = date.toISOString();
      }
    }
  }

  if (body.isActive !== undefined) row.is_active = Boolean(body.isActive);

  return row;
};

// @desc    List coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res, next) => {
  try {
    const rows = check(await supabase.from('coupons').select('*').order('created_at', { ascending: false }));
    res.status(200).json({ success: true, count: rows.length, data: rows.map((row) => toApi(row)) });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
  let row;
  try {
    row = buildCoupon(req.body);
  } catch (error) {
    return badRequest(res, error.message);
  }

  try {
    const created = check(await supabase.from('coupons').insert(row).select('*').single());
    res.status(201).json({ success: true, message: 'Coupon created', data: toApi(created) });
  } catch (error) {
    if (error.code === UNIQUE_VIOLATION) return badRequest(res, 'A coupon with this code already exists');
    next(error);
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res, next) => {
  const id = normalizeId(req.params.id);
  if (!id) return res.status(404).json({ success: false, message: 'Coupon not found' });

  let row;
  try {
    row = buildCoupon(req.body, true);
  } catch (error) {
    return badRequest(res, error.message);
  }

  try {
    const updated = check(await supabase.from('coupons').update(row).eq('id', id).select('*').maybeSingle());
    if (!updated) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.status(200).json({ success: true, message: 'Coupon updated', data: toApi(updated) });
  } catch (error) {
    if (error.code === UNIQUE_VIOLATION) return badRequest(res, 'A coupon with this code already exists');
    // e.g. switching to percent while the value is above 100
    if (error.code === '23514') return badRequest(res, 'Invalid discount for this coupon type');
    next(error);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res, next) => {
  try {
    const id = normalizeId(req.params.id);
    const deleted = id && check(await supabase.from('coupons').delete().eq('id', id).select('id'));
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Check a coupon against the current cart and preview the discount
// @route   POST /api/coupons/validate   body: { code, items }
// @access  Private
exports.validateCoupon = async (req, res, next) => {
  try {
    const code = String(req.body.code || '').trim();
    if (!code) return badRequest(res, 'Please enter a coupon code');

    let priced;
    try {
      priced = await priceItems(req.body.items);
    } catch (error) {
      if (!error.statusCode) throw error;
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    // Same database function the order uses (without counting a use)
    const { data: discount, error } = await supabase.rpc('coupon_discount', {
      p_code: code,
      p_items_price: priced.itemsPrice,
      p_reserve: false,
    });
    if (error) return badRequest(res, error.message);

    const discountPrice = roundMoney(Number(discount));
    res.status(200).json({
      success: true,
      data: {
        code: code.toUpperCase(),
        itemsPrice: priced.itemsPrice,
        shippingPrice: priced.shippingPrice,
        discountPrice,
        totalPrice: roundMoney(priced.itemsPrice + priced.shippingPrice - discountPrice),
      },
    });
  } catch (error) {
    next(error);
  }
};
