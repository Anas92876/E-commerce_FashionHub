// Sample store catalog: 6 categories, 20 products with color/size variants.
// Used by `npm run seed` and `npm run seed:catalog`. Photos are added by
// seedPhotos.js (first color of each product matches its photo).

const CATEGORIES = ['T-Shirts', 'Jeans', 'Dresses', 'Jackets', 'Shoes', 'Accessories'];

const APPAREL = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const WAIST = ['28', '30', '32', '34', '36'];
const SHOE = ['7', '8', '9', '10', '11', '12'];

// color: [name, hex, code, priceOverride?]; stock: one number per size
// (low / zero values are intentional so low-stock alerts have data)
const PRODUCTS = [
  // ---------------- T-Shirts
  {
    name: 'Classic White T-Shirt',
    category: 'T-Shirts',
    basePrice: 24.99,
    description: 'Our everyday essential: a crew-neck tee in 100% organic cotton with a soft, breathable feel. Pre-shrunk and garment-washed so it keeps its shape wash after wash.',
    sizes: APPAREL,
    colors: [
      { color: ['White', '#F5F5F5', 'WHT'], stock: [12, 25, 30, 28, 18, 9] },
      { color: ['Heather Grey', '#9CA3AF', 'GRY'], stock: [8, 15, 20, 16, 10, 4] },
    ],
  },
  {
    name: 'Black Cotton T-Shirt',
    category: 'T-Shirts',
    basePrice: 22.99,
    description: 'A clean black tee in midweight cotton jersey. Regular fit with a ribbed collar that lies flat - easy to dress up or down.',
    sizes: APPAREL,
    colors: [
      { color: ['Black', '#111111', 'BLK'], stock: [10, 22, 26, 24, 14, 6] },
      { color: ['Navy', '#1E3A5F', 'NVY'], stock: [5, 12, 14, 12, 8, 3] },
    ],
  },
  {
    name: 'Striped Breton Tee',
    category: 'T-Shirts',
    basePrice: 34.99,
    description: 'The timeless sailor stripe in heavyweight cotton. Slightly relaxed through the body with a boat-friendly crew neck.',
    sizes: APPAREL,
    colors: [
      { color: ['Navy Stripe', '#1E3A5F', 'NVS'], stock: [6, 14, 18, 15, 9, 2] },
      { color: ['Red Stripe', '#B91C1C', 'RDS', 36.99], stock: [3, 8, 9, 7, 4, 0] },
    ],
  },
  {
    name: 'Oversized Graphic Tee',
    category: 'T-Shirts',
    basePrice: 29.99,
    description: 'A boxy, dropped-shoulder tee with a vintage-style back print. Made from thick 240gsm cotton for that structured streetwear drape.',
    sizes: APPAREL,
    colors: [
      { color: ['Burgundy', '#7F1D1D', 'BRG'], stock: [4, 10, 16, 14, 11, 5] },
      { color: ['Off White', '#F5F0E6', 'OFW'], stock: [5, 9, 12, 12, 8, 4] },
    ],
  },

  // ---------------- Jeans
  {
    name: 'Slim Fit Blue Jeans',
    category: 'Jeans',
    basePrice: 79.99,
    description: 'Slim through the hip and thigh with a tapered leg. Premium stretch denim (98% cotton, 2% elastane) that moves with you and recovers its shape.',
    sizes: WAIST,
    colors: [
      { color: ['Mid Blue', '#4A6FA5', 'MBL'], stock: [8, 16, 20, 14, 6] },
      { color: ['Light Blue', '#8FB3D9', 'LBL'], stock: [4, 9, 11, 8, 3] },
    ],
  },
  {
    name: 'Classic Straight Jeans',
    category: 'Jeans',
    basePrice: 69.99,
    description: 'A straight-leg five-pocket jean with a mid rise and a classic indigo rinse. Rigid cotton denim that softens and fades beautifully over time.',
    sizes: WAIST,
    colors: [{ color: ['Indigo', '#2C3E66', 'IND'], stock: [10, 18, 22, 17, 9] }],
  },
  {
    name: 'Black Skinny Jeans',
    category: 'Jeans',
    basePrice: 74.99,
    description: 'A sleek skinny fit in deep black stretch denim that resists fading. Sits at the waist with a close fit from hip to ankle.',
    sizes: WAIST,
    colors: [
      { color: ['Black', '#1A1A1A', 'BLK'], stock: [7, 13, 15, 10, 4] },
      { color: ['Charcoal', '#374151', 'CHR'], stock: [2, 6, 7, 5, 1] },
    ],
  },

  // ---------------- Dresses
  {
    name: 'Floral Summer Dress',
    category: 'Dresses',
    basePrice: 59.99,
    description: 'A light, flowing wrap dress in a romantic floral print. Flutter sleeves, an adjustable tie waist and a midi length made for warm days.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { color: ['White Floral', '#F8F4EF', 'WFL'], stock: [6, 12, 14, 10, 5] },
      { color: ['Red Floral', '#C2410C', 'RFL'], stock: [3, 7, 8, 6, 2] },
    ],
  },
  {
    name: 'Elegant Evening Dress',
    category: 'Dresses',
    basePrice: 129.99,
    description: 'A floor-length gown with a fitted strapless bodice and a sweeping tulle skirt. Fully lined, with a hidden back zip - made for special occasions.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { color: ['Burgundy', '#7B1E3A', 'BRG'], stock: [3, 5, 6, 3] },
      { color: ['Black', '#111111', 'BLK', 139.99], stock: [2, 4, 4, 2] },
    ],
  },
  {
    name: 'Linen Midi Dress',
    category: 'Dresses',
    basePrice: 69.99,
    description: 'Breathable European linen in a relaxed midi silhouette, with puff sleeves and an open tie back. Gets softer with every wash.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { color: ['Sky Blue', '#BCD4E6', 'SKY'], stock: [5, 10, 12, 9, 4] },
      { color: ['Natural Linen', '#E8DCC8', 'NAT'], stock: [4, 8, 9, 7, 3] },
    ],
  },

  // ---------------- Jackets
  {
    name: 'Classic Leather Jacket',
    category: 'Jackets',
    basePrice: 199.99,
    description: 'A biker jacket in supple genuine lambskin with asymmetric zip, notched lapels and quilted lining. Built to last and look better with age.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { color: ['Black', '#111111', 'BLK'], stock: [4, 8, 9, 6, 2] },
      { color: ['Brown', '#5C3A21', 'BRN', 219.99], stock: [2, 4, 5, 3, 1] },
    ],
  },
  {
    name: 'Denim Jacket',
    category: 'Jackets',
    basePrice: 89.99,
    description: 'The classic trucker jacket in sturdy 13oz denim with a cosy corduroy collar, chest flap pockets and adjustable waist tabs.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { color: ['Dark Wash', '#1F3A5F', 'DRK'], stock: [6, 11, 13, 9, 4] },
      { color: ['Light Wash', '#7DA0C4', 'LGT'], stock: [3, 7, 8, 5, 2] },
    ],
  },
  {
    name: 'Quilted Puffer Jacket',
    category: 'Jackets',
    basePrice: 119.99,
    description: 'Lightweight warmth with recycled synthetic insulation, a water-repellent shell and a stand collar. Packs down into its own pocket.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { color: ['Black', '#111111', 'BLK'], stock: [5, 10, 12, 8, 3] },
      { color: ['Olive', '#4B5320', 'OLV'], stock: [2, 5, 6, 4, 0] },
    ],
  },

  // ---------------- Shoes
  {
    name: 'Canvas Sneakers',
    category: 'Shoes',
    basePrice: 49.99,
    description: 'High-top canvas sneakers with a vulcanised rubber sole, padded collar and classic toe cap. Comfortable from the first wear.',
    sizes: SHOE,
    colors: [
      { color: ['Black', '#111111', 'BLK'], stock: [6, 12, 15, 14, 9, 4] },
      { color: ['Navy', '#1E3A5F', 'NVY'], stock: [3, 6, 8, 7, 5, 2] },
      { color: ['White', '#F5F5F5', 'WHT'], stock: [4, 8, 10, 9, 6, 3] },
    ],
  },
  {
    name: 'Leather Boots',
    category: 'Shoes',
    basePrice: 139.99,
    description: 'Goodyear-welted lace-up boots in full-grain leather with a cushioned insole and a grippy rubber outsole. Resoleable and made to last years.',
    sizes: SHOE,
    colors: [
      { color: ['Dark Brown', '#3E2723', 'DBR'], stock: [3, 6, 8, 7, 5, 2] },
      { color: ['Black', '#111111', 'BLK'], stock: [2, 5, 6, 5, 3, 1] },
    ],
  },
  {
    name: 'White Leather Sneakers',
    category: 'Shoes',
    basePrice: 94.99,
    description: 'Minimal low-top sneakers in smooth white leather with tonal stitching, a padded heel and a cupsole that goes with everything.',
    sizes: SHOE,
    colors: [{ color: ['White', '#F5F5F5', 'WHT'], stock: [5, 11, 14, 13, 8, 4] }],
  },
  {
    name: 'Running Shoes',
    category: 'Shoes',
    basePrice: 109.99,
    description: 'Responsive foam cushioning, a breathable engineered mesh upper and a durable rubber outsole - built for daily miles on road or treadmill.',
    sizes: SHOE,
    colors: [
      { color: ['Grey', '#9CA3AF', 'GRY'], stock: [4, 9, 12, 11, 7, 3] },
      { color: ['Blue', '#2563EB', 'BLU'], stock: [3, 6, 8, 8, 4, 0] },
    ],
  },

  // ---------------- Accessories
  {
    name: 'Leather Belt',
    category: 'Accessories',
    basePrice: 29.99,
    description: 'A 35mm belt cut from a single piece of full-grain leather with a brushed steel buckle. Ages into a rich patina.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { color: ['Brown', '#6B4226', 'BRN'], stock: [8, 14, 12, 6] },
      { color: ['Black', '#111111', 'BLK'], stock: [7, 12, 10, 5] },
    ],
  },
  {
    name: 'Baseball Cap',
    category: 'Accessories',
    basePrice: 19.99,
    description: 'A washed cotton twill cap with a curved brim, embroidered eyelets and an adjustable strap. Soft, broken-in look from day one.',
    sizes: ['One Size'],
    colors: [
      { color: ['Washed Grey', '#6B7280', 'GRY'], stock: [40] },
      { color: ['Black', '#111111', 'BLK'], stock: [35] },
      { color: ['Navy', '#1E3A5F', 'NVY'], stock: [4] },
    ],
  },
  {
    name: 'Leather Backpack',
    category: 'Accessories',
    basePrice: 149.99,
    description: 'A roomy everyday backpack in vegetable-tanned leather with a padded 15" laptop sleeve, front zip pocket and adjustable straps.',
    sizes: ['One Size'],
    colors: [
      { color: ['Cognac', '#9A4E2F', 'CGN'], stock: [9] },
      { color: ['Black', '#111111', 'BLK'], stock: [3] },
    ],
  },
];

module.exports = { CATEGORIES, PRODUCTS };
