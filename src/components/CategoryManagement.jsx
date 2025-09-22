import React, { useState, useEffect } from 'react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    image: null
  });

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('display_name', formData.display_name);
    formDataToSend.append('description', formData.description);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const url = editingCategory 
        ? `http://localhost:3000/api/categories/${editingCategory.id}`
        : 'http://localhost:3000/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      if (response.ok) {
        alert(editingCategory ? 'Category updated successfully!' : 'Category added successfully!');
        setFormData({ name: '', display_name: '', description: '', image: null });
        setEditingCategory(null);
        loadCategories();
        setActiveView('overview');
      } else {
        alert('Error saving category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      display_name: category.display_name || '',
      description: category.description || '',
      image: null
    });
    setActiveView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/categories/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Category deleted successfully!');
          loadCategories();
        } else {
          alert('Error deleting category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', display_name: '', description: '', image: null });
    setEditingCategory(null);
    setActiveView('overview');
  };

  const renderOverview = () => (
    <div className="main-content">
      <div className="dashboard-header">
        <h1>Category Management</h1>
        <p>Manage product categories for your website</p>
        <div className="current-route">
          <span className="route-indicator">📍</span>
          <span>Current Route: /admin/categories</span>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => setActiveView('form')}
        >
          ➕ Add New Category
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Display Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-cell">Loading categories...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">No categories found</td>
              </tr>
            ) : (
              categories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="table-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="no-image">📁</div>
                    )}
                  </td>
                  <td>
                    <div className="category-name">{category.name}</div>
                  </td>
                  <td>{category.display_name}</td>
                  <td className="description-cell">
                    {category.description ? (
                      category.description.length > 50 
                        ? `${category.description.substring(0, 50)}...`
                        : category.description
                    ) : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-edit"
                        onClick={() => handleEdit(category)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-delete"
                        onClick={() => handleDelete(category.id)}
                      >
                        🗑️ Delete
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

  const renderForm = () => (
    <div className="main-content">
      <div className="dashboard-header">
        <h1>{editingCategory ? 'Edit Category' : 'Add New Category'}</h1>
        <p>{editingCategory ? 'Update category information' : 'Create a new product category'}</p>
        <div className="current-route">
          <span className="route-indicator">📍</span>
          <span>Current Route: /admin/categories</span>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-row">
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., printers"
              />
              <small>URL-friendly name (lowercase, no spaces)</small>
            </div>

            <div className="form-group">
              <label>Display Name *</label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., Printers"
              />
              <small>User-friendly display name</small>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Describe this category..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Category Image</label>
            <input
              type="file"
              name="image"
              onChange={handleInputChange}
              accept="image/*"
              className="form-file"
            />
            <small>Upload an image for this category (optional)</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingCategory ? '💾 Update Category' : '➕ Add Category'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="category-management">
      {activeView === 'overview' ? renderOverview() : renderForm()}

      <style jsx>{`
        .category-management {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px;
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

        .action-buttons {
          margin-bottom: 30px;
          display: flex;
          gap: 15px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
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
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
        }

        .btn-edit {
          background: #f39c12;
          color: white;
          padding: 8px 16px;
          font-size: 12px;
        }

        .btn-edit:hover {
          background: #e67e22;
        }

        .btn-delete {
          background: #e74c3c;
          color: white;
          padding: 8px 16px;
          font-size: 12px;
        }

        .btn-delete:hover {
          background: #c0392b;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #f8f9fa;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e9ecef;
        }

        .data-table td {
          padding: 15px;
          border-bottom: 1px solid #e9ecef;
          vertical-align: middle;
        }

        .data-table tr:hover {
          background: #f8f9fa;
        }

        .loading-cell, .empty-cell {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 40px;
        }

        .table-image {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 8px;
        }

        .no-image {
          width: 50px;
          height: 50px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #6c757d;
        }

        .category-name {
          font-weight: 500;
          color: #333;
        }

        .description-cell {
          max-width: 200px;
          color: #666;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .form-container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .category-form {
          max-width: 800px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
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

        .form-input, .form-textarea, .form-file {
          width: 100%;
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: #3498db;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-file {
          padding: 8px;
        }

        .form-group small {
          display: block;
          margin-top: 5px;
          color: #666;
          font-size: 12px;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
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

export default CategoryManagement;
