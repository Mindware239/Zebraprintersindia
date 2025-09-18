import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import AdminLogin from './AdminLogin';

const Admin = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  // If authenticated, show admin dashboard
  return (
    <div className="admin-page">
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard activeTab="dashboard" />} />
        <Route path="/analytics" element={<AdminDashboard activeTab="analytics" />} />
        <Route path="/products" element={<AdminDashboard activeTab="products" />} />
        <Route path="/import" element={<AdminDashboard activeTab="import" />} />
        <Route path="/categories" element={<AdminDashboard activeTab="categories" />} />
        <Route path="/subcategories" element={<AdminDashboard activeTab="subcategories" />} />
        <Route path="/brands" element={<AdminDashboard activeTab="brands" />} />
        <Route path="/webpages" element={<AdminDashboard activeTab="webpages" />} />
        <Route path="/hero-settings" element={<AdminDashboard activeTab="hero-settings" />} />
        <Route path="/color-themes" element={<AdminDashboard activeTab="color-themes" />} />
        <Route path="/orders" element={<AdminDashboard activeTab="orders" />} />
        <Route path="/user" element={<AdminDashboard activeTab="user" />} />
        <Route path="/settings" element={<AdminDashboard activeTab="settings" />} />
      </Routes>
    </div>
  );
};

export default Admin;
