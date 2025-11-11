const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  markOrderAsPaid,
  cancelOrder,
  deleteOrder
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/auth');

// Public routes - None

// Protected routes (logged-in users)
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/pay', protect, admin, markOrderAsPaid);
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router;
