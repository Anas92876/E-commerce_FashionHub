import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Contact.css'; // kept to avoid breaking anything if file exists

const API_URL = 'http://localhost:5000/api';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/contact`, formData);

      if (data.success) {
        toast.success(data.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
    <Navbar />

    {/* Page Wrapper */}
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* Header */}
      <div className=" mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          Get in touch
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl ">
          Questions, feedback, or a project in mind? Send us a message and we’ll get back to you.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Info Panel */}
        <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
          <p className="text-white/80 mb-8">
            We’d love to hear from you. Our team typically responds within 24–48 hours.
          </p>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <span className="text-lg">📧</span>
              </div>
              <div>
                <p className="text-sm text-white/70">Email</p>
                <p className="font-medium">support@example.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <span className="text-lg">📞</span>
              </div>
              <div>
                <p className="text-sm text-white/70">Phone</p>
                <p className="font-medium">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <span className="text-lg">📍</span>
              </div>
              <div>
                <p className="text-sm text-white/70">Office</p>
                <p className="font-medium">Amsterdam, Netherlands</p>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-white/15 bg-white/10 p-4">
            <p className="text-sm text-white/80">
              Prefer email? We’re cool with that. Just send a detailed message and we’ll route it to the right person.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white/80 backdrop-blur shadow-sm ring-1 ring-gray-200">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="sm:col-span-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Phone */}
              <div className="sm:col-span-1">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+31 6 1234 5678"
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Subject */}
              <div className="sm:col-span-1">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Message */}
              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-y"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-gray-700 font-medium ring-1 ring-gray-300 hover:bg-gray-50 transition"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition"
              >
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Small note */}
      <p className="mt-8 text-center text-sm text-gray-500">
        By submitting, you agree to our terms and privacy policy.
      </p>
    </div>

      <Footer />
  </div>


  );
};

export default Contact;
