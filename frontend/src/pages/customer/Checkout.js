import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  TruckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LazyImage from '../../components/LazyImage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL, getImageUrl } from '../../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    notes: ''
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`
      }));
    }
  }, [user]);

  // Redirect if cart is empty (but not if order is being completed)
  useEffect(() => {
    if (cartItems.length === 0 && !isOrderComplete) {
      toast('Your cart is empty');
      navigate('/cart');
    }
  }, [cartItems, navigate, isOrderComplete]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.postalCode || !formData.country) {
        toast.error('Please fill all required fields including country');
        setLoading(false);
        return;
      }

      const items = cartItems.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize || item.variant?.size || 'One Size',
        image: item.image,
        ...(item.variant && {
          variantSku: item.variant.sku || item.variant.variantSku,
          color: {
            name: item.variant.color?.name || null,
            hex: item.variant.color?.hex || null,
            code: item.variant.color?.code || null
          },
          sizeSku: item.variant.sizeSku || null
        })
      }));

      const orderData = {
        items,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: 'Cash on Delivery',
        itemsPrice: getCartTotal(),
        shippingPrice: 0,
        totalPrice: getCartTotal(),
        notes: formData.notes
      };

      const token = localStorage.getItem('token');

      const { data } = await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        // Mark order as complete to prevent redirect
        setIsOrderComplete(true);
        
        // Clear cart
        clearCart();
        
        // Show success message
        toast.success('Order placed successfully! Redirecting to your orders...', {
          autoClose: 2000,
        });
        
        // Navigate to my-orders page after a short delay to show the success message
        setTimeout(() => {
          navigate('/my-orders', { replace: true });
        }, 1500);
      }

    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if ((!user || cartItems.length === 0) && !isOrderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
      <Navbar />

      {/* Header - SAME SPACING AS PRODUCTS PAGE */}
      <div className="relative pt-1 pb-12 border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Checkout</span>
          </div>

          {/* Heading */}
          <motion.h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Complete Your{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Order
            </span>
          </motion.h1>

          {/* Steps */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-gray-700 font-medium">Cart</span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span className="font-semibold text-gray-900">Shipping</span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center text-xs">3</div>
              <span className="text-gray-500">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - EXACT SAME LAYOUT AS PRODUCTS */}
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">

            {/* Shipping Address */}
            <motion.div
              className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <TruckIcon className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Choose your Country"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
                  <textarea
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                    required
                  />
                </div>

                {/* City + Postal Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Order Notes</label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional instructions..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                  />
                </div>
              </form>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <CreditCardIcon className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="p-4 border-2 border-primary-600 rounded-lg bg-primary-50">
                <div className="flex items-center gap-3">
                  <input type="radio" checked readOnly className="w-4 h-4 text-primary-600" />
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">💵 Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive your order</div>
                  </div>
                  <CheckCircleIcon className="w-6 h-6 text-primary-600" />
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm flex gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                <span><strong>Secure Checkout</strong> — Your data is protected.</span>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 shadow-lg"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>

              <Link
                to="/cart"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-center"
              >
                ← Back to Cart
              </Link>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6 sticky top-28 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      {item.image ? (
                        <LazyImage
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-primary-600 mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-600">${getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t text-sm text-gray-600">
                <div className="flex gap-3 items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  Free shipping on all orders
                </div>
                <div className="flex gap-3 items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  Cash on Delivery available
                </div>
                <div className="flex gap-3 items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  7-14 days delivery time
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
