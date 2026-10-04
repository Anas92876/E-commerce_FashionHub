// User helpers - replaces the Mongoose User model's hooks and methods
const bcrypt = require('bcryptjs');
const { toApi } = require('./db');

// Columns safe to return to clients (never the password hash)
const USER_PUBLIC_COLUMNS =
  'id, first_name, last_name, email, role, shipping_address, email_preferences, created_at, updated_at';

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = (entered, hash) => bcrypt.compare(entered, hash);

// Row -> API user (both `id` and `_id`, which different frontend parts use)
const toUser = (row) => {
  if (!row) return row;
  const { password, ...user } = toApi(row);
  user.id = user._id;
  return user;
};

module.exports = {
  USER_PUBLIC_COLUMNS,
  hashPassword,
  comparePassword,
  toUser,
};
