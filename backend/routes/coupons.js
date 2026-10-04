const express = require('express');
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getFeaturedCoupons,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/auth');

// Public: coupons advertised on the home page
router.get('/featured', getFeaturedCoupons);

// Customer: preview a coupon at checkout
router.post('/validate', protect, validateCoupon);

// Admin: manage coupons
router.get('/', protect, admin, getCoupons);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;
