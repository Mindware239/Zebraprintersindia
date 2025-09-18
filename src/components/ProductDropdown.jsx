import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Printer, Scan, Radio, Tag, Settings, Wrench, Headphones } from 'lucide-react';
import './ProductDropdown.css';

const ProductDropdown = ({ isOpen, onClose, onMouseEnter, onMouseLeave }) => {
  const [dropdownData, setDropdownData] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Category icons mapping
  const categoryIcons = {
    'printers': Printer,
    'scanners': Scan,
    'rfid': Radio,
    'supplies': Tag,
    'software': Settings,
    'accessories': Wrench,
    'service': Headphones
  };

  // Fetch dropdown data from API
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dropdown-data');
        const data = await response.json();
        setDropdownData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="product-dropdown"
      onMouseEnter={() => {
        if (onMouseEnter) onMouseEnter();
      }}
      onMouseLeave={() => {
        if (onMouseLeave) onMouseLeave();
      }}
    >
      <div className="dropdown-container">
        {/* Header */}
        <div className="dropdown-header">
          <h2>Product Categories</h2>
          <p>Explore our comprehensive range of barcode and RFID solutions</p>
        </div>

        <div className="dropdown-content">
          {/* Left Column - Categories */}
          <div className="categories-column">
            <div className="categories-list">
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading categories...</p>
                </div>
              ) : (
                Object.entries(dropdownData).map(([categoryKey, category]) => {
                  const IconComponent = categoryIcons[categoryKey] || Settings;
                  return (
                    <div
                      key={categoryKey}
                      className={`category-item ${hoveredCategory === categoryKey ? 'active' : ''}`}
                      onMouseEnter={() => setHoveredCategory(categoryKey)}
                    >
                      <div className="category-icon">
                        <IconComponent size={20} />
                      </div>
                      <div className="category-info">
                        <h3>{category.display_name}</h3>
                        <p>{category.description}</p>
                      </div>
                      <ChevronRight size={16} className="category-arrow" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column - Subcategories */}
          <div className="subcategories-column">
            {hoveredCategory && dropdownData[hoveredCategory] ? (
              <div className="subcategories-content">
                <div className="subcategories-header">
                  <h3>{dropdownData[hoveredCategory].display_name}</h3>
                  <p>{dropdownData[hoveredCategory].description}</p>
                </div>
                
                <div className="subcategories-grid">
                  {dropdownData[hoveredCategory].subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.id}
                      to={`/products/${subcategory.name}`}
                      className="subcategory-item"
                      onClick={onClose}
                    >
                      <div className="subcategory-content">
                        <h4>{subcategory.display_name}</h4>
                        <p>{subcategory.description}</p>
                      </div>
                      <ChevronRight size={14} className="subcategory-arrow" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <div className="no-selection-icon">
                  <Settings size={48} />
                </div>
                <h3>Select a Category</h3>
                <p>Hover over a category to see its subcategories and products</p>
              </div>
            )}
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="featured-section">
          <div className="featured-header">
            <h3>Featured Products</h3>
            <Link to="/products" className="view-all-link">View All Products</Link>
          </div>
          <div className="featured-products">
            <div className="featured-product">
              <div className="product-icon">🖨️</div>
              <div className="product-info">
                <h4>Zebra ZD421 Desktop Printer</h4>
                <p>High-performance desktop printer</p>
                <span className="product-price">₹45,000</span>
              </div>
            </div>
            <div className="featured-product">
              <div className="product-icon">📱</div>
              <div className="product-info">
                <h4>Zebra DS2208 Scanner</h4>
                <p>Advanced barcode scanner</p>
                <span className="product-price">₹25,000</span>
              </div>
            </div>
            <div className="featured-product">
              <div className="product-icon">💻</div>
              <div className="product-info">
                <h4>ZebraDesigner Pro</h4>
                <p>Professional label design software</p>
                <span className="product-price">₹15,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDropdown;
