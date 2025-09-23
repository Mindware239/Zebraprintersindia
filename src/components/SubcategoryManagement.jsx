import React, { useState, useEffect } from 'react';

const SubcategoryManagement = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    category_id: '',
    description: '',
    image: null
  });

  // Load subcategories and categories on component mount
  useEffect(() => {
    loadSubcategories();
    loadCategories();
  }, []);

  const loadSubcategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subcategories');
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
      } else {
        console.error('Failed to load subcategories');
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
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
    formDataToSend.append('category_id', formData.category_id);
    formDataToSend.append('description', formData.description);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const url = editingSubcategory 
        ? `/api/subcategories/${editingSubcategory.id}`
        : '/api/subcategories';
      
      const method = editingSubcategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      if (response.ok) {
        alert(editingSubcategory ? 'Subcategory updated successfully!' : 'Subcategory added successfully!');
        setFormData({ name: '', display_name: '', category_id: '', description: '', image: null });
        setEditingSubcategory(null);
        loadSubcategories();
        setActiveView('overview');
      } else {
        alert('Error saving subcategory');
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert('Error saving subcategory');
    }
  };

  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name || '',
      display_name: subcategory.display_name || '',
      category_id: subcategory.category_id || '',
      description: subcategory.description || '',
      image: null
    });
    setActiveView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        const response = await fetch(`/api/subcategories/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Subcategory deleted successfully!');
          loadSubcategories();
        } else {
          alert('Error deleting subcategory');
        }
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        alert('Error deleting subcategory');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', display_name: '', category_id: '', description: '', image: null });
    setEditingSubcategory(null);
    setActiveView('overview');
  };

  const renderOverview = () => (
    <div className="main-content">
      <div className="dashboard-header">
        <h1>Subcategory Management</h1>
        <p>Manage product subcategories for your website</p>
        <div className="current-route">
          <span className="route-indicator">📍</span>
          <span>Current Route: /admin/subcategories</span>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => setActiveView('form')}
        >
          ➕ Add New Subcategory
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
              <th>Category</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading-cell">Loading subcategories...</td>
              </tr>
            ) : subcategories.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">No subcategories found</td>
              </tr>
            ) : (
              subcategories.map(subcategory => (
                <tr key={subcategory.id}>
                  <td>{subcategory.id}</td>
                  <td>
                    {subcategory.image ? (
                      <img 
                        src={subcategory.image} 
                        alt={subcategory.name}
                        className="table-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="no-image">📂</div>
                    )}
                  </td>
                  <td>
                    <div className="subcategory-name">{subcategory.name}</div>
                  </td>
                  <td>{subcategory.display_name}</td>
                  <td>
                    <span className="category-badge">
                      {subcategory.category_display_name || subcategory.category_name || 'N/A'}
                    </span>
                  </td>
                  <td className="description-cell">
                    {subcategory.description ? (
                      subcategory.description.length > 50 
                        ? `${subcategory.description.substring(0, 50)}...`
                        : subcategory.description
                    ) : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-edit"
                        onClick={() => handleEdit(subcategory)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-delete"
                        onClick={() => handleDelete(subcategory.id)}
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
        <h1>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</h1>
        <p>{editingSubcategory ? 'Update subcategory information' : 'Create a new product subcategory'}</p>
        <div className="current-route">
          <span className="route-indicator">📍</span>
          <span>Current Route: /admin/subcategories</span>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="subcategory-form">
          <div className="form-row">
            <div className="form-group">
              <label>Subcategory Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., desktop-printers"
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
                placeholder="e.g., Desktop Printers"
              />
              <small>User-friendly display name</small>
            </div>
          </div>

          <div className="form-group">
            <label>Parent Category *</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.display_name || category.name}
                </option>
              ))}
            </select>
            <small>Choose the parent category for this subcategory</small>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Describe this subcategory..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Subcategory Image</label>
            <input
              type="file"
              name="image"
              onChange={handleInputChange}
              accept="image/*"
              className="form-file"
            />
            <small>Upload an image for this subcategory (optional)</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingSubcategory ? '💾 Update Subcategory' : '➕ Add Subcategory'}
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
    <div className="subcategory-management">
      {activeView === 'overview' ? renderOverview() : renderForm()}
    </div>
  );
};

export default SubcategoryManagement;