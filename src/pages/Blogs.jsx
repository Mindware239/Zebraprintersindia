import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, User, Tag, ArrowRight, Clock } from 'lucide-react';

const Blogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [blogs] = useState([
    {
      id: 1,
      title: 'The Future of Barcode Technology: Trends and Innovations',
      excerpt: 'Explore the latest trends in barcode technology and how they are revolutionizing industries worldwide.',
      content: 'Barcode technology has come a long way since its inception in the 1970s. Today, we are witnessing revolutionary changes that are transforming how businesses operate...',
      author: 'Dr. Sarah Johnson',
      date: '2024-01-15',
      category: 'Technology',
      readTime: '5 min read',
      image: '/api/placeholder/400/250',
      tags: ['Barcode', 'Technology', 'Innovation', 'Future']
    },
    {
      id: 2,
      title: 'Best Practices for Barcode Printer Maintenance',
      excerpt: 'Learn essential maintenance tips to keep your barcode printers running efficiently and extend their lifespan.',
      content: 'Proper maintenance is crucial for ensuring your barcode printers deliver consistent, high-quality output. Here are some best practices...',
      author: 'Mike Chen',
      date: '2024-01-10',
      category: 'Maintenance',
      readTime: '3 min read',
      image: '/api/placeholder/400/250',
      tags: ['Maintenance', 'Printers', 'Tips', 'Efficiency']
    },
    {
      id: 3,
      title: 'Understanding Different Barcode Types and Their Applications',
      excerpt: 'A comprehensive guide to various barcode formats and when to use each one for optimal results.',
      content: 'With so many barcode types available, choosing the right one for your application can be challenging. This guide will help you understand...',
      author: 'Emily Rodriguez',
      date: '2024-01-05',
      category: 'Guide',
      readTime: '7 min read',
      image: '/api/placeholder/400/250',
      tags: ['Barcode Types', 'Guide', 'Applications', 'Standards']
    },
    {
      id: 4,
      title: 'How to Choose the Right Barcode Scanner for Your Business',
      excerpt: 'Factors to consider when selecting a barcode scanner that meets your specific business requirements.',
      content: 'Selecting the right barcode scanner is crucial for operational efficiency. Here are the key factors to consider...',
      author: 'David Kim',
      date: '2024-01-01',
      category: 'Business',
      readTime: '4 min read',
      image: '/api/placeholder/400/250',
      tags: ['Scanner', 'Business', 'Selection', 'Efficiency']
    }
  ]);

  const [filteredBlogs, setFilteredBlogs] = useState(blogs);

  React.useEffect(() => {
    let filtered = blogs;

    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(blog => blog.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    setFilteredBlogs(filtered);
  }, [searchTerm, selectedCategory, blogs]);

  const categories = ['all', 'Technology', 'Maintenance', 'Guide', 'Business'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6">Our Blog</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Stay updated with the latest insights, tips, and trends in barcode technology
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white py-8 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Blog Post */}
      {filteredBlogs.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden mb-12"
          >
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={filteredBlogs[0].image}
                  alt={filteredBlogs[0].title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredBlogs[0].category}
                  </span>
                  <span className="text-gray-500 text-sm">{filteredBlogs[0].readTime}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{filteredBlogs[0].title}</h2>
                <p className="text-gray-600 mb-6 text-lg">{filteredBlogs[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{filteredBlogs[0].author}</p>
                      <p className="text-sm text-gray-500">{filteredBlogs[0].date}</p>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-4 pb-12">
        {filteredBlogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.slice(1).map((blog, index) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {blog.category}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        <Tag className="w-3 h-3 inline mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{blog.author}</p>
                        <p className="text-xs text-gray-500">{blog.date}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                      Read More
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest insights and updates in barcode technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
