import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import AdminLogin from '../pages/AdminLogin';

const ProtectedRoute = ({ children, requireAdmin = false, fallback = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (requireAdmin ? <AdminLogin /> : <LoginForm />);
  }

  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Admin privileges are required.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
