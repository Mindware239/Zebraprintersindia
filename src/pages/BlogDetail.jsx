import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Tag, Clock, Eye, ArrowLeft, Share2, BookOpen } from 'lucide-react';
import apiService from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    fetchBlogDetail();
  }, [slug]);

  const fetchBlogDetail = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBlogBySlug(slug);
      setBlog(data);
      
      // Fetch related blogs
      const allBlogs = await apiService.getBlogs(1, 10);
      const related = allBlogs
        .filter(b => b.id !== data.id && b.category === data.category)
        .slice(0, 3);
      setRelatedBlogs(related);
    } catch (err) {
      console.error('Error fetching blog detail:', err);
      setError('Blog not found');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseTags = (tags) => {
    if (typeof tags === 'string') {
      try {
        return JSON.parse(tags);
      } catch {
        return [];
      }
    }
    return Array.isArray(tags) ? tags : [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-64 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
            <p className="text-gray-600 mb-8">The blog you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Blogs
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tags = parseTags(blog.tags);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => navigate('/blogs')}
              className="hover:text-blue-600 transition-colors"
            >
              Blogs
            </button>
            <span>/</span>
            <span className="text-gray-900 truncate">{blog.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/blogs')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Blogs
          </button>

          {/* Blog Header */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            {/* Featured Image */}
            {blog.featured_image && (
              <div className="aspect-video bg-gray-200 overflow-hidden">
                <img
                  src={blog.featured_image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* Category Badge */}
              {blog.category && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                  {blog.category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {blog.title}
              </h1>

              {/* Excerpt */}
              {blog.excerpt && (
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  {blog.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <User size={18} className="mr-2" />
                  <span>{blog.author || 'Admin'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2" />
                  <span>{formatDate(blog.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={18} className="mr-2" />
                  <span>{Math.ceil(blog.content?.length / 500) || 1} min read</span>
                </div>
                <div className="flex items-center">
                  <Eye size={18} className="mr-2" />
                  <span>{blog.views || 0} views</span>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      <Tag size={14} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share Button */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b">
                <div className="flex items-center text-gray-600">
                  <BookOpen size={18} className="mr-2" />
                  <span>Blog Article</span>
                </div>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 size={18} className="mr-2" />
                  Share
                </button>
              </div>

              {/* Blog Content */}
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: blog.content?.replace(/\n/g, '<br />') || 'No content available.'
                  }}
                />
              </div>
            </div>
          </motion.article>

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <motion.article
                    key={relatedBlog.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/blog/${relatedBlog.slug}`)}
                  >
                    {relatedBlog.featured_image && (
                      <div className="aspect-video bg-gray-200 overflow-hidden">
                        <img
                          src={relatedBlog.featured_image}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedBlog.excerpt}
                      </p>
                      <div className="flex items-center mt-3 text-xs text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(relatedBlog.created_at)}</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetail;
