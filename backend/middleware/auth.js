const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { normalizeId } = require('../utils/db');
const { USER_PUBLIC_COLUMNS, toUser } = require('../utils/user');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from Bearer token
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tokens issued before the Supabase migration hold Mongo ObjectIds
    const userId = normalizeId(decoded.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user from token
    const { data, error } = await supabase
      .from('users')
      .select(USER_PUBLIC_COLUMNS)
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = toUser(data);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

// Admin middleware - check if user is admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as admin',
    });
  }
};
