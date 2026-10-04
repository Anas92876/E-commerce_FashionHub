const test = require('node:test');
const assert = require('node:assert/strict');
const { createFakeSupabase, installFakeSupabase } = require('./helpers');

installFakeSupabase(createFakeSupabase());

const { toApi, toDb, normalizeId, objectIdToUuid, isUuid } = require('../utils/db');
const {
  toProduct,
  prepareVariants,
  checkAvailability,
  getAvailabilityMatrix,
  generateSKU,
} = require('../utils/product');

const variant = (overrides = {}) => ({
  sku: 'TEE-RED',
  color: { name: 'Red', hex: '#ff0000', code: 'RED' },
  images: [],
  isActive: true,
  sizes: [
    { size: 'M', stock: 3, sku: 'TEE-RED-M', lowStockThreshold: 5 },
    { size: 'L', stock: 0, sku: 'TEE-RED-L', lowStockThreshold: 5 },
  ],
  ...overrides,
});

test('toApi converts snake_case to camelCase and adds _id', () => {
  const api = toApi({ id: 'abc', first_name: 'Sara', is_active: true, id_text: 'abc' });
  assert.deepEqual(api, { id: 'abc', _id: 'abc', firstName: 'Sara', isActive: true });
});

test('toApi converts listed embedded relations', () => {
  const api = toApi({ id: '1', user: { id: '2', first_name: 'Omar' } }, ['user']);
  assert.equal(api.user.firstName, 'Omar');
  assert.equal(api.user._id, '2');
});

test('toDb converts camelCase to snake_case and drops ids/undefined', () => {
  assert.deepEqual(toDb({ _id: 'x', id: 'x', basePrice: 10, isActive: undefined }), { base_price: 10 });
});

test('Mongo ObjectIds map to stable UUIDs', () => {
  const uuid = objectIdToUuid('507f1f77bcf86cd799439011');
  assert.equal(uuid, '00000000-507f-1f77-bcf8-6cd799439011');
  assert.ok(isUuid(uuid));
  assert.equal(normalizeId('507F1F77BCF86CD799439011'), uuid);
  assert.equal(normalizeId('not-an-id'), null);
  assert.equal(normalizeId(undefined), null);
});

test('toProduct adds totalStock, displayPrice and hasVariablePricing', () => {
  const product = toProduct({
    id: 'p1',
    base_price: 20,
    price: 20,
    variants: [variant(), variant({ sku: 'TEE-BLU', priceOverride: 25, color: { name: 'Blue', hex: '#0000ff', code: 'BLU' } })],
  });
  assert.equal(product.totalStock, 6);
  assert.equal(product.displayPrice, 20);
  assert.equal(product.hasVariablePricing, true);
});

test('prepareVariants casts strings from form data to numbers', () => {
  const [v] = prepareVariants([variant({ priceOverride: '', sizes: [{ size: 'M', stock: '7', sku: 'S-M' }] })]);
  assert.equal(v.priceOverride, null);
  assert.equal(v.sizes[0].stock, 7);
  assert.equal(v.sizes[0].lowStockThreshold, 5);
  assert.equal(v.isActive, true);
});

test('prepareVariants rejects invalid data with a 400 error', () => {
  assert.throws(() => prepareVariants([variant({ color: { name: 'Red', hex: 'red', code: 'RED' } })]), (err) => err.statusCode === 400);
  assert.throws(() => prepareVariants([variant({ images: ['1', '2', '3', '4', '5', '6'] })]), /up to 5 images/);
  assert.throws(() => prepareVariants([variant({ sizes: [{ size: 'M', stock: -1, sku: 'x' }] })]), /negative/);
});

test('checkAvailability for variant and legacy products', () => {
  const product = toProduct({ id: 'p1', base_price: 20, variants: [variant()] });
  assert.deepEqual(checkAvailability(product, 'TEE-RED', 'M'), { available: true, stock: 3, lowStock: true });
  assert.equal(checkAvailability(product, 'TEE-RED', 'L').available, false);
  assert.equal(checkAvailability(product, 'NOPE', 'M').error, 'Variant not found');
  assert.equal(checkAvailability(product, 'TEE-RED', 'XXL').error, 'Size not found');

  const legacy = toProduct({ id: 'p2', price: 10, stock: 2, sizes: ['One Size'], variants: [] });
  assert.equal(checkAvailability(legacy, null, 'One Size').available, true);
});

test('availability matrix hides inactive variants', () => {
  const product = toProduct({ id: 'p1', base_price: 20, variants: [variant(), variant({ sku: 'OFF', isActive: false })] });
  const matrix = getAvailabilityMatrix(product);
  assert.equal(matrix.hasVariants, true);
  assert.equal(matrix.colors.length, 1);
  assert.equal(matrix.colors[0].sizes[0].lowStock, true);
});

test('generateSKU builds readable codes', () => {
  assert.match(generateSKU('Classic Tee!', 'RED', 'M'), /^CLASSICTEE-RED-M-\d{3}$/);
});
