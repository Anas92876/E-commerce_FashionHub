const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const { check, normalizeId, FOREIGN_KEY_VIOLATION } = require('../utils/db');
const { toProduct } = require('../utils/product');

router.use(protect);

// @desc    Get the logged-in user's saved products (newest first)
// @route   GET /api/wishlist
router.get('/', async (req, res, next) => {
  try {
    const rows = check(
      await supabase
        .from('wishlists')
        .select('created_at, product:products(*)')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
    );

    const products = rows
      .filter((row) => row.product && row.product.is_active)
      .map((row) => ({ ...toProduct(row.product), savedAt: row.created_at }));

    res.status(200).json({
      success: true,
      count: products.length,
      // ids let the frontend show filled hearts without another request
      ids: rows.map((row) => row.product?.id).filter(Boolean),
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Save a product
// @route   POST /api/wishlist/:productId
router.post('/:productId', async (req, res, next) => {
  try {
    const productId = normalizeId(req.params.productId);
    const notFound = () => res.status(404).json({ success: false, message: 'Product not found' });
    if (!productId) return notFound();

    // Saving twice is fine (no duplicate rows). A single round trip: the
    // foreign key rejects products that don't exist.
    const { error } = await supabase
      .from('wishlists')
      .upsert({ user_id: req.user.id, product_id: productId }, { onConflict: 'user_id,product_id', ignoreDuplicates: true });
    if (error?.code === FOREIGN_KEY_VIOLATION) return notFound();
    if (error) throw error;

    res.status(201).json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove a saved product
// @route   DELETE /api/wishlist/:productId
router.delete('/:productId', async (req, res, next) => {
  try {
    const productId = normalizeId(req.params.productId);
    if (productId) {
      check(await supabase.from('wishlists').delete().eq('user_id', req.user.id).eq('product_id', productId));
    }
    res.status(200).json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
