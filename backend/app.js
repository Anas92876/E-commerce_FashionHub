// The Express app, without app.listen().
// - Locally:   server.js imports it and listens on PORT
// - On Vercel: api/index.js exports it as a serverless function
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables (before anything reads process.env)
dotenv.config({ quiet: true });

// Initialize Express app
const app = express();

// CORS: the frontend and API share one domain on Vercel, so same-site requests are
// always allowed. CLIENT_URL can add another origin (e.g. a custom domain).
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000'].filter(Boolean);

const isAllowedOrigin = (origin, host) =>
  !origin || // same-origin GETs, curl, mobile apps
  origin === `https://${host}` ||
  allowedOrigins.includes(origin) ||
  process.env.NODE_ENV !== 'production'; // allow everything in development

app.use(cors((req, callback) => {
  const allowed = isAllowedOrigin(req.headers.origin, req.headers.host);
  callback(allowed ? null : Object.assign(new Error('Not allowed by CORS'), { statusCode: 403 }), {
    origin: allowed,
    credentials: true,
    optionsSuccessStatus: 200,
  });
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints
const health = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};
app.get('/health', health);
app.get('/api/health', health);

// Basic route
app.get(['/', '/api'], (req, res) => {
  res.json({
    message: 'Welcome to ZAYRO API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/users', require('./routes/users'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/admin', require('./routes/admin'));

// Unknown API routes -> JSON 404
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Multer errors (e.g. file too large) are client errors
  const status = err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  res.status(status).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

module.exports = app;
