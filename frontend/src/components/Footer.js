import React from 'react';
import BrandLogo from './BrandLogo';
import { Link } from 'react-router-dom';
import { BanknotesIcon } from '@heroicons/react/24/outline';

// Every link here points to a route that exists in App.js
const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { name: 'All products', path: '/products' },
      { name: 'New arrivals', path: '/products?sort=newest' },
      { name: 'Top rated', path: '/products?sort=rating-desc' },
      { name: 'Wishlist', path: '/wishlist' },
    ],
  },
  {
    title: 'Account',
    links: [
      { name: 'Sign in', path: '/login' },
      { name: 'Create account', path: '/register' },
      { name: 'Profile', path: '/profile' },
      { name: 'Shopping bag', path: '/cart' },
    ],
  },
  {
    title: 'Help',
    links: [
      { name: 'Contact us', path: '/contact' },
      { name: 'Track an order', path: '/my-orders' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-ink text-stone-300 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 rounded-md text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
              <BrandLogo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
              Everyday staples and considered pieces, delivered free to your door.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">{column.title}</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="transition-colors hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ZAYRO. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <BanknotesIcon className="h-5 w-5" aria-hidden="true" />
            Payment: cash on delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
