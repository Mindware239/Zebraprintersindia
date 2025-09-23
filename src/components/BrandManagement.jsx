import React, { useState, useEffect } from 'react';

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    website: '',
    logo: null
  });

  // Load brands on component mount
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/brands');
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      } else {
        console.error('Failed to load brands');
      }
    } catch (error) {
      console.error('Error loading brands:', error);
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
    formDataToSend.append('website', formData.website);
    if (formData.logo) {
      formDataToSend.append('logo', formData.logo);
    }

    try {
      const url = editingBrand 
        ? `/api/brands/${editingBrand.id}`
        : '/api/brands';
      
      const method = editingBrand ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      if (response.ok) {
        alert(editingBrand ? 'Brand updated successfully!' : 'Brand added successfully!');
        setFormData({ name: '', display_name: '', description: '', website: '', logo: null });
        setEditingBrand(null);
        loadBrands();
        setActiveView('overview');
      } else {
        alert('Error saving brand');
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      alert('Error saving brand');
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      display_name: brand.display_name || '',
      description: brand.description || '',
      website: brand.website || '',
      logo: null
    });
    setActiveView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        const response = await fetch(`/api/brands/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Brand deleted successfully!');
          loadBrands();
        } else {
          alert('Error deleting brand');
        }
      } catch (error) {
        console.error('Error deleting brand:', error);
        alert('Error deleting brand');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', display_name: '', description: '', website: '', logo: null });
    setEditingBrand(null);
    setActiveView('overview');
  };

  const renderOverview = () => (
    <div className="main-content">
      <div className="dashboard-header">
        <h1>Brand Management</h1>
        <p>Manage product brands for your website</p>
        <div className="current-route">
          <span className="route-indicator">📍</span>
          <span>Current Route: /admin/brands</span>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => setActiveView('form')}
        >
          ➕ Add New Brand
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Logo</th>
              <th>Name</th>
              <th>Display Name</th>
              <th>Website</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading-cell">Loading brands...</td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">No brands found</td>
              </tr>
            ) : (
              brands.map(brand => (
                <tr key={brand.id}>
                  <td>{brand.id}</td>
                  <td>
                    {brand.logo ? (
                      <img 
                        src={brand.logo} 
                        alt={brand.name}
                        className="table-logo"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="no-logo">🏢</div>
                    )}
                  </td>
                  <td>
                    <div className="brand-name">{brand.name}</div>
                  </td>
                  <td>{brand.display_name}</td>
                  <td>
                    {brand.website ? (
                      <a 
                        href={brand.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="website-link"
                      >
                        🌐 Visit Website
                      </a>
                    ) : '-'}
                  </td>
                  <td className="description-cell">
                    {brand.description ? (
                      brand.description.length > 50 
                        ? `${brand.description.substring(0, 50)}...`
                        : brand.description
                    ) : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-edit"
                        onClick={() => handleEdit(brand)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-delete"
                        onClick={() => handleDelete(brand.id)}
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
        <h1>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h1>
        <p>{editingBrand ? 'Update brand information' : 'Create a new product brand'}</p>
        <div className="current-route">
          <span className="route-indicator">📍</span>
          <span>Current Route: /admin/brands</span>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-row">
            <div className="form-group">
              <label>Brand Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., zebra-technologies"
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
                placeholder="e.g., Zebra Technologies"
              />
              <small>User-friendly display name</small>
            </div>
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://www.example.com"
            />
            <small>Official website URL (optional)</small>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Describe this brand..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Brand Logo</label>
            <input
              type="file"
              name="logo"
              onChange={handleInputChange}
              accept="image/*"
              className="form-file"
            />
            <small>Upload a logo for this brand (optional)</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingBrand ? '💾 Update Brand' : '➕ Add Brand'}
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
    <div className="brand-management">
      {activeView === 'overview' ? renderOverview() : renderForm()}
    </div>
  );
};

export default BrandManagement;