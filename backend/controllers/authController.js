const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { check, UNIQUE_VIOLATION } = require('../utils/db');
const { resetAttempts, loginEmailKey } = require('../utils/rateLimit');
const {
  USER_PUBLIC_COLUMNS,
  hashPassword,
  comparePassword,
  toUser,
} = require('../utils/user');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const normalizeEmail = (email) => (email ? String(email).trim().toLowerCase() : email);

const findUserByEmail = async (email, columns = USER_PUBLIC_COLUMNS) =>
  check(await supabase.from('users').select(columns).eq('email', normalizeEmail(email)).maybeSingle());

// Shape of the user object returned by register/login
const authUser = (user) => ({
  id: user.id,
  _id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const userExists = await findUserByEmail(email, 'id');
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const row = check(
      await supabase
        .from('users')
        .insert({
          first_name: String(firstName).trim(),
          last_name: String(lastName).trim(),
          email: normalizeEmail(email),
          password: await hashPassword(password),
        })
        .select(USER_PUBLIC_COLUMNS)
        .single()
    );
    const user = toUser(row);

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: authUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === UNIQUE_VIOLATION) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check if user exists (include password)
    const row = await findUserByEmail(email, `${USER_PUBLIC_COLUMNS}, password`);
    if (!row) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isPasswordMatch = await comparePassword(password, row.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const user = toUser(row);

    // Successful login: forget earlier failed attempts for this account
    await resetAttempts(loginEmailKey(email));

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: authUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // protect middleware already loaded the fresh user row
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        ...authUser(user),
        shippingAddress: user.shippingAddress,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const email = normalizeEmail(req.body.email);

    // Check if email is already taken by another user
    if (email) {
      const emailExists = check(
        await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .neq('id', req.user.id)
          .maybeSingle()
      );

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
    }

    // Update user
    const row = check(
      await supabase
        .from('users')
        .update({
          first_name: firstName || req.user.firstName,
          last_name: lastName || req.user.lastName,
          email: email || req.user.email,
        })
        .eq('id', req.user.id)
        .select(USER_PUBLIC_COLUMNS)
        .single()
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: authUser(toUser(row)),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Get user with password
    const row = check(
      await supabase.from('users').select('id, password').eq('id', req.user.id).single()
    );

    // Check current password
    const isPasswordMatch = await comparePassword(currentPassword, row.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    check(
      await supabase
        .from('users')
        .update({ password: await hashPassword(newPassword) })
        .eq('id', req.user.id)
    );

    // Generate new token
    const token = generateToken(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
