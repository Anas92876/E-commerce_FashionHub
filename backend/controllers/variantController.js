const Product = require('../models/Product');

/**
 * Get availability matrix for a product
 * Returns all variants with availability status
 *
 * GET /api/products/:id/availability-matrix
 */
exports.getAvailabilityMatrix = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Get availability matrix using model method
    const matrix = product.getAvailabilityMatrix();

    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        productName: product.name,
        ...matrix
      }
    });

  } catch (error) {
    console.error('Error fetching availability matrix:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching availability matrix',
      error: error.message
    });
  }
};

/**
 * Check if specific variant + size is available
 *
 * GET /api/products/:id/variants/:sku/availability?size=M
 */
exports.checkVariantAvailability = async (req, res) => {
  try {
    const { id, sku } = req.params;
    const { size } = req.query;

    if (!size) {
      return res.status(400).json({
        success: false,
        message: 'Size parameter is required'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check availability using model method
    const availability = product.checkAvailability(sku, size);

    if (availability.error) {
      return res.status(404).json({
        success: false,
        message: availability.error
      });
    }

    res.status(200).json({
      success: true,
      data: availability
    });

  } catch (error) {
    console.error('Error checking variant availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message
    });
  }
};

/**
 * Get specific variant details
 *
 * GET /api/products/:id/variants/:sku
 */
exports.getVariant = async (req, res) => {
  try {
    const { id, sku } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.variants || product.variants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product does not have variants'
      });
    }

    const variant = product.variants.find(v => v.sku === sku);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    const totalStock = variant.sizes.reduce((sum, s) => sum + s.stock, 0);

    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        productName: product.name,
        variant: {
          sku: variant.sku,
          color: variant.color,
          images: variant.images,
          price: variant.priceOverride || product.basePrice || product.price,
          isAvailable: totalStock > 0,
          isActive: variant.isActive,
          sizes: variant.sizes.map(s => ({
            size: s.size,
            stock: s.stock,
            sku: s.sku,
            available: s.stock > 0,
            lowStock: s.stock > 0 && s.stock <= s.lowStockThreshold
          }))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching variant:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching variant',
      error: error.message
    });
  }
};

/**
 * ADMIN: Add new variant to product
 *
 * POST /api/admin/products/:id/variants
 * Body: { color: { name, hex, code }, images: [], priceOverride?, sizes: [{ size, stock }] }
 */
exports.addVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { color, images, priceOverride, sizes } = req.body;

    // Validation
    if (!color || !color.name || !color.hex || !color.code) {
      return res.status(400).json({
        success: false,
        message: 'Color information is required (name, hex, code)'
      });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    if (images.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 images allowed per variant'
      });
    }

    if (!sizes || sizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one size is required'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Generate SKUs
    const { generateSKU } = require('../scripts/migrateProductsToVariants');
    const variantSku = generateSKU(product.name, color.code);

    // Check if variant SKU already exists
    if (product.variants && product.variants.some(v => v.sku === variantSku)) {
      return res.status(400).json({
        success: false,
        message: 'Variant with this color already exists'
      });
    }

    const newVariant = {
      sku: variantSku,
      color,
      images,
      priceOverride: priceOverride || null,
      sizes: sizes.map(s => ({
        size: s.size,
        stock: s.stock || 0,
        sku: generateSKU(product.name, color.code, s.size),
        lowStockThreshold: s.lowStockThreshold || 5
      })),
      isActive: true,
      createdAt: new Date()
    };

    // Add variant
    if (!product.variants) {
      product.variants = [];
    }
    product.variants.push(newVariant);

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Variant added successfully',
      data: newVariant
    });

  } catch (error) {
    console.error('Error adding variant:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding variant',
      error: error.message
    });
  }
};

/**
 * ADMIN: Update existing variant
 *
 * PUT /api/admin/products/:id/variants/:sku
 * Body: { color, images, priceOverride, sizes, isActive }
 */
exports.updateVariant = async (req, res) => {
  try {
    const { id, sku } = req.params;
    const { color, images, priceOverride, sizes, isActive } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const variantIndex = product.variants.findIndex(v => v.sku === sku);

    if (variantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    const variant = product.variants[variantIndex];

    // Update fields if provided
    if (color) {
      if (color.name) variant.color.name = color.name;
      if (color.hex) variant.color.hex = color.hex;
      if (color.code) variant.color.code = color.code;
    }

    if (images) {
      if (images.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 images allowed per variant'
        });
      }
      variant.images = images;
    }

    if (priceOverride !== undefined) {
      variant.priceOverride = priceOverride;
    }

    if (sizes) {
      const { generateSKU } = require('../scripts/migrateProductsToVariants');
      variant.sizes = sizes.map(s => ({
        size: s.size,
        stock: s.stock || 0,
        sku: s.sku || generateSKU(product.name, variant.color.code, s.size),
        lowStockThreshold: s.lowStockThreshold || 5
      }));
    }

    if (isActive !== undefined) {
      variant.isActive = isActive;
    }

    product.variants[variantIndex] = variant;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Variant updated successfully',
      data: variant
    });

  } catch (error) {
    console.error('Error updating variant:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating variant',
      error: error.message
    });
  }
};

/**
 * ADMIN: Delete variant (soft delete - set isActive to false)
 *
 * DELETE /api/admin/products/:id/variants/:sku
 */
exports.deleteVariant = async (req, res) => {
  try {
    const { id, sku } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const variant = product.variants.find(v => v.sku === sku);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    // Soft delete - set isActive to false
    variant.isActive = false;

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Variant deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting variant:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting variant',
      error: error.message
    });
  }
};

/**
 * ADMIN: Update stock for multiple sizes in a variant
 *
 * PATCH /api/admin/products/:id/variants/:sku/stock
 * Body: { sizeStockUpdates: [{ size: 'M', stock: 15 }, { size: 'L', stock: 20 }] }
 */
exports.updateVariantStock = async (req, res) => {
  try {
    const { id, sku } = req.params;
    const { sizeStockUpdates } = req.body;

    if (!sizeStockUpdates || !Array.isArray(sizeStockUpdates)) {
      return res.status(400).json({
        success: false,
        message: 'sizeStockUpdates array is required'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const variant = product.variants.find(v => v.sku === sku);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    // Update stock for each size
    for (const update of sizeStockUpdates) {
      const sizeObj = variant.sizes.find(s => s.size === update.size);
      if (sizeObj) {
        sizeObj.stock = update.stock;
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        variant: {
          sku: variant.sku,
          color: variant.color,
          sizes: variant.sizes
        }
      }
    });

  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: error.message
    });
  }
};
