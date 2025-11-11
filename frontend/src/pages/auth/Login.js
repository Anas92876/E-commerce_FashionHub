import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  HeartIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [authError, setAuthError] = useState('');

  const { email, password } = formData;

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  // Validate all fields
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear auth error when user starts typing
    if (authError) {
      setAuthError('');
    }

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    const newErrors = {
      email: emailError,
      password: passwordError,
    };

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    // Check if there are any errors
    if (emailError || passwordError) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);
    setAuthError(''); // Clear any previous auth errors

    // Login user
    const result = await login({ email, password });

    setLoading(false);

    if (result.success) {
      toast.success('Login successful!');
      // Redirect to the page they came from or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      // Set auth error for display on the form
      setAuthError('Your email or password is invalid');
      toast.error(result.message || 'Your email or password is invalid');
    }
  };

  return (
   <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
    {/* Background Decorative Elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-100/30 rounded-full blur-3xl" />
    </div>

    <div className="relative w-full max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* Left Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-10">

            {/* ✅ Back button INSIDE the card (non-absolute) */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-primary-600 font-semibold transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>

            {/* Logo & Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mb-4"
              >
                <LockClosedIcon className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-display">
                Welcome Back
              </h1>
              <p className="text-gray-600 font-sans">
                Login to continue shopping
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Authentication Error Message */}
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-red-800">
                        {authError}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-sans ${
                      errors.email && touched.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.email && touched.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-sans ${
                      errors.password && touched.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? 'Logging in...' : 'Login'}
              </motion.button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 font-sans">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

          {/* Right Side - Shopping Cart Flow Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md h-[500px]">
              {/* Central Shopping Cart */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl rotate-12">
                    <ShoppingBagIcon className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    3
                  </div>
                </motion.div>
              </div>

              {/* Flowing Product Items - T-Shirt */}
              <motion.div
                animate={{
                  y: [0, -120, -240],
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.8]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeOut",
                  times: [0, 0.3, 0.7, 1]
                }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
              >
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </motion.div>

              {/* Flowing Product Items - Jeans */}
              <motion.div
                animate={{
                  y: [0, -120, -240],
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.8]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 1.3,
                  times: [0, 0.3, 0.7, 1]
                }}
                className="absolute bottom-0 left-1/3 -translate-x-1/2"
              >
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </motion.div>

              {/* Flowing Product Items - Shoes */}
              <motion.div
                animate={{
                  y: [0, -120, -240],
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.8]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 2.6,
                  times: [0, 0.3, 0.7, 1]
                }}
                className="absolute bottom-0 right-1/3 -translate-x-1/2"
              >
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </motion.div>

              {/* Circular Path Items */}
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0"
              >
                {/* Item 1 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl shadow-lg flex items-center justify-center">
                    <HeartIcon className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-8"
              >
                {/* Item 2 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Feature Badges */}
              <div className="absolute top-8 right-0">
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white px-4 py-2 rounded-l-full shadow-lg border-r-4 border-green-500"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">Free Shipping</div>
                      <div className="text-xs text-gray-500">On all orders</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="absolute top-32 right-0">
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="bg-white px-4 py-2 rounded-l-full shadow-lg border-r-4 border-blue-500"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">Secure Pay</div>
                      <div className="text-xs text-gray-500">100% Protected</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="absolute bottom-32 right-0">
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="bg-white px-4 py-2 rounded-l-full shadow-lg border-r-4 border-purple-500"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">Top Quality</div>
                      <div className="text-xs text-gray-500">Premium items</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
