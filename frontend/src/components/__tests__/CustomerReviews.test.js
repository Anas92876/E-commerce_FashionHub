import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CustomerReviews, { pickReviews } from '../home/CustomerReviews';

const review = (id, person, product, extra = {}) => ({
  _id: id,
  rating: 5,
  comment: `Comment ${id}`,
  verifiedPurchase: true,
  user: { name: person },
  product: { _id: product },
  productName: `Product ${product}`,
  ...extra,
});

test('picks positive reviews, new customers first, no repeated customer + product pair', () => {
  const picked = pickReviews([
    review('a', 'Sara', 'p1'),
    review('b', 'Sara', 'p1'), // same pair: skipped
    review('c', 'Sara', 'p2'), // repeat customer: after new ones
    review('d', 'Omar', 'p1'),
    review('e', 'Lina', 'p3', { rating: 2 }), // negative: skipped
    review('f', 'Maya', 'p4', { comment: '' }), // no comment: skipped
  ]);
  expect(picked.map((r) => r._id)).toEqual(['a', 'd', 'c']);
});

test('caps the slider at 12 reviews', () => {
  const many = Array.from({ length: 20 }, (_, i) => review(`r${i}`, `Person ${i}`, `p${i}`));
  expect(pickReviews(many)).toHaveLength(12);
});

test('renders every picked review as a slide', () => {
  render(
    <MemoryRouter>
      <CustomerReviews reviews={[review('a', 'Sara', 'p1'), review('d', 'Omar', 'p2')]} summary={{ reviews: 2, averageRating: 5 }} />
    </MemoryRouter>
  );
  const list = screen.getByRole('list', { name: 'Customer reviews' });
  expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  expect(screen.getByText('“Comment a”')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Product p2' })).toHaveAttribute('href', '/products/p2');
});

test('nothing to show without positive reviews', () => {
  const { container } = render(
    <MemoryRouter>
      <CustomerReviews reviews={[review('a', 'Sara', 'p1', { rating: 1 })]} />
    </MemoryRouter>
  );
  expect(container).toBeEmptyDOMElement();
});
