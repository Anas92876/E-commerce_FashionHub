import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { API_URL } from "../../utils/api";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout, refreshUser } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setProfileData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
    });
  }, [user, navigate]);

  // Validation functions
  const validateName = (name, fieldName) => {
    if (!name || name.trim() === "") return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { label: "Very Weak", color: "bg-red-500", strength: 1 },
      { label: "Weak", color: "bg-orange-500", strength: 2 },
      { label: "Fair", color: "bg-yellow-500", strength: 3 },
      { label: "Good", color: "bg-blue-500", strength: 4 },
      { label: "Strong", color: "bg-green-500", strength: 5 },
    ];

    const level = levels[Math.min(strength - 1, 4)] || { strength: 0, label: "", color: "" };
    return { ...level, strength };
  };

  // Validate individual field
  const validateField = (name, value, additionalData = {}) => {
    let error = "";
    switch (name) {
      case "firstName":
        error = validateName(value, "First name");
        break;
      case "lastName":
        error = validateName(value, "Last name");
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "currentPassword":
        if (!value) error = "Current password is required";
        break;
      case "newPassword":
        error = validatePassword(value);
        // Also revalidate confirm password if it was touched
        if (touched.confirmPassword && passwordData.confirmPassword) {
          const confirmError = validateConfirmPassword(
            passwordData.confirmPassword,
            value
          );
          setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value, passwordData.newPassword);
        break;
      default:
        break;
    }
    return error;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });

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

  // Update profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const firstNameError = validateName(profileData.firstName, "First name");
    const lastNameError = validateName(profileData.lastName, "Last name");
    const emailError = validateEmail(profileData.email);

    const newErrors = {
      firstName: firstNameError,
      lastName: lastNameError,
      email: emailError,
    };

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
    });

    // Check if there are any errors
    if (firstNameError || lastNameError || emailError) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_URL}/auth/update-profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        updateUser(data.user);
        toast.success("Profile updated successfully!");
        setStep(2);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      
      // Check if the error is about existing email
      if (errorMessage.toLowerCase().includes("already") || 
          errorMessage.toLowerCase().includes("in use")) {
        setErrors((prev) => ({ ...prev, email: errorMessage }));
        setTouched((prev) => ({ ...prev, email: true }));
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const currentPasswordError = passwordData.currentPassword
      ? ""
      : "Current password is required";
    const newPasswordError = validatePassword(passwordData.newPassword);
    const confirmPasswordError = validateConfirmPassword(
      passwordData.confirmPassword,
      passwordData.newPassword
    );

    const newErrors = {
      currentPassword: currentPasswordError,
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError,
    };

    setErrors(newErrors);
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Check if there are any errors
    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_URL}/auth/update-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        localStorage.setItem("token", data.token);
        toast.success("Password updated successfully!");
        setStep(3);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update password";
      
      // Check if the error is about incorrect current password
      if (errorMessage.toLowerCase().includes("incorrect") ||
          errorMessage.toLowerCase().includes("current")) {
        setErrors((prev) => ({ ...prev, currentPassword: errorMessage }));
        setTouched((prev) => ({ ...prev, currentPassword: true }));
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  // Step component fade animation
  const fade = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col transition-colors duration-300">
      <Navbar />

      {/* Header */}
      <header className="text-center pt-20 sm:pt-24 pb-8 sm:pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Account Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage your personal information and secure your account
          </p>
        </motion.div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 mb-8 sm:mb-12">
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 h-2 sm:h-3 rounded-full shadow-lg"
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-3 px-1">
            <span className={`font-medium ${step >= 1 ? "text-primary-600 dark:text-primary-400" : ""}`}>
              Profile
            </span>
            <span className={`font-medium ${step >= 2 ? "text-primary-600 dark:text-primary-400" : ""}`}>
              Security
            </span>
            <span className={`font-medium ${step >= 3 ? "text-primary-600 dark:text-primary-400" : ""}`}>
              Complete
            </span>
          </div>
        </div>
      </div>

      {/* Steps Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-12 sm:pb-24">
        <div className="relative w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section
                key="step1"
                {...fade}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl dark:shadow-gray-900/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10"
              >
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                    <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Personal Information
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Update your profile details
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        First Name <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        onBlur={handleBlur}
                        placeholder="John"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                          errors.firstName && touched.firstName
                            ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30"
                            : "border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-200 dark:focus:ring-primary-900/30"
                        } focus:ring-2 outline-none`}
                      />
                      {errors.firstName && touched.firstName && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          {errors.firstName}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Last Name <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        onBlur={handleBlur}
                        placeholder="Doe"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                          errors.lastName && touched.lastName
                            ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30"
                            : "border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-200 dark:focus:ring-primary-900/30"
                        } focus:ring-2 outline-none`}
                      />
                      {errors.lastName && touched.lastName && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          {errors.lastName}
                        </motion.p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        onBlur={handleBlur}
                        placeholder="you@example.com"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                          errors.email && touched.email
                            ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30"
                            : "border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-200 dark:focus:ring-primary-900/30"
                        } focus:ring-2 outline-none`}
                      />
                    </div>
                    {errors.email && touched.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ChevronRightIcon className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section
                key="step2"
                {...fade}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl dark:shadow-gray-900/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10"
              >
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                    <ShieldCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Security Settings
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Current Password <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <KeyIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        onBlur={handleBlur}
                        placeholder="Enter current password"
                        className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                          errors.currentPassword && touched.currentPassword
                            ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30"
                            : "border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-200 dark:focus:ring-primary-900/30"
                        } focus:ring-2 outline-none`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPasswords.current ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && touched.currentPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        {errors.currentPassword}
                      </motion.p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        New Password <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          onBlur={handleBlur}
                          placeholder="Min 8 characters"
                          className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                            errors.newPassword && touched.newPassword
                              ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30"
                              : "border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-200 dark:focus:ring-primary-900/30"
                          } focus:ring-2 outline-none`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new,
                            })
                          }
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showPasswords.new ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {passwordData.newPassword && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full transition-all ${
                                  level <= passwordStrength.strength
                                    ? passwordStrength.color
                                    : "bg-gray-200 dark:bg-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Strength:{" "}
                            <span
                              className={`font-semibold ${
                                passwordStrength.color === "bg-green-500"
                                  ? "text-green-600 dark:text-green-400"
                                  : passwordStrength.color === "bg-blue-500"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : passwordStrength.color === "bg-yellow-500"
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : passwordStrength.color === "bg-orange-500"
                                  ? "text-orange-600 dark:text-orange-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {passwordStrength.label}
                            </span>
                          </p>
                        </div>
                      )}
                      {errors.newPassword && touched.newPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          {errors.newPassword}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          onBlur={handleBlur}
                          placeholder="Confirm new password"
                          className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                            errors.confirmPassword && touched.confirmPassword
                              ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30"
                              : passwordData.confirmPassword &&
                                passwordData.newPassword === passwordData.confirmPassword
                              ? "border-green-500 dark:border-green-400 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-200 dark:focus:ring-green-900/30"
                              : "border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-200 dark:focus:ring-primary-900/30"
                          } focus:ring-2 outline-none`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showPasswords.confirm ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && touched.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                      {passwordData.confirmPassword &&
                        !errors.confirmPassword &&
                        passwordData.newPassword === passwordData.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-1.5 text-xs text-green-600 dark:text-green-400 flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Passwords match
                          </motion.p>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <span>Update Password</span>
                          <CheckCircleIcon className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section
                key="step3"
                {...fade}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl dark:shadow-gray-900/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-6"
                >
                  <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 dark:text-green-400" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  All Set!
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  Your account information and password have been successfully updated.
                  Your account is now more secure.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate("/")}
                    className="px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="px-6 sm:px-8 py-3 rounded-xl border-2 border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
