import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Clock, Tag, ArrowRight, Filter, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import './Blogs.css';

const Blogs = () => {
  const { language } = useLanguage();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Sample blog data - in a real app, this would come from an API
  const sampleBlogs = [
    {
      id: 1,
      title: 'The Future of Barcode Technology: Trends and Innovations',
      excerpt: 'Explore the latest advancements in barcode technology and how they\'re revolutionizing industries worldwide.',
      content: 'Barcode technology has come a long way since its inception in the 1970s. Today, we\'re seeing revolutionary changes that are transforming how businesses operate...',
      author: 'Dr. Sarah Johnson',
      authorRole: 'Chief Technology Officer',
      publishDate: '2024-01-20',
      readTime: '5 min read',
      category: 'Technology',
      tags: ['Barcode', 'Innovation', 'Technology', 'Future'],
      image: '/api/placeholder/600/300',
      featured: true,
      views: 1250
    },
    {
      id: 2,
      title: 'Best Practices for Barcode Implementation in Manufacturing',
      excerpt: 'Learn the essential steps to successfully implement barcode systems in your manufacturing facility.',
      content: 'Implementing barcode systems in manufacturing requires careful planning and execution. Here are the key best practices that can make or break your implementation...',
      author: 'Michael Chen',
      authorRole: 'Manufacturing Solutions Expert',
      publishDate: '2024-01-18',
      readTime: '7 min read',
      category: 'Manufacturing',
      tags: ['Manufacturing', 'Implementation', 'Best Practices', 'Barcode'],
      image: '/api/placeholder/600/300',
      featured: false,
      views: 890
    },
    {
      id: 3,
      title: 'Understanding Different Barcode Types: A Complete Guide',
      excerpt: 'A comprehensive guide to various barcode symbologies and when to use each one.',
      content: 'With over 100 different barcode symbologies available, choosing the right one can be overwhelming. This guide breaks down the most common types...',
      author: 'Lisa Rodriguez',
      authorRole: 'Technical Writer',
      publishDate: '2024-01-15',
      readTime: '6 min read',
      category: 'Education',
      tags: ['Guide', 'Barcode Types', 'Education', 'Symbology'],
      image: '/api/placeholder/600/300',
      featured: false,
      views: 2100
    },
    {
      id: 4,
      title: 'How Barcode Technology is Transforming Healthcare',
      excerpt: 'Discover how barcode systems are improving patient safety and operational efficiency in healthcare.',
      content: 'Healthcare facilities are increasingly adopting barcode technology to enhance patient safety, reduce errors, and improve operational efficiency...',
      author: 'Dr. Robert Kim',
      authorRole: 'Healthcare Technology Consultant',
      publishDate: '2024-01-12',
      readTime: '8 min read',
      category: 'Healthcare',
      tags: ['Healthcare', 'Patient Safety', 'Technology', 'Efficiency'],
      image: '/api/placeholder/600/300',
      featured: true,
      views: 1650
    },
    {
      id: 5,
      title: 'Mobile Barcode Scanning: Apps and Solutions',
      excerpt: 'Explore the best mobile barcode scanning solutions for businesses of all sizes.',
      content: 'Mobile barcode scanning has become essential for modern businesses. Here\'s a comprehensive look at the best apps and solutions available...',
      author: 'Alex Thompson',
      authorRole: 'Mobile Solutions Specialist',
      publishDate: '2024-01-10',
      readTime: '4 min read',
      category: 'Mobile',
      tags: ['Mobile', 'Scanning', 'Apps', 'Solutions'],
      image: '/api/placeholder/600/300',
      featured: false,
      views: 980
    },
    {
      id: 6,
      title: 'Barcode Printer Maintenance: Tips for Longevity',
      excerpt: 'Essential maintenance tips to keep your barcode printers running smoothly for years to come.',
      content: 'Proper maintenance is crucial for extending the life of your barcode printers. Follow these expert tips to ensure optimal performance...',
      author: 'James Wilson',
      authorRole: 'Technical Support Manager',
      publishDate: '2024-01-08',
      readTime: '5 min read',
      category: 'Maintenance',
      tags: ['Maintenance', 'Printers', 'Longevity', 'Tips'],
      image: '/api/placeholder/600/300',
      featured: false,
      views: 750
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // In a real app, this would be: const data = await apiService.getBlogs();
        setBlogs(sampleBlogs);
        setFilteredBlogs(sampleBlogs);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    let currentBlogs = [...blogs];

    if (searchQuery) {
      currentBlogs = currentBlogs.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      currentBlogs = currentBlogs.filter(blog => blog.category === selectedCategory);
    }

    if (selectedTag !== 'all') {
      currentBlogs = currentBlogs.filter(blog => blog.tags.includes(selectedTag));
    }

    setFilteredBlogs(currentBlogs);
  }, [searchQuery, selectedCategory, selectedTag, blogs]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Education', label: 'Education' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Mobile', label: 'Mobile' },
    { value: 'Maintenance', label: 'Maintenance' }
  ];

  const allTags = [...new Set(blogs.flatMap(blog => blog.tags))];
  const tags = [
    { value: 'all', label: 'All Tags' },
    ...allTags.map(tag => ({ value: tag, label: tag }))
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatViews = (views) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <div className="blogs-page-container">
        <div className="blogs-loading">
          <div className="loading-spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogs-page-container">
        <div className="blogs-error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const featuredBlogs = filteredBlogs.filter(blog => blog.featured);
  const regularBlogs = filteredBlogs.filter(blog => !blog.featured);

  return (
    <div className="blogs-page-container">
      {/* Hero Section */}
      <div className="blogs-hero">
        <div className="blogs-hero-content">
          <h1>MINDWARE Blog</h1>
          <p>Insights, tips, and trends in barcode technology and business solutions</p>
          <div className="blogs-stats">
            <div className="stat">
              <span className="stat-number">{blogs.length}</span>
              <span className="stat-label">Articles</span>
            </div>
            <div className="stat">
              <span className="stat-number">{categories.length - 1}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat">
              <span className="stat-number">{allTags.length}</span>
              <span className="stat-label">Topics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="blogs-search-filters">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search articles, authors, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="blogs-filters">
          <div className="filter-group">
            <label>Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Tag</label>
            <select 
              value={selectedTag} 
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              {tags.map(tag => (
                <option key={tag.value} value={tag.value}>{tag.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <div className="featured-blogs">
          <h2>Featured Articles</h2>
          <div className="featured-blogs-grid">
            {featuredBlogs.map(blog => (
              <div key={blog.id} className="featured-blog-card">
                <div className="blog-image">
                  <img src={blog.image} alt={blog.title} />
                  <div className="featured-badge">Featured</div>
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="blog-category">{blog.category}</span>
                    <span className="blog-read-time">{blog.readTime}</span>
                  </div>
                  <h3>{blog.title}</h3>
                  <p>{blog.excerpt}</p>
                  <div className="blog-author">
                    <div className="author-info">
                      <span className="author-name">{blog.author}</span>
                      <span className="author-role">{blog.authorRole}</span>
                    </div>
                    <div className="blog-stats">
                      <span>{formatViews(blog.views)} views</span>
                    </div>
                  </div>
                  <div className="blog-tags">
                    {blog.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="blog-tag">{tag}</span>
                    ))}
                  </div>
                  <button className="read-more-btn">
                    Read More <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Blogs */}
      <div className="blogs-list">
        <h2>Latest Articles</h2>
        {regularBlogs.length > 0 ? (
          <div className="blogs-grid">
            {regularBlogs.map(blog => (
              <div key={blog.id} className="blog-card">
                <div className="blog-image">
                  <img src={blog.image} alt={blog.title} />
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="blog-category">{blog.category}</span>
                    <span className="blog-date">{formatDate(blog.publishDate)}</span>
                  </div>
                  <h3>{blog.title}</h3>
                  <p>{blog.excerpt}</p>
                  <div className="blog-author">
                    <div className="author-info">
                      <span className="author-name">{blog.author}</span>
                      <span className="blog-read-time">{blog.readTime}</span>
                    </div>
                    <div className="blog-stats">
                      <span>{formatViews(blog.views)} views</span>
                    </div>
                  </div>
                  <div className="blog-tags">
                    {blog.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="blog-tag">{tag}</span>
                    ))}
                  </div>
                  <button className="read-more-btn">
                    Read More <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-blogs">
            <h3>No articles found</h3>
            <p>Try adjusting your search criteria or check back later for new content.</p>
          </div>
        )}
      </div>

      {/* Newsletter Signup */}
      <div className="newsletter-signup">
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Get the latest insights and trends in barcode technology delivered to your inbox.</p>
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email address"
              className="newsletter-input"
            />
            <button className="newsletter-btn">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
