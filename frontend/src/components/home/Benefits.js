import React from 'react';
import { Link } from 'react-router-dom';
import { TruckIcon, BanknotesIcon, MapIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

// Only promises the store actually keeps:
// - shipping is $0 on every order (pricing.js SHIPPING_PRICE = 0)
// - Cash on Delivery is the payment method at checkout
// - every order has a tracking timeline in My Orders
// - the contact form reaches the admin Messages inbox
const BENEFITS = [
  { icon: TruckIcon, title: 'Free shipping', text: 'On every order, no minimum.' },
  { icon: BanknotesIcon, title: 'Cash on delivery', text: 'Pay when your order arrives.' },
  { icon: MapIcon, title: 'Order tracking', text: 'Follow each step in My Orders.', to: '/my-orders' },
  { icon: ChatBubbleLeftRightIcon, title: 'Questions?', text: 'Send us a message anytime.', to: '/contact' },
];

const Benefits = () => (
  <section aria-label="Shopping with ZAYRO" className="border-y border-stone-200 bg-canvas dark:border-gray-800 dark:bg-gray-950">
    <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
      {BENEFITS.map(({ icon: Icon, title, text, to }) => {
        const body = (
          <>
            <Icon className="h-6 w-6 flex-shrink-0 text-ink dark:text-white" aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold text-ink dark:text-white">{title}</span>
              <span className="mt-0.5 block text-sm text-stone-600 dark:text-gray-400">{text}</span>
            </span>
          </>
        );
        return (
          <li key={title}>
            {to ? (
              <Link to={to} className="flex gap-3 rounded-md hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
                {body}
              </Link>
            ) : (
              <div className="flex gap-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  </section>
);

export default Benefits;
