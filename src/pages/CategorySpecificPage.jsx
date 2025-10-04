import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Filter, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from '../contexts/LocationContext';
import { useParams, useNavigate } from 'react-router-dom';
import DynamicSEO from '../components/DynamicSEO';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const CategorySpecificPage = () => {
  const { isEnglish } = useLanguage();
  const { currentLocation } = useLocation();
  const { category } = useParams();
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState(null);

  // Fetch subcategories and category info on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch subcategories for this category
        const subcategoriesResponse = await fetch(`/api/categories/${category}/subcategories`);
        if (subcategoriesResponse.ok) {
          const subcategoriesData = await subcategoriesResponse.json();
          setSubcategories(subcategoriesData);
        }

        // Fetch category info
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          const currentCategory = categoriesData.find(cat => cat.name === category);
          setCategoryInfo(currentCategory);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (category) {
      fetchData();
    }
  }, [category]);

  // Fetch products when subcategory or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        if (selectedSubcategory === 'all') {
          // Fetch all products in this category
          const response = await fetch(`/api/products/category/${category}/paginated?page=${pagination.currentPage}&limit=8`);
          if (response.ok) {
            const data = await response.json();
            setProducts(data.products || []);
            setPagination(data.pagination || {
              currentPage: 1,
              totalPages: 1,
              totalProducts: 0,
              hasNextPage: false,
              hasPrevPage: false
            });
          }
        } else {
          // Fetch products by subcategory
          const response = await fetch(`/api/products/subcategory/${selectedSubcategory}/paginated?page=${pagination.currentPage}&limit=8`);
          if (response.ok) {
            const data = await response.json();
            setProducts(data.products || []);
            setPagination(data.pagination || {
              currentPage: 1,
              totalPages: 1,
              totalProducts: 0,
              hasNextPage: false,
              hasPrevPage: false
            });
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (category) {
      fetchProducts();
    }
  }, [category, selectedSubcategory, pagination.currentPage]);

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };


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

  const backButtonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    marginBottom: '24px',
    border: '1px solid rgba(255, 255, 255, 0.3)'
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
    borderBottom: 'none'
  };

  const filtersContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const searchContainerStyles = {
    position: 'relative',
    maxWidth: '400px',
    margin: '0 auto 32px'
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

  const filterButtonsContainerStyles = {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const filterButtonStyles = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    minWidth: '120px',
    textAlign: 'center'
  };

  const activeFilterButtonStyles = {
    ...filterButtonStyles,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderColor: '#3b82f6',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  };

  const allProductsButtonStyles = {
    ...filterButtonStyles,
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '2px solid #3b82f6',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%) 1'
  };

  const activeAllProductsButtonStyles = {
    ...allProductsButtonStyles,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    background: '#3b82f6',
    backgroundClip: 'unset',
    WebkitBackgroundClip: 'unset',
    WebkitTextFillColor: 'unset',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
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
    marginBottom: '32px'
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
      <DynamicSEO 
        title={`${categoryInfo?.display_name || category} - Zebra Barcode Solutions`}
        description={`Explore ${categoryInfo?.display_name || category} products from Zebra Technologies. Professional barcode printing and scanning solutions.`}
        keywords={`Zebra ${categoryInfo?.display_name || category}, barcode solutions, professional equipment`}
      />
      
      {/* Header Section */}
      <motion.section
        style={headerSectionStyles}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div style={headerContainerStyles}>
          <motion.button
            style={backButtonStyles}
            onClick={() => navigate('/products')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={16} />
            {isEnglish ? 'Back to All Products' : 'सभी उत्पादों पर वापस जाएं'}
          </motion.button>
          
          <h1 style={headerTitleStyles}>
            {categoryInfo?.display_name || category}
          </h1>
          <p style={headerDescriptionStyles}>
            {categoryInfo?.description || `Explore our ${categoryInfo?.display_name || category} solutions`}
          </p>
        </div>
      </motion.section>

      {/* Filters Section */}
      <section style={filtersSectionStyles}>
        <div style={filtersContainerStyles}>
          
          <div style={filterButtonsContainerStyles}>
            <motion.button
              style={selectedSubcategory === 'all' ? activeAllProductsButtonStyles : allProductsButtonStyles}
              onClick={() => handleSubcategoryChange('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isEnglish ? 'ALL' : 'सभी'}
            </motion.button>

            {subcategories.map(subcategory => (
              <motion.button
                key={subcategory.id}
                style={selectedSubcategory === subcategory.name ? activeFilterButtonStyles : filterButtonStyles}
                onClick={() => handleSubcategoryChange(subcategory.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {subcategory.display_name || subcategory.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section style={productsSectionStyles}>
        <div style={productsContainerStyles}>
          {products.length === 0 ? (
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
            <>
              <motion.div
                style={productsGridStyles}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
              >
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </motion.div>

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
              />

            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategorySpecificPage;

