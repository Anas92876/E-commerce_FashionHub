// Local development server (on Vercel, api/index.js serves the app instead)
const app = require('./app');
const { checkConnection } = require('./config/supabase');

// Verify the Supabase connection
checkConnection();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
