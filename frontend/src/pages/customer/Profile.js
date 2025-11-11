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
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const API_URL = "http://localhost:5000/api";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

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

  // Update profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
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
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
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
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Step component fade animation
  const fade = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -40 },
    transition: { duration: 0.4 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
      <Navbar />

      {/* Header */}
      <header className="text-center pt-24 pb-10">
        <h1 className="text-4xl font-bold text-gray-900">Account Setup</h1>
        <p className="text-gray-500">
          Complete your profile and secure your account
        </p>
      </header>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto w-full px-6 mb-12">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-primary-600 h-3 rounded-full"
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Profile</span>
          <span>Password</span>
          <span>Done</span>
        </div>
      </div>

      {/* Steps Container */}
      <main className="flex-1 flex items-center justify-center px-4 pb-24">
        <div className="relative w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section
                key="step1"
                {...fade}
                className="bg-white/70 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-10"
              >
                <div className="flex items-center gap-3 mb-8">
                  <UserIcon className="w-8 h-8 text-primary-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Personal Information
                  </h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-3 mt-1 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                        required
                        className="w-full px-4 py-3 mt-1 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <div className="relative mt-1">
                      <EnvelopeIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        required
                        className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-300"
                  >
                    {loading ? "Updating..." : "Continue"}
                  </button>
                </form>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section
                key="step2"
                {...fade}
                className="bg-white/70 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-10"
              >
                <div className="flex items-center gap-3 mb-8">
                  <KeyIcon className="w-8 h-8 text-primary-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Security Setup
                  </h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 mt-1 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        minLength="6"
                        className="w-full px-4 py-3 mt-1 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        minLength="6"
                        className="w-full px-4 py-3 mt-1 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-all"
                    >
                      {loading ? "Updating..." : "Finish"}
                    </button>
                  </div>
                </form>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section
                key="step3"
                {...fade}
                className="bg-white/70 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-10 text-center"
              >
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  All Set!
                </h2>
                <p className="text-gray-500 mb-8">
                  Your account information and password have been updated.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-all"
                >
                  Go to Dashboard
                </button>

                <div className="mt-8">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-semibold mx-auto"
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
