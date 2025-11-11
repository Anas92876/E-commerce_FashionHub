const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Get all users
router.get('/', getAllUsers);

// Update user role
router.put('/:id/role', updateUserRole);

// Delete user
router.delete('/:id', deleteUser);

module.exports = router;
