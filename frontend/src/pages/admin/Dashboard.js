import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
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
  UserGroupIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import { API_URL } from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import SalesChart from '../../components/SalesChart';

const PERIODS = [7, 30, 90];

const money = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Change vs the previous period of the same length
const trend = (current, previous) => {
  if (!previous) return current > 0 ? { label: 'New', up: true } : null;
  const pct = ((current - previous) / previous) * 100;
  return { label: `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`, up: pct >= 0 };
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    processing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
  };
  return colors[status?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
};

const Card = ({ title, children, action, className = '' }) => (
  <div className={`p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

const Dashboard = () => {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get(`${API_URL}/admin/stats`, { params: { days } })
      .then(({ data }) => {
        if (!cancelled) {
          setStats(data.data);
          setError('');
        }
      })
      .catch((err) => {
        console.error('Error fetching dashboard stats:', err);
        if (!cancelled) setError(err.response?.data?.message || 'Could not load statistics');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  const totals = stats?.totals || {};
  const period = stats?.period || {};

  const statsCards = [
    { title: 'Total Revenue', value: money(totals.revenue), icon: CurrencyDollarIcon, gradient: 'from-purple-500 to-purple-600', bg: 'from-purple-50 to-purple-100',
      trend: trend(Number(period.revenue), Number(period.previousRevenue)), note: `${money(period.revenue)} in last ${days} days` },
    { title: 'Total Orders', value: totals.orders ?? 0, icon: ShoppingCartIcon, gradient: 'from-orange-500 to-orange-600', bg: 'from-orange-50 to-orange-100',
      trend: trend(period.orders, period.previousOrders), note: `${period.orders ?? 0} in last ${days} days` },
    { title: 'Customers', value: totals.customers ?? 0, icon: UserGroupIcon, gradient: 'from-pink-500 to-pink-600', bg: 'from-pink-50 to-pink-100',
      trend: trend(period.customers, period.previousCustomers), note: `${period.customers ?? 0} bought in last ${days} days` },
    { title: 'Pending Orders', value: totals.pendingOrders ?? 0, icon: ClockIcon, gradient: 'from-yellow-500 to-yellow-600', bg: 'from-yellow-50 to-yellow-100',
      note: 'Waiting to be processed' },
    { title: 'Products', value: totals.products ?? 0, icon: ShoppingBagIcon, gradient: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-blue-100',
      note: `${totals.activeProducts ?? 0} active` },
    { title: 'Categories', value: totals.categories ?? 0, icon: TagIcon, gradient: 'from-green-500 to-green-600', bg: 'from-green-50 to-green-100' },
  ];

  const quickActions = [
    { title: 'Add New Product', description: 'Create a new product listing', icon: PlusIcon, link: '/admin/products/add' },
    { title: 'View Products', description: 'Browse all products', icon: EyeIcon, link: '/admin/products' },
    { title: 'Manage Categories', description: 'Organize product categories', icon: Cog6ToothIcon, link: '/admin/categories' },
    { title: 'Coupons', description: 'Create discount codes', icon: TicketIcon, link: '/admin/coupons' },
  ];

  const periodRevenue = (stats?.dailySales || []).reduce((sum, d) => sum + Number(d.revenue), 0);
  const maxSold = Math.max(1, ...(stats?.bestSellers || []).map((b) => b.quantity));

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-300">
        {/* Header + period filter (one row above the charts) */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-gray-900 dark:text-white mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening with your store.</p>
          </div>
          <div className="inline-flex rounded-lg bg-white dark:bg-gray-800 p-1 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700" role="group" aria-label="Time period">
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setDays(p)} aria-pressed={days === p}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  days === p ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                {p} days
              </button>
            ))}
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 ${loading ? 'opacity-60' : ''}`}>
          {statsCards.map((card, index) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.bg} dark:from-gray-800 dark:to-gray-700 p-4 sm:p-6 shadow-lg dark:shadow-gray-900/50`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{card.title}</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{card.value}</h3>
                  <div className="flex items-center gap-1 flex-wrap">
                    {card.trend && (
                      <>
                        {card.trend.up ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-700 dark:text-green-400" aria-hidden="true" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-700 dark:text-red-400" aria-hidden="true" />
                        )}
                        <span className={`text-xs sm:text-sm font-semibold ${card.trend.up ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                          {card.trend.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">vs previous {days} days</span>
                      </>
                    )}
                    {card.note && <span className="text-xs text-gray-500 dark:text-gray-400">{card.note}</span>}
                  </div>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${card.gradient} shadow-lg`}>
                  <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sales chart */}
        <Card title={`Revenue · last ${days} days`} className="mb-6 sm:mb-8"
          action={<span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{money(periodRevenue)}</span>}>
          {periodRevenue > 0 ? (
            <SalesChart data={stats?.dailySales || []} />
          ) : (
            <p className="py-12 text-center text-gray-500 dark:text-gray-400">No sales in this period yet.</p>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Excludes cancelled orders. Days in UTC.</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
          {/* Best sellers */}
          <Card title={<span className="flex items-center gap-2"><TrophyIcon className="w-5 h-5" />Best Sellers</span>}>
            {stats?.bestSellers?.length ? (
              <ol className="space-y-4">
                {stats.bestSellers.map((item, i) => (
                  <li key={item.productId || i}>
                    <div className="flex items-baseline justify-between gap-3 text-sm mb-1">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        <span className="text-gray-500 dark:text-gray-400 mr-2">{i + 1}.</span>{item.name}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {item.quantity} sold · {money(item.revenue)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden" aria-hidden="true">
                      <div className="h-full rounded-full bg-primary-600" style={{ width: `${(item.quantity / maxSold) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-8 text-center text-gray-500 dark:text-gray-400">No sales yet.</p>
            )}
          </Card>

          {/* Low stock */}
          <Card title={<span className="flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5" />Low Stock</span>}
            action={<Link to="/admin/products" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">Manage</Link>}>
            {stats?.lowStock?.length ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {stats.lowStock.map((item, i) => {
                  const out = item.stock === 0;
                  return (
                    <li key={`${item.productId}-${item.color}-${item.size}-${i}`} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <Link to={`/admin/products/edit/${item.productId}`} className="text-sm font-medium text-gray-900 dark:text-white hover:underline truncate block">
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {[item.color, item.size && `Size ${item.size}`].filter(Boolean).join(' · ') || 'All sizes'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        out ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        <ExclamationTriangleIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        {out ? 'Out of stock' : `${item.stock} left`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-8 text-center text-gray-500 dark:text-gray-400">All products are well stocked.</p>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions" className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.link}
                className="group p-3 sm:p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <action.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card title="Recent Orders"
          action={<Link to="/admin/orders" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-semibold text-xs sm:text-sm">View All</Link>}>
          {stats?.recentOrders?.length ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                      <th key={h} className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap font-mono text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Deleted user'}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {money(order.totalPrice)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCartIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">No orders yet</p>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
