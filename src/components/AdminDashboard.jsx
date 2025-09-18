import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductManagement from './ProductManagement';
import CategoryManagement from './CategoryManagement';
import SubcategoryManagement from './SubcategoryManagement';
import BrandManagement from './BrandManagement';
import Import from '../pages/Import';

const AdminDashboard = ({ activeTab: propActiveTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState(propActiveTab);
  const navigate = useNavigate();
  const location = useLocation();

  // Update activeTab when prop changes
  useEffect(() => {
    setActiveTab(propActiveTab);
  }, [propActiveTab]);

  // Update activeTab when location changes
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'admin') {
      setActiveTab(path);
    }
  }, [location]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'products', label: 'Products', icon: '🛍️' },
    { id: 'import', label: 'Import/Export', icon: '📥' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'subcategories', label: 'Subcategories', icon: '📂' },
    { id: 'brands', label: 'Brands', icon: '🏢' },
    { id: 'webpages', label: 'WebPages', icon: '🌐' },
    { id: 'hero-settings', label: 'Hero Settings', icon: '⚙️' },
    { id: 'color-themes', label: 'Color Themes', icon: '🎨' },
    { id: 'orders', label: 'Orders', icon: '🛒', badge: '3' },
    { id: 'user', label: 'User', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const recentProducts = [
    { name: 'Zebra ZD421 Desktop Printer', status: 'Active', sku: 'ZEB-ZD421' },
    { name: 'Zebra ZT411 Industrial Printer', status: 'Active', sku: 'ZEB-ZT411' },
    { name: 'Zebra DS2208 Barcode Scanner', status: 'Active', sku: 'ZEB-DS2208' },
    { name: 'Zebra TC21 Mobile Computer', status: 'Active', sku: 'ZEB-TC21' },
    { name: 'Zebra ZD620 Industrial Printer', status: 'Active', sku: 'ZEB-ZD620' }
  ];

  const recentCategories = [
    { name: 'Desktop Printers', description: 'High-performance desktop thermal printers for small to medium businesses', status: 'Active' },
    { name: 'Industrial Printers', description: 'Heavy-duty industrial printers for high-volume manufacturing environments', status: 'Active' },
    { name: 'Barcode Scanners', description: 'Handheld and fixed-mount barcode scanners for various applications', status: 'Active' },
    { name: 'Mobile Computers', description: 'Rugged mobile computing devices for field operations and data collection', status: 'Active' },
    { name: 'Labels & Ribbons', description: 'Thermal labels and printing ribbons for barcode printing applications', status: 'Active' }
  ];

  const renderContent = () => {
    switch(activeTab) {
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
                <div className="card-icon purple">🖨️</div>
                <div className="card-content">
                  <h3>Zebra Printers</h3>
                  <div className="card-value">24</div>
                  <p>Desktop & Industrial printers</p>
                  <a href="#" className="card-link">Click to manage</a>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon green">📱</div>
                <div className="card-content">
                  <h3>Barcode Scanners</h3>
                  <div className="card-value">18</div>
                  <p>Handheld & Fixed-mount scanners</p>
                  <a href="#" className="card-link">Click to manage</a>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon blue">💻</div>
                <div className="card-content">
                  <h3>Mobile Computers</h3>
                  <div className="card-value">12</div>
                  <p>Rugged mobile devices</p>
                  <a href="#" className="card-link">Click to manage</a>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon orange">🏷️</div>
                <div className="card-content">
                  <h3>Labels & Ribbons</h3>
                  <div className="card-value">156</div>
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
                    <span className="section-icon">📦</span>
                    <div>
                      <h3>Recent Products</h3>
                      <p>Latest products in your catalog</p>
                    </div>
                  </div>
                </div>
                <div className="section-content">
                  {recentProducts.map((product, index) => (
                    <div key={index} className="product-item">
                      <div className="item-icon">🖨️</div>
                      <div className="item-content">
                        <div className="item-name">{product.name}</div>
                        <div className="item-sku">SKU: {product.sku}</div>
                        <button className="call-button">
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
                    <span className="section-icon">🏷️</span>
                    <div>
                      <h3>Recent Categories</h3>
                      <p>Product categories in your system</p>
                    </div>
                  </div>
                </div>
                <div className="section-content">
                  {recentCategories.map((category, index) => (
                    <div key={index} className="category-item">
                      <div className="item-icon">🏷️</div>
                      <div className="item-content">
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
      
      case 'products':
        return <ProductManagement />;
      
      case 'import':
        return <Import />;
      
      case 'categories':
        return <CategoryManagement />;
       
       case 'subcategories':
         return <SubcategoryManagement />;
       
       case 'brands':
         return <BrandManagement />;
      
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
      
      case 'hero-settings':
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
      
      case 'color-themes':
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
      
      case 'user':
        return (
          <div className="main-content">
            <div className="dashboard-header">
              <h1>User Management</h1>
              <p>Manage user accounts and permissions</p>
            </div>
            <div className="users-list">
              <div className="user-item">
                <div className="user-avatar">AD</div>
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
                <h3>General Settings</h3>
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
      
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Top Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="search-section">
            <input 
              type="text" 
              placeholder="Search products, orders..." 
              className="search-input"
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
            {sidebarItems.map(item => (
              <div 
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(`/admin/${item.id}`);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="back-to-site" onClick={() => navigate('/')}>
              <span className="back-icon">🏠</span>
              <span>Back to Site</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-main">
          {renderContent()}
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #f8f9fa;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .admin-header {
          background: white;
          border-bottom: 1px solid #e9ecef;
          padding: 0 20px;
          height: 60px;
          display: flex;
          align-items: center;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .search-section {
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 25px;
          font-size: 14px;
          outline: none;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notification-icon {
          position: relative;
          font-size: 20px;
          cursor: pointer;
        }

        .notification-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #e74c3c;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-icon {
          font-size: 20px;
          cursor: pointer;
        }

        .user-avatar {
          position: relative;
          width: 40px;
          height: 40px;
          background: #3498db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }

        .avatar-text {
          font-size: 14px;
        }

        .verify-tooltip {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }

        .user-avatar:hover .verify-tooltip {
          opacity: 1;
        }

        .admin-layout {
          display: flex;
          margin-top: 60px;
          min-height: calc(100vh - 60px);
        }

        .admin-sidebar {
          width: 250px;
          background: #2c3e50;
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: calc(100vh - 60px);
          overflow-y: auto;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          width: 45px;
          height: 45px;
          background: #3498db;
          color: white;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
          box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
          transition: all 0.3s ease;
        }

        .logo-icon:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 12px 30px rgba(52, 152, 219, 0.6);
        }

        .logo-text {
          font-weight: bold;
          font-size: 14px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          margin: 8px 15px;
          border-radius: 15px;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .nav-item:hover::before {
          left: 100%;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(8px) scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.2);
          border-right: 4px solid #3498db;
          box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
          transform: translateX(8px);
        }

        .nav-icon {
          margin-right: 15px;
          font-size: 18px;
          transition: all 0.3s ease;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .nav-item:hover .nav-icon {
          transform: scale(1.2) rotate(10deg);
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        .nav-label {
          flex: 1;
          font-size: 14px;
        }

        .nav-badge {
          background: #e74c3c;
          color: white;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
          animation: bounce 2s infinite;
          position: relative;
        }

        .nav-badge::before {
          content: '';
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #ff4757;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-3px); }
          60% { transform: translateY(-2px); }
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-to-site {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          opacity: 0.8;
          transition: opacity 0.3s;
        }

        .back-to-site:hover {
          opacity: 1;
        }

        .admin-main {
          flex: 1;
          margin-left: 250px;
          padding: 30px;
        }

        .main-content {
          max-width: 1200px;
        }

        .dashboard-header h1 {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin: 0 0 10px 0;
        }

        .dashboard-header p {
          color: #666;
          font-size: 16px;
          margin: 0 0 15px 0;
        }

        .current-route {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #e8f4fd;
          padding: 8px 12px;
          border-radius: 6px;
          border-left: 4px solid #3498db;
          margin-bottom: 30px;
          font-size: 14px;
          color: #2c3e50;
        }

        .route-indicator {
          font-size: 16px;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.3s;
        }

        .summary-card:hover {
          transform: translateY(-2px);
        }

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .card-icon.purple {
          background: #e3f2fd;
          color: #6f42c1;
        }

        .card-icon.green {
          background: #e8f5e8;
          color: #28a745;
        }

        .card-icon.blue {
          background: #e3f2fd;
          color: #007bff;
        }

        .card-icon.orange {
          background: #fff3e0;
          color: #fd7e14;
        }

        .card-content h3 {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .card-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin: 0 0 5px 0;
        }

        .card-content p {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #999;
        }

        .card-link {
          color: #3498db;
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
        }

        .card-link:hover {
          text-decoration: underline;
        }

        .content-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .content-section {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          margin-bottom: 20px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .section-icon {
          font-size: 24px;
        }

        .section-title h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
          color: #333;
        }

        .section-title p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .product-item, .category-item {
          display: flex;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .product-item:last-child, .category-item:last-child {
          border-bottom: none;
        }

        .item-icon {
          margin-right: 15px;
          font-size: 20px;
        }

        .item-content {
          flex: 1;
        }

        .item-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 5px;
        }

        .item-sku {
          font-size: 12px;
          color: #666;
          font-weight: 500;
          margin-bottom: 5px;
        }

        .item-description {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }

        .call-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 11px;
          cursor: pointer;
          margin-top: 5px;
        }

        .item-status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .item-status.active {
          background: #d4edda;
          color: #155724;
        }

        /* Form Styles */
        .form-container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }

        .submit-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .submit-btn:hover {
          background: #2980b9;
        }

        /* Analytics Styles */
        .analytics-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .analytics-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .chart-placeholder {
          height: 200px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #666;
        }

        /* Pages List */
        .pages-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .page-item {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .edit-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }

        /* Theme Options */
        .theme-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .theme-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .theme-preview {
          width: 100%;
          height: 100px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .theme-preview.purple {
          background: #6f42c1;
        }

        .theme-preview.blue {
          background: #007bff;
        }

        .theme-preview.green {
          background: #28a745;
        }

        .select-theme {
          background: #3498db;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }

        /* Orders List */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .order-item {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .order-status {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .order-status.pending {
          background: #fff3cd;
          color: #856404;
        }

        .order-status.completed {
          background: #d4edda;
          color: #155724;
        }

        /* Users List */
        .users-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .user-item {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          background: #3498db;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .user-role {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .user-role.admin {
          background: #d4edda;
          color: #155724;
        }

        /* Settings */
        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .settings-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .setting-item {
          margin-bottom: 20px;
        }

        .setting-item label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .setting-item input,
        .setting-item textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s;
          }

          .admin-main {
            margin-left: 0;
          }

          .content-sections {
            grid-template-columns: 1fr;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .analytics-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;