import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ChevronDownIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  HomeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { OrderListSkeleton } from '../../components/skeletons/OrderCardSkeleton';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useConfirm } from '../../hooks/useConfirm';
import { API_URL } from '../../utils/api';

const MyOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'Processing':
        return <ClockIcon className="w-4 h-4 animate-spin" />;
      case 'Shipped':
        return <TruckIcon className="w-4 h-4" />;
      case 'Delivered':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleCancelOrder = async (orderId) => {
    const confirmed = await confirm({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order? This action cannot be undone.',
      confirmText: 'Cancel Order',
      cancelText: 'Keep Order',
      variant: 'warning'
    });

    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/orders/${orderId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 flex flex-col">
  {/* Navbar */}
  <Navbar />

  {/* Main Content */}
  <div className="mx-auto w-full max-w-6xl px-4 pt-24 pb-8">
    {/* Page Header */}
    <div className="mb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
      <p className="text-gray-600">Track and manage your orders</p>
    </div>

    {/* Loading State */}
    {loading ? (
      <OrderListSkeleton count={3} />
    ) : orders.length === 0 ? (
      /* Empty State */
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-12 text-center"
      >
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here!
          </p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            Start Shopping
          </button>
        </div>
      </motion.div>
    ) : (
      /* Orders List */
      <div className="space-y-6">
        {orders.map((order, index) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Disclosure>
              {({ open }) => (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <Disclosure.Button className="w-full">
                    <div className="p-6">
                      {/* Order Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              Order #{order._id.substring(0, 8).toUpperCase()}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">${order.totalPrice.toFixed(2)}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Preview of Items */}
                      <div className="flex gap-2 mb-4">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                          >
                            {item.image ? (
                              <img
                                src={`http://localhost:5000${item.image}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingBagIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>

                      {/* Expand Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm font-medium text-blue-600">
                          {open ? 'Hide Details' : 'View Details'}
                        </span>
                        <ChevronDownIcon
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            open ? 'transform rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </Disclosure.Button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {open && (
                      <Disclosure.Panel static>
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100"
                        >
                          <div className="p-6 bg-gray-50">
                            {/* Order Items Detail */}
                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <ShoppingBagIcon className="w-5 h-5" />
                                Order Items
                              </h4>
                              <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex gap-4 p-4 bg-white rounded-lg"
                                  >
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                      {item.image ? (
                                        <img
                                          src={`http://localhost:5000${item.image}`}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                          <ShoppingBagIcon className="w-8 h-8" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-900">{item.name}</h5>
                                      <div className="flex items-center gap-4 flex-wrap mt-2">
                                        {/* Color Swatch for Variant Products */}
                                        {item.variant && item.variant.color && (
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-sm text-gray-600">Color:</span>
                                            <div
                                              className="w-4 h-4 rounded-full border-2 border-gray-300"
                                              style={{ backgroundColor: item.variant.color.hex || '#808080' }}
                                              title={item.variant.color.name || 'Color'}
                                            />
                                            <span className="font-medium text-sm text-gray-900">
                                              {item.variant.color.name || item.variant.color.code || 'Default'}
                                            </span>
                                          </div>
                                        )}
                                        <p className="text-sm text-gray-600">
                                          Size: <span className="font-medium">{item.size}</span>
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          Quantity: <span className="font-medium">{item.quantity}</span>
                                        </p>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-2">
                                        ${item.price} × {item.quantity} = <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPinIcon className="w-5 h-5" />
                                Shipping Address
                              </h4>
                              <div className="bg-white p-4 rounded-lg">
                                <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                                <p className="text-gray-600 text-sm mt-1">{order.shippingAddress.address}</p>
                                <p className="text-gray-600 text-sm">
                                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                </p>
                                <p className="text-gray-600 text-sm">{order.shippingAddress.country}</p>
                                <p className="text-gray-600 text-sm mt-2">Phone: {order.shippingAddress.phone}</p>
                              </div>
                            </div>

                            {/* Payment & Summary */}
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Payment Info */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <CreditCardIcon className="w-5 h-5" />
                                  Payment Information
                                </h4>
                                <div className="bg-white p-4 rounded-lg space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment Status:</span>
                                    <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                      {order.isPaid ? 'Paid' : 'Not Paid'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Order Summary */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
                                <div className="bg-white p-4 rounded-lg space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium text-gray-900">
                                      ${order.totalPrice.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span className="font-medium text-green-600">Free</span>
                                  </div>
                                  <div className="pt-2 border-t border-gray-200">
                                    <div className="flex justify-between">
                                      <span className="font-semibold text-gray-900">Total:</span>
                                      <span className="font-bold text-xl text-gray-900">
                                        ${order.totalPrice.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            {(order.status === 'Pending' || order.status === 'Processing') && (
                              <div className="mt-6 pt-6 border-t border-gray-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelOrder(order._id);
                                  }}
                                  className="w-full md:w-auto px-6 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                  <XCircleIcon className="w-5 h-5" />
                                  Cancel Order
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </Disclosure.Panel>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Disclosure>
          </motion.div>
        ))}
      </div>
    )}

    {/* Back to Shopping */}
    {!loading && orders.length > 0 && (
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <HomeIcon className="w-5 h-5" />
          Continue Shopping
        </button>
      </div>
    )}
  </div>

  {/* Footer */}
  <Footer />

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
</div>

  );
};

export default MyOrders;
