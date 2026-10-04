const test = require('node:test');
const assert = require('node:assert/strict');
const { createFakeSupabase, installFakeSupabase, resetAppModules } = require('./helpers');

const PRODUCT_ID = '11111111-1111-1111-1111-111111111111';

const productRow = (overrides = {}) => ({
  id: PRODUCT_ID,
  name: 'Classic Tee',
  base_price: 20,
  price: 20,
  stock: 0,
  sizes: [],
  is_active: true,
  variants: [
    {
      sku: 'TEE-RED',
      color: { name: 'Red', hex: '#ff0000', code: 'RED' },
      images: [],
      priceOverride: 25,
      isActive: true,
      sizes: [{ size: 'M', stock: 3, sku: 'TEE-RED-M', lowStockThreshold: 5 }],
    },
  ],
  ...overrides,
});

const loadPricing = (rows) => {
  resetAppModules();
  installFakeSupabase(createFakeSupabase({ tables: { products: rows } }));
  return require('../utils/pricing');
};

test('prices come from the database, not the request', async () => {
  const { priceItems } = loadPricing([productRow()]);
  const { items, itemsPrice, shippingPrice } = await priceItems([
    { product: PRODUCT_ID, name: 'hacked', price: 0.01, quantity: 2, size: 'M', variantSku: 'TEE-RED' },
  ]);
  assert.equal(items[0].price, 25); // variant priceOverride
  assert.equal(items[0].name, 'Classic Tee');
  assert.equal(itemsPrice, 50);
  assert.equal(shippingPrice, 0);
});

test('legacy products use the product price', async () => {
  const { priceItems } = loadPricing([productRow({ variants: [], price: 12.5, stock: 4, sizes: ['One Size'] })]);
  const { itemsPrice } = await priceItems([{ product: PRODUCT_ID, quantity: 3, size: 'One Size' }]);
  assert.equal(itemsPrice, 37.5);
});

test('rejects more than the available stock', async () => {
  const { priceItems } = loadPricing([productRow()]);
  await assert.rejects(
    priceItems([{ product: PRODUCT_ID, quantity: 9, size: 'M', variantSku: 'TEE-RED' }]),
    (err) => err.statusCode === 400 && /Available: 3, Requested: 9/.test(err.message)
  );
});

test('rejects unknown or inactive products', async () => {
  const { priceItems } = loadPricing([productRow({ is_active: false })]);
  await assert.rejects(
    priceItems([{ product: PRODUCT_ID, name: 'Tee', quantity: 1, size: 'M', variantSku: 'TEE-RED' }]),
    (err) => err.statusCode === 404
  );
});

test('rejects empty carts and bad quantities', async () => {
  const { priceItems } = loadPricing([productRow()]);
  await assert.rejects(priceItems([]), /No order items/);
  await assert.rejects(priceItems([{ product: PRODUCT_ID, quantity: 0, size: 'M' }]), /quantity of at least 1/);
  await assert.rejects(priceItems([{ product: PRODUCT_ID, quantity: 1.5, size: 'M' }]), /quantity of at least 1/);
});
