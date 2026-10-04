import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthField from '../../components/auth/AuthField';

const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
  return '';
};

// Only check that a password was entered: the server decides if it's right
// (older accounts may have passwords shorter than today's sign-up rules)
const validatePassword = (password) => (password ? '' : 'Password is required');

const VALIDATORS = { email: validateEmail, password: validatePassword };

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [authError, setAuthError] = useState('');

  const { email, password } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (authError) setAuthError('');
    if (touched[name]) setErrors({ ...errors, [name]: VALIDATORS[name](value) });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: VALIDATORS[name](value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    if (newErrors.email || newErrors.password) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);
    setAuthError('');
    const result = await login({ email, password });
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back!');
      // Back to the page they came from, or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setAuthError(result.message || 'Your email or password is incorrect');
      toast.error(result.message || 'Your email or password is incorrect');
    }
  };

  return (
    <AuthLayout
      eyebrow="Sign in"
      title="Welcome"
      accent="back."
      intro="Sign in to see your orders, track deliveries and pick up your saved pieces."
      image="/images/auth/browsing-rail"
      imageAlt=""
      tagline="Wardrobe essentials, made to last."
      footer={
        <p>
          New to ZAYRO?{' '}
          <Link to="/register" className="font-semibold text-ink underline underline-offset-4 hover:text-primary-700 dark:text-white dark:hover:text-primary-300">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {authError && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {authError}
          </div>
        )}

        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          showError={touched.email}
        />

        <AuthField
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          showError={touched.password}
        />

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-md bg-primary-600 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
