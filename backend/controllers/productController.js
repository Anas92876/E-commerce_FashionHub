const { supabase } = require('../config/supabase');
const { check, normalizeId, UNIQUE_VIOLATION } = require('../utils/db');
const { toProduct, prepareVariants } = require('../utils/product');

// Multipart form fields arrive as strings ("true"/"false")
const toBool = (value) => (typeof value === 'string' ? value === 'true' : Boolean(value));

const parseSizes = (sizes) => (Array.isArray(sizes) ? sizes : JSON.parse(sizes));

const SORT_OPTIONS = {
  'price-asc': ['price', true],
  'price-desc': ['price', false],
  'name-asc': ['name', true],
  'name-desc': ['name', false],
  'rating-desc': ['rating', false],
  newest: ['created_at', false],
};

const notFound = (res) =>
  res.status(404).json({
    success: false,
    message: 'Product not found',
  });

const findProduct = async (id) => {
  const productId = normalizeId(id);
  if (!productId) return null;
  return check(await supabase.from('products').select('*').eq('id', productId).maybeSingle());
};

// Escape LIKE wildcards so a search for "50%" matches literally
const escapeLike = (text) => text.replace(/[\\%_]/g, (c) => `\\${c}`);

const toNumberOrNull = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
};

// Query params -> search_products() arguments
const searchArgs = (query) => {
  const search = String(query.search || '').trim().slice(0, 100);
  return {
    p_search: search ? escapeLike(search) : null,
    p_category: query.category || null,
    p_min_price: toNumberOrNull(query.minPrice),
    p_max_price: toNumberOrNull(query.maxPrice),
    p_size: query.size || null,
    p_color: query.color || null,
    p_in_stock: query.inStock === 'true',
  };
};

// @desc    Get all products (public)
// @route   GET /api/products?search=&category=&minPrice=&maxPrice=&size=&color=&inStock=true&sort=&page=&limit=
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 100);
    const skip = (page - 1) * limit;

    // Sort options (default: newest)
    const [column, ascending] = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest;

    // Filtering happens in the search_products database function
    const result = await supabase
      .rpc('search_products', searchArgs(req.query), { count: 'exact' })
      .order(column, { ascending })
      .order('id')
      .range(skip, skip + limit - 1);

    const rows = check(result);
    const totalProducts = result.count || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      count: rows.length,
      total: totalProducts,
      page,
      pages: totalPages,
      data: rows.map(toProduct),
    });
  } catch (error) {
    next(error);
  }
};

// Clothing sizes in natural order, then numeric sizes, then anything else
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const sizeRank = (size) => {
  const i = SIZE_ORDER.indexOf(String(size).toUpperCase());
  if (i !== -1) return [0, i];
  const n = parseFloat(size);
  return Number.isFinite(n) ? [1, n] : [2, 0];
};
const compareSizes = (a, b) => {
  const [ga, va] = sizeRank(a);
  const [gb, vb] = sizeRank(b);
  return ga - gb || va - vb || String(a).localeCompare(String(b));
};

// @desc    Options for the filter sidebar (sizes, colors, price range)
// @route   GET /api/products/filters
// @access  Public
exports.getFilterOptions = async (req, res, next) => {
  try {
    const options = check(await supabase.rpc('product_filter_options'));
    options.sizes = (options.sizes || []).sort(compareSizes);
    res.status(200).json({ success: true, data: options });
  } catch (error) {
    next(error);
  }
};

// @desc    Store summary for the home page (real numbers, not marketing copy)
// @route   GET /api/products/summary
// @access  Public
exports.getStoreSummary = async (req, res, next) => {
  try {
    const [productsResult, categoriesResult] = await Promise.all([
      supabase.from('products').select('rating, num_reviews').eq('is_active', true),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
    ]);
    const products = check(productsResult);
    check(categoriesResult);

    const reviews = products.reduce((sum, p) => sum + p.num_reviews, 0);
    const ratingTotal = products.reduce((sum, p) => sum + Number(p.rating) * p.num_reviews, 0);

    res.status(200).json({
      success: true,
      data: {
        products: products.length,
        categories: categoriesResult.count || 0,
        reviews,
        averageRating: reviews ? Math.round((ratingTotal / reviews) * 10) / 10 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search suggestions while typing (max 6)
// @route   GET /api/products/suggest?q=
// @access  Public
exports.getSuggestions = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const rows = check(
      await supabase
        .rpc('search_products', searchArgs({ search: q }))
        .select('id, name, category, price, base_price, image, variants, rating') // order column must be selected
        .order('rating', { ascending: false })
        .limit(6)
    );

    res.status(200).json({
      success: true,
      data: rows.map((row) => ({
        _id: row.id,
        name: row.name,
        category: row.category,
        price: Number(row.base_price || row.price),
        image: row.image || row.variants?.[0]?.images?.[0] || '',
      })),
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
    const row = await findProduct(req.params.id);

    if (!row) {
      return notFound(res);
    }

    // Check if product is active
    if (!row.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Product not available',
      });
    }

    res.status(200).json({
      success: true,
      data: toProduct(row),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product (admin only)
// @route   POST /api/products
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
    let row;

    if (hasVariants) {
      // Parse variants data from JSON string
      const variantsData = JSON.parse(variants);

      // Uploaded images arrive in order; assign them to variants by imageCount
      const uploadedFiles = req.files || [];
      let fileIndex = 0;

      const processedVariants = prepareVariants(variantsData.map((variant) => {
        const imageCount = variant.imageCount || 0;
        const variantImages = [];

        for (let i = 0; i < imageCount && fileIndex < uploadedFiles.length; i++) {
          // file.path holds the Supabase Storage public URL
          variantImages.push(uploadedFiles[fileIndex].path);
          fileIndex++;
        }

        return {
          sku: variant.sku,
          color: variant.color,
          images: variantImages,
          priceOverride: variant.priceOverride,
          sizes: variant.sizes,
          isActive: true,
        };
      }));

      const parsedBasePrice = parseFloat(basePrice);

      // Create product with variants
      row = check(
        await supabase
          .from('products')
          .insert({
            name: name && name.trim(),
            description,
            base_price: parsedBasePrice,
            category,
            is_active: isActive !== undefined ? toBool(isActive) : true,
            variants: processedVariants,
            // Legacy fields for backward compatibility
            price: parsedBasePrice,
            image: processedVariants[0]?.images[0] || '',
            sizes: sizes ? parseSizes(sizes) : [],
            stock: 0,
          })
          .select('*')
          .single()
      );

      res.status(201).json({
        success: true,
        message: 'Product with variants created successfully',
        data: toProduct(row),
      });

    } else {
      // Legacy simple product creation
      let imagePath = '';
      if (req.files && req.files.length > 0) {
        imagePath = req.files[0].path;
      }

      const parsedPrice = parseFloat(price);

      row = check(
        await supabase
          .from('products')
          .insert({
            name: name && name.trim(),
            description,
            price: parsedPrice,
            base_price: parsedPrice,
            category,
            image: imagePath,
            sizes: sizes ? parseSizes(sizes) : ['S', 'M', 'L', 'XL'],
            stock: parseInt(stock) || 0,
            is_active: isActive !== undefined ? toBool(isActive) : true,
          })
          .select('*')
          .single()
      );

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: toProduct(row),
      });
    }

  } catch (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return res.status(409).json({ success: false, message: 'A product with this name already exists' });
    }
    console.error('Error creating product:', error);
    next(error);
  }
};

// @desc    Update product (admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await findProduct(req.params.id);

    if (!product) {
      return notFound(res);
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
    const updates = {};

    if (hasVariants) {
      // Parse variants data from JSON string
      const variantsData = JSON.parse(variants);

      // Process uploaded images and assign them to variants
      const uploadedFiles = req.files || [];
      let fileIndex = 0;

      const processedVariants = prepareVariants(variantsData.map((variant) => {
        const imageCount = variant.imageCount || 0;
        const variantImages = [];

        // If variant has existing images, keep them
        if (variant.existingImages && Array.isArray(variant.existingImages)) {
          variantImages.push(...variant.existingImages);
        }

        // Add new images for this variant
        for (let i = 0; i < imageCount && fileIndex < uploadedFiles.length; i++) {
          variantImages.push(uploadedFiles[fileIndex].path);
          fileIndex++;
        }

        return {
          sku: variant.sku,
          color: variant.color,
          images: variantImages,
          priceOverride: variant.priceOverride,
          sizes: variant.sizes,
          isActive: variant.isActive !== undefined ? variant.isActive : true,
          createdAt: variant.createdAt,
        };
      }));

      if (name) updates.name = name.trim();
      if (description) updates.description = description;
      if (basePrice) {
        updates.base_price = parseFloat(basePrice);
        // Update legacy price for backward compatibility
        updates.price = parseFloat(basePrice);
      }
      if (category) updates.category = category;
      if (isActive !== undefined) updates.is_active = toBool(isActive);
      updates.variants = processedVariants;

      if (sizes) {
        updates.sizes = parseSizes(sizes);
      }
      if (processedVariants.length > 0 && processedVariants[0].images.length > 0) {
        updates.image = processedVariants[0].images[0];
      }

    } else {
      // Legacy simple product update
      if (name) updates.name = name.trim();
      if (description) updates.description = description;
      if (price) updates.price = parseFloat(price);
      if (category) updates.category = category;
      if (sizes) updates.sizes = parseSizes(sizes);
      if (stock !== undefined) updates.stock = parseInt(stock) || 0;
      if (isActive !== undefined) updates.is_active = toBool(isActive);

      // Handle image upload if new image is provided
      if (req.files && req.files.length > 0) {
        updates.image = req.files[0].path;
      } else if (req.file) {
        updates.image = req.file.path;
      }
    }

    // Ensure basePrice is set from price if not already set
    if (!product.base_price && !updates.base_price && (updates.price || product.price)) {
      updates.base_price = updates.price || product.price;
    }

    const row = check(
      await supabase.from('products').update(updates).eq('id', product.id).select('*').single()
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: toProduct(row),
    });
  } catch (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return res.status(409).json({ success: false, message: 'A product with this name already exists' });
    }
    console.error('Error updating product:', error);
    next(error);
  }
};

// @desc    Delete product (admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await findProduct(req.params.id);

    if (!product) {
      return notFound(res);
    }

    check(await supabase.from('products').delete().eq('id', product.id));

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
