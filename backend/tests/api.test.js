// HTTP-level tests: run the real Express app against a fake Supabase client
const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { createFakeSupabase, installFakeSupabase, resetAppModules } = require('./helpers');

const USER_ID = '22222222-2222-2222-2222-222222222222';

// Start the app on a random port with the given fake; returns { url, close, fake }
const startApp = async (fakeOptions) => {
  resetAppModules();
  const fake = createFakeSupabase(fakeOptions);
  installFakeSupabase(fake);
  const app = require('../app');
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  return {
    fake,
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
};

const userRow = (role) => ({ id: USER_ID, first_name: 'Test', last_name: 'User', email: 't@example.com', role });
const tokenFor = () => jwt.sign({ id: USER_ID }, process.env.JWT_SECRET);

test('health check', async () => {
  const app = await startApp();
  try {
    const res = await fetch(`${app.url}/api/health`);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).status, 'healthy');
  } finally {
    await app.close();
  }
});

test('unknown API routes return JSON 404', async () => {
  const app = await startApp();
  try {
    const res = await fetch(`${app.url}/api/nope`);
    assert.equal(res.status, 404);
    assert.equal((await res.json()).success, false);
  } finally {
    await app.close();
  }
});

test('admin routes need a token and the admin role', async () => {
  let app = await startApp({ tables: { users: [userRow('customer')] } });
  try {
    let res = await fetch(`${app.url}/api/admin/stats`);
    assert.equal(res.status, 401);

    res = await fetch(`${app.url}/api/admin/stats`, { headers: { Authorization: `Bearer ${tokenFor()}` } });
    assert.equal(res.status, 403);
  } finally {
    await app.close();
  }

  app = await startApp({
    tables: { users: [userRow('admin')], orders: [] },
    rpc: { admin_dashboard_stats: ({ p_days }) => ({ data: { totals: { orders: 0 }, period: { days: p_days } }, error: null }) },
  });
  try {
    const res = await fetch(`${app.url}/api/admin/stats?days=7`, { headers: { Authorization: `Bearer ${tokenFor()}` } });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.period.days, 7);
  } finally {
    await app.close();
  }
});

test('login is blocked once the rate limit is reached', async () => {
  const app = await startApp({ rpc: { hit_rate_limit: () => ({ data: false, error: null }) } });
  try {
    const res = await fetch(`${app.url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.co', password: 'whatever' }),
    });
    assert.equal(res.status, 429);
    assert.match((await res.json()).message, /Too many login attempts/);
  } finally {
    await app.close();
  }
});

test('the rate limiter fails open if the database check errors', async () => {
  // no fake for hit_rate_limit -> error -> request continues to validation/login
  const app = await startApp({ tables: { users: [] } });
  try {
    const res = await fetch(`${app.url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.co', password: 'whatever' }),
    });
    assert.equal(res.status, 401); // reached the login handler: unknown user
  } finally {
    await app.close();
  }
});

test('product search passes filters to search_products', async () => {
  const app = await startApp({
    rpc: { search_products: () => ({ data: [], error: null, count: 0 }) },
  });
  try {
    const res = await fetch(`${app.url}/api/products?search=50%25_off&size=M&color=Red&inStock=true&minPrice=10`);
    assert.equal(res.status, 200);
    const call = app.fake.calls.find((c) => c.rpc === 'search_products');
    assert.equal(call.args.p_search, '50\\%\\_off'); // LIKE wildcards escaped
    assert.equal(call.args.p_size, 'M');
    assert.equal(call.args.p_color, 'Red');
    assert.equal(call.args.p_in_stock, true);
    assert.equal(call.args.p_min_price, 10);
    assert.equal(call.args.p_max_price, null);
  } finally {
    await app.close();
  }
});

test('coupon creation validates input', async () => {
  const app = await startApp({ tables: { users: [userRow('admin')] } });
  try {
    const res = await fetch(`${app.url}/api/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFor()}` },
      body: JSON.stringify({ code: 'X', discountType: 'percent', discountValue: 150 }),
    });
    assert.equal(res.status, 400);
    assert.match((await res.json()).message, /Code must be 3-30/);
  } finally {
    await app.close();
  }
});
