import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Printer, Scan, Radio, Tag, Settings, Wrench, Headphones } from 'lucide-react';
import apiService from '../services/api';
import './ProductDropdown.css';

const ProductDropdown = ({ isOpen, onClose, onMouseEnter, onMouseLeave }) => {
  const [dropdownData, setDropdownData] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Debug logging
  console.log('ProductDropdown rendered, isOpen:', isOpen);

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

  // Static fallback data
  const staticDropdownData = {
    'printers': {
      id: 1,
      display_name: 'Printers',
      description: 'Barcode and label printers for all business needs',
      subcategories: [
        { id: 1, name: 'desktop-printers', display_name: 'Desktop Printers', description: 'Compact desktop printing solutions' },
        { id: 2, name: 'industrial-printers', display_name: 'Industrial Printers', description: 'Heavy-duty industrial printing' },
        { id: 3, name: 'mobile-printers', display_name: 'Mobile Printers', description: 'Portable printing solutions' }
      ]
    },
    'scanners': {
      id: 2,
      display_name: 'Barcode Scanners',
      description: 'Advanced scanning solutions for every industry',
      subcategories: [
        { id: 4, name: 'handheld-scanners', display_name: 'Handheld Scanners', description: 'Portable scanning devices' },
        { id: 5, name: 'fixed-mount-scanners', display_name: 'Fixed Mount Scanners', description: 'Stationary scanning solutions' },
        { id: 6, name: 'mobile-computers', display_name: 'Mobile Computers', description: 'All-in-one mobile computing' }
      ]
    },
    'accessories': {
      id: 3,
      display_name: 'Accessories',
      description: 'Accessories for printers and scanners',
      subcategories: [
        { id: 7, name: 'labels', display_name: 'Labels & Supplies', description: 'Labels, ribbons, and consumables' },
        { id: 8, name: 'cables', display_name: 'Cables & Connectors', description: 'Connectivity solutions' },
        { id: 9, name: 'mounts', display_name: 'Mounts & Stands', description: 'Installation accessories' }
      ]
    },
    'software': {
      id: 4,
      display_name: 'Software',
      description: 'Professional software solutions',
      subcategories: [
        { id: 10, name: 'design-software', display_name: 'Design Software', description: 'Label and barcode design tools' },
        { id: 11, name: 'management-software', display_name: 'Management Software', description: 'Device and inventory management' }
      ]
    }
  };

  // Fetch dropdown data from API
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const data = await apiService.getDropdownData();
        setDropdownData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        // Use static data as fallback
        setDropdownData(staticDropdownData);
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

  if (!isOpen) {
    console.log('ProductDropdown not open, returning null');
    return null;
  }

  console.log('ProductDropdown is open, rendering dropdown');

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
