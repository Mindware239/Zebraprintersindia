import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, User, Tag, ArrowRight, Clock, Eye } from 'lucide-react';
import apiService from '../services/api';

const Blogs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['all']);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBlogs(1, 50);
      setBlogs(data);
      
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(data.map(blog => blog.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const [filteredBlogs, setFilteredBlogs] = useState([]);

  useEffect(() => {
    let filtered = blogs;

    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(blog => blog.category && blog.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    setFilteredBlogs(filtered);
  }, [searchTerm, selectedCategory, blogs]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchBlogs}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest insights, tips, and trends in barcode technology and business solutions.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Blog Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredBlogs.map((blog, index) => (
            <motion.article
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Featured Badge */}
              {blog.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                </div>
              )}

              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={blog.featured_image || '/api/placeholder/400/250'}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Category */}
                <div className="mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {blog.category}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {blog.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User size={16} className="mr-1" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>{formatDate(blog.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>{getReadTime(blog.content)} min read</span>
                  </div>
                </div>

                {/* Tags */}
                {(() => {
                  let tags = blog.tags;
                  if (typeof tags === 'string') {
                    try {
                      tags = JSON.parse(tags);
                    } catch (e) {
                      tags = [];
                    }
                  }
                  return tags && Array.isArray(tags) && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  );
                })()}

                {/* Read More Button */}
                <button 
                  onClick={() => navigate(`/blog/${blog.slug}`)}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Read More
                  <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredBlogs.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filter.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Blogs;