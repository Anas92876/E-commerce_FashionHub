import { render, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// No real network in tests: every API call resolves with empty data
jest.mock('axios');

beforeEach(() => {
  axios.get.mockResolvedValue({ data: { data: [], ids: [] } });
  localStorage.clear();
});

test('renders the 404 page for an unknown address', async () => {
  window.history.pushState({}, '', '/this-page-does-not-exist');
  render(<App />);
  expect(await screen.findByRole('heading', { level: 1, name: '404' })).toBeInTheDocument();
});

test('renders the products page with its search box', async () => {
  window.history.pushState({}, '', '/products?category=Jeans');
  render(<App />);
  expect(await screen.findByRole('heading', { level: 1, name: /Our Collection/ })).toBeInTheDocument();
  expect(screen.getAllByRole('combobox', { name: 'Search products' }).length).toBeGreaterThan(0);
  // the category from the URL is sent to the API
  expect(axios.get).toHaveBeenCalledWith(
    expect.stringMatching(/\/products$/),
    expect.objectContaining({ params: expect.objectContaining({ category: 'Jeans' }) })
  );
});
