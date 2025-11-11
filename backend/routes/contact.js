const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  replyToContact,
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

// Validation middleware
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

// Public route - Submit contact form
router.post('/', contactValidation, submitContact);

// Admin routes - Manage contact messages
router.get('/', protect, admin, getAllContacts);
router.get('/:id', protect, admin, getContactById);
router.put('/:id/status', protect, admin, updateContactStatus);
router.post('/:id/reply', protect, admin, replyToContact);
router.delete('/:id', protect, admin, deleteContact);

module.exports = router;
