/**
 * Sample store activity: customers, orders, reviews, wishlists and coupons.
 *
 *   npm run seed:reviews
 *
 * - 12 sample customers (password: Customer123!) - they can log in
 * - ~35 orders over the last 60 days with realistic statuses and tracking
 *   history (older orders delivered, recent ones pending/shipped, a few cancelled)
 * - 2-5 reviews per product; "verified purchase" when the reviewer bought it
 * - wishlists, and 3 coupons (WELCOME10, SAVE20, SUMMER25 - the last one expired)
 *
 * Safe to re-run: the sample customers' orders, reviews and wishlists are
 * replaced; nobody else's data is touched. Uses a fixed random seed, so every
 * run creates the same data. Product ratings update automatically (trigger).
 */
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const { supabase } = require('../config/supabase');
const { check } = require('../utils/db');
const { hashPassword } = require('../utils/user');

const CUSTOMER_PASSWORD = 'Customer123!';

const CUSTOMERS = [
  ['Sara', 'Ahmed', 'Lahore', 'Pakistan', '54000', '+92 300 1234567', '12 Gulberg III, Main Boulevard'],
  ['Omar', 'Khan', 'Karachi', 'Pakistan', '75500', '+92 321 7654321', '45-B Clifton Block 5'],
  ['Lina', 'Hassan', 'Dubai', 'United Arab Emirates', '00000', '+971 50 123 4567', 'Marina Gate 2, Apt 1804'],
  ['Daniel', 'Brooks', 'Austin', 'United States', '78701', '+1 512 555 0142', '210 Congress Ave, Unit 6'],
  ['Maya', 'Patel', 'London', 'United Kingdom', 'E1 6AN', '+44 20 7946 0321', '18 Brick Lane'],
  ['Youssef', 'Ali', 'Cairo', 'Egypt', '11511', '+20 100 555 2211', '7 El Tahrir St, Dokki'],
  ['Hannah', 'Schmidt', 'Berlin', 'Germany', '10115', '+49 30 1234 5678', 'Invalidenstraße 42'],
  ['Ahmed', 'Raza', 'Islamabad', 'Pakistan', '44000', '+92 333 5551234', 'House 9, Street 21, F-7/2'],
  ['Chloe', 'Martin', 'Toronto', 'Canada', 'M5V 2T6', '+1 416 555 0198', '88 Spadina Ave, Suite 410'],
  ['Fatima', 'Noor', 'Riyadh', 'Saudi Arabia', '12211', '+966 55 123 4567', 'King Fahd Rd, Al Olaya'],
  ['James', 'Carter', 'Sydney', 'Australia', '2000', '+61 2 5550 1234', '25 George St'],
  ['Aisha', 'Malik', 'Manchester', 'United Kingdom', 'M1 1AE', '+44 161 496 0754', '3 Piccadilly Gardens'],
].map(([first, last, city, country, postalCode, phone, address]) => ({
  first_name: first,
  last_name: last,
  email: `${first}.${last}@example.com`.toLowerCase(),
  shipping: { fullName: `${first} ${last}`, phone, address, city, postalCode, country },
}));

const COUPONS = [
  { code: 'WELCOME10', featured: true, description: '10% off your first order', discount_type: 'percent', discount_value: 10, min_order_amount: 0, max_uses: null, expiresInDays: 365 },
  { code: 'SAVE20', featured: true, description: '$20 off orders over $150', discount_type: 'fixed', discount_value: 20, min_order_amount: 150, max_uses: 100, expiresInDays: 90 },
  { code: 'SUMMER25', featured: false, description: 'Summer sale - 25% off (ended)', discount_type: 'percent', discount_value: 25, min_order_amount: 50, max_uses: 500, expiresInDays: -10 },
];

// [rating, comment] per category - mostly positive, some honest criticism
const REVIEWS = {
  'T-Shirts': [
    [5, 'Super soft cotton and the fit is perfect. Still looks new after many washes.'],
    [5, 'My go-to everyday tee. Bought a second color right away.'],
    [4, 'Great quality for the price. Runs slightly large, consider sizing down.'],
    [4, 'Comfortable and breathable, perfect for warm days.'],
    [3, 'Nice fabric but it shrank a little after the first hot wash.'],
    [5, 'Thick material, not see-through at all. Exactly what I wanted.'],
    [2, 'The collar stretched out after a few weeks. Expected better.'],
  ],
  Jeans: [
    [5, 'Best jeans I have owned. The stretch makes them comfortable all day.'],
    [4, 'Great fit through the waist and legs. The color is exactly as pictured.'],
    [5, 'Solid denim, well stitched, and they hold their shape.'],
    [4, 'Really comfortable. A bit long for me, but easy to hem.'],
    [3, 'Good jeans, though the denim felt stiff for the first week.'],
    [5, 'True to size and the wash looks premium. Will order another pair.'],
  ],
  Dresses: [
    [5, 'Absolutely beautiful! I got so many compliments at the wedding.'],
    [5, 'The fabric is lovely and it flows nicely. True to size.'],
    [4, 'Gorgeous dress. I wish it had pockets, but otherwise perfect.'],
    [4, 'Elegant and comfortable. The color is even nicer in person.'],
    [3, 'Pretty design, but the fabric wrinkles easily.'],
    [5, 'Light and airy - perfect for summer evenings.'],
  ],
  Jackets: [
    [5, 'Excellent quality and it keeps me warm. Worth every penny.'],
    [5, 'Looks premium and fits perfectly across the shoulders.'],
    [4, 'Great jacket, a little heavy, but very well made.'],
    [4, 'Stylish and goes with everything in my wardrobe.'],
    [3, 'Nice look, but the sleeves are slightly long for me.'],
    [5, 'Zips and stitching feel very solid. Fast delivery too.'],
  ],
  Shoes: [
    [5, 'Very comfortable right out of the box, no break-in needed.'],
    [4, 'Good support and they look great. Runs half a size big.'],
    [5, 'I walk all day in these with no problem. Highly recommend.'],
    [4, 'Well made and stylish. The sole has good grip.'],
    [3, 'Look nice, but they took a week to get comfortable.'],
    [2, 'Pinched my toes - had to exchange for a bigger size.'],
  ],
  Accessories: [
    [5, 'Great quality and finish. Makes a perfect gift.'],
    [4, 'Exactly as described, good value for money.'],
    [5, 'Simple, classic, and well made. Love it.'],
    [4, 'Nice item, fast delivery. Would buy again.'],
    [3, 'Decent quality, but a bit smaller than I expected.'],
  ],
};

// Small seeded PRNG (mulberry32) so every run produces the same data
const rng = (() => {
  let seed = 20261004;
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const between = (min, max) => min + Math.floor(rng() * (max - min + 1));
const round2 = (n) => Math.round(n * 100) / 100;

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days, hour = 10) => {
  const d = new Date(Date.now() - days * DAY);
  d.setUTCHours(hour, between(0, 59), 0, 0);
  return d;
};

// Status + tracking history from the order's age
const orderTimeline = (created, ageDays, cancel) => {
  const at = (hours) => new Date(created.getTime() + hours * 60 * 60 * 1000).toISOString();
  const history = [{ status: 'Pending', at: created.toISOString() }];
  if (cancel) {
    history.push({ status: 'Cancelled', at: at(between(2, 20)) });
    return { status: 'Cancelled', history };
  }
  if (ageDays < 1) return { status: 'Pending', history };
  history.push({ status: 'Processing', at: at(between(6, 20)) });
  if (ageDays < 3) return { status: 'Processing', history };
  history.push({ status: 'Shipped', at: at(between(30, 50)) });
  if (ageDays < 7) return { status: 'Shipped', history };
  history.push({ status: 'Delivered', at: at(between(96, 150)) });
  return { status: 'Delivered', history };
};

const seedReviews = async () => {
  // ---- products
  const products = check(
    await supabase.from('products').select('id, name, category, base_price, price, image, variants').eq('is_active', true)
  ).filter((p) => p.variants?.length);
  if (products.length === 0) throw new Error('No products with variants - run the catalog seed first');

  // ---- customers (upsert by email)
  const password = await hashPassword(CUSTOMER_PASSWORD);
  const customers = check(
    await supabase
      .from('users')
      .upsert(
        CUSTOMERS.map((c) => ({
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          password,
          role: 'customer',
          shipping_address: {
            street: c.shipping.address,
            city: c.shipping.city,
            zipCode: c.shipping.postalCode,
            country: c.shipping.country,
          },
        })),
        { onConflict: 'email' }
      )
      .select('id, email')
  );
  const byEmail = new Map(customers.map((c) => [c.email, c.id]));
  const customerIds = customers.map((c) => c.id);

  // ---- clear previous sample activity
  check(await supabase.from('orders').delete().in('user_id', customerIds));
  check(await supabase.from('reviews').delete().in('user_id', customerIds));
  check(await supabase.from('wishlists').delete().in('user_id', customerIds));

  // ---- coupons (upsert by code; usage counted below)
  check(
    await supabase.from('coupons').upsert(
      COUPONS.map(({ expiresInDays, ...c }) => ({
        ...c,
        is_active: true,
        expires_at: new Date(Date.now() + expiresInDays * DAY).toISOString(),
      })),
      { onConflict: 'code' }
    )
  );

  // ---- orders
  const purchases = new Map(); // `${userId}:${productId}` -> delivered/shipped date
  const couponUses = {};
  const orderRows = [];

  for (const customer of CUSTOMERS) {
    const userId = byEmail.get(customer.email);
    const count = between(1, 4);
    for (let n = 0; n < count; n++) {
      const ageDays = rng() < 0.15 ? rng() * 0.9 : between(1, 60) + rng(); // a few brand-new orders
      const created = daysAgo(ageDays, between(8, 21));
      const cancel = ageDays >= 1 && rng() < 0.08;

      // 1-3 different products, an in-stock color/size each
      const chosen = new Set();
      const items = [];
      const itemCount = between(1, 3);
      while (items.length < itemCount && chosen.size < products.length) {
        const product = pick(products);
        if (chosen.has(product.id)) continue;
        chosen.add(product.id);
        const variant = pick(product.variants.filter((v) => v.isActive !== false));
        const size = pick(variant.sizes.filter((s) => s.stock > 0).length ? variant.sizes.filter((s) => s.stock > 0) : variant.sizes);
        items.push({
          product: product.id,
          name: product.name,
          price: Number(variant.priceOverride || product.base_price || product.price),
          quantity: rng() < 0.2 ? 2 : 1,
          size: size.size,
          image: variant.images?.[0] || product.image || '',
          variantSku: variant.sku,
          color: { name: variant.color.name, hex: variant.color.hex, code: variant.color.code },
          sizeSku: size.sku,
        });
      }

      const itemsPrice = round2(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
      let couponCode = null;
      let discount = 0;
      if (itemsPrice >= 150 && rng() < 0.3) {
        couponCode = 'SAVE20';
        discount = 20;
      } else if (rng() < 0.2) {
        couponCode = 'WELCOME10';
        discount = round2(itemsPrice * 0.1);
      }
      if (couponCode && !cancel) couponUses[couponCode] = (couponUses[couponCode] || 0) + 1;

      const { status, history } = orderTimeline(created, ageDays, cancel);
      const delivered = history.find((h) => h.status === 'Delivered');

      if (status === 'Delivered' || status === 'Shipped') {
        for (const item of items) purchases.set(`${userId}:${item.product}`, new Date(delivered?.at || history.at(-1).at));
      }

      orderRows.push({
        insert: {
          user_id: userId,
          items,
          shipping_address: customer.shipping,
          payment_method: 'Cash on Delivery',
          items_price: itemsPrice,
          shipping_price: 0,
          discount_price: discount,
          total_price: round2(itemsPrice - discount),
          coupon_code: couponCode,
          status,
          is_paid: status === 'Delivered',
          paid_at: delivered ? delivered.at : null,
          is_delivered: status === 'Delivered',
          delivered_at: delivered ? delivered.at : null,
          created_at: created.toISOString(),
        },
        history,
      });
    }
  }

  // Insert, then set the real tracking history (the insert trigger records "now")
  const inserted = check(await supabase.from('orders').insert(orderRows.map((o) => o.insert)).select('id'));
  for (let i = 0; i < inserted.length; i += 5) {
    await Promise.all(
      inserted.slice(i, i + 5).map((row, j) =>
        supabase.from('orders').update({ status_history: orderRows[i + j].history }).eq('id', row.id).then(check)
      )
    );
  }

  for (const coupon of COUPONS) {
    check(await supabase.from('coupons').update({ used_count: couponUses[coupon.code] || 0 }).eq('code', coupon.code));
  }

  // ---- reviews: 2-5 per product, buyers first (verified purchase)
  const reviewRows = [];
  for (const product of products) {
    const pool = [...(REVIEWS[product.category] || REVIEWS['T-Shirts'])].sort(() => rng() - 0.5);
    const buyers = customerIds.filter((id) => purchases.has(`${id}:${product.id}`));
    const others = customerIds.filter((id) => !buyers.includes(id)).sort(() => rng() - 0.5);
    const reviewers = [...buyers, ...others].slice(0, Math.min(between(2, 5), pool.length));

    reviewers.forEach((userId, i) => {
      const [rating, comment] = pool[i];
      const boughtAt = purchases.get(`${userId}:${product.id}`);
      const reviewedAt = boughtAt
        ? new Date(Math.min(boughtAt.getTime() + between(1, 6) * DAY, Date.now() - 60 * 60 * 1000))
        : daysAgo(between(2, 70));
      reviewRows.push({
        product_id: product.id,
        user_id: userId,
        rating,
        comment,
        verified_purchase: Boolean(boughtAt),
        created_at: reviewedAt.toISOString(),
        updated_at: reviewedAt.toISOString(),
      });
    });
  }
  check(await supabase.from('reviews').insert(reviewRows));

  // ---- wishlists: 0-4 saved products per customer
  const wishlistRows = [];
  for (const userId of customerIds) {
    const saved = new Set();
    const count = between(0, 4);
    while (saved.size < count) saved.add(pick(products).id);
    saved.forEach((productId) => wishlistRows.push({ user_id: userId, product_id: productId }));
  }
  if (wishlistRows.length) check(await supabase.from('wishlists').insert(wishlistRows));

  return {
    customers: customers.length,
    orders: inserted.length,
    reviews: reviewRows.length,
    wishlists: wishlistRows.length,
    coupons: COUPONS.length,
  };
};

module.exports = seedReviews;
module.exports.CUSTOMER_PASSWORD = CUSTOMER_PASSWORD;

if (require.main === module) {
  seedReviews()
    .then((r) => {
      console.log(`✅ ${r.customers} customers, ${r.orders} orders, ${r.reviews} reviews, ${r.wishlists} wishlist items, ${r.coupons} coupons`);
    })
    .catch((error) => {
      console.error('❌ Error seeding sample activity:', error.message);
      process.exitCode = 1;
    });
}
