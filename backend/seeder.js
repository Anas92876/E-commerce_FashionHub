// Seed Supabase with sample categories, products and an admin user.
//   node seeder.js      -> wipe categories/products/users, then import
//   node seeder.js -d   -> wipe only
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { supabase } = require('./config/supabase');
const { check } = require('./utils/db');
const { hashPassword } = require('./utils/user');
const seedReviews = require('./scripts/seedReviews');

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

// Import data
const importData = async () => {
  try {
    console.log('Deleting existing data...');

    // Delete existing data
    await deleteAll('categories');
    await deleteAll('products');
    await deleteAll('users');

    console.log('Creating admin user...');

    // Create admin user
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

    console.log('Creating categories...');

    const createdCategories = check(
      await supabase
        .from('categories')
        .insert(categories.map((cat) => ({ name: cat.name, slug: slugify(cat.name) })))
        .select('id')
    );
    console.log(`✓ ${createdCategories.length} categories created`);

    console.log('Creating products...');

    // Create products
    const createdProducts = check(
      await supabase
        .from('products')
        .insert(
          products.map((p) => ({
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
        .select('id')
    );
    console.log(`✓ ${createdProducts.length} products created`);

    console.log('Creating sample reviews...');
    const { reviews } = await seedReviews();
    console.log(`✓ ${reviews} reviews created`);

    console.log('\n✅ Data imported successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Admin User: 1 (${adminUser.email})`);
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${createdProducts.length}`);

    process.exit();
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    console.log('Deleting all data...');

    await deleteAll('categories');
    await deleteAll('products');
    await deleteAll('users');

    console.log('✅ Data deleted successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error deleting data:', error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}
