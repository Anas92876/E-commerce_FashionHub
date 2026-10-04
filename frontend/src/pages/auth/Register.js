import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthField from '../../components/auth/AuthField';

// Password rules (shown as a live checklist under the field)
const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
];

const validateName = (name, fieldName) => {
  if (!name || name.trim() === '') return `${fieldName} is required`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  return '';
};

const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password));
  return failed ? `Password needs: ${failed.label.toLowerCase()}` : '';
};

const validateConfirmPassword = (confirmPassword, password) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (confirmPassword !== password) return 'Passwords do not match';
  return '';
};

const PasswordChecklist = ({ password }) => (
  <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs" aria-label="Password requirements">
    {PASSWORD_RULES.map((rule) => {
      const met = rule.test(password);
      return (
        <li key={rule.label} className={`flex items-center gap-1.5 ${met ? 'text-ink dark:text-white' : 'text-stone-500 dark:text-gray-400'}`}>
          <span
            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
              met ? 'border-primary-600 bg-primary-600 text-white' : 'border-stone-300 dark:border-gray-600'
            }`}
            aria-hidden="true"
          >
            {met && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
          </span>
          {rule.label}
          <span className="sr-only">{met ? '(done)' : '(not yet)'}</span>
        </li>
      );
    })}
  </ul>
);

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { firstName, lastName, email, password, confirmPassword } = formData;

  const validateField = (name, value, data = formData) => {
    switch (name) {
      case 'firstName':
        return validateName(value, 'First name');
      case 'lastName':
        return validateName(value, 'Last name');
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(value, data.password);
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);

    const nextErrors = { ...errors };
    if (touched[name]) nextErrors[name] = validateField(name, value, next);
    // changing the password re-checks the confirmation
    if (name === 'password' && touched.confirmPassword) {
      nextErrors.confirmPassword = validateConfirmPassword(next.confirmPassword, value);
    }
    setErrors(nextErrors);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      firstName: validateName(firstName, 'First name'),
      lastName: validateName(lastName, 'Last name'),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    };
    setErrors(newErrors);
    setTouched({ firstName: true, lastName: true, email: true, password: true, confirmPassword: true });

    if (Object.values(newErrors).some(Boolean)) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);
    const result = await register({ firstName, lastName, email, password });
    setLoading(false);

    if (result.success) {
      toast.success('Welcome to FashionHub!');
      navigate('/');
    } else {
      if (result.message?.toLowerCase().includes('already exists')) {
        setErrors((prev) => ({
          ...prev,
          email: 'An account with this email already exists. Try signing in instead.',
        }));
        setTouched((prev) => ({ ...prev, email: true }));
      }
      toast.error(result.message);
    }
  };

  const field = (name) => ({
    id: name,
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
    showError: touched[name],
  });

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Join"
      accent="FashionHub."
      intro="Save the pieces you love, follow every order and check out with cash on delivery."
      image="/images/auth/shopping-bags"
      imageAlt=""
      tagline="Considered pieces, delivered free."
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-primary-700 dark:text-white dark:hover:text-primary-300">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <AuthField {...field('firstName')} label="First name" autoComplete="given-name" placeholder="Sara" />
          <AuthField {...field('lastName')} label="Last name" autoComplete="family-name" placeholder="Ahmed" />
        </div>

        <AuthField {...field('email')} type="email" label="Email" autoComplete="email" placeholder="you@example.com" />

        <AuthField
          {...field('password')}
          type="password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          hint={<PasswordChecklist password={password} />}
        />

        <AuthField
          {...field('confirmPassword')}
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
        />

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-md bg-primary-600 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
