// Seed Supabase with sample categories, products (with photos), reviews and an admin user.
//   node seeder.js            -> wipe categories/products/users, then import everything
//   node seeder.js --catalog  -> only add missing sample categories/products/photos/reviews
//                                (keeps existing users, orders and products)
//   node seeder.js -d         -> wipe only
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { supabase } = require('./config/supabase');
const { check } = require('./utils/db');
const { hashPassword } = require('./utils/user');
const seedReviews = require('./scripts/seedReviews');
const seedPhotos = require('./scripts/seedPhotos');

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// supabase-js requires a filter on delete; this matches every row
const deleteAll = async (table) => check(await supabase.from(table).delete().not('id', 'is', null));

// Sample categories
const categories = [
  { name: 'T-Shirts' },
  { name: 'Jeans' },
  { name: 'Dresses' },
  { name: 'Jackets' },
  { name: 'Shoes' },
  { name: 'Accessories' },
];

// Sample products
const products = [
  {
    name: 'Classic White T-Shirt',
    description: 'Premium quality cotton t-shirt in classic white. Perfect for any occasion. Made from 100% organic cotton for maximum comfort.',
    price: 24.99,
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 150,
    isActive: true,
  },
  {
    name: 'Black Cotton T-Shirt',
    description: 'Stylish black t-shirt made from soft cotton blend. Great for casual wear.',
    price: 22.99,
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 120,
    isActive: true,
  },
  {
    name: 'Slim Fit Blue Jeans',
    description: 'Modern slim fit jeans with stretch comfort. Made from premium denim with a contemporary cut.',
    price: 79.99,
    category: 'Jeans',
    sizes: ['28', '30', '32', '34', '36'],
    stock: 75,
    isActive: true,
  },
  {
    name: 'Classic Straight Jeans',
    description: 'Timeless straight-leg jeans in classic blue wash. Comfortable and versatile.',
    price: 69.99,
    category: 'Jeans',
    sizes: ['28', '30', '32', '34', '36', '38'],
    stock: 90,
    isActive: true,
  },
  {
    name: 'Floral Summer Dress',
    description: 'Light and breezy summer dress with beautiful floral pattern. Perfect for warm weather.',
    price: 59.99,
    category: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 50,
    isActive: true,
  },
  {
    name: 'Elegant Evening Dress',
    description: 'Sophisticated evening dress for special occasions. Features a flattering silhouette.',
    price: 129.99,
    category: 'Dresses',
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 30,
    isActive: true,
  },
  {
    name: 'Classic Leather Jacket',
    description: 'Genuine leather jacket with premium finish. Timeless style that never goes out of fashion.',
    price: 199.99,
    category: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25,
    isActive: true,
  },
  {
    name: 'Denim Jacket',
    description: 'Casual denim jacket with a vintage-inspired design. Perfect layering piece.',
    price: 89.99,
    category: 'Jackets',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 45,
    isActive: true,
  },
  {
    name: 'Canvas Sneakers',
    description: 'Comfortable canvas sneakers for everyday wear. Classic design in multiple colors.',
    price: 49.99,
    category: 'Shoes',
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 100,
    isActive: true,
  },
  {
    name: 'Leather Boots',
    description: 'Durable leather boots with cushioned insole. Perfect for all-day comfort.',
    price: 139.99,
    category: 'Shoes',
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 60,
    isActive: true,
  },
  {
    name: 'Leather Belt',
    description: 'Classic leather belt with silver buckle. Complements any outfit.',
    price: 29.99,
    category: 'Accessories',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 80,
    isActive: true,
  },
  {
    name: 'Baseball Cap',
    description: 'Adjustable baseball cap in cotton twill. Features embroidered logo.',
    price: 19.99,
    category: 'Accessories',
    sizes: ['One Size'],
    stock: 150,
    isActive: true,
  },
];

// Sample admin user
const adminUser = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@fashionhub.com',
  password: 'Admin123!',
  role: 'admin',
};

// Insert sample categories + products that don't exist yet (matched by name)
const addCatalog = async () => {
  const existingCats = new Set(check(await supabase.from('categories').select('name')).map((c) => c.name));
  const newCats = categories.filter((cat) => !existingCats.has(cat.name));
  if (newCats.length) {
    check(await supabase.from('categories').insert(newCats.map((cat) => ({ name: cat.name, slug: slugify(cat.name) }))));
  }

  const existingProducts = new Set(check(await supabase.from('products').select('name')).map((p) => p.name));
  const newProducts = products.filter((p) => !existingProducts.has(p.name));
  if (newProducts.length) {
    check(
      await supabase.from('products').insert(
        newProducts.map((p) => ({
          name: p.name,
          description: p.description,
          price: p.price,
          base_price: p.price,
          category: p.category,
          sizes: p.sizes,
          stock: p.stock,
          is_active: p.isActive,
        }))
      )
    );
  }

  console.log(`✓ ${newCats.length} categories and ${newProducts.length} products added`);

  const { added } = await seedPhotos();
  console.log(`✓ Photos added to ${added} products`);

  const { reviews } = await seedReviews();
  console.log(`✓ ${reviews} sample reviews created`);
};

// Full reset: wipe users, categories and products, then import everything
const importData = async () => {
  console.log('Deleting existing data...');

  await deleteAll('categories');
  await deleteAll('products');
  await deleteAll('users');

  console.log('Creating admin user...');

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
  '-d': deleteData,      // wipe only
  '--catalog': addCatalog, // add missing sample catalog; keeps users & orders
};

(commands[process.argv[2]] || importData)()
  .then(() => console.log('✅ Done'))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exitCode = 1;
  });
