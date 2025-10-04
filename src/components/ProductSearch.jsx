import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './ProductSearch.css';

const ProductSearch = ({ placeholder = "Search products...", className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
        setShowSuggestions(searchTerm.trim().length > 0);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    setIsLoading(true);
    try {
      const results = await apiService.getSearchSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query = searchTerm) => {
    if (!query.trim()) return;

    // Add to recent searches
    const newRecentSearches = [
      query.trim(),
      ...recentSearches.filter(item => item !== query.trim())
    ].slice(0, 5); // Keep only 5 recent searches

    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion.name);
  };

  const handleRecentSearchClick = (search) => {
    setSearchTerm(search);
    handleSearch(search);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const containerStyles = {
    position: 'relative',
    width: '100%',
    maxWidth: '500px'
  };

  const searchContainerStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '25px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    padding: '8px 16px'
  };

  const searchInputStyles = {
    flex: 1,
    padding: '0',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: '#374151'
  };


  const suggestionsContainerStyles = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    marginTop: '4px',
    overflow: 'hidden'
  };

  const suggestionItemStyles = {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'background-color 0.2s ease'
  };

  const recentSearchesHeaderStyles = {
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280'
  };

  const clearButtonStyles = {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '2px 6px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
  };

  const loadingStyles = {
    padding: '16px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px'
  };

  const noResultsStyles = {
    padding: '16px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px'
  };

  return (
    <div ref={searchRef} style={containerStyles} className={`product-search ${className}`}>
      <div style={searchContainerStyles}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => setShowSuggestions(searchTerm.trim().length > 0 || recentSearches.length > 0)}
          placeholder={placeholder}
          style={searchInputStyles}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setShowSuggestions(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '8px'
            }}
          >
            <X size={16} color="#6b7280" />
          </button>
        )}
        <Search size={20} color="#6b7280" style={{ cursor: 'pointer' }} onClick={() => handleSearch()} />
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={suggestionsContainerStyles}
          >
            {isLoading ? (
              <div style={loadingStyles}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #2563eb',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Searching...
                </div>
              </div>
            ) : (
              <>
                {suggestions.length > 0 && (
                  <>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={`suggestion-${index}`}
                        style={suggestionItemStyles}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <TrendingUp size={16} color="#10b981" />
                        <div>
                          <div style={{ fontWeight: '500', color: '#374151' }}>
                            {suggestion.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {suggestion.brand} • {suggestion.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {recentSearches.length > 0 && (
                  <>
                    {suggestions.length === 0 && searchTerm.trim().length === 0 && (
                      <div style={recentSearchesHeaderStyles}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={14} />
                          Recent Searches
                        </div>
                        <button
                          onClick={clearRecentSearches}
                          style={clearButtonStyles}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                    {recentSearches.map((search, index) => (
                      <div
                        key={`recent-${index}`}
                        style={suggestionItemStyles}
                        onClick={() => handleRecentSearchClick(search)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <Clock size={16} color="#6b7280" />
                        <div style={{ color: '#374151' }}>{search}</div>
                      </div>
                    ))}
                  </>
                )}

                {suggestions.length === 0 && recentSearches.length === 0 && searchTerm.trim().length > 0 && (
                  <div style={noResultsStyles}>
                    No products found for "{searchTerm}"
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSearch;
