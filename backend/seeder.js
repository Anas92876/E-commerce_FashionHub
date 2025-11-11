const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

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
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Creating admin user...');

    // Create admin user
    const admin = await User.create(adminUser);
    console.log(`✓ Admin user created (${admin.email})`);

    console.log('Creating categories...');

    // Create categories one by one to trigger pre-save hooks
    const createdCategories = [];
    for (const cat of categories) {
      const category = await Category.create(cat);
      createdCategories.push(category);
    }
    console.log(`✓ ${createdCategories.length} categories created`);

    console.log('Creating products...');

    // Create products
    const createdProducts = await Product.insertMany(products);
    console.log(`✓ ${createdProducts.length} products created`);

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

    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

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
