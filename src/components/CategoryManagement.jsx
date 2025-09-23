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
      const response = await fetch('/api/categories');
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
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      
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
        const response = await fetch(`/api/categories/${id}`, {
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
    </div>
  );
};

export default CategoryManagement;