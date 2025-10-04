import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Star, ShoppingCart, Eye, ArrowLeft } from 'lucide-react';
import apiService from '../services/api';
import ProductSearch from '../components/ProductSearch';
import { useLanguage } from '../contexts/LanguageContext';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    if (query) {
      searchProducts(query);
    }
  }, [query]);

  const searchProducts = async (searchQuery) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await apiService.searchProducts(searchQuery);
      setProducts(results);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = (newQuery) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  const filteredProducts = products.filter(product => {
    if (filterCategory === 'all') return true;
    return product.category?.toLowerCase() === filterCategory.toLowerCase();
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'relevance':
      default:
        // Keep original order for relevance
        return 0;
    }
  });

  const getUniqueCategories = () => {
    const categories = products.map(p => p.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const pageStyles = {
    minHeight: '100vh',
    paddingTop: '80px',
    backgroundColor: '#f8fafc'
  };

  const headerStyles = {
    backgroundColor: '#ffffff',
    padding: '32px 0',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '32px'
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const searchHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  };

  const backButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  const resultsHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px'
  };

  const resultsCountStyles = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151'
  };

  const filtersRowStyles = {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const selectStyles = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    outline: 'none'
  };

  const productGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginTop: '32px'
  };

  const productCardStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const productImageStyles = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    backgroundColor: '#f3f4f6'
  };

  const productContentStyles = {
    padding: '20px'
  };

  const productTitleStyles = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
    lineHeight: 1.4
  };

  const productDescriptionStyles = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
    lineHeight: 1.5
  };

  const productMetaStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  };

  const productPriceStyles = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#059669'
  };

  const productCategoryStyles = {
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '6px'
  };

  const productActionsStyles = {
    display: 'flex',
    gap: '8px'
  };

  const actionButtonStyles = {
    flex: 1,
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  };

  const primaryButtonStyles = {
    ...actionButtonStyles,
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: '1px solid #2563eb'
  };

  const loadingStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center'
  };

  const errorStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center'
  };

  const noResultsStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center'
  };

  return (
    <div style={pageStyles}>
      <header style={headerStyles}>
        <div style={containerStyles}>
          <div style={searchHeaderStyles}>
            <button
              onClick={() => navigate(-1)}
              style={backButtonStyles}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            >
              <ArrowLeft size={16} />
              {isEnglish ? 'Back' : 'वापस'}
            </button>
            <ProductSearch 
              placeholder={isEnglish ? 'Search products...' : 'उत्पाद खोजें...'}
              className="search-results-search"
            />
          </div>

          <div style={resultsHeaderStyles}>
            <div style={resultsCountStyles}>
              {isLoading ? (
                isEnglish ? 'Searching...' : 'खोज रहे हैं...'
              ) : (
                `${sortedProducts.length} ${isEnglish ? 'products found' : 'उत्पाद मिले'} ${query ? `for "${query}"` : ''}`
              )}
            </div>

            {products.length > 0 && (
              <div style={filtersRowStyles}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="#6b7280" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={selectStyles}
                  >
                    <option value="relevance">
                      {isEnglish ? 'Relevance' : 'प्रासंगिकता'}
                    </option>
                    <option value="name">
                      {isEnglish ? 'Name A-Z' : 'नाम A-Z'}
                    </option>
                    <option value="price-low">
                      {isEnglish ? 'Price: Low to High' : 'मूल्य: कम से अधिक'}
                    </option>
                    <option value="price-high">
                      {isEnglish ? 'Price: High to Low' : 'मूल्य: अधिक से कम'}
                    </option>
                  </select>
                </div>

                {getUniqueCategories().length > 0 && (
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={selectStyles}
                  >
                    <option value="all">
                      {isEnglish ? 'All Categories' : 'सभी श्रेणियां'}
                    </option>
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category.toLowerCase()}>
                        {category}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={containerStyles}>
        {isLoading ? (
          <div style={loadingStyles}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }}></div>
            <p style={{ color: '#6b7280' }}>
              {isEnglish ? 'Searching for products...' : 'उत्पाद खोज रहे हैं...'}
            </p>
          </div>
        ) : error ? (
          <div style={errorStyles}>
            <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={() => searchProducts(query)}
              style={primaryButtonStyles}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              {isEnglish ? 'Try Again' : 'फिर से कोशिश करें'}
            </button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div style={noResultsStyles}>
            <Search size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#374151', marginBottom: '8px' }}>
              {isEnglish ? 'No products found' : 'कोई उत्पाद नहीं मिला'}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {isEnglish 
                ? `No products match your search for "${query}". Try different keywords or browse our categories.`
                : `"${query}" के लिए कोई उत्पाद नहीं मिला। अलग कीवर्ड आज़माएं या हमारी श्रेणियां देखें।`
              }
            </p>
            <ProductSearch 
              placeholder={isEnglish ? 'Try a different search...' : 'अलग खोज आज़माएं...'}
            />
          </div>
        ) : (
          <div style={productGridStyles}>
            {sortedProducts.map((product, index) => (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                style={productCardStyles}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <img
                  src={product.image || '/uploads/no-image.jpg'}
                  alt={product.name}
                  style={productImageStyles}
                  onError={(e) => {
                    e.target.src = '/uploads/no-image.jpg';
                  }}
                />
                <div style={productContentStyles}>
                  <h3 style={productTitleStyles}>{product.name}</h3>
                  <p style={productDescriptionStyles}>
                    {product.shortDescription || product.description || 'No description available'}
                  </p>
                  
                  <div style={productMetaStyles}>
                    <div style={productPriceStyles}>
                      {product.price ? `₹${product.price.toLocaleString()}` : 'Price on Request'}
                    </div>
                    {product.category && (
                      <div style={productCategoryStyles}>{product.category}</div>
                    )}
                  </div>

                  <div style={productActionsStyles}>
                    <button
                      onClick={() => navigate(`/${product.slug || product.id}`)}
                      style={actionButtonStyles}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
                    >
                      <Eye size={16} />
                      {isEnglish ? 'View' : 'देखें'}
                    </button>
                    <button
                      onClick={() => navigate(`/contact`)}
                      style={primaryButtonStyles}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                    >
                      <ShoppingCart size={16} />
                      {isEnglish ? 'Inquire' : 'पूछताछ'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
