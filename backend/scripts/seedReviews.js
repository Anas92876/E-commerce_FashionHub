const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

// Load environment variables
dotenv.config();

// Sample review texts for variety
const reviewComments = [
  "Absolutely love this product! The quality exceeded my expectations. Highly recommend!",
  "Great purchase! The fabric is soft and the fit is perfect. Will definitely buy again.",
  "This is exactly what I was looking for. Amazing quality and fast shipping!",
  "Incredible product! The attention to detail is outstanding. Very satisfied with my purchase.",
  "Best purchase I've made this year! The quality is top-notch and it looks even better in person.",
  "Fantastic! The product arrived quickly and exceeded all my expectations. 5 stars!",
  "Really impressed with the quality. It's comfortable, stylish, and well-made.",
  "This product is worth every penny! Great quality and beautiful design.",
  "I'm so happy with this purchase! The product is exactly as described and the quality is superb.",
  "Outstanding quality! This has become my favorite item. Highly recommended!",
  "Perfect! The product fits great and the material is excellent. Very pleased!",
  "Excellent product! The craftsmanship is evident. Will be ordering more soon.",
  "Amazing! The quality is incredible and it arrived in perfect condition.",
  "Love it! The product is beautiful and the quality is exceptional.",
  "This exceeded my expectations! Great quality, great price, great service!"
];

const seedReviews = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB...');

    // Find or create Moaz user
    let moazUser = await User.findOne({ email: 'Moaz@gmail.com' });

    if (!moazUser) {
      console.log('Moaz@gmail.com user not found. Creating user...');
      moazUser = await User.create({
        firstName: 'Moaz',
        lastName: 'Ahmed',
        email: 'Moaz@gmail.com',
        password: 'password123', // Will be hashed by the model pre-save hook
        role: 'customer'
      });
      console.log('Moaz user created successfully!');
    } else {
      console.log('Found existing Moaz user');
    }

    // Get all products
    const products = await Product.find({ isActive: true });
    console.log(`Found ${products.length} products`);

    if (products.length === 0) {
      console.log('No products found. Please add products first.');
      process.exit(0);
    }

    // Delete existing reviews from Moaz user (to avoid duplicates)
    await Review.deleteMany({ user: moazUser._id });
    console.log('Cleared existing reviews from Moaz user');

    // Create reviews for random products
    const reviewsToCreate = Math.min(products.length, 10); // Create up to 10 reviews
    const createdReviews = [];

    for (let i = 0; i < reviewsToCreate; i++) {
      const product = products[i];
      const randomRating = Math.floor(Math.random() * 2) + 4; // Rating between 4-5
      const randomComment = reviewComments[Math.floor(Math.random() * reviewComments.length)];

      try {
        const review = await Review.create({
          product: product._id,
          user: moazUser._id,
          rating: randomRating,
          comment: randomComment,
          verifiedPurchase: true
        });

        createdReviews.push(review);
        console.log(`✓ Created review for product: ${product.name} (${randomRating} stars)`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠ Review already exists for product: ${product.name}`);
        } else {
          console.error(`✗ Error creating review for ${product.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Successfully created ${createdReviews.length} reviews!`);
    console.log('\nReview Summary:');
    console.log(`User: ${moazUser.firstName} ${moazUser.lastName} (${moazUser.email})`);
    console.log(`Total Reviews: ${createdReviews.length}`);
    console.log(`Average Rating: ${(createdReviews.reduce((sum, r) => sum + r.rating, 0) / createdReviews.length).toFixed(1)}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
};

// Run the seeder
seedReviews();
