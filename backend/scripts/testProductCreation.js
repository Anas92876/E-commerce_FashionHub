const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * Test script to verify product creation with variants works correctly
 * This script will create a test product through the API
 */

async function testProductCreation() {
  try {
    console.log('🧪 Testing Product Creation with Variants...\n');

    // Step 1: Login as admin to get token
    console.log('Step 1: Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@fashionhub.com',
      password: 'Admin123!'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Prepare test product data
    console.log('Step 2: Preparing product data...');

    const formData = new FormData();

    // Basic product info
    formData.append('name', 'Test Hoodie - Variant Test');
    formData.append('description', 'Testing variant system with multiple colors');
    formData.append('basePrice', '49.99');
    formData.append('category', 'Clothing');
    formData.append('sizes', JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']));
    formData.append('isActive', 'true');

    // Variant data (2 variants without images to test optional images)
    const variants = [
      {
        sku: 'TEST-HOODIE-NAVY',
        color: {
          name: 'Navy Blue',
          code: 'NAVY',
          hex: '#001f3f'
        },
        priceOverride: null,
        imageCount: 0, // No images
        sizes: [
          { size: 'S', stock: 10, sku: 'TEST-HOODIE-NAVY-S', lowStockThreshold: 5 },
          { size: 'M', stock: 15, sku: 'TEST-HOODIE-NAVY-M', lowStockThreshold: 5 },
          { size: 'L', stock: 20, sku: 'TEST-HOODIE-NAVY-L', lowStockThreshold: 5 },
          { size: 'XL', stock: 12, sku: 'TEST-HOODIE-NAVY-XL', lowStockThreshold: 5 },
          { size: 'XXL', stock: 8, sku: 'TEST-HOODIE-NAVY-XXL', lowStockThreshold: 5 }
        ]
      },
      {
        sku: 'TEST-HOODIE-BLACK',
        color: {
          name: 'Black',
          code: 'BLACK',
          hex: '#000000'
        },
        priceOverride: 54.99,
        imageCount: 0, // No images
        sizes: [
          { size: 'S', stock: 8, sku: 'TEST-HOODIE-BLACK-S', lowStockThreshold: 5 },
          { size: 'M', stock: 18, sku: 'TEST-HOODIE-BLACK-M', lowStockThreshold: 5 },
          { size: 'L', stock: 22, sku: 'TEST-HOODIE-BLACK-L', lowStockThreshold: 5 },
          { size: 'XL', stock: 14, sku: 'TEST-HOODIE-BLACK-XL', lowStockThreshold: 5 },
          { size: 'XXL', stock: 10, sku: 'TEST-HOODIE-BLACK-XXL', lowStockThreshold: 5 }
        ]
      }
    ];

    formData.append('variants', JSON.stringify(variants));
    console.log('✅ Product data prepared (2 variants, no images)\n');

    // Step 3: Create product
    console.log('Step 3: Sending create product request...');
    const createResponse = await axios.post(
      'http://localhost:5000/api/products',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Product created successfully!\n');
    console.log('📦 Product Details:');
    console.log('   ID:', createResponse.data.data._id);
    console.log('   Name:', createResponse.data.data.name);
    console.log('   Base Price: $' + createResponse.data.data.basePrice);
    console.log('   Variants:', createResponse.data.data.variants.length);
    console.log('\n📊 Variant Details:');
    createResponse.data.data.variants.forEach((variant, index) => {
      console.log(`   ${index + 1}. ${variant.color.name} (${variant.color.code})`);
      console.log(`      - SKU: ${variant.sku}`);
      console.log(`      - Price: $${variant.priceOverride || createResponse.data.data.basePrice}`);
      console.log(`      - Images: ${variant.images.length}`);
      const totalStock = variant.sizes.reduce((sum, s) => sum + s.stock, 0);
      console.log(`      - Total Stock: ${totalStock} units`);
    });

    console.log('\n✅ TEST PASSED: Product creation with variants (no images) works correctly!');
    console.log(`\n🌐 View product at: http://localhost:3000/product/${createResponse.data.data._id}`);

    return createResponse.data.data;

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    throw error;
  }
}

// Run the test
testProductCreation()
  .then(() => {
    console.log('\n🎉 All tests completed successfully!');
    process.exit(0);
  })
  .catch(() => {
    console.log('\n💥 Tests failed!');
    process.exit(1);
  });
