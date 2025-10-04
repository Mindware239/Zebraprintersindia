import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Filter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from '../contexts/LocationContext';
import { useParams, useNavigate } from 'react-router-dom';
import DynamicSEO from '../components/DynamicSEO';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const SubcategoryPage = () => {
  const { isEnglish } = useLanguage();
  const { currentLocation } = useLocation();
  const { category, subcategory } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [subcategoryInfo, setSubcategoryInfo] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(null);

  // Function to convert category name to URL slug
  const categoryToSlug = (categoryName) => {
    if (!categoryName) return '';
    return categoryName
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[^a-z0-9]/g, ''); // Remove special characters
  };

  // Function to convert slug back to category name
  const slugToCategory = (slug) => {
    if (!slug) return '';
    const categoryMap = {
      'mobilecomputer': 'Mobile Computer',
      'barcodescanners': 'Barcode Scanners',
      'rfidsolutions': 'RFID Solutions',
      'rfidcards': 'RFID Cards',
      'serviceandsupport': 'Service & Support',
      'softwaresolutions': 'Software Solutions',
      'supplieslabelsribbons': 'Supplies (Labels & Ribbons)',
      'printers': 'printers',
      'scanners': 'scanners',
      'rfid': 'rfid',
      'supplies': 'supplies'
    };
    return categoryMap[slug] || slug;
  };

  // Function to convert subcategory name to URL slug
  const subcategoryToSlug = (subcategoryName) => {
    if (!subcategoryName) return '';
    return subcategoryName
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[^a-z0-9]/g, ''); // Remove special characters
  };

  // Function to convert slug back to subcategory name
  const slugToSubcategory = (slug) => {
    if (!slug) return '';
    
    // Handle hyphenated slugs by converting them to the expected format
    const normalizedSlug = slug.replace(/-/g, '');
    
    const subcategoryMap = {
      'desktopprinters': 'Desktop Printers',
      'industrialprinters': 'Industrial Printers',
      'handheldscanners': 'Handheld Scanners',
      'fixedscanners': 'Fixed Scanners',
      'ruggedmobile': 'Rugged Mobile',
      'touchmobile': 'Touch Mobile',
      'thermallabels': 'Thermal Labels',
      'printribbons': 'Print Ribbons',
      // Add more specific mappings for the actual subcategory names
      'fixedmountscanners': 'fixed-mount-scanners',
      'ultraruggedscanners': 'ultra-rugged-scanners',
      'multipanescanners': 'multi-plane-scanners',
      'handsfreescanners': 'hands-free-scanners',
      'oemscanengines': 'oem-scan-engines'
    };
    
    // First try the normalized slug, then return the original slug if not found
    return subcategoryMap[normalizedSlug] || slug;
  };

  // Fetch subcategory info and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Convert URL slugs back to names
        const categoryName = slugToCategory(category);
        const subcategoryName = slugToSubcategory(subcategory);

        // Fetch subcategory info
        const subcategoriesResponse = await fetch('/api/subcategories');
        if (subcategoriesResponse.ok) {
          const subcategoriesData = await subcategoriesResponse.json();
          const currentSubcategory = subcategoriesData.find(sub => sub.name === subcategoryName);
          setSubcategoryInfo(currentSubcategory);
        }

        // Fetch category info
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          const currentCategory = categoriesData.find(cat => cat.name === categoryName);
          setCategoryInfo(currentCategory);
        }

        // Fetch products for this subcategory by getting all products from category and filtering
        const productsResponse = await fetch(`/api/products/category/${categoryName}/paginated?page=1&limit=100`);
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          // Filter products by subcategory name
          const filteredProducts = (productsData.products || []).filter(product => 
            product.subcategory_name === subcategoryName || 
            product.subcategory_display_name?.toLowerCase().includes(subcategoryName.toLowerCase())
          );
          setProducts(filteredProducts.slice(0, 8)); // Limit to 8 products
          setPagination({
            currentPage: 1,
            totalPages: Math.ceil(filteredProducts.length / 8),
            totalProducts: filteredProducts.length,
            hasNextPage: filteredProducts.length > 8,
            hasPrevPage: false
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (subcategory) {
      fetchData();
    }
  }, [category, subcategory]);

  // Fetch products when page changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const subcategoryName = slugToSubcategory(subcategory);
        const categoryName = slugToCategory(category);
        
        // Fetching data for subcategory
        
        // Fetch all products from category and filter by subcategory
        const response = await fetch(`/api/products/category/${categoryName}/paginated?page=1&limit=100`);
        if (response.ok) {
          const data = await response.json();
          // Filter products by subcategory name
          const filteredProducts = (data.products || []).filter(product => 
            product.subcategory_name === subcategoryName || 
            product.subcategory_display_name?.toLowerCase().includes(subcategoryName.toLowerCase())
          );
          
          // Apply pagination to filtered results
          const startIndex = (pagination.currentPage - 1) * 8;
          const endIndex = startIndex + 8;
          const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
          
          setProducts(paginatedProducts);
          setPagination({
            currentPage: pagination.currentPage,
            totalPages: Math.ceil(filteredProducts.length / 8),
            totalProducts: filteredProducts.length,
            hasNextPage: endIndex < filteredProducts.length,
            hasPrevPage: pagination.currentPage > 1
          });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (subcategory && pagination.currentPage > 1) {
      fetchProducts();
    }
  }, [subcategory, pagination.currentPage, category]);

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };


  const pageStyles = {
    minHeight: '100vh'
  };

  const headerSectionStyles = {
    background: '#ffffff',
    color: '#1f2937',
    padding: '48px 0',
    borderBottom: 'none'
  };

  const headerContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    textAlign: 'center'
  };

  const breadcrumbStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
    fontSize: '14px',
    opacity: 0.9
  };

  const breadcrumbLinkStyles = {
    color: '#ffffff',
    textDecoration: 'none',
    transition: 'opacity 0.3s ease'
  };

  const breadcrumbSeparatorStyles = {
    color: '#ffffff',
    opacity: 0.6
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
    margin: '0 auto'
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
        title={`${subcategoryInfo?.display_name || subcategory} - ${categoryInfo?.display_name || category} | Zebra Solutions`}
        description={`Explore ${subcategoryInfo?.display_name || subcategory} products from Zebra Technologies. Professional ${categoryInfo?.display_name || category} solutions.`}
        keywords={`Zebra ${subcategoryInfo?.display_name || subcategory}, ${categoryInfo?.display_name || category}, barcode solutions`}
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
            onClick={() => {
              const categorySlug = categoryToSlug(categoryInfo?.display_name || category);
              navigate(`/products/${categorySlug}`);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={16} />
            {isEnglish ? `Back to ${categoryInfo?.display_name || category}` : `${categoryInfo?.display_name || category} पर वापस जाएं`}
          </motion.button>

          <div style={breadcrumbStyles}>
            <a 
              href="/products" 
              style={breadcrumbLinkStyles}
              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              {isEnglish ? 'Products' : 'उत्पाद'}
            </a>
            <span style={breadcrumbSeparatorStyles}>›</span>
            <a 
              href={`/products/${category}`}
              style={breadcrumbLinkStyles}
              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              {categoryInfo?.display_name || category}
            </a>
            <span style={breadcrumbSeparatorStyles}>›</span>
            <span>{subcategoryInfo?.display_name || subcategory}</span>
          </div>
          
          <h1 style={headerTitleStyles}>
            {subcategoryInfo?.display_name || subcategory}
          </h1>
          <p style={headerDescriptionStyles}>
            {subcategoryInfo?.description || `Explore our ${subcategoryInfo?.display_name || subcategory} solutions`}
          </p>
        </div>
      </motion.section>

      {/* Filters Section */}
      <section style={filtersSectionStyles}>
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
                  ? 'Try adjusting your search criteria'
                  : 'अपनी खोज मानदंड को समायोजित करने का प्रयास करें'
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

export default SubcategoryPage;

