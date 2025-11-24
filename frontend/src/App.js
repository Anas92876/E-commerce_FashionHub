import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Public Pages
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Home from './pages/Home';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Customer Pages
import Products from './pages/customer/Products';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import MyOrders from './pages/customer/MyOrders';
import Profile from './pages/customer/Profile';

// Admin Route Protection
import AdminRoute from './components/AdminRoute';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductsList from './pages/admin/ProductsList';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import Messages from './pages/admin/Messages';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="App bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <Routes>
              {/* ============================================
                  PUBLIC ROUTES - Anyone can access these
                  ============================================ */}
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

              {/* Customer Routes */}
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contact" element={<Contact />} />

            {/* ============================================
                ADMIN ROUTES - Only accessible by admins
                These routes are protected by AdminRoute component
                If user is not admin, they get redirected to home
                ============================================ */}

            {/* Admin Dashboard - Shows statistics and quick actions */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />

            {/* Products List - View all products with search/filter */}
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <ProductsList />
                </AdminRoute>
              }
            />

            {/* Add Product - Form to create new product */}
            <Route
              path="/admin/products/add"
              element={
                <AdminRoute>
                  <AddProduct />
                </AdminRoute>
              }
            />

            {/* Edit Product - Form to update existing product
                :id is the product ID from URL */}
            <Route
              path="/admin/products/edit/:id"
              element={
                <AdminRoute>
                  <EditProduct />
                </AdminRoute>
              }
            />

            {/* Categories Management - Add/Edit/Delete categories */}
            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <Categories />
                </AdminRoute>
              }
            />

            {/* Orders Management - View and manage all orders */}
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <Orders />
                </AdminRoute>
              }
            />

            {/* Messages - View and manage contact form submissions */}
            <Route
              path="/admin/messages"
              element={
                <AdminRoute>
                  <Messages />
                </AdminRoute>
              }
            />

            {/* Users - Manage users and admins */}
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              }
            />

            {/* 404 Not Found - Catch all unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--toast-bg, #363636)',
                    color: '#fff',
                  },
                  className: 'dark:bg-gray-800 dark:text-white',
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
