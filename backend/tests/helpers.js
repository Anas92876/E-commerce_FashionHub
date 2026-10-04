// Test helpers: replace config/supabase with a fake client before any module
// that uses it is loaded, so tests never touch a real database.
const path = require('path');

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test-project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

/**
 * A tiny chainable stand-in for supabase-js. `tables[name]` is the rows a
 * query on that table resolves to; `rpc[name]` is a function returning
 * { data, error } for supabase.rpc(name, args).
 */
const createFakeSupabase = ({ tables = {}, rpc = {} } = {}) => {
  const calls = [];

  const query = (table) => {
    const state = { table, filters: [] };
    const result = () => ({ data: tables[table] ?? [], error: null });
    const builder = {
      select: () => builder,
      eq: (col, val) => { state.filters.push(['eq', col, val]); return builder; },
      in: (col, vals) => { state.filters.push(['in', col, vals]); return builder; },
      order: () => builder,
      limit: () => builder,
      range: () => builder,
      maybeSingle: async () => ({ data: (tables[table] ?? [])[0] ?? null, error: null }),
      single: async () => ({ data: (tables[table] ?? [])[0] ?? null, error: null }),
      then: (resolve, reject) => Promise.resolve(result()).then(resolve, reject),
    };
    calls.push(state);
    return builder;
  };

  return {
    calls,
    client: {
      from: query,
      // Like supabase-js, rpc() returns a chainable, awaitable builder
      rpc: (name, args) => {
        calls.push({ rpc: name, args });
        const run = () => (rpc[name] ? rpc[name](args) : { data: null, error: { message: `no fake for ${name}` } });
        const builder = {
          select: () => builder,
          order: () => builder,
          range: () => builder,
          limit: () => builder,
          then: (resolve, reject) => Promise.resolve().then(run).then(resolve, reject),
        };
        return builder;
      },
      storage: { from: () => ({}) },
    },
  };
};

// Install a fake client into the require cache (call before requiring app code)
const installFakeSupabase = (fake) => {
  const modulePath = path.resolve(__dirname, '../config/supabase.js');
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports: { supabase: fake.client, STORAGE_BUCKET: 'product-images', checkConnection: async () => {} },
  };
};

// Clear app modules from the cache so the next require picks up a new fake
const resetAppModules = () => {
  const root = path.resolve(__dirname, '..');
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(root) && !key.includes('node_modules') && !key.includes(`${path.sep}tests${path.sep}`)) {
      delete require.cache[key];
    }
  }
};

module.exports = { createFakeSupabase, installFakeSupabase, resetAppModules };
