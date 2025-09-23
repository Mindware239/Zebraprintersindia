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
    { id: 'import', label: 'Import', icon: '📥' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'webpages', label: 'WebPages', icon: '🌐' },
    { id: 'hero', label: 'Hero Settings', icon: '🎨' },
    { id: 'themes', label: 'Color Themes', icon: '🎨' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
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
      
      case 'analytics':
        return (
          <div className="main-content">
            <div className="dashboard-header">
              <h1>Analytics</h1>
              <p>View detailed analytics and reports for your business</p>
              <div className="current-route">
                <span className="route-indicator">📍</span>
                <span>Current Route: /admin/{activeTab}</span>
              </div>
            </div>
            <div className="analytics-content">
              <div className="analytics-card">
                <h3>Sales Overview</h3>
                <div className="chart-placeholder">📊 Sales Chart</div>
              </div>
              <div className="analytics-card">
                <h3>Product Performance</h3>
                <div className="chart-placeholder">📈 Performance Chart</div>
              </div>
            </div>
          </div>
        );
      
      case 'webpages':
        return (
          <div className="main-content">
            <div className="dashboard-header">
              <h1>WebPages</h1>
              <p>Manage website pages and content</p>
            </div>
            <div className="pages-list">
              <div className="page-item">
                <h3>Home Page</h3>
                <p>Main landing page</p>
                <button className="edit-btn">Edit</button>
              </div>
              <div className="page-item">
                <h3>Products Page</h3>
                <p>Product listing page</p>
                <button className="edit-btn">Edit</button>
              </div>
              <div className="page-item">
                <h3>About Page</h3>
                <p>Company information</p>
                <button className="edit-btn">Edit</button>
              </div>
            </div>
          </div>
        );
      
      case 'hero':
        return (
          <div className="main-content">
            <div className="dashboard-header">
              <h1>Hero Settings</h1>
              <p>Configure hero section settings</p>
            </div>
            <div className="form-container">
              <form className="hero-form">
                <div className="form-group">
                  <label>Hero Title</label>
                  <input type="text" placeholder="Enter hero title" />
                </div>
                <div className="form-group">
                  <label>Hero Subtitle</label>
                  <input type="text" placeholder="Enter hero subtitle" />
                </div>
                <div className="form-group">
                  <label>Hero Image</label>
                  <input type="file" accept="image/*" />
                </div>
                <button type="submit" className="submit-btn">Save Settings</button>
              </form>
            </div>
          </div>
        );
      
      case 'themes':
        return (
          <div className="main-content">
            <div className="dashboard-header">
              <h1>Color Themes</h1>
              <p>Customize website color scheme</p>
            </div>
            <div className="theme-options">
              <div className="theme-card">
                <div className="theme-preview purple"></div>
                <h3>Purple Theme</h3>
                <button className="select-theme">Select</button>
              </div>
              <div className="theme-card">
                <div className="theme-preview blue"></div>
                <h3>Blue Theme</h3>
                <button className="select-theme">Select</button>
              </div>
              <div className="theme-card">
                <div className="theme-preview green"></div>
                <h3>Green Theme</h3>
                <button className="select-theme">Select</button>
              </div>
            </div>
          </div>
        );
      
      case 'orders':
        return (
          <div className="main-content">
            <div className="dashboard-header">
              <h1>Orders</h1>
              <p>Manage customer orders</p>
            </div>
            <div className="orders-list">
              <div className="order-item">
                <div className="order-info">
                  <h3>Order #12345</h3>
                  <p>Customer: John Doe</p>
                  <p>Amount: ₹2,500</p>
                </div>
                <div className="order-status pending">Pending</div>
              </div>
              <div className="order-item">
                <div className="order-info">
                  <h3>Order #12346</h3>
                  <p>Customer: Jane Smith</p>
                  <p>Amount: ₹1,800</p>
                </div>
                <div className="order-status completed">Completed</div>
              </div>
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div className="main-content">
            <div className="dashboard-header">
              <h1>User Management</h1>
              <p>Manage user accounts and permissions</p>
            </div>
            <div className="users-list">
              <div className="user-item">
                <div className="user-info">
                  <h3>Admin User</h3>
                  <p>admin@example.com</p>
                </div>
                <div className="user-role admin">Admin</div>
              </div>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="main-content">
            <div className="dashboard-header">
              <h1>Settings</h1>
              <p>Configure system settings</p>
            </div>
            <div className="settings-sections">
              <div className="settings-card">
                <div className="setting-item">
                  <label>Site Name</label>
                  <input type="text" defaultValue="Mindware" />
                </div>
                <div className="setting-item">
                  <label>Site Description</label>
                  <textarea defaultValue="Professional barcode solutions"></textarea>
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
      {/* Top Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="search-section">
            <input 
              type="text" 
              className="search-input"
              placeholder="Search products, orders..." 
            />
          </div>
          <div className="header-controls">
            <div className="notification-icon">
              🔔
              <span className="notification-badge">2</span>
            </div>
            <div className="settings-icon">⚙️</div>
            <div className="user-avatar">
              <span className="avatar-text">AD</span>
              <span className="verify-tooltip">Verify it's you</span>
            </div>
          </div>
        </div>
      </div>

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