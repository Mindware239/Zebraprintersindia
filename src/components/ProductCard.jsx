import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from '../contexts/LocationContext';

const ProductCard = ({ product, index = 0, onHover }) => {
  const { isEnglish } = useLanguage();
  const { currentLocation } = useLocation();
  const navigate = useNavigate();
  const [expandedDescription, setExpandedDescription] = useState(false);

  // Function to generate product URL (only add location if explicitly selected)
  const getProductUrl = (productSlug) => {
    // Check if location was manually set by user (not auto-detected)
    const isLocationManuallySet = localStorage.getItem('locationManuallySet') === 'true';
    
    if (isLocationManuallySet && currentLocation?.city?.name && currentLocation?.country?.name) {
      const citySlug = currentLocation.city.name.toLowerCase().replace(/\s+/g, '-');
      const countrySlug = currentLocation.country.name.toLowerCase().replace(/\s+/g, '-');
      return `/${productSlug}/in-${citySlug}-${countrySlug}`;
    }
    return `/${productSlug}`;
  };

  // Function to truncate text
  const truncateText = (text, maxLength = 120) => {
    if (!text) return 'No description available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const productCardStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'none',
    transition: 'all 0.3s ease',
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    cursor: 'pointer'
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
    color: '#1f2937',
    lineHeight: '1.4'
  };

  const productDescriptionStyles = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px',
    lineHeight: '1.5',
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


  const handleCardClick = () => {
    navigate(getProductUrl(product.slug));
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    navigate(getProductUrl(product.slug));
  };


  return (
    <motion.div
      style={productCardStyles}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        transform: 'translateY(-2px)'
      }}
      onClick={handleCardClick}
      onMouseEnter={onHover}
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
          fontWeight: '600',
          zIndex: 1
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
          {expandedDescription 
            ? (product.shortDescription || product.description || 'No description available')
            : truncateText(product.shortDescription || product.description || 'No description available')
          }
        </p>
        {(product.shortDescription || product.description || '').length > 120 && (
          <span 
            style={readMoreStyles}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedDescription(!expandedDescription);
            }}
          >
            {expandedDescription 
              ? (isEnglish ? 'Read less' : 'कम पढ़ें')
              : (isEnglish ? 'Read more' : 'और पढ़ें')
            }
          </span>
        )}
      </div>
      
      {product.price && (
        <div style={productPriceStyles}>₹{product.price}</div>
      )}
      
      
      
      <div style={productActionsStyles}>
        <button 
          style={primaryButtonStyles}
          onClick={handleViewClick}
        >
          <Eye style={{ width: '16px', height: '16px' }} />
          {isEnglish ? 'View' : 'देखें'}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;






