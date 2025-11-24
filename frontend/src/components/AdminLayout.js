import React, { useState, Fragment } from 'react';
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
  UsersIcon
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
              <svg
                className="w-8 h-8 text-primary-600 dark:text-primary-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C10 2 8.5 3 7.5 4.5C6.5 6 6 8 6 10C6 11 6.2 11.8 6.5 12.5C5.8 12.8 5.2 13.2 4.7 13.7C4 14.4 3.5 15.3 3.2 16.3C3 17 2.9 17.7 2.9 18.5C2.9 19.3 3 20 3.3 20.7C3.6 21.4 4 22 4.6 22.4C5.2 22.8 5.9 23 6.7 23C7.5 23 8.2 22.8 8.8 22.4C9.4 22 9.8 21.4 10.1 20.7C10.4 20 10.5 19.3 10.5 18.5C10.5 17.7 10.4 17 10.1 16.3C9.8 15.6 9.4 15 8.8 14.6C8.2 14.2 7.5 14 6.7 14C6.5 14 6.3 14 6.1 14.1C6 13.5 5.9 12.8 5.9 12C5.9 10.3 6.3 8.6 7.1 7.2C7.9 5.8 9 4.8 10.5 4.3C11 4.1 11.5 4 12 4C12.5 4 13 4.1 13.5 4.3C15 4.8 16.1 5.8 16.9 7.2C17.7 8.6 18.1 10.3 18.1 12C18.1 12.8 18 13.5 17.9 14.1C17.7 14 17.5 14 17.3 14C16.5 14 15.8 14.2 15.2 14.6C14.6 15 14.2 15.6 13.9 16.3C13.6 17 13.5 17.7 13.5 18.5C13.5 19.3 13.6 20 13.9 20.7C14.2 21.4 14.6 22 15.2 22.4C15.8 22.8 16.5 23 17.3 23C18.1 23 18.8 22.8 19.4 22.4C20 22 20.4 21.4 20.7 20.7C21 20 21.1 19.3 21.1 18.5C21.1 17.7 21 17 20.8 16.3C20.5 15.3 20 14.4 19.3 13.7C18.8 13.2 18.2 12.8 17.5 12.5C17.8 11.8 18 11 18 10C18 8 17.5 6 16.5 4.5C15.5 3 14 2 12 2M6.7 15.5C7.2 15.5 7.6 15.7 7.9 16C8.2 16.3 8.4 16.7 8.5 17.2C8.6 17.7 8.7 18.1 8.7 18.5C8.7 18.9 8.6 19.3 8.5 19.8C8.4 20.3 8.2 20.7 7.9 21C7.6 21.3 7.2 21.5 6.7 21.5C6.2 21.5 5.8 21.3 5.5 21C5.2 20.7 5 20.3 4.9 19.8C4.8 19.3 4.7 18.9 4.7 18.5C4.7 18.1 4.8 17.7 4.9 17.2C5 16.7 5.2 16.3 5.5 16C5.8 15.7 6.2 15.5 6.7 15.5M17.3 15.5C17.8 15.5 18.2 15.7 18.5 16C18.8 16.3 19 16.7 19.1 17.2C19.2 17.7 19.3 18.1 19.3 18.5C19.3 18.9 19.2 19.3 19.1 19.8C19 20.3 18.8 20.7 18.5 21C18.2 21.3 17.8 21.5 17.3 21.5C16.8 21.5 16.4 21.3 16.1 21C15.8 20.7 15.6 20.3 15.5 19.8C15.4 19.3 15.3 18.9 15.3 18.5C15.3 18.1 15.4 17.7 15.5 17.2C15.6 16.7 15.8 16.3 16.1 16C16.4 15.7 16.8 15.5 17.3 15.5Z"/>
              </svg>
              <span className="hidden sm:block font-display text-xl font-bold text-gray-900 dark:text-white">
                FashionHub Admin
              </span>
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
