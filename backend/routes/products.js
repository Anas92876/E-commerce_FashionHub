const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const {
  getAvailabilityMatrix,
  checkVariantAvailability,
  getVariant,
  addVariant,
  updateVariant,
  deleteVariant,
  updateVariantStock
} = require('../controllers/variantController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// ===== VARIANT ROUTES (Public) =====
router.get('/:id/availability-matrix', getAvailabilityMatrix);
router.get('/:id/variants/:sku', getVariant);
router.get('/:id/variants/:sku/availability', checkVariantAvailability);

// Admin routes (protected)
router.post('/', protect, admin, upload.array('images', 50), createProduct); // Support up to 50 images (10 variants * 5 images each)
router.put('/:id', protect, admin, upload.array('images', 50), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// ===== VARIANT ROUTES (Admin) =====
router.post('/:id/variants', protect, admin, addVariant);
router.put('/:id/variants/:sku', protect, admin, updateVariant);
router.delete('/:id/variants/:sku', protect, admin, deleteVariant);
router.patch('/:id/variants/:sku/stock', protect, admin, updateVariantStock);

module.exports = router;
