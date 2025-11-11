/**
 * Migration Script: Convert Existing Products to Variant System
 *
 * This script migrates products from the old schema (single image, array of sizes)
 * to the new variant system (color variants with individual stock per size).
 *
 * Usage:
 *   node scripts/migrateProductsToVariants.js
 *
 * What it does:
 * 1. Finds all products without variants
 * 2. Creates a "Default" variant for each product
 * 3. Converts existing sizes into variant sizes with stock
 * 4. Keeps legacy fields for rollback capability
 *
 * Safety:
 * - Non-destructive (keeps original fields)
 * - Can be run multiple times (idempotent)
 * - Logs all changes
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Generate unique SKU for variant
function generateSKU(productName, colorCode, size = null) {
  const baseCode = productName
    .substring(0, 20)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  if (size) {
    return `${baseCode}-${colorCode}-${size}-${randomSuffix}`;
  }
  return `${baseCode}-${colorCode}-${randomSuffix}`;
}

// Main migration function
async function migrateProducts() {
  try {
    console.log('🚀 Starting product migration to variant system...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-clothing', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all products without variants
    const productsToMigrate = await Product.find({
      $or: [
        { variants: { $exists: false } },
        { variants: { $size: 0 } }
      ]
    });

    console.log(`📊 Found ${productsToMigrate.length} products to migrate\n`);

    if (productsToMigrate.length === 0) {
      console.log('✨ No products need migration. All done!');
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    // Migrate each product
    for (const product of productsToMigrate) {
      try {
        console.log(`\n🔄 Migrating: ${product.name} (ID: ${product._id})`);

        // Ensure basePrice is set
        if (!product.basePrice && product.price) {
          product.basePrice = product.price;
        }

        // Create default variant
        const defaultVariant = {
          sku: generateSKU(product.name, 'DEFAULT'),
          color: {
            name: 'Default',
            hex: '#808080',  // Gray
            code: 'DEFAULT'
          },
          images: product.image ? [product.image] : [],
          priceOverride: null,  // Use basePrice
          sizes: [],
          isActive: true,
          createdAt: new Date()
        };

        // Convert existing sizes to variant sizes
        if (product.sizes && product.sizes.length > 0) {
          for (const size of product.sizes) {
            defaultVariant.sizes.push({
              size: size,
              stock: product.stock || 0,  // Use total stock for all sizes
              sku: generateSKU(product.name, 'DEFAULT', size),
              lowStockThreshold: 5
            });
          }
        } else {
          // If no sizes, create default sizes
          const defaultSizes = ['S', 'M', 'L', 'XL'];
          for (const size of defaultSizes) {
            defaultVariant.sizes.push({
              size: size,
              stock: 0,
              sku: generateSKU(product.name, 'DEFAULT', size),
              lowStockThreshold: 5
            });
          }
        }

        // Add variant to product
        product.variants = [defaultVariant];

        // Save the product
        await product.save();

        console.log(`   ✅ Success! Created default variant with ${defaultVariant.sizes.length} sizes`);
        console.log(`   📦 Variant SKU: ${defaultVariant.sku}`);
        console.log(`   🏷️  Sizes: ${defaultVariant.sizes.map(s => s.size).join(', ')}`);

        successCount++;

      } catch (error) {
        console.error(`   ❌ Error migrating ${product.name}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);
    console.log(`📦 Total processed: ${successCount + errorCount} products`);
    console.log('='.repeat(60) + '\n');

    if (errorCount === 0) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log('⚠️  Migration completed with some errors. Please review the logs.');
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const productsWithVariants = await Product.countDocuments({
      variants: { $exists: true, $ne: [] }
    });
    const totalProducts = await Product.countDocuments({});

    console.log(`   Products with variants: ${productsWithVariants}`);
    console.log(`   Total products: ${totalProducts}`);

    if (productsWithVariants === totalProducts) {
      console.log('   ✅ All products have variants!');
    } else {
      console.log(`   ⚠️  ${totalProducts - productsWithVariants} products still need migration`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run migration
if (require.main === module) {
  migrateProducts();
}

module.exports = { migrateProducts, generateSKU };
