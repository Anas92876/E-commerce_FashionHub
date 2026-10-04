// Server-side pricing for a cart / order. Prices always come from the
// database - never from the browser. Used by order creation and coupon preview.
const { supabase } = require('../config/supabase');
const { check, normalizeId } = require('./db');
const { toProduct, checkAvailability } = require('./product');

// Free shipping on all orders (matches the Cart/Checkout pages)
const SHIPPING_PRICE = 0;

const roundMoney = (value) => Math.round(value * 100) / 100;

const httpError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

// The price the store charges for an item
const unitPrice = (product, item) => {
  if (item.variantSku) {
    const variant = product.variants.find((v) => v.sku === item.variantSku);
    if (variant) return Number(variant.priceOverride || product.basePrice || product.price);
  }
  return Number(product.price || product.basePrice);
};

// Keep only the fields an order item is allowed to have
const sanitizeItem = (item) => ({
  product: normalizeId(item.product),
  name: item.name,
  price: Number(item.price),
  quantity: Number(item.quantity), // must be a whole number (validated below)
  size: item.size,
  image: item.image,
  variantSku: item.variantSku || null,
  color: {
    name: item.color?.name || null,
    hex: item.color?.hex || null,
    code: item.color?.code || null,
  },
  sizeSku: item.sizeSku || null,
});

/**
 * Validate cart items (exist, in stock) and price them from the database.
 * Throws errors with statusCode 400/404 and a customer-friendly message.
 * Returns { items, itemsPrice, shippingPrice }.
 */
const priceItems = async (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw httpError(400, 'No order items provided');
  }

  const items = rawItems.map(sanitizeItem);

  for (const item of items) {
    if (!item.size || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw httpError(400, 'Each order item needs a size and a quantity of at least 1');
    }
  }

  // The create_order database function re-checks stock atomically while
  // decrementing; this check gives a clear message first.
  const productIds = [...new Set(items.map((item) => item.product).filter(Boolean))];
  const rows = productIds.length
    ? check(await supabase.from('products').select('*').in('id', productIds))
    : [];
  const products = new Map(rows.map((row) => [row.id, toProduct(row)]));

  for (const item of items) {
    const product = products.get(item.product);

    if (!product || !product.isActive) {
      throw httpError(404, `Product not found: ${item.name || item.product}`);
    }

    let availability;
    if (item.variantSku && item.size) {
      availability = checkAvailability(product, item.variantSku, item.size);
      if (availability.error) {
        throw httpError(404, `${availability.error} for ${product.name}`);
      }
    } else {
      // Legacy product without variants
      availability = { available: product.stock >= item.quantity, stock: product.stock };
    }

    if (!availability.available || availability.stock < item.quantity) {
      throw httpError(
        400,
        `Insufficient stock for ${product.name} (${item.size}). Available: ${availability.stock}, Requested: ${item.quantity}`
      );
    }

    // Use the real name and price from the database
    item.name = product.name;
    item.price = unitPrice(product, item);
    if (!(item.price >= 0)) {
      throw httpError(400, `${product.name} has no price set`);
    }
  }

  const itemsPrice = roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));

  return { items, itemsPrice, shippingPrice: SHIPPING_PRICE };
};

module.exports = { priceItems, roundMoney, SHIPPING_PRICE };
