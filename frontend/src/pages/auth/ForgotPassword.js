import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { API_URL } from '../../utils/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setEmail(value);

    // Validate on change if field was touched
    if (touched.email) {
      const error = validateEmail(value);
      setErrors({ ...errors, email: error });
    }
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, email: true });
    const error = validateEmail(email);
    setErrors({ ...errors, email: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    const emailError = validateEmail(email);
    setErrors({ email: emailError });
    setTouched({ email: true });

    if (emailError) {
      toast.error('Please fix the error before submitting');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });

      if (data.success) {
        setEmailSent(true);
        toast.success('Password reset email sent! Please check your inbox.');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to send reset email';
      toast.error(errorMessage);
      
      // If email doesn't exist, show error in field
      if (errorMessage.toLowerCase().includes('not found') || 
          errorMessage.toLowerCase().includes('no user')) {
        setErrors({ email: 'No account found with this email address' });
        setTouched({ email: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 dark:bg-primary-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-100/30 dark:bg-accent-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl dark:shadow-gray-900/50 p-8 md:p-10 border border-gray-200/50 dark:border-gray-700/50"
        >
          {/* Back Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Login
            </button>
          </div>

          {!emailSent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mb-4"
                >
                  <LockClosedIcon className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 font-display">
                  Forgot Password?
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-sans">
                  No worries! Enter your email and we'll send you reset
                  instructions.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-heading">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all font-sans bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.email && touched.email
                          ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="w-5 h-5" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 font-sans">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Login here
                </Link>
              </p>
              </div>
            </>
          ) : (
            /* Success Message */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
              >
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Check Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We've sent a password reset link to{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> The reset link will expire in 10 minutes.
                  If you don't see the email, please check your spam folder.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                    setErrors({});
                    setTouched({});
                  }}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold transition-all"
                >
                  Send Another Email
                </button>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold transition-all text-center"
                >
                  Back to Login
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;

