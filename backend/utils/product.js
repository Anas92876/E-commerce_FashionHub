// Product helpers - the logic that used to live in the Mongoose Product model
// (virtuals and instance methods), now working on plain API objects.
const { toApi } = require('./db');

// Generate a SKU like CLASSICWHITETSHIRT-BLK-M-042
const generateSKU = (productName, colorCode, size = null) => {
  const baseCode = productName
    .substring(0, 20)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  if (size) {
    return `${baseCode}-${colorCode}-${size}-${randomSuffix}`;
  }
  return `${baseCode}-${colorCode}-${randomSuffix}`;
};

const hasVariants = (product) => Array.isArray(product.variants) && product.variants.length > 0;

const variantPrice = (product, variant) => variant.priceOverride || product.basePrice || product.price;

// Total stock across all variants
const totalStock = (product) => {
  if (!hasVariants(product)) return product.stock;
  return product.variants.reduce(
    (total, variant) => total + (variant.sizes || []).reduce((sum, size) => sum + size.stock, 0),
    0
  );
};

// Minimum price across all active variants
const displayPrice = (product) => {
  if (hasVariants(product)) {
    const prices = product.variants.filter((v) => v.isActive).map((v) => variantPrice(product, v));
    if (prices.length > 0) return Math.min(...prices);
  }
  return product.basePrice || product.price;
};

const hasVariablePricing = (product) => {
  if (!hasVariants(product)) return false;
  const prices = product.variants.filter((v) => v.isActive).map((v) => variantPrice(product, v));
  return new Set(prices).size > 1;
};

// Row -> API product, including the computed fields Mongoose used to add
const toProduct = (row) => {
  if (!row) return row;
  const product = toApi(row);
  product.id = product._id;
  product.totalStock = totalStock(product);
  product.displayPrice = displayPrice(product);
  product.hasVariablePricing = hasVariablePricing(product);
  return product;
};

// Availability matrix for the product page
const getAvailabilityMatrix = (product) => {
  if (!hasVariants(product)) {
    return {
      hasVariants: false,
      price: product.price,
      sizes: (product.sizes || []).map((size) => ({
        size,
        available: product.stock > 0,
      })),
    };
  }

  return {
    hasVariants: true,
    basePrice: product.basePrice || product.price,
    hasVariablePricing: hasVariablePricing(product),
    colors: product.variants
      .filter((v) => v.isActive)
      .map((variant) => {
        const variantStock = variant.sizes.reduce((sum, s) => sum + s.stock, 0);

        return {
          sku: variant.sku,
          name: variant.color.name,
          hex: variant.color.hex,
          code: variant.color.code,
          image: variant.images[0] || '',
          allImages: variant.images,
          price: variantPrice(product, variant),
          isAvailable: variantStock > 0,
          sizes: variant.sizes.map((size) => ({
            size: size.size,
            stock: size.stock,
            sku: size.sku,
            available: size.stock > 0,
            lowStock: size.stock > 0 && size.stock <= size.lowStockThreshold,
          })),
        };
      }),
  };
};

// Check if a specific variant + size is available
const checkAvailability = (product, variantSku, size) => {
  if (!hasVariants(product)) {
    return {
      available: product.stock > 0 && (product.sizes || []).includes(size),
      stock: product.stock,
    };
  }

  const variant = product.variants.find((v) => v.sku === variantSku && v.isActive);
  if (!variant) {
    return { available: false, stock: 0, error: 'Variant not found' };
  }

  const sizeObj = variant.sizes.find((s) => s.size === size);
  if (!sizeObj) {
    return { available: false, stock: 0, error: 'Size not found' };
  }

  return {
    available: sizeObj.stock > 0,
    stock: sizeObj.stock,
    lowStock: sizeObj.stock <= sizeObj.lowStockThreshold,
  };
};

const toNumberOrNull = (value) =>
  value === null || value === undefined || value === '' ? null : Number(value);

// Cast numeric fields and validate variants before saving
// (replaces Mongoose casting + schema validators). Returns the normalized array.
const prepareVariants = (variants) => {
  const normalized = variants.map((variant) => ({
    ...variant,
    images: variant.images || [],
    priceOverride: toNumberOrNull(variant.priceOverride),
    isActive: variant.isActive !== undefined ? variant.isActive : true,
    createdAt: variant.createdAt || new Date().toISOString(),
    sizes: (variant.sizes || []).map((size) => ({
      ...size,
      stock: Number(size.stock) || 0,
      lowStockThreshold: size.lowStockThreshold !== undefined ? Number(size.lowStockThreshold) : 5,
    })),
  }));

  for (const variant of normalized) {
    if (!variant.sku) throw validationError('Variant SKU is required');
    if (!variant.color || !variant.color.name || !variant.color.code) {
      throw validationError('Variant color name and code are required');
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(variant.color.hex || '')) {
      throw validationError(`Invalid color hex for ${variant.color.name}`);
    }
    if ((variant.images || []).length > 5) {
      throw validationError('Each variant can have up to 5 images');
    }
    if (variant.priceOverride !== null && variant.priceOverride !== undefined && variant.priceOverride < 0) {
      throw validationError('Price cannot be negative');
    }
    for (const size of variant.sizes || []) {
      if (!size.size || !size.sku) throw validationError('Each size needs a size and SKU');
      if (size.stock < 0) throw validationError('Stock cannot be negative');
    }
  }

  return normalized;
};

const validationError = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

module.exports = {
  generateSKU,
  toProduct,
  getAvailabilityMatrix,
  checkAvailability,
  prepareVariants,
};
