import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Calendar, User, Tag } from 'lucide-react';
import apiService from '../services/api';
import './BlogManagement.css';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    author: '',
    category: '',
    tags: [],
    status: 'published',
    featured: false
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBlogs(1, 100);
      setBlogs(data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBlog) {
        await apiService.updateBlog(editingBlog.id, formData);
      } else {
        await apiService.createBlog(formData);
      }
      setShowForm(false);
      setEditingBlog(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        author: '',
        category: '',
        tags: [],
        status: 'published',
        featured: false
      });
      fetchBlogs();
    } catch (err) {
      console.error('Error saving blog:', err);
      setError('Failed to save blog');
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    
    // Parse tags if they're a JSON string
    let tags = blog.tags || [];
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = [];
      }
    }
    
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      content: blog.content,
      featured_image: blog.featured_image || '',
      author: blog.author,
      category: blog.category || '',
      tags: tags,
      status: blog.status,
      featured: blog.featured || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await apiService.deleteBlog(id);
        fetchBlogs();
      } catch (err) {
        console.error('Error deleting blog:', err);
        setError('Failed to delete blog');
      }
    }
  };

  const filteredBlogs = (blogs || []).filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set((blogs || []).map(blog => blog.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="blog-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-management">
      <div className="management-header">
        <h1>Blog Management</h1>
        <p>Manage all your blog posts from this centralized dashboard</p>
        
        <div className="action-buttons">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus size={20} />
            Add New Blog
          </button>
        </div>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Blog Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingBlog ? 'Edit Blog' : 'Add New Blog'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
                  <input
                    type="url"
                    name="featured_image"
                    value={formData.featured_image}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={handleTagsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">Featured</label>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBlog(null);
                    setFormData({
                      title: '',
                      slug: '',
                      excerpt: '',
                      content: '',
                      featured_image: '',
                      author: '',
                      category: '',
                      tags: [],
                      status: 'published',
                      featured: false
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBlog ? 'Update' : 'Create'} Blog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blogs List */}
      <div className="blogs-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading blogs...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No blogs found</h3>
            <p>Start by creating your first blog post.</p>
          </div>
        ) : (
          filteredBlogs.map((blog) => (
            <div key={blog.id} className="blog-card">
              <img 
                src={blog.featured_image || '/placeholder-blog.jpg'} 
                alt={blog.title}
                className="blog-image"
              />
              <div className="blog-content">
                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-excerpt">{blog.excerpt || blog.content}</p>
                
                <div className="blog-meta">
                  <div className="blog-meta-item">
                    <User size={14} />
                    {blog.author}
                  </div>
                  <div className="blog-meta-item">
                    <Calendar size={14} />
                    {new Date(blog.created_at).toLocaleDateString()}
                  </div>
                  <div className="blog-meta-item">
                    <Eye size={14} />
                    {blog.views || 0} views
                  </div>
                </div>

                {(() => {
                  let tags = blog.tags;
                  if (typeof tags === 'string') {
                    try {
                      tags = JSON.parse(tags);  // Parse JSON string to array
                    } catch {
                      tags = [];  // Fallback to empty array
                    }
                  }
                  return tags && Array.isArray(tags) && tags.length > 0 && (
                    <div className="blog-tags">
                      {tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="blog-tag">{tag}</span>
                      ))}
                    </div>
                  );
                })()}

                <div className="blog-actions">
                  <span className={`status-badge status-${blog.status}`}>
                    {blog.status?.toUpperCase() || 'PUBLISHED'}
                  </span>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="btn-icon btn-edit"
                      title="Edit Blog"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="btn-icon btn-delete"
                      title="Delete Blog"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default BlogManagement;

