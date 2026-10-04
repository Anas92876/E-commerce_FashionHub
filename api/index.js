// Vercel serverless function: every /api/* request is rewritten here (see vercel.json)
// and handled by the Express app in backend/.
module.exports = require('../backend/app');
