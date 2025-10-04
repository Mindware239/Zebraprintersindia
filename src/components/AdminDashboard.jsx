import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import SubcategoryManagement from './SubcategoryManagement';
import BrandManagement from './BrandManagement';
import DriverManagement from './DriverManagement';
import BlogManagement from './BlogManagement';
import JobManagement from './JobManagement';
import Import from '../pages/Import';
import apiService from '../services/api';
import './AdminDashboard.css';

// No styled components needed - using CSS file

const AdminDashboard = ({ activeTab: propActiveTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState(propActiveTab);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Dynamic data states
  const [dashboardData, setDashboardData] = useState({
    products: [],
    categories: [],
    orders: [],
    users: []
  });

  // Statistics data
  const [statistics, setStatistics] = useState({
    printers: 0,
    scanners: 0,
    mobileComputers: 0,
    labels: 0
  });

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'categories', label: 'Categories', icon: '📂' },
    { id: 'subcategories', label: 'Subcategories', icon: '📁' },
    { id: 'brands', label: 'Brands', icon: '🏷️' },
    { id: 'drivers', label: 'Drivers', icon: '💾' },
    { id: 'blogs', label: 'Blogs', icon: '📝' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'import', label: 'Import', icon: '📥' }
  ];

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update active tab when prop changes
  useEffect(() => {
    setActiveTab(propActiveTab);
  }, [propActiveTab]);

  const loadDashboardData = async () => {
    try {
      // Load products
      const products = await apiService.getAllProducts();
      setDashboardData(prev => ({
        ...prev,
        products: products.slice(0, 5) // Show only first 5
      }));

      // Load categories
      const categories = await apiService.getCategories();
      setDashboardData(prev => ({
        ...prev,
        categories: categories.slice(0, 5) // Show only first 5
      }));

      // Calculate statistics
      const printerCount = products.filter(p => 
        p.category?.toLowerCase().includes('printer') || 
        p.name?.toLowerCase().includes('printer')
      ).length;
      
      const scannerCount = products.filter(p => 
        p.category?.toLowerCase().includes('scanner') || 
        p.name?.toLowerCase().includes('scanner')
      ).length;
      
      const mobileCount = products.filter(p => 
        p.category?.toLowerCase().includes('mobile') || 
        p.name?.toLowerCase().includes('mobile')
      ).length;
      
      const labelCount = products.filter(p => 
        p.category?.toLowerCase().includes('label') || 
        p.name?.toLowerCase().includes('label')
      ).length;

      setStatistics({
        printers: printerCount || 24, // Fallback to sample data
        scanners: scannerCount || 18,
        mobileComputers: mobileCount || 12,
        labels: labelCount || 156
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set fallback statistics when API fails
      setStatistics({
        printers: 24,
        scanners: 18,
        mobileComputers: 12,
        labels: 156
      });
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin/${tabId}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="main-content">
            <div className="dashboard-header">
              <h1>Admin Dashboard</h1>
              <p>Welcome back! Here's what's happening with your business today.</p>
              <div className="current-route">
                <span className="route-indicator">📍</span>
                <span>Current Route: /admin/{activeTab}</span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon">🖨️</div>
                <div className="card-content">
                  <div className="card-number">{statistics.printers}</div>
                  <h3>Zebra Printers</h3>
                  <p>Desktop & Industrial printers</p>
                  <a href="#" className="card-link">Click to manage</a>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon">📱</div>
                <div className="card-content">
                  <div className="card-number">{statistics.scanners}</div>
                  <h3>Barcode Scanners</h3>
                  <p>Handheld & Fixed-mount scanners</p>
                  <a href="#" className="card-link">Click to manage</a>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon">💻</div>
                <div className="card-content">
                  <div className="card-number">{statistics.mobileComputers}</div>
                  <h3>Mobile Computers</h3>
                  <p>Rugged mobile devices</p>
                  <a href="#" className="card-link">Click to manage</a>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon">🏷️</div>
                <div className="card-content">
                  <div className="card-number">{statistics.labels}</div>
                  <h3>Labels & Ribbons</h3>
                  <p>Thermal labels & ribbons</p>
                  <a href="#" className="card-link">Click to manage</a>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="content-sections">
              {/* Recent Products */}
              <div className="content-section">
                <div className="section-header">
                  <div className="section-title">
                      <h3>Recent Products</h3>
                      <p>Latest products in your catalog</p>
                  </div>
                </div>
                <div className="section-content">
                  {dashboardData.products.map((product, index) => (
                    <div key={index} className="item-card">
                      <div className="item-info">
                        <div className="item-name">{product.name}</div>
                        <div className="item-description">{product.shortDescription}</div>
                        <button className="action-btn">
                          📞 Get Quote
                        </button>
                      </div>
                      <div className="item-status active">{product.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Categories */}
              <div className="content-section">
                <div className="section-header">
                  <div className="section-title">
                      <h3>Recent Categories</h3>
                      <p>Product categories in your system</p>
                  </div>
                </div>
                <div className="section-content">
                  {dashboardData.categories.map((category, index) => (
                    <div key={index} className="item-card">
                      <div className="item-info">
                        <div className="item-name">{category.name}</div>
                        <div className="item-description">{category.description}</div>
                      </div>
                      <div className="item-status active">{category.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'subcategories':
        return <SubcategoryManagement />;
      case 'brands':
        return <BrandManagement />;
      case 'drivers':
        return <DriverManagement />;
             case 'blogs':
               return <BlogManagement />;
      case 'jobs':
        return <JobManagement />;
      case 'import':
        return <Import />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-icon">M</div>
              <span className="logo-text">Mindware Admin Dashboard</span>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            {navigationItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="back-to-site">
              <span className="back-icon">🏠</span>
              <span>Back to Site</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;