import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../auth/Login';
import Register from '../auth/Register';

const mockLogin = jest.fn();
const mockRegister = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin, register: mockRegister }),
}));
jest.mock('react-hot-toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const renderAt = (path, element) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path} element={element} />
        <Route path="/" element={<p>Home page</p>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => jest.clearAllMocks());

test('login: signs in and goes home', async () => {
  mockLogin.mockResolvedValue({ success: true });
  renderAt('/login', <Login />);

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome back.');
  fireEvent.change(screen.getByLabelText('Email'), { target: { name: 'email', value: 'sara@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { name: 'password', value: 'secret' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByText('Home page')).toBeInTheDocument();
  expect(mockLogin).toHaveBeenCalledWith({ email: 'sara@example.com', password: 'secret' });
});

test('login: shows the server error and validates empty fields', async () => {
  mockLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });
  renderAt('/login', <Login />);

  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(screen.getByText('Email is required')).toBeInTheDocument();
  expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  expect(mockLogin).not.toHaveBeenCalled();

  fireEvent.change(screen.getByLabelText('Email'), { target: { name: 'email', value: 'sara@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { name: 'password', value: 'wrong' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
});

test('login: password can be shown', () => {
  renderAt('/login', <Login />);
  const input = screen.getByLabelText('Password');
  expect(input).toHaveAttribute('type', 'password');
  fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
  expect(input).toHaveAttribute('type', 'text');
});

test('register: live checklist, validation, then creates the account', async () => {
  mockRegister.mockResolvedValue({ success: true });
  renderAt('/register', <Register />);

  const set = (label, name, value) => fireEvent.change(screen.getByLabelText(label), { target: { name, value } });
  set('Password', 'password', 'abc');
  const checklist = screen.getByRole('list', { name: 'Password requirements' });
  expect(checklist).toHaveTextContent('One lowercase letter(done)');
  expect(checklist).toHaveTextContent('One number(not yet)');

  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
  expect(screen.getByText('First name is required')).toBeInTheDocument();
  expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
  expect(mockRegister).not.toHaveBeenCalled();

  set('First name', 'firstName', 'Sara');
  set('Last name', 'lastName', 'Ahmed');
  set('Email', 'email', 'sara@example.com');
  set('Password', 'password', 'Abcdefg1');
  set('Confirm password', 'confirmPassword', 'Abcdefg1');
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

  await waitFor(() =>
    expect(mockRegister).toHaveBeenCalledWith({ firstName: 'Sara', lastName: 'Ahmed', email: 'sara@example.com', password: 'Abcdefg1' })
  );
  expect(await screen.findByText('Home page')).toBeInTheDocument();
});

test('register: existing email is shown on the field', async () => {
  mockRegister.mockResolvedValue({ success: false, message: 'User already exists' });
  renderAt('/register', <Register />);
  const set = (label, name, value) => fireEvent.change(screen.getByLabelText(label), { target: { name, value } });
  set('First name', 'firstName', 'Sara');
  set('Last name', 'lastName', 'Ahmed');
  set('Email', 'email', 'sara@example.com');
  set('Password', 'password', 'Abcdefg1');
  set('Confirm password', 'confirmPassword', 'Abcdefg1');
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
  expect(await screen.findByText(/already exists\. Try signing in instead/)).toBeInTheDocument();
});
