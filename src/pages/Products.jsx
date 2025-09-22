import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, Star, ShoppingCart, Eye, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useParams, useNavigate } from 'react-router-dom';

const Products = () => {
  const { isEnglish } = useLanguage();
  const { category } = useParams();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Function to truncate text
  const truncateText = (text, maxLength = 120) => {
    if (!text) return 'No description available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Function to toggle description expansion
  const toggleDescription = (productId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Set category from URL parameter
  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchProducts();
    fetchCategories();
    setIsLoading(false);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.shortDescription && product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else {
      // Check if it matches the category (case insensitive)
      const productCategory = product.category?.toLowerCase();
      const selectedCategoryLower = selectedCategory.toLowerCase();
      
      // Check category match
      if (productCategory === selectedCategoryLower) {
        matchesCategory = true;
      }
      
      // Check subcategory match (for dropdown navigation)
      if (product.subcategory_name === selectedCategory) {
        matchesCategory = true;
      }
    }
    
    
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const pageStyles = {
    minHeight: '100vh',
    paddingTop: '80px'
  };

  const headerSectionStyles = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
    color: '#ffffff',
    padding: '64px 0'
  };

  const headerContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    textAlign: 'center'
  };

  const headerTitleStyles = {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 'bold',
    marginBottom: '16px'
  };

  const headerDescriptionStyles = {
    fontSize: '20px',
    maxWidth: '768px',
    margin: '0 auto',
    lineHeight: 1.6
  };

  const filtersSectionStyles = {
    padding: '32px 0',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb'
  };

  const filtersContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    alignItems: 'center'
  };

  const searchContainerStyles = {
    position: 'relative',
    flex: '1',
    maxWidth: '400px'
  };

  const searchInputStyles = {
    width: '100%',
    padding: '12px 16px 12px 48px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: '#f9fafb'
  };

  const searchIconStyles = {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    width: '20px',
    height: '20px'
  };

  const filtersRowStyles = {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%'
  };

  const selectStyles = {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    minWidth: '150px'
  };

  const productsSectionStyles = {
    padding: '48px 0',
    backgroundColor: '#f9fafb'
  };

  const productsContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const productsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '32px'
  };

  const productCardStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s ease',
    border: '1px solid #e5e7eb',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };

  const productImageStyles = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '16px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const productNameStyles = {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1f2937'
  };

  const productDescriptionStyles = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px',
    lineHeight: 1.5,
    flex: '1'
  };

  const readMoreStyles = {
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    textDecoration: 'underline',
    marginTop: '4px'
  };

  const productPriceStyles = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: '16px'
  };

  const productFeaturesStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px'
  };

  const featureTagStyles = {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500'
  };

  const productRatingStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  };

  const starStyles = {
    color: '#fbbf24',
    width: '16px',
    height: '16px'
  };

  const productActionsStyles = {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto'
  };

  const buttonStyles = {
    flex: '1',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const primaryButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#3b82f6',
    color: '#ffffff'
  };

  const secondaryButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db'
  };

  const loadingStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontSize: '18px',
    color: '#6b7280'
  };

  const emptyStateStyles = {
    textAlign: 'center',
    padding: '64px 16px',
    color: '#6b7280'
  };

  if (isLoading) {
    return (
      <div style={pageStyles}>
        <div style={loadingStyles}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Loading products...
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={pageStyles}>
      {/* Header Section */}
      <motion.section
        style={headerSectionStyles}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div style={headerContainerStyles}>
          <h1 style={headerTitleStyles}>
            {isEnglish ? 'Our Products' : 'हमारे उत्पाद'}
          </h1>
          <p style={headerDescriptionStyles}>
            {isEnglish 
              ? 'Explore our comprehensive range of Zebra barcode printing and scanning solutions'
              : 'Zebra बारकोड प्रिंटिंग और स्कैनिंग समाधानों की हमारी व्यापक श्रृंखला की खोज करें'
            }
          </p>
        </div>
      </motion.section>

      {/* Filters Section */}
      <section style={filtersSectionStyles}>
        <div style={filtersContainerStyles}>
          <div style={searchContainerStyles}>
            <Search style={searchIconStyles} />
            <input
              type="text"
              placeholder={isEnglish ? 'Search by name or description...' : 'नाम या विवरण से खोजें...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyles}
            />
          </div>
          
          <div style={filtersRowStyles}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                {isEnglish ? 'Category' : 'श्रेणी'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={selectStyles}
              >
                <option value="all">
                  {isEnglish ? 'All Products' : 'सभी उत्पाद'}
                </option>
                {categories.map(category => (
                  <option key={category.id} value={category.name.toLowerCase()}>
                    {category.display_name || category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                {isEnglish ? 'Sort by' : 'क्रमबद्ध करें'}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={selectStyles}
              >
                <option value="name">{isEnglish ? 'Name' : 'नाम'}</option>
                <option value="price-low">{isEnglish ? 'Price: Low to High' : 'कीमत: कम से ज्यादा'}</option>
                <option value="price-high">{isEnglish ? 'Price: High to Low' : 'कीमत: ज्यादा से कम'}</option>
                <option value="rating">{isEnglish ? 'Rating' : 'रेटिंग'}</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section style={productsSectionStyles}>
        <div style={productsContainerStyles}>
          {sortedProducts.length === 0 ? (
            <div style={emptyStateStyles}>
              <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#374151' }}>
                {isEnglish ? 'No products found' : 'कोई उत्पाद नहीं मिला'}
              </h3>
              <p>
                {isEnglish 
                  ? 'Try adjusting your search or filter criteria'
                  : 'अपनी खोज या फिल्टर मानदंड को समायोजित करने का प्रयास करें'
                }
              </p>
            </div>
          ) : (
            <motion.div
              style={productsGridStyles}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  style={productCardStyles}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ 
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  {product.featured && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {isEnglish ? 'Featured' : 'विशेष'}
                    </div>
                  )}
                  
                  <div style={productImageStyles}>
                    <img
                      src={product.image || '/placeholder-product.jpg'}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  
                  <h3 style={productNameStyles}>{product.name}</h3>
                  <div style={productDescriptionStyles}>
                    <p>
                      {expandedDescriptions[product.id] 
                        ? (product.shortDescription || product.description || 'No description available')
                        : truncateText(product.shortDescription || product.description || 'No description available')
                      }
                    </p>
                    {(product.shortDescription || product.description || '').length > 120 && (
                      <span 
                        style={readMoreStyles}
                        onClick={() => toggleDescription(product.id)}
                      >
                        {expandedDescriptions[product.id] 
                          ? (isEnglish ? 'Read less' : 'कम पढ़ें')
                          : (isEnglish ? 'Read more' : 'और पढ़ें')
                        }
                      </span>
                    )}
                  </div>
                  
                  {product.price && (
                    <div style={productPriceStyles}>₹{product.price}</div>
                  )}
                  
                  {product.features && (
                    <div style={productFeaturesStyles}>
                      {(Array.isArray(product.features) ? product.features : [product.features]).slice(0, 3).map((feature, idx) => (
                        <span key={idx} style={featureTagStyles}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div style={productRatingStyles}>
                    <div style={{ display: 'flex' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          style={{
                            ...starStyles,
                            fill: i < (product.rating || 0) ? '#fbbf24' : 'none'
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      {product.rating || 0} ({product.reviews || 0} {isEnglish ? 'reviews' : 'समीक्षाएं'})
                    </span>
                  </div>
                  
                  <div style={productActionsStyles}>
                    <button 
                      style={primaryButtonStyles}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <Eye style={{ width: '16px', height: '16px' }} />
                      {isEnglish ? 'View' : 'देखें'}
                    </button>
                    <button style={secondaryButtonStyles}>
                      <ShoppingCart style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
