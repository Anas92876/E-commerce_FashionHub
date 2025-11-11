import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute Component
 *
 * This component protects admin-only routes.
 * It checks if:
 * 1. User is logged in
 * 2. User has admin role
 *
 * If user is not logged in -> redirect to /login
 * If user is logged in but not admin -> redirect to home
 * If user is admin -> allow access to the admin page
 *
 * Usage:
 * <Route path="/admin/dashboard" element={
 *   <AdminRoute>
 *     <AdminDashboard />
 *   </AdminRoute>
 * } />
 */
const AdminRoute = ({ children }) => {
  // Get authentication state from AuthContext
  const { user, loading, isAdmin } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but not an admin, redirect to home
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // User is admin, render the protected component
  return children;
};

export default AdminRoute;
