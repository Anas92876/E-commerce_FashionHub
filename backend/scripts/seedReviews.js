/**
 * Add sample customer reviews to every product.
 *
 *   npm run seed:reviews
 *
 * Creates a few sample reviewer accounts (with random, unusable passwords) and
 * 2-4 reviews per product. Safe to re-run: the sample reviewers' old reviews are
 * replaced. Product ratings update automatically (database trigger).
 */
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const { supabase } = require('../config/supabase');
const { check } = require('../utils/db');
const { hashPassword } = require('../utils/user');

const REVIEWERS = [
  { first_name: 'Sara', last_name: 'Ahmed', email: 'sara.ahmed@reviews.fashionhub.example' },
  { first_name: 'Omar', last_name: 'Khan', email: 'omar.khan@reviews.fashionhub.example' },
  { first_name: 'Lina', last_name: 'Hassan', email: 'lina.hassan@reviews.fashionhub.example' },
  { first_name: 'Daniel', last_name: 'Brooks', email: 'daniel.brooks@reviews.fashionhub.example' },
  { first_name: 'Maya', last_name: 'Patel', email: 'maya.patel@reviews.fashionhub.example' },
  { first_name: 'Youssef', last_name: 'Ali', email: 'youssef.ali@reviews.fashionhub.example' },
];

// [rating, comment] pools per category
const COMMENTS = {
  'T-Shirts': [
    [5, 'Super soft cotton and the fit is perfect. Still looks new after many washes.'],
    [5, 'My go-to everyday tee. Bought a second one right away.'],
    [4, 'Great quality for the price. Runs slightly large, consider sizing down.'],
    [4, 'Comfortable and breathable, perfect for summer days.'],
    [3, 'Nice fabric but it shrank a little after the first wash.'],
  ],
  Jeans: [
    [5, 'Best jeans I have owned. The stretch makes them comfortable all day.'],
    [4, 'Great fit through the waist and legs. The color is exactly as pictured.'],
    [5, 'Solid denim, well stitched, and they hold their shape.'],
    [4, 'Really comfortable. Length was a bit long for me, but easy to hem.'],
    [3, 'Good jeans, though the denim is a little stiff at first.'],
  ],
  Dresses: [
    [5, 'Absolutely beautiful! I got so many compliments at the party.'],
    [5, 'The fabric is lovely and it flows nicely. True to size.'],
    [4, 'Gorgeous dress. I wish it had pockets, but otherwise perfect.'],
    [4, 'Elegant and comfortable. The color is even nicer in person.'],
    [3, 'Pretty design, but the fabric wrinkles easily.'],
  ],
  Jackets: [
    [5, 'Excellent quality and it keeps me warm. Worth every penny.'],
    [5, 'Looks premium and fits perfectly across the shoulders.'],
    [4, 'Great jacket, a little heavy, but very well made.'],
    [4, 'Stylish and goes with everything in my wardrobe.'],
    [3, 'Nice look, but the sleeves are slightly long for me.'],
  ],
  Shoes: [
    [5, 'Very comfortable right out of the box, no break-in needed.'],
    [4, 'Good support and they look great. Runs half a size big.'],
    [5, 'I walk all day in these with no problem. Highly recommend.'],
    [4, 'Well made and stylish. The sole has good grip.'],
    [3, 'Look nice, but they took a week to get comfortable.'],
  ],
  Accessories: [
    [5, 'Great quality and finish. Makes a perfect gift.'],
    [4, 'Exactly as described, good value for money.'],
    [5, 'Simple, classic, and well made. Love it.'],
    [4, 'Nice item, fast delivery. Would buy again.'],
    [3, 'Decent quality, but smaller than I expected.'],
  ],
};

const DEFAULT_COMMENTS = COMMENTS['T-Shirts'];

const seedReviews = async () => {
  // Create or update the sample reviewer accounts
  const password = await hashPassword(crypto.randomBytes(24).toString('hex'));
  const reviewers = check(
    await supabase
      .from('users')
      .upsert(REVIEWERS.map((r) => ({ ...r, password, role: 'customer' })), { onConflict: 'email' })
      .select('id')
  );
  const reviewerIds = reviewers.map((r) => r.id);

  // Remove previous sample reviews so the script can be re-run
  check(await supabase.from('reviews').delete().in('user_id', reviewerIds));

  const products = check(await supabase.from('products').select('id, category').eq('is_active', true));

  const rows = [];
  products.forEach((product, i) => {
    const pool = COMMENTS[product.category] || DEFAULT_COMMENTS;
    const count = 2 + (i % 3); // 2-4 reviews per product
    for (let j = 0; j < count; j++) {
      const [rating, comment] = pool[(i + j) % pool.length];
      const daysAgo = 3 + ((i * 7 + j * 11) % 60);
      rows.push({
        product_id: product.id,
        user_id: reviewerIds[(i + j) % reviewerIds.length],
        rating,
        comment,
        verified_purchase: false,
        created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  });

  if (rows.length) {
    check(await supabase.from('reviews').insert(rows));
  }

  return { reviewers: reviewerIds.length, reviews: rows.length, products: products.length };
};

module.exports = seedReviews;

if (require.main === module) {
  seedReviews()
    .then(({ reviews, products }) => {
      console.log(`✅ Added ${reviews} reviews across ${products} products`);
    })
    .catch((error) => {
      console.error('❌ Error seeding reviews:', error.message);
      process.exitCode = 1;
    });
}
