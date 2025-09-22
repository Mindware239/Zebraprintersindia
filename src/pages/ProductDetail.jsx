import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShoppingCart, Download, Share2, Heart, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import apiService from '../services/api';

const ProductDetail = () => {
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

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
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
        title: product?.name,
        text: product?.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '18px',
          color: '#6b7280'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading product...
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

  if (error || !product) {
    return (
      <div style={{
        minHeight: '100vh',
        paddingTop: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#374151' }}>
            {isEnglish ? 'Product Not Found' : 'उत्पाद नहीं मिला'}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            {isEnglish ? 'The product you are looking for does not exist.' : 'आप जो उत्पाद खोज रहे हैं वह मौजूद नहीं है।'}
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            {isEnglish ? 'Back to Products' : 'उत्पादों पर वापस जाएं'}
          </button>
        </div>
      </div>
    );
  }

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
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <ArrowLeft size={16} />
          {isEnglish ? 'Back to Products' : 'उत्पादों पर वापस जाएं'}
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '32px'
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '48px',
            alignItems: 'start'
          }}>
            {/* Product Images */}
            <div>
              <div style={{
                width: '100%',
                height: '400px',
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img
                  src={product.image || '/placeholder-product.jpg'}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{
                  display: 'none',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  fontSize: '48px'
                }}>
                  🖨️
                  <span style={{ fontSize: '16px', marginTop: '8px' }}>Product Image</span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Featured Badge */}
              {product.featured && (
                <div style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '16px'
                }}>
                  {isEnglish ? 'Featured' : 'विशेष'}
                </div>
              )}

              {/* Product Title */}
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px',
                lineHeight: 1.2
              }}>
                {product.name}
              </h1>

              {/* SKU */}
              <div style={{
                color: '#6b7280',
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                SKU: {product.sku || 'N/A'}
              </div>

              {/* Rating */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      style={{
                        width: '20px',
                        height: '20px',
                        fill: i < (product.rating || 0) ? '#fbbf24' : 'none',
                        color: '#fbbf24'
                      }}
                    />
                  ))}
                </div>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  {product.rating || 0} ({product.reviews || 0} {isEnglish ? 'reviews' : 'समीक्षाएं'})
                </span>
              </div>

              {/* Price */}
              {product.price && (
                <div style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#059669',
                  marginBottom: '24px'
                }}>
                  ₹{product.price}
                </div>
              )}

              {/* Short Description */}
              <p style={{
                fontSize: '16px',
                color: '#4b5563',
                lineHeight: 1.6,
                marginBottom: '24px'
              }}>
                {product.shortDescription || product.description}
              </p>

              {/* Quantity Selector */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  {isEnglish ? 'Quantity' : 'मात्रा'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </button>
                  <span style={{
                    minWidth: '60px',
                    textAlign: 'center',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '32px'
              }}>
                <button
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ShoppingCart size={20} />
                  {isEnglish ? 'Add to Cart' : 'कार्ट में जोड़ें'}
                </button>
                <button
                  onClick={toggleWishlist}
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: isWishlisted ? '#ef4444' : '#f3f4f6',
                    color: isWishlisted ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleShare}
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Share2 size={20} />
                </button>
              </div>

              {/* Download Datasheet */}
              {product.pdf && (
                <button
                  onClick={handleDownloadDatasheet}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    color: '#3b82f6',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} />
                  {isEnglish ? 'Download Datasheet' : 'डेटाशीट डाउनलोड करें'}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '32px'
          }}
        >
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '24px'
          }}>
            {isEnglish ? 'Product Details' : 'उत्पाद विवरण'}
          </h2>

          {/* Product Specifications */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '16px'
            }}>
              {isEnglish ? 'Product Specifications' : 'उत्पाद विनिर्देश'}
            </h3>
            
            {/* Features */}
            {features.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#4b5563',
                  marginBottom: '12px'
                }}>
                  {isEnglish ? 'Key Features' : 'मुख्य विशेषताएं'}
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  {features.map((feature, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 0'
                    }}>
                      <CheckCircle size={16} color="#10b981" />
                      <span style={{ color: '#4b5563' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Specifications */}
            {specifications.length > 0 && (
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#4b5563',
                  marginBottom: '12px'
                }}>
                  {isEnglish ? 'Technical Details' : 'तकनीकी विवरण'}
                </h4>
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  padding: '0',
                  overflow: 'hidden'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <tbody>
                      {specifications.map((spec, index) => {
                        // Split specification by colon to separate key and value
                        const [key, ...valueParts] = spec.split(':');
                        const value = valueParts.join(':').trim();
                        
                        return (
                          <tr key={index} style={{
                            borderBottom: index < specifications.length - 1 ? '1px solid #e5e7eb' : 'none'
                          }}>
                            <td style={{
                              padding: '12px 16px',
                              fontWeight: '500',
                              color: '#374151',
                              backgroundColor: '#f3f4f6',
                              width: '35%',
                              verticalAlign: 'top'
                            }}>
                              {key?.trim()}
                            </td>
                            <td style={{
                              padding: '12px 16px',
                              color: '#4b5563',
                              verticalAlign: 'top'
                            }}>
                              {value || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ProductDetail;
