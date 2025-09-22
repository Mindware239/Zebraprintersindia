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
      const response = await fetch('http://localhost:3000/api/subcategories');
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
      const response = await fetch('http://localhost:3000/api/categories');
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
        ? `http://localhost:3000/api/subcategories/${editingSubcategory.id}`
        : 'http://localhost:3000/api/subcategories';
      
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
        const response = await fetch(`http://localhost:3000/api/subcategories/${id}`, {
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

      <style jsx>{`
        .subcategory-management {
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

        .subcategory-name {
          font-weight: 500;
          color: #333;
        }

        .category-badge {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
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

        .subcategory-form {
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

        .form-input, .form-textarea, .form-file, .form-select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
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

export default SubcategoryManagement;
