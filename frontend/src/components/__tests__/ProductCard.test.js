import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProductCard, { productImage, productPrice } from '../ProductCard';

const mockToggle = jest.fn();
let mockSaved = false;

jest.mock('../../context/WishlistContext', () => ({
  useWishlist: () => ({ isSaved: () => mockSaved, toggle: mockToggle }),
}));

const variantProduct = {
  _id: 'p1',
  name: 'Classic Tee',
  category: 'T-Shirts',
  description: 'Soft cotton',
  basePrice: 20,
  price: 20,
  displayPrice: 20,
  hasVariablePricing: true,
  totalStock: 0,
  rating: 4.5,
  numReviews: 3,
  variants: [
    { sku: 'R', isActive: true, color: { name: 'Red', hex: '#ff0000' }, images: ['https://img/red.jpg'], sizes: [{ size: 'M' }, { size: 'L' }] },
    { sku: 'B', isActive: true, color: { name: 'Blue', hex: '#0000ff' }, images: [], sizes: [{ size: 'M' }] },
    { sku: 'X', isActive: false, color: { name: 'Hidden', hex: '#000000' }, images: [], sizes: [] },
  ],
};

const renderCard = (product) =>
  render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  );

beforeEach(() => {
  mockToggle.mockClear();
  mockSaved = false;
});

test('shows name, "from" price, rating, colors and sizes', () => {
  renderCard(variantProduct);

  expect(screen.getByText('Classic Tee')).toBeInTheDocument();
  expect(screen.getByText('from')).toBeInTheDocument();
  expect(screen.getByText('$20.00')).toBeInTheDocument();
  expect(screen.getByText('4.5')).toBeInTheDocument();
  expect(screen.getByLabelText('Colors: Red, Blue')).toBeInTheDocument(); // inactive variant hidden
  expect(screen.getByText('M')).toBeInTheDocument();
  expect(screen.getByText('L')).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute('href', '/products/p1');
});

test('shows Out of Stock when total stock is 0', () => {
  renderCard(variantProduct);
  expect(screen.getByText('Out of Stock')).toBeInTheDocument();
});

test('heart button toggles the wishlist without following the link', async () => {
  renderCard(variantProduct);
  await userEvent.click(screen.getByRole('button', { name: 'Save to wishlist' }));
  expect(mockToggle).toHaveBeenCalledWith('p1');
});

test('heart shows the saved state', () => {
  mockSaved = true;
  renderCard(variantProduct);
  expect(screen.getByRole('button', { name: 'Remove from wishlist' })).toHaveAttribute('aria-pressed', 'true');
});

test('image and price helpers', () => {
  expect(productImage(variantProduct)).toBe('https://img/red.jpg');
  expect(productImage({ image: 'legacy.jpg', variants: [] })).toBe('legacy.jpg');
  expect(productImage({ variants: [] })).toBe('');
  expect(productPrice({ price: '12.5' })).toBe(12.5);
  expect(productPrice({ displayPrice: 9, price: 20 })).toBe(9);
});
