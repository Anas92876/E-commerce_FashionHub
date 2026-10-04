import React, { useState, useEffect, Fragment } from 'react';
import BrandLogo from './BrandLogo';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  UserIcon,
  HomeIcon,
  Squares2X2Icon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HeartIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import SearchBox from './SearchBox';
import ThemeToggle from './ThemeToggle';

// Shared look for the icon buttons on the right of the header
const iconButton =
  'relative inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-700 transition-colors hover:bg-stone-100 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white';

// Small count bubble on the wishlist / cart icons
const Count = ({ value }) =>
  value > 0 ? (
    <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold leading-none text-white" aria-hidden="true">
      {value > 99 ? '99+' : value}
    </span>
  ) : null;

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cartItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const cartItemsCount = (cartItems || []).reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon, end: true },
    { name: 'Shop', path: '/products', icon: Squares2X2Icon },
    { name: 'Contact', path: '/contact', icon: EnvelopeIcon },
    ...(user ? [{ name: 'My Orders', path: '/my-orders', icon: ClipboardDocumentListIcon }] : []),
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-200 ${
          isScrolled
            ? 'border-stone-200 bg-canvas/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95'
            : 'border-transparent bg-canvas dark:bg-gray-950'
        }`}
      >
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex flex-shrink-0 items-center gap-2 rounded-md text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-white"
          >
            <BrandLogo />
          </Link>

          {/* Primary links (desktop) */}
          <ul className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    `relative py-5 text-sm font-medium transition-colors focus:outline-none focus-visible:text-primary-700 ${
                      isActive
                        ? 'text-ink after:absolute after:inset-x-0 after:bottom-3 after:h-0.5 after:rounded-full after:bg-ink dark:text-white dark:after:bg-white'
                        : 'text-stone-500 hover:text-ink dark:text-gray-400 dark:hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Search (wide screens) */}
          <SearchBox className="ml-auto hidden w-full max-w-xs xl:block" />

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 xl:ml-0">
            <Link to="/products" aria-label="Search products" className={`${iconButton} xl:hidden`}>
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Link>

            <span className="hidden sm:inline-flex">
              <ThemeToggle />
            </span>

            <Link
              to="/wishlist"
              aria-label={user ? `Wishlist, ${wishlistCount} saved` : 'Wishlist'}
              className={`${iconButton} hidden sm:inline-flex`}
            >
              <HeartIcon className="h-5 w-5" />
              <Count value={user ? wishlistCount : 0} />
            </Link>

            <Link to="/cart" aria-label={`Shopping bag, ${cartItemsCount} items`} className={iconButton}>
              <ShoppingBagIcon className="h-5 w-5" />
              <Count value={cartItemsCount} />
            </Link>

            {/* Account */}
            {user ? (
              <Menu as="div" className="relative hidden lg:block">
                <Menu.Button className={iconButton} aria-label="Account menu">
                  <UserIcon className="h-5 w-5" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b border-stone-100 px-4 py-3 dark:border-gray-700">
                      <p className="truncate text-sm font-medium text-ink dark:text-white">{user.firstName} {user.lastName}</p>
                      <p className="truncate text-xs text-stone-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    {[
                      { label: 'Profile', icon: UserIcon, to: '/profile' },
                      { label: 'My Orders', icon: ClipboardDocumentListIcon, to: '/my-orders' },
                      { label: 'Wishlist', icon: HeartIcon, to: '/wishlist' },
                      ...(isAdmin() ? [{ label: 'Admin Panel', icon: Cog6ToothIcon, to: '/admin/dashboard' }] : []),
                    ].map(({ label, icon: Icon, to }) => (
                      <Menu.Item key={label}>
                        {({ active }) => (
                          <Link
                            to={to}
                            className={`flex items-center gap-2 px-4 py-2 text-sm text-stone-700 dark:text-gray-300 ${active ? 'bg-stone-50 dark:bg-gray-700' : ''}`}
                          >
                            <Icon className="h-4 w-4" />
                            {label}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`flex w-full items-center gap-2 border-t border-stone-100 px-4 py-2 text-left text-sm text-red-600 dark:border-gray-700 dark:text-red-400 ${active ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          Log out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <Link
                to="/login"
                className="ml-1 hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-white dark:hover:bg-gray-800 lg:inline-flex"
              >
                <UserIcon className="h-5 w-5" />
                Sign in
              </Link>
            )}

            <button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" className={`${iconButton} lg:hidden`}>
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <Transition appear show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 flex justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-200"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-150"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="flex h-full w-full max-w-sm flex-col bg-canvas shadow-xl dark:bg-gray-950">
                <div className="flex h-16 items-center justify-between border-b border-stone-200 px-4 dark:border-gray-800">
                  <Dialog.Title className="font-display text-lg font-bold text-ink dark:text-white">Menu</Dialog.Title>
                  <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className={iconButton}>
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="px-4 py-4">
                  <SearchBox onDone={() => setMobileMenuOpen(false)} />
                </div>

                <ul className="flex-1 overflow-y-auto px-2">
                  {[
                    ...navLinks,
                    { name: 'Wishlist', path: '/wishlist', icon: HeartIcon },
                    { name: 'Shopping Bag', path: '/cart', icon: ShoppingBagIcon },
                    ...(user && isAdmin() ? [{ name: 'Admin Panel', path: '/admin/dashboard', icon: Cog6ToothIcon }] : []),
                  ].map((link) => (
                    <li key={link.path}>
                      <NavLink
                        to={link.path}
                        end={link.end}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors ${
                            isActive
                              ? 'bg-white text-ink shadow-sm dark:bg-gray-900 dark:text-white'
                              : 'text-stone-700 hover:bg-white dark:text-gray-300 dark:hover:bg-gray-900'
                          }`
                        }
                      >
                        <link.icon className="h-5 w-5 text-stone-500 dark:text-gray-400" />
                        {link.name}
                        {link.path === '/cart' && cartItemsCount > 0 && (
                          <span className="ml-auto text-sm text-stone-500">{cartItemsCount}</span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 border-t border-stone-200 p-4 dark:border-gray-800">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-md border border-stone-300 px-4 py-3 font-medium text-ink dark:border-gray-700 dark:text-white"
                      >
                        <UserIcon className="h-5 w-5" />
                        {user.firstName} · Profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-4 py-3 font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full rounded-md bg-ink px-4 py-3 text-center font-medium text-white dark:bg-white dark:text-ink"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full rounded-md border border-stone-300 px-4 py-3 text-center font-medium text-ink dark:border-gray-700 dark:text-white"
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Navbar;
