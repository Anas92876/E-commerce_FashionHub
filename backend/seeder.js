// Seed Supabase with a realistic sample store: 6 categories, 20 products with
// color/size variants and photos, sample customers with orders and reviews,
// coupons, and an admin user.
//   node seeder.js            -> FULL RESET: wipe users/categories/products, then import everything
//   node seeder.js --catalog  -> SAFE: add missing sample categories/products/photos and
//                                (re)create the sample customers' orders, reviews and wishlists.
//                                Your own users, orders and products are kept.
//   node seeder.js -d         -> wipe only
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ quiet: true });

const { supabase } = require('./config/supabase');
const { check } = require('./utils/db');
const { hashPassword } = require('./utils/user');
const { generateSKU, prepareVariants } = require('./utils/product');
const { CATEGORIES, PRODUCTS } = require('./scripts/sampleCatalog');
const seedPhotos = require('./scripts/seedPhotos');
const seedActivity = require('./scripts/seedReviews');

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// supabase-js requires a filter on delete; this matches every row
const deleteAll = async (table) => check(await supabase.from(table).delete().not('id', 'is', null));

// Sample admin user
const adminUser = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@fashionhub.com',
  password: 'Admin123!',
  role: 'admin',
};

// Catalog entry -> products row with variants
const toProductRow = (p) => {
  const variants = prepareVariants(
    p.colors.map(({ color: [name, hex, code, priceOverride], stock }) => ({
      sku: generateSKU(p.name, code),
      color: { name, hex, code },
      images: [],
      priceOverride: priceOverride ?? null,
      sizes: p.sizes.map((size, i) => ({
        size,
        stock: stock[i] ?? 0,
        sku: generateSKU(p.name, code, size),
        lowStockThreshold: 5,
      })),
    }))
  );

  return {
    name: p.name,
    description: p.description,
    category: p.category,
    base_price: p.basePrice,
    price: p.basePrice,
    sizes: p.sizes,
    stock: 0,
    variants,
    is_active: true,
  };
};

// Insert sample categories + products that don't exist yet (matched by name),
// add photos, then sample customers / orders / reviews / coupons
const addCatalog = async () => {
  const existingCats = new Set(check(await supabase.from('categories').select('name')).map((c) => c.name));
  const newCats = CATEGORIES.filter((name) => !existingCats.has(name));
  if (newCats.length) {
    check(await supabase.from('categories').insert(newCats.map((name) => ({ name, slug: slugify(name) }))));
  }

  const existingProducts = new Set(check(await supabase.from('products').select('name')).map((p) => p.name));
  const newProducts = PRODUCTS.filter((p) => !existingProducts.has(p.name));
  if (newProducts.length) {
    check(await supabase.from('products').insert(newProducts.map(toProductRow)));
  }
  console.log(`✓ ${newCats.length} categories and ${newProducts.length} products added`);

  const { added } = await seedPhotos();
  console.log(`✓ Photos added to ${added} products`);

  const activity = await seedActivity();
  console.log(
    `✓ ${activity.customers} customers, ${activity.orders} orders, ${activity.reviews} reviews, ` +
      `${activity.wishlists} wishlist items, ${activity.coupons} coupons`
  );
};

// Full reset: wipe users, categories and products, then import everything
const importData = async () => {
  console.log('Deleting existing data...');

  await deleteAll('categories');
  await deleteAll('products');
  await deleteAll('users');

  const admin = check(
    await supabase
      .from('users')
      .insert({
        first_name: adminUser.firstName,
        last_name: adminUser.lastName,
        email: adminUser.email,
        password: await hashPassword(adminUser.password),
        role: adminUser.role,
      })
      .select('email')
      .single()
  );
  console.log(`✓ Admin user created (${admin.email})`);

  await addCatalog();
};

const deleteData = async () => {
  console.log('Deleting all data...');

  await deleteAll('categories');
  await deleteAll('products');
  await deleteAll('users');
};

const commands = {
  '-d': deleteData,        // wipe only
  '--catalog': addCatalog, // add missing sample data; keeps your users & orders
};

(commands[process.argv[2]] || importData)()
  .then(() => console.log('✅ Done'))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exitCode = 1;
  });
