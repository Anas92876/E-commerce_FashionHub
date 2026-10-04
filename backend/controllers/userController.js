const { forgetUser } = require('../middleware/auth');
const { supabase } = require('../config/supabase');
const { check, normalizeId } = require('../utils/db');
const { USER_PUBLIC_COLUMNS, toUser } = require('../utils/user');

const findUser = async (id) => {
  const userId = normalizeId(id);
  if (!userId) return null;
  return check(await supabase.from('users').select('id').eq('id', userId).maybeSingle());
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const rows = check(
      await supabase
        .from('users')
        .select(USER_PUBLIC_COLUMNS)
        .order('created_at', { ascending: false })
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows.map(toUser),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    if (!role || !['customer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "customer" or "admin"',
      });
    }

    // Check if user exists
    const user = await findUser(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from changing their own role
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    // Update role
    const row = check(
      await supabase.from('users').update({ role }).eq('id', user.id).select(USER_PUBLIC_COLUMNS).single()
    );
    forgetUser(user.id);

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: toUser(row),
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Check if user exists
    const user = await findUser(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    // Delete user (their reviews are removed; their orders are kept with user = null)
    check(await supabase.from('users').delete().eq('id', user.id));
    forgetUser(user.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};
