import React from 'react';
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
              <svg className="h-7 w-7 text-primary-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C10 2 8.5 3 7.5 4.5C6.5 6 6 8 6 10C6 11 6.2 11.8 6.5 12.5C5.8 12.8 5.2 13.2 4.7 13.7C4 14.4 3.5 15.3 3.2 16.3C3 17 2.9 17.7 2.9 18.5C2.9 19.3 3 20 3.3 20.7C3.6 21.4 4 22 4.6 22.4C5.2 22.8 5.9 23 6.7 23C7.5 23 8.2 22.8 8.8 22.4C9.4 22 9.8 21.4 10.1 20.7C10.4 20 10.5 19.3 10.5 18.5C10.5 17.7 10.4 17 10.1 16.3C9.8 15.6 9.4 15 8.8 14.6C8.2 14.2 7.5 14 6.7 14C6.5 14 6.3 14 6.1 14.1C6 13.5 5.9 12.8 5.9 12C5.9 10.3 6.3 8.6 7.1 7.2C7.9 5.8 9 4.8 10.5 4.3C11 4.1 11.5 4 12 4C12.5 4 13 4.1 13.5 4.3C15 4.8 16.1 5.8 16.9 7.2C17.7 8.6 18.1 10.3 18.1 12C18.1 12.8 18 13.5 17.9 14.1C17.7 14 17.5 14 17.3 14C16.5 14 15.8 14.2 15.2 14.6C14.6 15 14.2 15.6 13.9 16.3C13.6 17 13.5 17.7 13.5 18.5C13.5 19.3 13.6 20 13.9 20.7C14.2 21.4 14.6 22 15.2 22.4C15.8 22.8 16.5 23 17.3 23C18.1 23 18.8 22.8 19.4 22.4C20 22 20.4 21.4 20.7 20.7C21 20 21.1 19.3 21.1 18.5C21.1 17.7 21 17 20.8 16.3C20.5 15.3 20 14.4 19.3 13.7C18.8 13.2 18.2 12.8 17.5 12.5C17.8 11.8 18 11 18 10C18 8 17.5 6 16.5 4.5C15.5 3 14 2 12 2Z" />
              </svg>
              <span className="font-display text-xl font-bold tracking-tight">FashionHub</span>
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
          <p>© {new Date().getFullYear()} FashionHub. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <BanknotesIcon className="h-5 w-5" aria-hidden="true" />
            Payment: cash on delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
