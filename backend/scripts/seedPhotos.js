/**
 * Add photos to the sample products.
 *
 *   npm run seed:photos
 *
 * Downloads free photos from Unsplash (Unsplash License: free for commercial
 * use), uploads them to Supabase Storage and sets them on the products with
 * these names. Products that already have an image are skipped.
 */
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const { supabase } = require('../config/supabase');
const { check } = require('../utils/db');
const { uploadFile } = require('../middleware/upload');

// Product name -> Unsplash photo id (images.unsplash.com/photo-<id>)
const PHOTOS = {
  'Classic White T-Shirt': '1622445275463-afa2ab738c34',
  'Black Cotton T-Shirt': '1618354691373-d851c5c3a990',
  'Slim Fit Blue Jeans': '1598554747436-c9293d6a588f',
  'Classic Straight Jeans': '1714143136372-ddaf8b606da7',
  'Floral Summer Dress': '1502868354157-ec2edd2a1651',
  'Elegant Evening Dress': '1568252542512-9fe8fe9c87bb',
  'Classic Leather Jacket': '1551028719-00167b16eac5',
  'Denim Jacket': '1611312449408-fcece27cdbb7',
  'Canvas Sneakers': '1562105962-2fbaaf107fe3',
  'Leather Boots': '1608256246200-53e635b5b65f',
  'Leather Belt': '1664286074176-5206ee5dc878',
  'Baseball Cap': '1521369909029-2afed882baee',
  'Striped Breton Tee': '1591224615614-e300d72e37c5',
  'Oversized Graphic Tee': '1527719197793-6b777854108d',
  'Black Skinny Jeans': '1718252540511-e958742e4165',
  'Linen Midi Dress': '1625158244856-e5e20f733c1f',
  'Quilted Puffer Jacket': '1614031679232-0dae776a72ee',
  'White Leather Sneakers': '1608379743498-ac08f6d022ba',
  'Running Shoes': '1597892657493-6847b9640bac',
  'Leather Backpack': '1622560480605-d83c853bc5c3',
};

const seedPhotos = async () => {
  const products = check(
    await supabase.from('products').select('id, name, image, variants').in('name', Object.keys(PHOTOS))
  );

  let added = 0;
  for (const product of products) {
    if (product.image) continue;

    // 1000px JPEG, cropped square - served from our own Supabase Storage
    const url = `https://images.unsplash.com/photo-${PHOTOS[product.name]}?w=1000&h=1000&fit=crop&q=80&fm=jpg`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  ! ${product.name}: download failed (HTTP ${response.status})`);
      continue;
    }

    const image = await uploadFile(
      {
        buffer: Buffer.from(await response.arrayBuffer()),
        mimetype: 'image/jpeg',
        originalname: 'photo.jpg',
      },
      'products'
    );

    // Variant products show variant images; legacy products use `image`
    const variants = (product.variants || []).map((v, i) =>
      i === 0 && (!v.images || v.images.length === 0) ? { ...v, images: [image] } : v
    );

    check(await supabase.from('products').update({ image, variants }).eq('id', product.id));
    added++;
  }

  return { added };
};

module.exports = seedPhotos;

if (require.main === module) {
  seedPhotos()
    .then(({ added }) => {
      console.log(`✅ Added photos to ${added} products`);
    })
    .catch((error) => {
      console.error('❌ Error adding photos:', error.message);
      process.exitCode = 1;
    });
}
