import React, { useState, useEffect } from 'react';

const ProductManagement = () => {
  const [activeView, setActiveView] = useState('overview'); // overview, add, import, export
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    subcategory_id: '',
    shortDescription: '',
    description: '',
    specifications: '',
    sku: '',
    metaKeywords: '',
    metaTitle: '',
    metaDescription: '',
    status: 'active',
    featured: false,
    image: null,
    pdf: null
  });

  // Load products and categories on component mount
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSubcategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubcategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subcategories');
      const data = await response.json();
      setSubcategories(data);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
      };
      
      // Auto-generate slug when name changes
      if (name === 'name' && value) {
        newData.slug = generateSlug(value);
      }
      
      // Reset subcategory when category changes
      if (name === 'category') {
        newData.subcategory_id = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      console.log('Form data before sending:', formData);
      console.log('Is editing:', isEditing, 'Product ID:', editingProductId);
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const url = isEditing 
        ? `http://localhost:5000/api/products/${editingProductId}`
        : 'http://localhost:5000/api/products';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Product ${isEditing ? 'updated' : 'added'} successfully:`, result);
        alert(`Product ${isEditing ? 'updated' : 'added'} successfully!`);
        
        // Reset form and states
        setIsEditing(false);
        setEditingProductId(null);
        setFormData({
          name: '',
          slug: '',
          category: '',
          subcategory_id: '',
          shortDescription: '',
          description: '',
          specifications: '',
          sku: '',
          metaKeywords: '',
          metaTitle: '',
          metaDescription: '',
          status: 'active',
          featured: false,
          image: null,
          pdf: null
        });
        loadProducts();
        setActiveView('overview');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Error ${isEditing ? 'updating' : 'adding'} product: ` + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} product:`, error);
      alert(`Error ${isEditing ? 'updating' : 'adding'} product: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          loadProducts();
          alert('Product deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        setLoading(true);
        for (const id of selectedProducts) {
          await fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'DELETE'
          });
        }
        setSelectedProducts([]);
        loadProducts();
        alert('Products deleted successfully!');
      } catch (error) {
        console.error('Error deleting products:', error);
        alert('Error deleting products');
      } finally {
        setLoading(false);
      }
    }
  };



  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderOverview = () => (
    <div className="product-overview">
      <div className="overview-header">
        <h2>Product Management</h2>
        <p>Manage all your products from this centralized dashboard</p>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => {
            setIsEditing(false);
            setEditingProductId(null);
            setFormData({
              name: '',
              slug: '',
              category: '',
              subcategory_id: '',
              shortDescription: '',
              description: '',
              specifications: '',
              sku: '',
              metaKeywords: '',
              metaTitle: '',
              metaDescription: '',
              status: 'active',
              featured: false,
              image: null,
              pdf: null
            });
            setActiveView('add');
          }}
        >
          ➕ Add Product
        </button>
        {selectedProducts.length > 0 && (
          <button 
            className="btn btn-danger"
            onClick={handleBulkDelete}
          >
            🗑️ Delete Selected ({selectedProducts.length})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(filteredProducts.map(p => p.id));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                />
              </th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Sub-category</th>
              <th>SKU</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="loading-cell">Loading products...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data-cell">No products found</td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product.id]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                        }
                      }}
                    />
                  </td>
                  <td>
                    <img 
                      src={product.image || '/placeholder-image.jpg'} 
                      alt={product.name}
                      className="product-thumbnail"
                    />
                  </td>
                  <td>
                    <div className="product-name">{product.name}</div>
                    <div className="product-description">{product.shortDescription}</div>
                  </td>
                  <td>{product.category_display_name || product.category}</td>
                  <td>{product.subcategory_display_name || product.subcategory_name || '-'}</td>
                  <td>{product.sku}</td>
                  <td>
                    <span className={`status-badge ${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>{product.sku}</td>
                  <td>
                    <div className="action-buttons-small">
                      <button 
                        className="btn-small btn-edit"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingProductId(product.id);
                          setFormData({
                            ...product,
                            image: null,
                            pdf: null,
                            // Ensure we have the right category name for filtering
                            category: product.category || product.category_name
                          });
                          setActiveView('add');
                        }}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-small btn-delete"
                        onClick={() => handleDelete(product.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddForm = () => (
    <div className="add-product-form">
      <div className="form-header">
        <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        <button 
          className="btn btn-secondary"
          onClick={() => {
            setIsEditing(false);
            setEditingProductId(null);
            setActiveView('overview');
          }}
        >
          ← Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Product Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="product-slug-url"
              />
              <small>URL-friendly version of the product name (auto-generated)</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sub-category</label>
                <select
                  name="subcategory_id"
                  value={formData.subcategory_id}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select Sub-category (Optional)</option>
                  {subcategories
                    .filter(sub => !formData.category || sub.category_name.toLowerCase() === formData.category.toLowerCase())
                    .map(subcategory => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.display_name || subcategory.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Short Description *</label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                required
                className="form-textarea"
                rows="3"
                placeholder="Brief description for product cards"
              />
            </div>

            <div className="form-group">
              <label>Product Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="form-textarea rich-text"
                rows="6"
                placeholder="Detailed product description with features and benefits"
              />
            </div>

            <div className="form-group">
              <label>Specifications</label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                placeholder="Technical specifications (one per line or JSON format)"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="form-section">
            <h3>Product Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>SKU / Product Code *</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Unique product identifier"
                />
              </div>

            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  Featured Product
                </label>
              </div>
            </div>
          </div>

          {/* SEO Information */}
          <div className="form-section">
            <h3>SEO Information</h3>
            
            <div className="form-group">
              <label>Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                className="form-input"
                placeholder="SEO title for search engines"
              />
            </div>

            <div className="form-group">
              <label>Meta Description</label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
                placeholder="SEO description for search engines"
              />
            </div>

            <div className="form-group">
              <label>Meta Keywords</label>
              <input
                type="text"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Keywords separated by commas"
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="form-section">
            <h3>File Uploads</h3>
            
            <div className="form-group">
              <label>Product Image *</label>
              <input
                type="file"
                name="image"
                onChange={handleInputChange}
                accept="image/*"
                required
                className="form-file"
              />
              <small>Upload main product image (JPG, PNG, GIF)</small>
            </div>

            <div className="form-group">
              <label>PDF Datasheet / Brochure</label>
              <input
                type="file"
                name="pdf"
                onChange={handleInputChange}
                accept=".pdf"
                className="form-file"
              />
              <small>Upload product datasheet or brochure (PDF)</small>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setActiveView('overview')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (isEditing ? 'Updating Product...' : 'Adding Product...') : (isEditing ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="product-management">
      <div className="current-route">
        <span className="route-indicator">📍</span>
        <span>Current Route: /admin/products</span>
      </div>

      {activeView === 'overview' ? renderOverview() : renderAddForm()}


      <style jsx>{`
        .product-management {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
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

        .overview-header h2 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .overview-header p {
          color: #666;
          margin-bottom: 30px;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-success {
          background: #27ae60;
          color: white;
        }

        .btn-success:hover {
          background: #229954;
        }

        .btn-info {
          background: #17a2b8;
          color: white;
        }

        .btn-info:hover {
          background: #138496;
        }

        .btn-danger {
          background: #e74c3c;
          color: white;
        }

        .btn-danger:hover {
          background: #c0392b;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .filters {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .search-input, .category-select {
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          min-width: 200px;
        }

        .search-input:focus, .category-select:focus {
          outline: none;
          border-color: #3498db;
        }

        .products-table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
        }

        .products-table th {
          background: #f8f9fa;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #2c3e50;
          border-bottom: 2px solid #dee2e6;
        }

        .products-table td {
          padding: 15px;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }

        .product-thumbnail {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
        }

        .product-name {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 5px;
        }

        .product-description {
          font-size: 12px;
          color: #666;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .action-buttons-small {
          display: flex;
          gap: 5px;
        }

        .btn-small {
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-edit {
          background: #3498db;
          color: white;
        }

        .btn-delete {
          background: #e74c3c;
          color: white;
        }

        .loading-cell, .no-data-cell {
          text-align: center;
          padding: 40px;
          color: #666;
          font-style: italic;
        }

        .add-product-form {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 30px;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #dee2e6;
        }

        .form-header h2 {
          color: #2c3e50;
          margin: 0;
        }

        .form-grid {
          display: grid;
          gap: 30px;
        }

        .form-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #3498db;
        }

        .form-section h3 {
          color: #2c3e50;
          margin: 0 0 20px 0;
          font-size: 18px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2c3e50;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #3498db;
        }

        .form-file {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
        }

        .form-textarea.rich-text {
          min-height: 120px;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }

        .form-group small {
          display: block;
          margin-top: 5px;
          color: #666;
          font-size: 12px;
        }




        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .filters {
            flex-direction: column;
          }
          
          .form-actions {
            flex-direction: column;
          }

        }
      `}</style>
    </div>
  );
};

export default ProductManagement;
