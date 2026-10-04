import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Home from '../Home';

jest.mock('axios');

// Header/footer are covered elsewhere and need auth/cart providers
jest.mock('../../components/Navbar', () => () => <nav data-testid="navbar" />);
jest.mock('../../components/SEO', () => () => null);
jest.mock('../../context/WishlistContext', () => ({
  useWishlist: () => ({ isSaved: () => false, toggle: jest.fn() }),
}));

const product = (id, name, extra = {}) => ({
  _id: id,
  name,
  category: 'Dresses',
  price: 69.99,
  displayPrice: 69.99,
  totalStock: 20,
  image: `https://img/${id}.jpg`,
  variants: [],
  ...extra,
});

const API = {
  '/products': [product('p1', 'Linen Midi Dress'), product('p2', 'Denim Jacket', { category: 'Jackets', price: 89.99, displayPrice: 89.99 })],
  '/categories': [
    { _id: 'c1', name: 'Dresses', productCount: 3, coverImage: 'https://img/dresses.jpg' },
    { _id: 'c2', name: 'Jackets', productCount: 1, coverImage: '' },
  ],
  '/reviews/recent': [
    { _id: 'r1', rating: 5, comment: 'Beautiful fabric.', verifiedPurchase: true, user: { name: 'Sara Ahmed' }, product: { _id: 'p1' }, productName: 'Linen Midi Dress' },
  ],
  '/products/summary': { products: 20, categories: 6, reviews: 65, averageRating: 4.2 },
  '/coupons/featured': [{ code: 'WELCOME10', discountType: 'percent', discountValue: 10, minOrderAmount: 0 }],
  '/products/suggest': [{ _id: 'p1', name: 'Linen Midi Dress', price: 69.99 }],
};

const mockApi = (overrides = {}) => {
  axios.get.mockImplementation((url) => {
    const path = url.replace(/^.*\/api/, '');
    const data = path in overrides ? overrides[path] : API[path];
    return Promise.resolve({ data: { data } });
  });
};

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

test('hero, sections and offer use real store data', async () => {
  mockApi();
  renderHome();

  expect(screen.getByRole('heading', { level: 1, name: 'Wardrobe essentials, made to last.' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Shop New Arrivals' })).toHaveAttribute('href', '/products?sort=newest');

  // numbers from /products/summary
  expect(await screen.findByText(/20 styles across 6 categories/)).toBeInTheDocument();
  expect(screen.getByText(/average from 65 customer reviews/)).toBeInTheDocument();

  // caption links to the product in the photo (one for desktop, one for small screens)
  const lookLinks = screen.getAllByRole('link', { name: 'Shop the look: Linen Midi Dress, $69.99' });
  expect(lookLinks.length).toBeGreaterThan(0);
  lookLinks.forEach((link) => expect(link).toHaveAttribute('href', '/products/p1'));

  // the headline reads as one sentence to assistive tech
  expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('Wardrobe essentials, made to last.');

  // featured coupon
  expect(screen.getByText('WELCOME10')).toBeInTheDocument();

  // new arrivals use the shared product card
  const arrivals = screen.getByRole('region', { name: 'New arrivals' });
  expect(within(arrivals).getByRole('link', { name: 'Denim Jacket' })).toHaveAttribute('href', '/products/p2');

  // categories with real counts
  const categories = screen.getByRole('region', { name: 'Shop by category' });
  expect(within(categories).getByRole('link', { name: /Dresses 3 styles/ })).toHaveAttribute('href', '/products?category=Dresses');
  expect(within(categories).getByRole('link', { name: /Jackets 1 style$/ })).toBeInTheDocument();

  // a real review
  expect(screen.getByText('“Beautiful fabric.”')).toBeInTheDocument();
});

test('no offer bar without an advertised coupon, no caption without the product', async () => {
  mockApi({ '/coupons/featured': [], '/products/suggest': [] });
  renderHome();

  expect(await screen.findByText(/20 styles across 6 categories/)).toBeInTheDocument();
  expect(screen.queryByText(/at checkout/)).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Shop the look/ })).not.toBeInTheDocument();
});

test('only promises the store keeps', async () => {
  mockApi();
  renderHome();
  await screen.findByText(/20 styles across 6 categories/);
  const benefits = screen.getByRole('region', { name: 'Shopping with FashionHub' });
  expect(within(benefits).getAllByRole('listitem').map((li) => li.querySelector('span span').textContent)).toEqual([
    'Free shipping',
    'Cash on delivery',
    'Order tracking',
    'Questions?',
  ]);
  expect(screen.queryByText(/returns/i)).not.toBeInTheDocument();
});
