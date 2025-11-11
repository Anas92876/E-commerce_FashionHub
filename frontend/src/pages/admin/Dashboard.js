import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  TagIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalCustomers: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch products count
        const productsRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/products`
        );

        // Fetch categories count
        const categoriesRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/categories`
        );

        // Fetch all orders
        const ordersRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/orders`,
          config
        );

        const orders = ordersRes.data.data || [];

        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        // Count pending orders
        const pendingOrders = orders.filter(order => order.status === 'Pending').length;

        // Get unique customers
        const uniqueCustomers = new Set(orders.map(order => order.user?._id).filter(Boolean));

        // Get recent 5 orders
        const recent = orders.slice(0, 5);

        setStats({
          totalProducts: productsRes.data.total || 0,
          totalCategories: categoriesRes.data.count || 0,
          totalOrders: orders.length,
          totalRevenue: totalRevenue.toFixed(2),
          pendingOrders,
          totalCustomers: uniqueCustomers.size,
        });

        setRecentOrders(recent);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Stats cards configuration with gradients
  const statsCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: TagIcon,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      iconBg: 'bg-green-500',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCartIcon,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500',
      trend: '+23%',
      trendUp: true,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue}`,
      icon: CurrencyDollarIcon,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      trend: '+18%',
      trendUp: true,
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: ClockIcon,
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100',
      iconBg: 'bg-yellow-500',
      trend: '-3%',
      trendUp: false,
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: UserGroupIcon,
      gradient: 'from-pink-500 to-pink-600',
      bgGradient: 'from-pink-50 to-pink-100',
      iconBg: 'bg-pink-500',
      trend: '+15%',
      trendUp: true,
    },
  ];

  // Quick actions configuration
  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Create a new product listing',
      icon: PlusIcon,
      link: '/admin/products/add',
      color: 'primary',
    },
    {
      title: 'View Products',
      description: 'Browse all products',
      icon: EyeIcon,
      link: '/admin/products',
      color: 'blue',
    },
    {
      title: 'Manage Categories',
      description: 'Organize product categories',
      icon: Cog6ToothIcon,
      link: '/admin/categories',
      color: 'green',
    },
    {
      title: 'View Orders',
      description: 'Check customer orders',
      icon: ShoppingCartIcon,
      link: '/admin/orders',
      color: 'orange',
    },
  ];

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.bgGradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{card.value}</h3>
                  <div className="flex items-center gap-1">
                    {card.trendUp ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-semibold ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {card.trend}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.link}
                className="group p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                    <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {order.user?.firstName} {order.user?.lastName}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          ${order.totalPrice?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders yet</p>
              <p className="text-gray-400 text-sm mt-2">Orders will appear here once customers start purchasing</p>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
