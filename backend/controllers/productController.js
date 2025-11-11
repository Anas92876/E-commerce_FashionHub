const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search by name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Sort options
    let sortOptions = {};
    if (req.query.sort === 'price-asc') {
      sortOptions.price = 1;
    } else if (req.query.sort === 'price-desc') {
      sortOptions.price = -1;
    } else if (req.query.sort === 'name-asc') {
      sortOptions.name = 1;
    } else if (req.query.sort === 'name-desc') {
      sortOptions.name = -1;
    } else if (req.query.sort === 'rating-desc') {
      sortOptions.rating = -1;
    } else if (req.query.sort === 'newest') {
      sortOptions.createdAt = -1;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest
    }

    // Get products with pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total: totalProducts,
      page,
      pages: totalPages,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if product is active
    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not available',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product (admin only)
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      basePrice,
      category,
      sizes,
      stock,
      isActive,
      variants
    } = req.body;

    // Check if this is a variant-based product
    const hasVariants = variants && variants !== 'undefined';

    if (hasVariants) {
      // Parse variants data from JSON string
      const variantsData = JSON.parse(variants);

      // Process uploaded images and assign them to variants
      const uploadedFiles = req.files || [];
      let fileIndex = 0;

      // Build variants array with image paths
      const processedVariants = variantsData.map((variant, variantIndex) => {
        const imageCount = variant.imageCount || 0;
        const variantImages = [];

        // Assign images for this variant
        for (let i = 0; i < imageCount && fileIndex < uploadedFiles.length; i++) {
          variantImages.push(`/uploads/${uploadedFiles[fileIndex].filename}`);
          fileIndex++;
        }

        return {
          sku: variant.sku,
          color: variant.color,
          images: variantImages,
          priceOverride: variant.priceOverride,
          sizes: variant.sizes,
          isActive: true,
          createdAt: new Date()
        };
      });

      // Create product with variants
      const product = await Product.create({
        name,
        description,
        basePrice: parseFloat(basePrice),
        category,
        isActive: isActive !== undefined ? isActive : true,
        variants: processedVariants,
        // Legacy fields for backward compatibility
        price: parseFloat(basePrice),
        image: processedVariants[0]?.images[0] || '',
        sizes: sizes ? (Array.isArray(sizes) ? sizes : JSON.parse(sizes)) : [],
        stock: 0,
      });

      res.status(201).json({
        success: true,
        message: 'Product with variants created successfully',
        data: product,
      });

    } else {
      // Legacy simple product creation
      let imagePath = '';
      if (req.files && req.files.length > 0) {
        imagePath = `/uploads/${req.files[0].filename}`;
      }

      const product = await Product.create({
        name,
        description,
        price: parseFloat(price),
        category,
        image: imagePath,
        sizes: sizes ? (Array.isArray(sizes) ? sizes : JSON.parse(sizes)) : ['S', 'M', 'L', 'XL'],
        stock: parseInt(stock) || 0,
        isActive: isActive !== undefined ? isActive : true,
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    }

  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

// @desc    Update product (admin only)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const {
      name,
      description,
      price,
      basePrice,
      category,
      sizes,
      stock,
      isActive,
      variants
    } = req.body;

    // Check if this is a variant-based product update
    const hasVariants = variants && variants !== 'undefined';

    if (hasVariants) {
      // Parse variants data from JSON string
      const variantsData = JSON.parse(variants);

      // Process uploaded images and assign them to variants
      const uploadedFiles = req.files || [];
      let fileIndex = 0;

      // Build variants array with image paths
      const processedVariants = variantsData.map((variant) => {
        const imageCount = variant.imageCount || 0;
        const variantImages = [];

        // If variant has existing images, keep them
        if (variant.existingImages && Array.isArray(variant.existingImages)) {
          variantImages.push(...variant.existingImages);
        }

        // Add new images for this variant
        for (let i = 0; i < imageCount && fileIndex < uploadedFiles.length; i++) {
          variantImages.push(`/uploads/${uploadedFiles[fileIndex].filename}`);
          fileIndex++;
        }

        return {
          sku: variant.sku,
          color: variant.color,
          images: variantImages,
          priceOverride: variant.priceOverride,
          sizes: variant.sizes,
          isActive: variant.isActive !== undefined ? variant.isActive : true,
          createdAt: variant.createdAt || new Date()
        };
      });

      // Update product with variants
      product.name = name || product.name;
      product.description = description || product.description;
      product.basePrice = basePrice ? parseFloat(basePrice) : product.basePrice;
      product.category = category || product.category;
      product.isActive = isActive !== undefined ? isActive : product.isActive;
      product.variants = processedVariants;

      // Update legacy fields for backward compatibility
      product.price = basePrice ? parseFloat(basePrice) : product.price;
      if (sizes) {
        product.sizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
      }
      if (processedVariants.length > 0 && processedVariants[0].images.length > 0) {
        product.image = processedVariants[0].images[0];
      }

    } else {
      // Legacy simple product update
      if (name) product.name = name;
      if (description) product.description = description;
      if (price) product.price = price;
      if (category) product.category = category;
      if (sizes) product.sizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
      if (stock !== undefined) product.stock = stock;
      if (isActive !== undefined) product.isActive = isActive;

      // Handle image upload if new image is provided
      if (req.files && req.files.length > 0) {
        product.image = `/uploads/${req.files[0].filename}`;
      } else if (req.file) {
        product.image = `/uploads/${req.file.filename}`;
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
};

// @desc    Delete product (admin only)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
