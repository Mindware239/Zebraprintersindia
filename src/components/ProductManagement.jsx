import React, { useState, useEffect } from 'react';
import './ProductManagement.css';

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
      const response = await fetch('/api/products');
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
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubcategories = async () => {
    try {
      const response = await fetch('/api/subcategories');
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
        ? `/api/products/${editingProductId}`
        : '/api/products';
      
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
        const response = await fetch(`/api/products/${id}`, {
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
          await fetch(`/api/products/${id}`, {
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
    <div className="product-management">
      <div className="management-header">
        <h1>Product Management</h1>
        <p>Manage all your products from this centralized dashboard</p>
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn-primary"
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
            + Add Product
          </button>
          {selectedProducts.length > 0 && (
            <button 
              className="btn-secondary"
              onClick={handleBulkDelete}
            >
              🗑️ Delete Selected ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
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

      {/* Products Table */}
      <div className="products-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No products found</h3>
            <p>Start by adding your first product to get started.</p>
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th className="checkbox-column">
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
                <th className="image-column">Image</th>
                <th className="name-column">Name</th>
                <th className="category-column">Category</th>
                <th className="subcategory-column">Sub-category</th>
                <th className="sku-column">SKU</th>
                <th className="status-column">Status</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td className="checkbox-column">
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
                  <td className="image-column">
                    <img 
                      src={product.image || '/placeholder-image.jpg'} 
                      alt={product.name}
                      className="product-image"
                    />
                  </td>
                  <td className="name-column">
                    <div className="product-name">{product.name}</div>
                    <div className="product-description">{product.shortDescription || product.description}</div>
                  </td>
                  <td className="category-column">
                    <span className="category-badge">
                      {product.category_display_name || product.category}
                    </span>
                  </td>
                  <td className="subcategory-column">
                    <span className="subcategory-badge">
                      {product.subcategory_display_name || product.subcategory_name || '-'}
                    </span>
                  </td>
                  <td className="sku-column">{product.sku}</td>
                  <td className="status-column">
                    <span className={`status-badge status-${product.status}`}>
                      {product.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="actions-column">
                    <div className="action-buttons-cell">
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingProductId(product.id);
                          setFormData({
                            ...product,
                            image: product.image || null,
                            pdf: product.pdf || null,
                            category: product.category || product.category_name
                          });
                          setActiveView('add');
                        }}
                        title="Edit Product"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(product.id)}
                        title="Delete Product"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
              {isEditing && formData.image && (
                <div className="current-image">
                  <p>Current image:</p>
                  <img 
                    src={formData.image} 
                    alt="Current product image" 
                    style={{maxWidth: '200px', maxHeight: '150px', marginBottom: '10px'}}
                  />
                  <p><small>Upload a new image to replace the current one</small></p>
                </div>
              )}
              <input
                type="file"
                name="image"
                onChange={handleInputChange}
                accept="image/*"
                required={!isEditing}
                className="form-file"
              />
              <small>Upload main product image (JPG, PNG, GIF)</small>
            </div>

            <div className="form-group">
              <label>PDF Datasheet / Brochure</label>
              {isEditing && formData.pdf && (
                <div className="current-pdf">
                  <p>Current PDF:</p>
                  <a 
                    href={formData.pdf} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{color: '#007bff', textDecoration: 'underline'}}
                  >
                    View current PDF
                  </a>
                  <p><small>Upload a new PDF to replace the current one</small></p>
                </div>
              )}
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


    </div>
  );
};

export default ProductManagement;