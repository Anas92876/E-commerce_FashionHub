// Brute-force protection backed by the database (hit_rate_limit), so limits
// hold across Vercel serverless instances.
const { supabase } = require('../config/supabase');

// Client IP (Vercel puts the real client first in x-forwarded-for)
const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
  req.socket?.remoteAddress ||
  'unknown';

// Records an attempt; returns false when the limit is reached.
// Fails open (allows) if the check itself errors, so a database hiccup
// never locks everyone out.
const allowAttempt = async (key, max, windowSeconds) => {
  const { data, error } = await supabase.rpc('hit_rate_limit', {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error('Rate limit check failed:', error.message);
    return true;
  }
  return data !== false;
};

const resetAttempts = async (key) => {
  const { error } = await supabase.rpc('clear_rate_limit', { p_key: key });
  if (error) console.error('Rate limit reset failed:', error.message);
};

// Express middleware factory. `keys(req)` returns [{ key, max, windowSeconds }]
const limit = (keys, message) => async (req, res, next) => {
  try {
    for (const { key, max, windowSeconds } of keys(req)) {
      if (!(await allowAttempt(key, max, windowSeconds))) {
        return res.status(429).json({ success: false, message });
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

const FIFTEEN_MINUTES = 15 * 60;
const ONE_HOUR = 60 * 60;

const loginEmailKey = (email) => `login:${String(email || '').trim().toLowerCase()}`;

// 10 tries per account and 30 per IP every 15 minutes
const loginLimiter = limit(
  (req) => [
    { key: `login-ip:${clientIp(req)}`, max: 30, windowSeconds: FIFTEEN_MINUTES },
    { key: loginEmailKey(req.body?.email), max: 10, windowSeconds: FIFTEEN_MINUTES },
  ],
  'Too many login attempts. Please wait 15 minutes and try again.'
);

// 10 new accounts per IP per hour
const registerLimiter = limit(
  (req) => [{ key: `register-ip:${clientIp(req)}`, max: 10, windowSeconds: ONE_HOUR }],
  'Too many accounts created from this network. Please try again later.'
);

module.exports = { loginLimiter, registerLimiter, resetAttempts, loginEmailKey };
