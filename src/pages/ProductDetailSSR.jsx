import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShoppingCart, Download, Share2, Heart, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import apiService from '../services/api';

const ProductDetailSSR = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await apiService.getProductBySlug(slug);
        setProduct(data);
        setError(null);
        
        // Update meta tags immediately when product loads
        if (data) {
          updateMetaTags(data);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const updateMetaTags = (productData) => {
    // Update document title
    document.title = `${productData.name} | Zebra Printers India`;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', productData.description);
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', productData.metaKeywords || `${productData.name}, Zebra printer, barcode printer, ${productData.category}, professional printing`);
    
    // Update Open Graph tags
    updateOpenGraphTags(productData);
    
    // Update structured data
    updateStructuredData(productData);
  };

  const updateOpenGraphTags = (productData) => {
    const ogTags = [
      { property: 'og:title', content: `${productData.name} | Zebra Printers India` },
      { property: 'og:description', content: productData.description },
      { property: 'og:type', content: 'product' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:image', content: productData.image || '/default-product-image.jpg' }
    ];
    
    ogTags.forEach(tag => {
      let element = document.querySelector(`meta[property="${tag.property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', tag.property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });
  };

  const updateStructuredData = (productData) => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": productData.name,
      "description": productData.description,
      "brand": {
        "@type": "Brand",
        "name": "Zebra"
      },
      "category": productData.category,
      "offers": {
        "@type": "Offer",
        "price": productData.price,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    };

    let structuredDataScript = document.getElementById('structured-data');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.setAttribute('type', 'application/ld+json');
      structuredDataScript.setAttribute('id', 'structured-data');
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);
  };

  const handleAddToCart = () => {
    console.log('Adding to cart:', { productSlug: slug, quantity });
  };

  const handleDownloadDatasheet = () => {
    if (product?.pdf) {
      window.open(product.pdf, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.href,
      }).then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: '#6b7280' }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ef4444', marginBottom: '16px' }}>
            <ArrowLeft size={48} style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Error Loading Product</h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '8px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <p style={{ color: '#6b7280' }}>Product not found.</p>
      </div>
    );
  }

  const images = product.image ? [product.image, ...(product.additional_images ? JSON.parse(product.additional_images) : [])] : [];
  const features = product.features ?
    (Array.isArray(product.features) ? product.features : JSON.parse(product.features)) : [];

  const specifications = product.specifications ?
    product.specifications.split('\n').filter(spec => spec.trim()) : [];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', backgroundColor: '#f9fafb' }}>
      {/* Breadcrumb */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => navigate('/products')}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Back to Products
        </button>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#1f2937' }}>{product.name}</h1>
      </div>

      {/* Product Details */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px',
        '@media (min-width: 768px)': {
          gridTemplateColumns: '1fr 1fr'
        }
      }}>
        {/* Image Gallery */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <motion.img
            key={selectedImage}
            src={images[selectedImage]}
            alt={product.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              maxWidth: '500px',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              marginBottom: '16px'
            }}
          />
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '8px'
          }}>
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.name} thumbnail ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: index === selectedImage ? '2px solid #2563eb' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p style={{ color: '#4b5563', fontSize: '1.125rem', lineHeight: '1.75rem', marginBottom: '16px' }}>
            {product.shortDescription}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', color: '#facc15', marginRight: '8px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < Math.round(product.rating) ? '#facc15' : 'none'} stroke={i < Math.round(product.rating) ? '#facc15' : '#9ca3af'} />
              ))}
            </div>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {product.rating.toFixed(1)} ({product.reviews} reviews)
            </span>
          </div>

          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
            ₹{product.price ? product.price.toLocaleString('en-IN') : 'N/A'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <label htmlFor="quantity" style={{ marginRight: '16px', fontWeight: 'medium', color: '#374151' }}>Quantity:</label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '80px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                textAlign: 'center'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 'semibold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              <ShoppingCart size={20} style={{ marginRight: '8px' }} />
              Add to Cart
            </button>
            <button
              onClick={toggleWishlist}
              style={{
                padding: '12px',
                backgroundColor: isWishlisted ? '#ef4444' : '#f3f4f6',
                color: isWishlisted ? 'white' : '#4b5563',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s, color 0.2s',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              <Heart size={20} fill={isWishlisted ? 'white' : 'none'} stroke={isWishlisted ? 'white' : '#4b5563'} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            {product.pdf && (
              <button
                onClick={handleDownloadDatasheet}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 'semibold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <Download size={20} style={{ marginRight: '8px' }} />
                Download Datasheet
              </button>
            )}
            <button
              onClick={handleShare}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: '#60a5fa',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 'semibold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              <Share2 size={20} style={{ marginRight: '8px' }} />
              Share
            </button>
          </div>

          <div style={{
            backgroundColor: '#ecfdf5',
            padding: '16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            color: '#047857',
            marginBottom: '24px'
          }}>
            <CheckCircle size={20} style={{ marginRight: '12px' }} />
            <span>In Stock: {product.inStock} units available</span>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        marginTop: '32px'
      }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
          Product Description
        </h2>
        <div
          dangerouslySetInnerHTML={{ __html: product.description }}
          style={{
            color: '#4b5563',
            lineHeight: '1.6',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Features Section */}
      {features.length > 0 && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          marginTop: '32px'
        }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
            Key Features
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {features.map((feature, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '12px',
                color: '#4b5563'
              }}>
                <CheckCircle size={20} style={{ marginRight: '12px', color: '#2563eb', flexShrink: 0 }} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Specifications Section */}
      {specifications.length > 0 && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          marginTop: '32px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
            Specifications
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {specifications.map((spec, index) => {
              const [key, value] = spec.split(':');
              return (
                <div key={index} style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ fontWeight: 'semibold', color: '#1f2937', marginBottom: '4px' }}>{key.trim()}:</p>
                  <p style={{ color: '#4b5563' }}>{value ? value.trim() : 'N/A'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailSSR;
