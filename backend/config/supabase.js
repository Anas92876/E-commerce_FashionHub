const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

// Server-side client using the service_role key (bypasses RLS).
// Never expose this key to the frontend.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

// Verify the connection on startup (mirrors the old connectDB log)
const checkConnection = async () => {
  // Not a HEAD request: those hide "table not found" errors
  const { error } = await supabase.from('categories').select('id').limit(1);
  if (error) {
    console.error(`Supabase connection error: ${error.message}`);
    console.error('Did you run backend/supabase/schema.sql in the Supabase SQL editor?');
    return;
  }
  console.log(`Supabase Connected: ${new URL(SUPABASE_URL).host}`);
};

module.exports = { supabase, STORAGE_BUCKET, checkConnection };
