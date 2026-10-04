import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SalesChart from '../SalesChart';

const data = [
  { date: '2026-10-01', orders: 0, revenue: 0 },
  { date: '2026-10-02', orders: 2, revenue: 120.5 },
  { date: '2026-10-03', orders: 1, revenue: 40 },
];

test('describes the chart and includes a data table for screen readers', () => {
  render(<SalesChart data={data} />);
  expect(screen.getByRole('img', { name: /last 3 days, total \$160\.50/ })).toBeInTheDocument();
  expect(screen.getByRole('table')).toHaveTextContent('Oct 2$120.502');
});

test('shows a tooltip when a day is focused', () => {
  render(<SalesChart data={data} />);
  fireEvent.focus(screen.getByLabelText('Oct 2: $120.50, 2 orders'));
  expect(screen.getByText('2 orders')).toBeInTheDocument();
});

test('renders nothing without data', () => {
  const { container } = render(<SalesChart data={[]} />);
  expect(container).toBeEmptyDOMElement();
});
