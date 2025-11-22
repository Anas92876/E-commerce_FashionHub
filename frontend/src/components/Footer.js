import React from 'react';
import { Link } from 'react-router-dom';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export default function Footer() {

  const footerLinks = {
    shop: [
      { name: 'All Products', path: '/products' },
      { name: 'Women', path: '/products?category=women' },
      { name: 'Men', path: '/products?category=men' },
      { name: 'Accessories', path: '/products?category=accessories' },
      { name: 'Sale', path: '/products?sale=true' },
    ],
    help: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'My Orders', path: '/my-orders' },
      { name: 'Shipping & Returns', path: '/shipping' },
      { name: 'Size Guide', path: '/size-guide' },
      { name: 'FAQ', path: '/faq' },
    ],
    about: [
      { name: 'Our Story', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Sustainability', path: '/sustainability' },
      { name: 'Press', path: '/press' },
      { name: 'Blog', path: '/blog' },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: 'https://facebook.com'
    },
    {
      name: 'Instagram',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
        </svg>
      ),
      url: 'https://instagram.com'
    },
    {
      name: 'Twitter',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      url: 'https://twitter.com'
    },
    {
      name: 'Pinterest',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
        </svg>
      ),
      url: 'https://pinterest.com'
    },
  ];

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'PayPal', icon: '💰' },
    { name: 'Apple Pay', icon: '🍎' },
    { name: 'Google Pay', icon: 'G' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-8 h-8 text-primary-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C10 2 8.5 3 7.5 4.5C6.5 6 6 8 6 10C6 11 6.2 11.8 6.5 12.5C5.8 12.8 5.2 13.2 4.7 13.7C4 14.4 3.5 15.3 3.2 16.3C3 17 2.9 17.7 2.9 18.5C2.9 19.3 3 20 3.3 20.7C3.6 21.4 4 22 4.6 22.4C5.2 22.8 5.9 23 6.7 23C7.5 23 8.2 22.8 8.8 22.4C9.4 22 9.8 21.4 10.1 20.7C10.4 20 10.5 19.3 10.5 18.5C10.5 17.7 10.4 17 10.1 16.3C9.8 15.6 9.4 15 8.8 14.6C8.2 14.2 7.5 14 6.7 14C6.5 14 6.3 14 6.1 14.1C6 13.5 5.9 12.8 5.9 12C5.9 10.3 6.3 8.6 7.1 7.2C7.9 5.8 9 4.8 10.5 4.3C11 4.1 11.5 4 12 4C12.5 4 13 4.1 13.5 4.3C15 4.8 16.1 5.8 16.9 7.2C17.7 8.6 18.1 10.3 18.1 12C18.1 12.8 18 13.5 17.9 14.1C17.7 14 17.5 14 17.3 14C16.5 14 15.8 14.2 15.2 14.6C14.6 15 14.2 15.6 13.9 16.3C13.6 17 13.5 17.7 13.5 18.5C13.5 19.3 13.6 20 13.9 20.7C14.2 21.4 14.6 22 15.2 22.4C15.8 22.8 16.5 23 17.3 23C18.1 23 18.8 22.8 19.4 22.4C20 22 20.4 21.4 20.7 20.7C21 20 21.1 19.3 21.1 18.5C21.1 17.7 21 17 20.8 16.3C20.5 15.3 20 14.4 19.3 13.7C18.8 13.2 18.2 12.8 17.5 12.5C17.8 11.8 18 11 18 10C18 8 17.5 6 16.5 4.5C15.5 3 14 2 12 2M6.7 15.5C7.2 15.5 7.6 15.7 7.9 16C8.2 16.3 8.4 16.7 8.5 17.2C8.6 17.7 8.7 18.1 8.7 18.5C8.7 18.9 8.6 19.3 8.5 19.8C8.4 20.3 8.2 20.7 7.9 21C7.6 21.3 7.2 21.5 6.7 21.5C6.2 21.5 5.8 21.3 5.5 21C5.2 20.7 5 20.3 4.9 19.8C4.8 19.3 4.7 18.9 4.7 18.5C4.7 18.1 4.8 17.7 4.9 17.2C5 16.7 5.2 16.3 5.5 16C5.8 15.7 6.2 15.5 6.7 15.5M17.3 15.5C17.8 15.5 18.2 15.7 18.5 16C18.8 16.3 19 16.7 19.1 17.2C19.2 17.7 19.3 18.1 19.3 18.5C19.3 18.9 19.2 19.3 19.1 19.8C19 20.3 18.8 20.7 18.5 21C18.2 21.3 17.8 21.5 17.3 21.5C16.8 21.5 16.4 21.3 16.1 21C15.8 20.7 15.6 20.3 15.5 19.8C15.4 19.3 15.3 18.9 15.3 18.5C15.3 18.1 15.4 17.7 15.5 17.2C15.6 16.7 15.8 16.3 16.1 16C16.4 15.7 16.8 15.5 17.3 15.5Z"/>
              </svg>
              <span className="font-display text-xl font-bold text-white">FashionHub</span>
            </div>
            <p className="text-sm mb-4">
              Elevating your style with premium fashion that speaks volumes.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-primary-500" />
                <span>123 Fashion St, NY 10001</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-primary-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-primary-500" />
                <span>support@fashionhub.com</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.help.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.about.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links & Payment Methods */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm">Follow us:</span>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all hover:scale-110"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-sm">We accept:</span>
              <div className="flex gap-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-xs font-semibold"
                    title={method.name}
                  >
                    {method.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p className="text-gray-400">
            © {new Date().getFullYear()} FashionHub Fashion. All rights reserved. |{' '}
            <Link to="/privacy" className="hover:text-primary-400 transition-colors">
              Privacy Policy
            </Link>{' '}
            |{' '}
            <Link to="/terms" className="hover:text-primary-400 transition-colors">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
