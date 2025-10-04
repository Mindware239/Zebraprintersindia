import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShoppingCart, Download, Share2, Heart, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import DynamicSEO from '../components/DynamicSEO';
import { setSSRMetaTags, checkMetaTags } from '../utils/ssrMetaTags';
import apiService from '../services/api';

const ProductDetail = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  
  // Parse the URL to extract city and country
  const parseUrl = () => {
    const pathname = window.location.pathname;
    const parts = pathname.split('/');
    const productPart = parts[1]; // This is the productSlug
    
    // Check if there's a location part after the product slug
    if (parts.length > 2 && parts[2].startsWith('in-')) {
      const locationPart = parts[2].substring(3); // Remove 'in-' prefix
      const locationParts = locationPart.split('-');
      if (locationParts.length >= 2) {
        const country = locationParts[locationParts.length - 1];
        const city = locationParts.slice(0, -1).join('-');
        return { city, country };
      }
    }
    return { city: null, country: null };
  };
  
  const { city, country } = parseUrl();
  const { isEnglish } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with slug:', productSlug);
        console.log('URL params:', { productSlug, city, country });
        const data = await apiService.getProductBySlug(productSlug);
        console.log('Product data received:', data);
        setProduct(data);
        setError(null);
        
        // Set meta tags immediately when product loads
        if (data) {
          setSSRMetaTags(data);
          // Also check what was set
          setTimeout(() => checkMetaTags(), 100);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      fetchProduct();
    } else {
      console.log('No productSlug provided');
      setLoading(false);
    }
  }, [productSlug]);


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
          Loading product... (Slug: {productSlug})
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

  // Debug logging
  console.log('ProductDetail: Product data:', product);
  console.log('ProductDetail: Meta keywords:', product?.metaKeywords);
  console.log('ProductDetail: Location params:', { city, country });

  // Generate location-specific SEO data
  const getLocationSpecificSEO = () => {
    if (!product) return {};
    
    const locationText = city && country ? ` in ${city}, ${country}` : '';
    const locationKeywords = city && country ? `, ${city}, ${country}, ${city} barcode printers, ${country} Zebra printers` : '';
    
    return {
      title: `${product.name}${locationText} | Zebra Printers India`,
      description: `${product.description}${locationText}. Professional Zebra barcode printing solutions${locationText}.`,
      keywords: `${product.metaKeywords || product.name}, Zebra printer, barcode printer, ${product.category}, professional printing${locationKeywords}`
    };
  };

  const seoData = getLocationSpecificSEO();

  console.log('ProductDetail rendering with:', { productSlug, city, country, product, loading, error });

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', backgroundColor: '#f9fafb' }}>
      <DynamicSEO
        title={seoData.title || (product ? `${product.name} | Zebra Printers India` : 'Product | Zebra Printers India')}
        description={seoData.description || (product ? product.description : 'Professional Zebra barcode printing solutions')}
        keywords={seoData.keywords || (product ? product.metaKeywords || `${product.name}, Zebra printer, barcode printer, ${product.category}, professional printing` : 'Zebra printer, barcode printer, professional printing')}
        structuredData={product ? {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "brand": {
            "@type": "Brand",
            "name": "Zebra"
          },
          "category": product.category,
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock"
          }
        } : null}
      />
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

      <div className="product-detail-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="product-detail-card"
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginBottom: '32px'
          }}
        >
          <div className="product-detail-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
            alignItems: 'start'
          }}>
            {/* Product Images */}
            <div>
              <div className="product-image-container" style={{
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
              <h1 className="product-title" style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px',
                lineHeight: 1.2
              }}>
                {product.name}
              </h1>

              {/* Product Details */}
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  fontSize: '14px'
                }}>
                  {product.sku && (
                    <div>
                      <span style={{ fontWeight: '500', color: '#374151' }}>
                        {isEnglish ? 'SKU:' : 'SKU:'}
                      </span>
                      <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                        {product.sku}
                      </span>
                    </div>
                  )}
                  {product.brand && (
                    <div>
                      <span style={{ fontWeight: '500', color: '#374151' }}>
                        {isEnglish ? 'Brand:' : 'ब्रांड:'}
                      </span>
                      <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                        {product.brand}
                      </span>
                    </div>
                  )}
                  {product.model && (
                    <div>
                      <span style={{ fontWeight: '500', color: '#374151' }}>
                        {isEnglish ? 'Model:' : 'मॉडल:'}
                      </span>
                      <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                        {product.model}
                      </span>
                    </div>
                  )}
                  {product.category && (
                    <div>
                      <span style={{ fontWeight: '500', color: '#374151' }}>
                        {isEnglish ? 'Category:' : 'श्रेणी:'}
                      </span>
                      <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                        {product.category}
                      </span>
                    </div>
                  )}
                </div>
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
              {product.shortDescription && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    {isEnglish ? 'Short Description' : 'संक्षिप्त विवरण'}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#4b5563',
                    lineHeight: 1.6
                  }}>
                    {product.shortDescription}
                  </p>
                </div>
              )}

              {/* Product Description */}
              {product.description && product.description !== product.shortDescription && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    {isEnglish ? 'Product Description' : 'उत्पाद विवरण'}
                  </h3>
                  <div style={{
                    fontSize: '16px',
                    color: '#4b5563',
                    lineHeight: 1.6
                  }}>
                    {product.description.split('\n').map((paragraph, index) => (
                      <p key={index} style={{ marginBottom: '12px' }}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}


              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '32px'
              }}>
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
                  <table className="specifications-table" style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <tbody>
                      {specifications.map((spec, index) => {
                        // Handle both colon-separated and semicolon-separated specifications
                        let key, value;
                        
                        if (spec.includes(';')) {
                          // If it contains semicolons, split by semicolon and then by colon for each part
                          const parts = spec.split(';').map(part => part.trim()).filter(part => part);
                          
                          // Create multiple rows for semicolon-separated specs
                          return parts.map((part, partIndex) => {
                            const [partKey, ...partValueParts] = part.split(':');
                            const partKeyTrimmed = partKey?.trim();
                            const partValue = partValueParts.join(':').trim();
                            
                            return (
                              <tr key={`${index}-${partIndex}`} style={{
                                borderBottom: partIndex < parts.length - 1 ? '1px solid #e5e7eb' : 'none'
                              }}>
                                <td style={{
                                  padding: '12px 16px',
                                  fontWeight: '500',
                                  color: '#374151',
                                  backgroundColor: '#f3f4f6',
                                  width: '35%',
                                  verticalAlign: 'top'
                                }}>
                                  {partKeyTrimmed}
                                </td>
                                <td style={{
                                  padding: '12px 16px',
                                  color: '#4b5563',
                                  verticalAlign: 'top'
                                }}>
                                  {partValue || '-'}
                                </td>
                              </tr>
                            );
                          });
                        } else {
                          // Original colon-separated format
                          const [specKey, ...valueParts] = spec.split(':');
                          key = specKey?.trim();
                          value = valueParts.join(':').trim();
                        }
                        
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
      
      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .product-detail-container {
            padding: 16px !important;
          }
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .product-detail-card {
            padding: 20px !important;
          }
          .product-image-container {
            height: 300px !important;
          }
          .product-title {
            font-size: 24px !important;
            line-height: 1.3 !important;
          }
          .product-price {
            font-size: 20px !important;
          }
          .product-description {
            font-size: 14px !important;
          }
          .product-buttons {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .product-button {
            width: 100% !important;
            justify-content: center !important;
          }
          .specifications-table {
            font-size: 14px !important;
          }
          .specifications-table th,
          .specifications-table td {
            padding: 8px !important;
          }
        }
        
        @media (max-width: 480px) {
          .product-detail-container {
            padding: 12px !important;
          }
          .product-detail-card {
            padding: 16px !important;
          }
          .product-image-container {
            height: 250px !important;
          }
          .product-title {
            font-size: 20px !important;
          }
          .breadcrumb-container {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
