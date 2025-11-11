const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');

// Helper function to generate SKUs
const generateSKU = (productName, colorCode, size = null) => {
  const cleanName = productName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
  const cleanColor = colorCode.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (size) {
    return `${cleanName}-${cleanColor}-${size}`;
  }
  return `${cleanName}-${cleanColor}`;
};

// Test product data with variants
const testProduct = {
  name: "Classic Cotton T-Shirt",
  description: "Premium 100% cotton t-shirt with a comfortable fit. Perfect for everyday wear. Features include reinforced shoulders, double-stitched hems, and pre-shrunk fabric.",
  category: "Clothing",
  basePrice: 29.99,

  variants: [
    {
      sku: generateSKU("Classic Cotton T-Shirt", "NAVY"),
      color: {
        name: "Navy Blue",
        hex: "#1e3a8a",
        code: "NAVY"
      },
      images: [
        "/uploads/products/tshirt-navy-1.jpg",
        "/uploads/products/tshirt-navy-2.jpg"
      ],
      priceOverride: null, // Use base price
      sizes: [
        {
          size: "XS",
          stock: 8,
          sku: generateSKU("Classic Cotton T-Shirt", "NAVY", "XS"),
          lowStockThreshold: 5
        },
        {
          size: "S",
          stock: 15,
          sku: generateSKU("Classic Cotton T-Shirt", "NAVY", "S"),
          lowStockThreshold: 5
        },
        {
          size: "M",
          stock: 20,
          sku: generateSKU("Classic Cotton T-Shirt", "NAVY", "M"),
          lowStockThreshold: 5
        },
        {
          size: "L",
          stock: 18,
          sku: generateSKU("Classic Cotton T-Shirt", "NAVY", "L"),
          lowStockThreshold: 5
        },
        {
          size: "XL",
          stock: 12,
          sku: generateSKU("Classic Cotton T-Shirt", "NAVY", "XL"),
          lowStockThreshold: 5
        },
        {
          size: "XXL",
          stock: 4,
          sku: generateSKU("Classic Cotton T-Shirt", "NAVY", "XXL"),
          lowStockThreshold: 5
        }
      ],
      isActive: true,
      createdAt: new Date()
    },
    {
      sku: generateSKU("Classic Cotton T-Shirt", "BLACK"),
      color: {
        name: "Black",
        hex: "#000000",
        code: "BLACK"
      },
      images: [
        "/uploads/products/tshirt-black-1.jpg",
        "/uploads/products/tshirt-black-2.jpg"
      ],
      priceOverride: null,
      sizes: [
        {
          size: "XS",
          stock: 10,
          sku: generateSKU("Classic Cotton T-Shirt", "BLACK", "XS"),
          lowStockThreshold: 5
        },
        {
          size: "S",
          stock: 22,
          sku: generateSKU("Classic Cotton T-Shirt", "BLACK", "S"),
          lowStockThreshold: 5
        },
        {
          size: "M",
          stock: 25,
          sku: generateSKU("Classic Cotton T-Shirt", "BLACK", "M"),
          lowStockThreshold: 5
        },
        {
          size: "L",
          stock: 20,
          sku: generateSKU("Classic Cotton T-Shirt", "BLACK", "L"),
          lowStockThreshold: 5
        },
        {
          size: "XL",
          stock: 15,
          sku: generateSKU("Classic Cotton T-Shirt", "BLACK", "XL"),
          lowStockThreshold: 5
        },
        {
          size: "XXL",
          stock: 3,
          sku: generateSKU("Classic Cotton T-Shirt", "BLACK", "XXL"),
          lowStockThreshold: 5
        }
      ],
      isActive: true,
      createdAt: new Date()
    },
    {
      sku: generateSKU("Classic Cotton T-Shirt", "WHITE"),
      color: {
        name: "White",
        hex: "#ffffff",
        code: "WHITE"
      },
      images: [
        "/uploads/products/tshirt-white-1.jpg"
      ],
      priceOverride: null,
      sizes: [
        {
          size: "XS",
          stock: 12,
          sku: generateSKU("Classic Cotton T-Shirt", "WHITE", "XS"),
          lowStockThreshold: 5
        },
        {
          size: "S",
          stock: 18,
          sku: generateSKU("Classic Cotton T-Shirt", "WHITE", "S"),
          lowStockThreshold: 5
        },
        {
          size: "M",
          stock: 22,
          sku: generateSKU("Classic Cotton T-Shirt", "WHITE", "M"),
          lowStockThreshold: 5
        },
        {
          size: "L",
          stock: 16,
          sku: generateSKU("Classic Cotton T-Shirt", "WHITE", "L"),
          lowStockThreshold: 5
        },
        {
          size: "XL",
          stock: 10,
          sku: generateSKU("Classic Cotton T-Shirt", "WHITE", "XL"),
          lowStockThreshold: 5
        },
        {
          size: "XXL",
          stock: 2,
          sku: generateSKU("Classic Cotton T-Shirt", "WHITE", "XXL"),
          lowStockThreshold: 5
        }
      ],
      isActive: true,
      createdAt: new Date()
    },
    {
      sku: generateSKU("Classic Cotton T-Shirt", "RED"),
      color: {
        name: "Red",
        hex: "#dc2626",
        code: "RED"
      },
      images: [
        "/uploads/products/tshirt-red-1.jpg",
        "/uploads/products/tshirt-red-2.jpg"
      ],
      priceOverride: 32.99, // Premium color - slight price increase
      sizes: [
        {
          size: "XS",
          stock: 0,
          sku: generateSKU("Classic Cotton T-Shirt", "RED", "XS"),
          lowStockThreshold: 5
        },
        {
          size: "S",
          stock: 3,
          sku: generateSKU("Classic Cotton T-Shirt", "RED", "S"),
          lowStockThreshold: 5
        },
        {
          size: "M",
          stock: 8,
          sku: generateSKU("Classic Cotton T-Shirt", "RED", "M"),
          lowStockThreshold: 5
        },
        {
          size: "L",
          stock: 5,
          sku: generateSKU("Classic Cotton T-Shirt", "RED", "L"),
          lowStockThreshold: 5
        },
        {
          size: "XL",
          stock: 0,
          sku: generateSKU("Classic Cotton T-Shirt", "RED", "XL"),
          lowStockThreshold: 5
        },
        {
          size: "XXL",
          stock: 0,
          sku: generateSKU("Classic Cotton T-Shirt", "RED", "XXL"),
          lowStockThreshold: 5
        }
      ],
      isActive: true,
      createdAt: new Date()
    },
    {
      sku: generateSKU("Classic Cotton T-Shirt", "GRAY"),
      color: {
        name: "Heather Gray",
        hex: "#9ca3af",
        code: "GRAY"
      },
      images: [
        "/uploads/products/tshirt-gray-1.jpg"
      ],
      priceOverride: null,
      sizes: [
        {
          size: "XS",
          stock: 6,
          sku: generateSKU("Classic Cotton T-Shirt", "GRAY", "XS"),
          lowStockThreshold: 5
        },
        {
          size: "S",
          stock: 14,
          sku: generateSKU("Classic Cotton T-Shirt", "GRAY", "S"),
          lowStockThreshold: 5
        },
        {
          size: "M",
          stock: 19,
          sku: generateSKU("Classic Cotton T-Shirt", "GRAY", "M"),
          lowStockThreshold: 5
        },
        {
          size: "L",
          stock: 15,
          sku: generateSKU("Classic Cotton T-Shirt", "GRAY", "L"),
          lowStockThreshold: 5
        },
        {
          size: "XL",
          stock: 8,
          sku: generateSKU("Classic Cotton T-Shirt", "GRAY", "XL"),
          lowStockThreshold: 5
        },
        {
          size: "XXL",
          stock: 0,
          sku: generateSKU("Classic Cotton T-Shirt", "GRAY", "XXL"),
          lowStockThreshold: 5
        }
      ],
      isActive: true,
      createdAt: new Date()
    }
  ],

  // Legacy fields (for backward compatibility)
  price: 29.99,
  image: "/uploads/products/tshirt-navy-1.jpg",
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  stock: 0,

  rating: 4.5,
  numReviews: 127,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Connect to MongoDB and create the test product
const createTestProduct = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB Connected\n');

    // Check if product already exists
    const existingProduct = await Product.findOne({ name: testProduct.name });

    if (existingProduct) {
      console.log(`⚠️  Product "${testProduct.name}" already exists!`);
      console.log(`   Product ID: ${existingProduct._id}`);
      console.log(`   Variants: ${existingProduct.variants?.length || 0}`);
      console.log('\n   Delete it first or choose a different name.');
      process.exit(0);
    }

    // Create the product
    console.log(`Creating test product: "${testProduct.name}"...`);
    const product = await Product.create(testProduct);

    console.log('\n✓ Test product created successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Product ID: ${product._id}`);
    console.log(`Name: ${product.name}`);
    console.log(`Base Price: $${product.basePrice}`);
    console.log(`Total Variants: ${product.variants.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('Variant Details:');
    product.variants.forEach((variant, index) => {
      const totalStock = variant.sizes.reduce((sum, s) => sum + s.stock, 0);
      const price = variant.priceOverride || product.basePrice;
      console.log(`\n  ${index + 1}. ${variant.color.name} (${variant.color.hex})`);
      console.log(`     SKU: ${variant.sku}`);
      console.log(`     Price: $${price}${variant.priceOverride ? ' (override)' : ''}`);
      console.log(`     Total Stock: ${totalStock} units`);
      console.log(`     Sizes: ${variant.sizes.map(s => `${s.size}(${s.stock})`).join(', ')}`);
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('View this product at:');
    console.log(`http://localhost:3000/product/${product._id}`);
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating test product:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
};

// Run the script
createTestProduct();
