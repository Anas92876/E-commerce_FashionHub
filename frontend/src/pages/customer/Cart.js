import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, ShoppingBagIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LazyImage from '../../components/LazyImage';
import { EmptyCart } from '../../components/EmptyState';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useConfirm } from '../../hooks/useConfirm';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const confirm = useConfirm();

  const handleRemoveItem = (item) => {
    const colorCode = item.variant?.color?.code || item.variant?.color || null;
    removeFromCart(item._id, item.selectedSize, colorCode);
    toast.success('Item removed from cart');
  };

  const handleClearCart = async () => {
    const confirmed = await confirm({
      title: 'Clear Cart',
      message: 'Are you sure you want to clear your cart? All items will be removed.',
      confirmText: 'Clear Cart',
      cancelText: 'Cancel',
      variant: 'warning'
    });

    if (confirmed) {
      clearCart();
      toast('Cart cleared');
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-16">
          <EmptyCart />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pt-24">
      <Navbar />

      {/* Header in same layout as Products */}
      <div className="relative pt-1 pb-12 border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Cart</span>
          </div>

          {/* Heading */}
          <motion.h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Shopping Cart
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-base sm:text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            You currently have{" "}
            <span className="font-semibold text-gray-900">{cartItems.length}</span>{" "}
            {cartItems.length === 1 ? "item" : "items"} in your cart.
          </motion.p>

          {/* Line + Cart Counter */}
          <div className="mt-6 flex items-center justify-between">
            <span className="inline-block h-1 w-24 rounded-full bg-gradient-to-r from-primary-600 to-primary-400" />
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 font-medium">
              🛒 {cartItems.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - EXACT same layout spacing as Products */}
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, index) => {
                const colorCode = item.variant?.color?.code || item.variant?.color || '';
                const itemKey = `${item._id}-${colorCode}-${item.selectedSize}`;

                return (
                  <motion.div
                    key={itemKey}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-all"
                  >

                    {/* Product Image */}
                    <Link
                      to={`/products/${item._id}`}
                      className="w-full sm:w-32 h-32 flex-shrink-0"
                    >
                      <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
                        {item.image ? (
                          <LazyImage
                            src={`http://localhost:5000${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 text-sm font-semibold">
                            No Image
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item._id}`} className="block group">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate group-hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>

                      <p className="text-sm text-gray-600 mb-2">{item.category}</p>

                      <div className="flex items-center gap-4 mb-3 flex-wrap">
                        {/* Color */}
                        {item.variant && item.variant.color && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Color:</span>
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-5 h-5 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: item.variant.color.hex || '#808080' }}
                              />
                              <span className="font-semibold text-gray-900 text-sm">
                                {item.variant.color.name || item.variant.color.code}
                              </span>
                            </div>
                          </div>
                        )}

                        <span className="text-sm text-gray-600">
                          Size:{" "}
                          <span className="font-semibold text-gray-900">{item.selectedSize}</span>
                        </span>

                        <span className="text-lg font-bold text-primary-600">${item.price}</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => {
                              const colorCode = item.variant?.color?.code || item.variant?.color || null;
                              updateQuantity(item._id, item.selectedSize, item.quantity - 1, colorCode);
                            }}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 font-bold"
                          >
                            −
                          </button>

                          <span className="px-4 py-1 font-semibold min-w-[3rem] text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => {
                              const colorCode = item.variant?.color?.code || item.variant?.color || null;
                              updateQuantity(item._id, item.selectedSize, item.quantity + 1, colorCode);
                            }}
                            disabled={item.quantity >= item.stock}
                            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-xl font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <motion.button
                            onClick={() => handleRemoveItem(item)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>

                      {item.quantity >= item.stock && (
                        <p className="text-xs text-amber-600 mt-2">Maximum quantity reached</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Clear Cart */}
            <motion.button
              onClick={handleClearCart}
              className="w-full px-6 py-3 rounded-xl bg-red-50 text-red-600 font-semibold border border-red-200 hover:bg-red-100 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear Cart
            </motion.button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6 sticky top-28 space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary-600">${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleProceedToCheckout}
                className="w-full px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg flex items-center justify-center gap-2 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBagIcon className="w-5 h-5" />
                Proceed to Checkout
              </motion.button>

              <Link
                to="/products"
                className="block w-full px-8 py-4 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-center transition-all"
              >
                Continue Shopping
              </Link>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <TruckIcon className="w-5 h-5 text-primary-600" />
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Cash on delivery available</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirm.isOpen}
        onClose={confirm.close}
        onConfirm={confirm.handleConfirm}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        variant={confirm.variant}
      />

      <Footer />
    </div>
  );
};

export default Cart;
