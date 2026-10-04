/**
 * One-time migration: MongoDB -> Supabase
 *
 * Copies users, categories, products, orders, reviews and contacts.
 * - Mongo ObjectIds become deterministic UUIDs (00000000-<objectid>), so
 *   references stay intact and old JWTs / saved carts keep working.
 * - Password hashes are copied as-is (bcrypt), so users keep their passwords.
 * - With --copy-images, every external image (e.g. Cloudinary) is downloaded and
 *   re-uploaded to Supabase Storage, and URLs are rewritten.
 *
 * Usage (from backend/, with MONGO_URI + SUPABASE_* in .env):
 *   npm run migrate:mongo
 *   npm run migrate:mongo -- --copy-images
 *
 * Safe to re-run: rows are upserted by id.
 */
const dotenv = require('dotenv');

dotenv.config();

const { MongoClient } = require('mongodb');
const { supabase, STORAGE_BUCKET } = require('../config/supabase');
const { objectIdToUuid } = require('../utils/db');
const { uploadFile } = require('../middleware/upload');

const COPY_IMAGES = process.argv.includes('--copy-images');
const BATCH_SIZE = 500;

const uuid = (objectId) => (objectId ? objectIdToUuid(objectId.toString()) : null);
const iso = (date) => (date ? new Date(date).toISOString() : null);

// Recursively drop Mongo's `_id` from subdocuments (variants, sizes, items)
const stripIds = (value) => {
  if (Array.isArray(value)) return value.map(stripIds);
  if (value && typeof value === 'object' && !(value instanceof Date) && value._bsontype === undefined) {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      if (key !== '_id') out[key] = stripIds(v);
    }
    return out;
  }
  if (value instanceof Date) return value.toISOString();
  return value;
};

// ---------- image copying ----------
const imageCache = new Map();
const supabaseMarker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

const copyImage = async (url, folder) => {
  if (!COPY_IMAGES || !url || !/^https?:\/\//.test(url) || url.includes(supabaseMarker)) return url;
  if (imageCache.has(url)) return imageCache.get(url);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const ext = `.${(contentType.split('/')[1] || 'jpg').split(';')[0]}`;
    const newUrl = await uploadFile(
      {
        buffer: Buffer.from(await response.arrayBuffer()),
        mimetype: contentType,
        originalname: `image${ext}`,
      },
      folder
    );
    imageCache.set(url, newUrl);
    return newUrl;
  } catch (error) {
    console.warn(`  ! Could not copy image ${url}: ${error.message} (keeping original URL)`);
    imageCache.set(url, url);
    return url;
  }
};

// ---------- helpers ----------
const upsert = async (table, rows) => {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id' });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  console.log(`✓ ${table}: ${rows.length} rows`);
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db();
  console.log(`Connected to MongoDB database "${db.databaseName}"`);
  if (COPY_IMAGES) console.log('Images will be copied to Supabase Storage');

  const all = (name) => db.collection(name).find().toArray();

  // ----- users -----
  const users = await all('users');
  const userIds = new Set();
  await upsert('users', users.map((u) => {
    userIds.add(uuid(u._id));
    return {
      id: uuid(u._id),
      first_name: u.firstName || '',
      last_name: u.lastName || '',
      email: String(u.email).toLowerCase(),
      password: u.password,
      role: u.role || 'customer',
      shipping_address: u.shippingAddress || null,
      ...(u.emailPreferences && { email_preferences: u.emailPreferences }),
      created_at: iso(u.createdAt) || new Date().toISOString(),
      updated_at: iso(u.updatedAt) || new Date().toISOString(),
    };
  }));

  // ----- categories -----
  const categories = await all('categories');
  const categoryRows = [];
  for (const c of categories) {
    categoryRows.push({
      id: uuid(c._id),
      name: c.name,
      slug: c.slug || null,
      image: await copyImage(c.image || '', 'categories'),
      created_at: iso(c.createdAt) || new Date().toISOString(),
    });
  }
  await upsert('categories', categoryRows);

  // ----- products -----
  const products = await all('products');
  const productIds = new Set();
  const productRows = [];
  for (const p of products) {
    const variants = stripIds(p.variants || []);
    for (const variant of variants) {
      variant.images = await Promise.all((variant.images || []).map((url) => copyImage(url, 'products')));
    }
    productIds.add(uuid(p._id));
    productRows.push({
      id: uuid(p._id),
      name: p.name,
      description: p.description || '',
      base_price: p.basePrice ?? p.price ?? null,
      category: p.category,
      variants,
      price: p.price ?? p.basePrice ?? null,
      image: await copyImage(p.image || '', 'products'),
      sizes: p.sizes || [],
      stock: Math.max(0, p.stock || 0),
      rating: p.rating || 0,
      num_reviews: p.numReviews || 0,
      is_active: p.isActive !== false,
      created_at: iso(p.createdAt) || new Date().toISOString(),
      updated_at: iso(p.updatedAt) || new Date().toISOString(),
    });
  }
  await upsert('products', productRows);

  // ----- orders -----
  const orders = await all('orders');
  const orderRows = [];
  for (const o of orders) {
    const items = stripIds(o.items || []);
    for (const item of items) {
      item.product = uuid(item.product);
      item.image = await copyImage(item.image, 'products');
    }
    const userId = uuid(o.user);
    orderRows.push({
      id: uuid(o._id),
      user_id: userIds.has(userId) ? userId : null,
      items,
      shipping_address: stripIds(o.shippingAddress || {}),
      payment_method: o.paymentMethod || 'Cash on Delivery',
      items_price: o.itemsPrice || 0,
      shipping_price: o.shippingPrice || 0,
      total_price: o.totalPrice || 0,
      status: o.status || 'Pending',
      is_paid: !!o.isPaid,
      paid_at: iso(o.paidAt),
      is_delivered: !!o.isDelivered,
      delivered_at: iso(o.deliveredAt),
      notes: o.notes || null,
      created_at: iso(o.createdAt) || new Date().toISOString(),
      updated_at: iso(o.updatedAt) || new Date().toISOString(),
    });
  }
  await upsert('orders', orderRows);

  // ----- reviews (skip ones whose user or product no longer exists) -----
  const reviews = await all('reviews');
  await upsert('reviews', reviews
    .filter((r) => userIds.has(uuid(r.user)) && productIds.has(uuid(r.product)))
    .map((r) => ({
      id: uuid(r._id),
      product_id: uuid(r.product),
      user_id: uuid(r.user),
      rating: r.rating,
      comment: String(r.comment || '').slice(0, 500),
      verified_purchase: !!r.verifiedPurchase,
      created_at: iso(r.createdAt) || new Date().toISOString(),
      updated_at: iso(r.updatedAt) || new Date().toISOString(),
    })));

  // ----- contacts -----
  const contacts = await all('contacts');
  await upsert('contacts', contacts.map((c) => ({
    id: uuid(c._id),
    name: c.name,
    email: String(c.email).toLowerCase(),
    phone: c.phone || null,
    subject: c.subject,
    message: c.message,
    status: c.status || 'new',
    is_read: !!c.isRead,
    created_at: iso(c.createdAt) || new Date().toISOString(),
    updated_at: iso(c.updatedAt) || new Date().toISOString(),
  })));

  await client.close();
  console.log('\n✅ Migration complete');
};

run().catch((error) => {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
});
