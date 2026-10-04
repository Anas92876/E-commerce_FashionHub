const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const { toApi, check } = require('../utils/db');

router.use(protect, admin);

const ALLOWED_DAYS = [7, 30, 90];

// @desc    Dashboard statistics, computed in the database over ALL orders
//          (totals, period comparison, daily sales, best sellers, low stock)
// @route   GET /api/admin/stats?days=30
router.get('/stats', async (req, res, next) => {
  try {
    const days = ALLOWED_DAYS.includes(Number(req.query.days)) ? Number(req.query.days) : 30;

    const [statsResult, recentResult] = await Promise.all([
      supabase.rpc('admin_dashboard_stats', { p_days: days }),
      supabase
        .from('orders')
        .select('id, total_price, status, created_at, user:users(id, first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const stats = check(statsResult);
    const recentOrders = check(recentResult).map((row) => toApi(row, ['user']));

    res.status(200).json({ success: true, data: { ...stats, recentOrders } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
