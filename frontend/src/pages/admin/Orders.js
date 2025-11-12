import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCartIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { API_URL } from '../../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (selectedStatus) params.status = selectedStatus;

      const { data } = await axios.get(`${API_URL}/orders`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/orders/${orderId}/pay`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Order marked as paid');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to mark as paid');
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
      'Processing': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      'Shipped': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700',
      'Delivered': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
      'Cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': ClockIcon,
      'Processing': ShoppingCartIcon,
      'Shipped': TruckIcon,
      'Delivered': CheckCircleIcon,
      'Cancelled': XCircleIcon
    };
    return icons[status] || ClockIcon;
  };

  const statusOptions = [
    { value: '', label: 'All Orders', count: orders.length },
    { value: 'Pending', label: 'Pending', count: orders.filter(o => o.status === 'Pending').length },
    { value: 'Processing', label: 'Processing', count: orders.filter(o => o.status === 'Processing').length },
    { value: 'Shipped', label: 'Shipped', count: orders.filter(o => o.status === 'Shipped').length },
    { value: 'Delivered', label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
    { value: 'Cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'Cancelled').length },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Orders Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Track and manage customer orders</p>
        </motion.div>

        {/* Status Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filter by Status</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedStatus === option.value
                    ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{option.count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{option.label}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="card p-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50">
              <LoadingSpinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="card p-12 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50">
              <ShoppingCartIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No orders found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                {selectedStatus ? 'Try changing the filter' : 'Orders will appear here once customers make purchases'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {orders.map((order, index) => {
                const StatusIcon = getStatusIcon(order.status);
                const isExpanded = expandedOrders.has(order._id);

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="card overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50"
                  >
                    {/* Order Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              Order #{order._id.substring(0, 8).toUpperCase()}
                            </h3>
                            <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                              <StatusIcon className="w-4 h-4" />
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <UserIcon className="w-4 h-4" />
                              {order.user?.firstName} {order.user?.lastName}
                            </div>
                            <div>
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">${order.totalPrice.toFixed(2)}</div>
                          <div className={`text-sm font-semibold ${order.isPaid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {order.isPaid ? '✓ Paid' : '✗ Not Paid'}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        {!order.isPaid && (
                          <button
                            onClick={() => handleMarkAsPaid(order._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                          >
                            <CreditCardIcon className="w-5 h-5" />
                            Mark as Paid
                          </button>
                        )}

                        <button
                          onClick={() => toggleOrderExpansion(order._id)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              Hide Details
                              <ChevronUpIcon className="w-5 h-5" />
                            </>
                          ) : (
                            <>
                              View Details
                              <ChevronDownIcon className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Order Details (Expandable) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                        >
                          <div className="p-6 space-y-6">
                            {/* Items List */}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Order Items</h4>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Size: {item.size} • Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">${item.price} each</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping Address */}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Shipping Address</h4>
                              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg space-y-2">
                                <div className="flex items-start gap-2">
                                  <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                                  <span className="text-gray-900 dark:text-white">{order.shippingAddress.fullName}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPinIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <PhoneIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                  <span className="text-gray-900 dark:text-white">{order.shippingAddress.phone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Orders;
