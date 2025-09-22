import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ShoppingCart, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { productAPI, productCategories } from '../data/products';
import './ProductShowcase.css';

const ProductShowcase = () => {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = productCategories;

  // Load products on component mount and category change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await productAPI.getProductsByCategory(activeCategory);
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeCategory]);

  // Products are now loaded dynamically from API

  const sectionStyles = {
    padding: '80px 0',
    backgroundColor: '#f8fafc'
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const sectionHeaderStyles = {
    textAlign: 'center',
    marginBottom: '64px'
  };

  const sectionTitleStyles = {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px'
  };

  const sectionDescriptionStyles = {
    fontSize: '20px',
    color: '#6b7280',
    maxWidth: '768px',
    margin: '0 auto'
  };

  const categoryFilterStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '48px'
  };

  const categoryButtonStyles = (isActive) => ({
    padding: '12px 24px',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? '#2563eb' : '#ffffff',
    color: isActive ? '#ffffff' : '#374151',
    border: '1px solid #e5e7eb',
    cursor: 'pointer'
  });

  const productsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    marginBottom: '48px'
  };

  const productCardStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s ease'
  };

  const productImageStyles = {
    position: 'relative',
    height: '192px',
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const productIconStyles = {
    width: '80px',
    height: '80px',
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const productIconTextStyles = {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold'
  };

  const ratingStyles = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    padding: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const productInfoStyles = {
    padding: '24px'
  };

  const productCategoryStyles = {
    fontSize: '14px',
    color: '#2563eb',
    fontWeight: '500',
    textTransform: 'capitalize',
    marginBottom: '8px'
  };

  const productRatingStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  };

  const productNameStyles = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
    lineHeight: 1.4
  };

  const productDescriptionStyles = {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '16px',
    lineHeight: 1.5
  };

  const featuresListStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px'
  };

  const featureItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6b7280'
  };

  const featureDotStyles = {
    width: '6px',
    height: '6px',
    backgroundColor: '#2563eb',
    borderRadius: '50%'
  };

  const priceContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  };

  const priceStyles = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2563eb'
  };

  const actionButtonsStyles = {
    display: 'flex',
    gap: '8px'
  };

  const actionButtonStyles = {
    flex: '1',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  };

  const viewButtonStyles = {
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };

  const addToCartButtonStyles = {
    backgroundColor: '#2563eb',
    color: '#ffffff'
  };

  const ctaStyles = {
    textAlign: 'center'
  };

  const ctaButtonStyles = {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '12px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  };

  return (
    <section style={sectionStyles}>
      <div style={containerStyles}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={sectionHeaderStyles}
        >
          <h2 style={sectionTitleStyles}>Our Product Range</h2>
          <p style={sectionDescriptionStyles}>
            From desktop printers to mobile computers, we provide comprehensive barcode solutions 
            for every business need
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={categoryFilterStyles}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              style={categoryButtonStyles(activeCategory === category.id)}
              onMouseEnter={(e) => {
                if (activeCategory !== category.id) {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== category.id) {
                  e.target.style.backgroundColor = '#ffffff';
                }
              }}
            >
              {getTranslation(category.nameKey, language)}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <motion.div
          layout
          className="products-grid"
        >
          {loading ? (
            // Loading state
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px',
              fontSize: '18px',
              color: '#6b7280'
            }}>
              Loading products...
            </div>
          ) : products.length === 0 ? (
            // No products state
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px',
              fontSize: '18px',
              color: '#6b7280'
            }}>
              No products found in this category.
            </div>
          ) : (
            products.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="product-card"
            >
                {/* Product Image */}
                <div style={productImageStyles}>
                  <div style={productIconStyles}>
                    <span style={productIconTextStyles}>Z</span>
                  </div>
                  <div style={ratingStyles}>
                    <Star size={16} color="#fbbf24" fill="#fbbf24" />
                    <span style={{ marginLeft: '4px', fontSize: '14px' }}>{product.rating}</span>
                  </div>
                </div>

              {/* Product Info */}
              <div style={productInfoStyles}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={productCategoryStyles}>
                    {product.category}
                  </span>
                  <div style={productRatingStyles}>
                    <Star size={16} color="#fbbf24" fill="#fbbf24" />
                    <span>{product.rating}</span>
                  </div>
                </div>

                <h3 style={productNameStyles}>
                  {product.name}
                </h3>

                <p style={productDescriptionStyles}>
                  {product.description}
                </p>

                {/* Features */}
                <div style={featuresListStyles}>
                  {product.features.map((feature, idx) => (
                    <div key={idx} style={featureItemStyles}>
                      <div style={featureDotStyles}></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price and Actions */}
                <div style={priceContainerStyles}>
                  <div style={priceStyles}>
                    ₹{product.price.toLocaleString()}
                  </div>
                  <div style={actionButtonsStyles}>
                    <button style={{...actionButtonStyles, ...viewButtonStyles}}>
                      <Eye size={18} />
                    </button>
                    <button style={{...actionButtonStyles, ...addToCartButtonStyles}}>
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
            ))
          )}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={ctaStyles}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={ctaButtonStyles}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
          >
            <span>View All Products</span>
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductShowcase;
