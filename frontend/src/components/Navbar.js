import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  UserIcon,
  HomeIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CountBadge } from './Badge';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const cartItemsCount = (cartItems || []).reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Products', path: '/products', icon: ShoppingCartIcon },
    { name: 'Contact', path: '/contact', icon: EnvelopeIcon },
    ...(user ? [{ name: 'My Orders', path: '/my-orders', icon: ClipboardDocumentListIcon }] : []),
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-lg shadow-lg'
            : 'bg-white/60 backdrop-blur-md'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                className="text-primary-600"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C10 2 8.5 3 7.5 4.5C6.5 6 6 8 6 10C6 11 6.2 11.8 6.5 12.5C5.8 12.8 5.2 13.2 4.7 13.7C4 14.4 3.5 15.3 3.2 16.3C3 17 2.9 17.7 2.9 18.5C2.9 19.3 3 20 3.3 20.7C3.6 21.4 4 22 4.6 22.4C5.2 22.8 5.9 23 6.7 23C7.5 23 8.2 22.8 8.8 22.4C9.4 22 9.8 21.4 10.1 20.7C10.4 20 10.5 19.3 10.5 18.5C10.5 17.7 10.4 17 10.1 16.3C9.8 15.6 9.4 15 8.8 14.6C8.2 14.2 7.5 14 6.7 14C6.5 14 6.3 14 6.1 14.1C6 13.5 5.9 12.8 5.9 12C5.9 10.3 6.3 8.6 7.1 7.2C7.9 5.8 9 4.8 10.5 4.3C11 4.1 11.5 4 12 4C12.5 4 13 4.1 13.5 4.3C15 4.8 16.1 5.8 16.9 7.2C17.7 8.6 18.1 10.3 18.1 12C18.1 12.8 18 13.5 17.9 14.1C17.7 14 17.5 14 17.3 14C16.5 14 15.8 14.2 15.2 14.6C14.6 15 14.2 15.6 13.9 16.3C13.6 17 13.5 17.7 13.5 18.5C13.5 19.3 13.6 20 13.9 20.7C14.2 21.4 14.6 22 15.2 22.4C15.8 22.8 16.5 23 17.3 23C18.1 23 18.8 22.8 19.4 22.4C20 22 20.4 21.4 20.7 20.7C21 20 21.1 19.3 21.1 18.5C21.1 17.7 21 17 20.8 16.3C20.5 15.3 20 14.4 19.3 13.7C18.8 13.2 18.2 12.8 17.5 12.5C17.8 11.8 18 11 18 10C18 8 17.5 6 16.5 4.5C15.5 3 14 2 12 2Z" />
                </svg>
              </motion.div>
              <span className="font-display text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                FashionHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingBagIcon className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <CountBadge count={cartItemsCount} />
                  </div>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <Menu as="div" className="relative hidden lg:block">
                  <Menu.Button className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <UserIcon className="w-6 h-6" />
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
                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => navigate('/profile')}
                              className={`${
                                active ? 'bg-gray-50' : ''
                              } w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2`}
                            >
                              <UserIcon className="w-4 h-4" />
                              Profile
                            </button>
                          )}
                        </Menu.Item>
                        {isAdmin() && (
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => navigate('/admin/dashboard')}
                                className={`${
                                  active ? 'bg-gray-50' : ''
                                } w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2`}
                              >
                                <Cog6ToothIcon className="w-4 h-4" />
                                Admin Panel
                              </button>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${
                                active ? 'bg-red-50' : ''
                              } w-full text-left px-4 py-2 text-sm text-red-600 flex items-center gap-2`}
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
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dialog */}
      <Transition appear show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-end">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="w-full max-w-sm bg-white h-screen shadow-xl">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <span className="font-display text-xl font-bold text-gray-900">Menu</span>
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                            location.pathname === link.path
                              ? 'bg-primary-100 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <link.icon className="w-5 h-5" />
                          <span className="font-medium">{link.name}</span>
                        </Link>
                      ))}

                      {user && isAdmin() && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Cog6ToothIcon className="w-5 h-5" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}
                    </div>

                    <div className="p-4 border-t space-y-2">
                      {user ? (
                        <>
                          <button
                            onClick={() => {
                              navigate('/profile');
                              setMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <UserIcon className="w-5 h-5" />
                            <span className="font-medium">Profile</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              navigate('/login');
                              setMobileMenuOpen(false);
                            }}
                            className="w-full px-4 py-3 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            Login
                          </button>
                          <button
                            onClick={() => {
                              navigate('/register');
                              setMobileMenuOpen(false);
                            }}
                            className="w-full px-4 py-3 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-lg transition-colors"
                          >
                            Register
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Navbar;
