const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');
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

// Sample products with placeholder images
const products = [
  {
    name: 'Classic White T-Shirt',
    description: 'Premium quality cotton t-shirt in classic white. Perfect for any occasion.',
    price: 24.99,
    category: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 150,
    isActive: true,
  },
  {
    name: 'Black Cotton T-Shirt',
    description: 'Stylish black t-shirt made from soft cotton blend.',
    price: 22.99,
    category: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 120,
    isActive: true,
  },
  {
    name: 'Slim Fit Blue Jeans',
    description: 'Modern slim fit jeans with stretch comfort. Made from premium denim.',
    price: 79.99,
    category: 'Jeans',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
    sizes: ['28', '30', '32', '34', '36'],
    stock: 75,
    isActive: true,
  },
  {
    name: 'Classic Straight Jeans',
    description: 'Timeless straight-leg jeans in classic blue wash.',
    price: 69.99,
    category: 'Jeans',
    image: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&h=800&fit=crop',
    sizes: ['28', '30', '32', '34', '36', '38'],
    stock: 90,
    isActive: true,
  },
  {
    name: 'Floral Summer Dress',
    description: 'Light and breezy summer dress with beautiful floral pattern.',
    price: 59.99,
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 50,
    isActive: true,
  },
  {
    name: 'Elegant Evening Dress',
    description: 'Sophisticated evening dress for special occasions.',
    price: 129.99,
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=800&fit=crop',
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 30,
    isActive: true,
  },
  {
    name: 'Classic Leather Jacket',
    description: 'Genuine leather jacket with premium finish. Timeless style.',
    price: 199.99,
    category: 'Jackets',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25,
    isActive: true,
  },
  {
    name: 'Denim Jacket',
    description: 'Casual denim jacket with vintage-inspired design.',
    price: 89.99,
    category: 'Jackets',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=800&fit=crop',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 45,
    isActive: true,
  },
  {
    name: 'Canvas Sneakers',
    description: 'Comfortable canvas sneakers for everyday wear.',
    price: 49.99,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=800&fit=crop',
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 100,
    isActive: true,
  },
  {
    name: 'Leather Boots',
    description: 'Durable leather boots with premium construction.',
    price: 149.99,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&h=800&fit=crop',
    sizes: ['7', '8', '9', '10', '11'],
    stock: 40,
    isActive: true,
  },
  {
    name: 'Leather Belt',
    description: 'Classic leather belt with metal buckle.',
    price: 34.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583f2?w=600&h=800&fit=crop',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 75,
    isActive: true,
  },
  {
    name: 'Stylish Sunglasses',
    description: 'UV-protected sunglasses with modern design.',
    price: 79.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop',
    sizes: ['One Size'],
    stock: 60,
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log('📦 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    console.log('📦 Creating products with images...');
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('✨ Database seeded successfully with images!');
    console.log('🎉 All products now have placeholder images from Unsplash');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
