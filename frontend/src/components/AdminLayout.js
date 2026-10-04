import React, { useState, Fragment } from 'react';
import BrandLogo from './BrandLogo';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  PlusCircleIcon,
  TagIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ChartBarIcon,
  UsersIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

/**
 * AdminLayout Component
 *
 * Modern admin dashboard layout with:
 * - Collapsible sidebar with smooth animations
 * - Breadcrumb navigation
 * - User dropdown menu
 * - Premium icons from Heroicons
 * - Responsive design
 */
const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Navigation items
  const navigation = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: ChartBarIcon },
    { name: 'Products', path: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Add Product', path: '/admin/products/add', icon: PlusCircleIcon },
    { name: 'Categories', path: '/admin/categories', icon: TagIcon },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCartIcon },
    { name: 'Coupons', path: '/admin/coupons', icon: TicketIcon },
    { name: 'Users', path: '/admin/users', icon: UsersIcon },
    { name: 'Messages', path: '/admin/messages', icon: EnvelopeIcon },
  ];

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
      path: '/' + paths.slice(0, index + 1).join('/'),
      current: index === paths.length - 1,
    }));
  };

  const breadcrumbs = generateBreadcrumbs();

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 transition-colors duration-300">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle (Desktop) */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <BrandLogo markClassName="h-8" nameClassName="hidden text-lg text-gray-900 dark:text-white sm:inline" suffix="Admin" />
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Back to Store Link */}
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              Back to Store
            </Link>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                </div>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/profile')}
                          className={`${
                            active ? 'bg-gray-50 dark:bg-gray-700' : ''
                          } w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2`}
                        >
                          <UserIcon className="w-4 h-4" />
                          My Profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-red-50 dark:bg-red-900/30' : ''
                          } w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2`}
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={false}
          animate={{
            width: sidebarOpen ? 256 : 72,
            transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
          }}
          className="hidden lg:block fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-20 overflow-hidden transition-colors duration-300"
        >
          <nav className="h-full overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActivePath(item.path)
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
                        className="font-medium text-sm whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              ))}
            </div>
          </nav>
        </motion.aside>
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <Transition show={mobileSidebarOpen} as={Fragment}>
        <div className="lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40"
              onClick={() => setMobileSidebarOpen(false)}
            />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/50 z-50 transition-colors duration-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <span className="font-display text-lg font-bold text-gray-900 dark:text-white">Menu</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <nav className="py-4 px-3">
                <div className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActivePath(item.path)
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          </Transition.Child>
        </div>
      </Transition>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-[72px]'
        }`}
      >
        <div className="p-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                {crumb.current ? (
                  <span className="font-medium text-gray-900 dark:text-white">{crumb.name}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
