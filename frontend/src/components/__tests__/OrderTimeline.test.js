import React from 'react';
import { render, screen, within } from '@testing-library/react';
import OrderTimeline from '../OrderTimeline';

const at = (day) => `2026-10-0${day}T10:00:00.000Z`;

test('marks steps up to the current status as done', () => {
  render(
    <OrderTimeline
      order={{
        status: 'Shipped',
        createdAt: at(1),
        statusHistory: [
          { status: 'Pending', at: at(1) },
          { status: 'Processing', at: at(2) },
          { status: 'Shipped', at: at(3) },
        ],
      }}
    />
  );

  const steps = within(screen.getByRole('list', { name: 'Order progress' })).getAllByRole('listitem');
  expect(steps).toHaveLength(4);
  expect(steps[0]).toHaveTextContent('Order placed (done)');
  expect(steps[2]).toHaveTextContent('Shipped (done)');
  expect(steps[3]).toHaveTextContent('Delivered (not yet)');
  expect(steps[2]).toHaveTextContent('Oct 3');
});

test('older orders without history still show the placed date', () => {
  render(<OrderTimeline order={{ status: 'Pending', createdAt: at(5), statusHistory: [] }} />);
  expect(screen.getByText(/Order placed/)).toHaveTextContent('(done)');
  expect(screen.getByText(/Oct 5/)).toBeInTheDocument();
});

test('cancelled orders say when they were cancelled', () => {
  render(
    <OrderTimeline
      order={{
        status: 'Cancelled',
        createdAt: at(1),
        statusHistory: [
          { status: 'Pending', at: at(1) },
          { status: 'Processing', at: at(2) },
          { status: 'Cancelled', at: at(4) },
        ],
      }}
    />
  );

  expect(screen.getByText(/Cancelled on Oct 4/)).toBeInTheDocument();
  expect(screen.getByText(/^Processing/)).toHaveTextContent('(done)');
  expect(screen.getByText(/^Shipped/)).toHaveTextContent('(not yet)');
});
