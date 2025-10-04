import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import DynamicSEO from '../components/DynamicSEO';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const DirectSubcategoryPage = ({ subcategorySlug }) => {
  const { isEnglish } = useLanguage();
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

  // Function to get category name from subcategory
  const getCategoryFromSubcategory = (subcategorySlug) => {
    const categoryMap = {
      'labels': 'supplies',
      'ribbons': 'supplies',
      'handheld-scanners': 'scanners',
      'fixed-mount-scanners': 'scanners',
      'ultra-rugged-scanners': 'scanners',
      'multi-plane-scanners': 'scanners',
      'hands-free-scanners': 'scanners',
      'oem-scan-engines': 'scanners',
      'desktop-printers': 'printers',
      'industrial-printers': 'printers',
      'id-card-printers': 'printers',
      'mobile-printers': 'printers',
      'healthcare-printers': 'printers',
      'print-engines': 'printers',
      'handheld-rfid': 'rfid',
      'fixed-rfid': 'rfid',
      'rfid-antennas': 'rfid',
      'rfid-printers': 'rfid',
      'handheld-computers': 'mobilecomputer',
      'vehicle-mounted-computers': 'mobilecomputer',
      'wearable-computers': 'mobilecomputer',
      'healthcare-mobile-computers': 'mobilecomputer',
      'Zebra RFID Cards': 'rfidcards'
    };
    return categoryMap[subcategorySlug] || 'supplies';
  };

  // Function to get display names
  const getDisplayNames = (subcategorySlug) => {
    const subcategoryMap = {
      'labels': { subcategory: 'Labels for Zebra Printers', category: 'Supplies (Labels & Ribbons)' },
      'ribbons': { subcategory: 'Ribbons for Zebra Printers', category: 'Supplies (Labels & Ribbons)' },
      'handheld-scanners': { subcategory: 'General Purpose Handheld Scanners', category: 'Barcode Scanners' },
      'fixed-mount-scanners': { subcategory: 'Fixed Mount Scanners', category: 'Barcode Scanners' },
      'ultra-rugged-scanners': { subcategory: 'Ultra-Rugged Scanners', category: 'Barcode Scanners' },
      'multi-plane-scanners': { subcategory: 'Multi-Plane Scanners', category: 'Barcode Scanners' },
      'hands-free-scanners': { subcategory: 'Hands-Free & On-Counter Scanners', category: 'Barcode Scanners' },
      'oem-scan-engines': { subcategory: 'OEM Scan Engines', category: 'Barcode Scanners' },
      'desktop-printers': { subcategory: 'Desktop Printers', category: 'Printers' },
      'industrial-printers': { subcategory: 'Industrial Printers', category: 'Printers' },
      'id-card-printers': { subcategory: 'ID Card Printers', category: 'Printers' },
      'mobile-printers': { subcategory: 'Mobile Printers', category: 'Printers' },
      'healthcare-printers': { subcategory: 'Healthcare Printers', category: 'Printers' },
      'print-engines': { subcategory: 'Print Engines', category: 'Printers' },
      'handheld-rfid': { subcategory: 'Handheld RFID Readers', category: 'RFID Solutions' },
      'fixed-rfid': { subcategory: 'Fixed RFID Readers', category: 'RFID Solutions' },
      'rfid-antennas': { subcategory: 'RFID Antennas', category: 'RFID Solutions' },
      'rfid-printers': { subcategory: 'RFID Printers', category: 'RFID Solutions' },
      'handheld-computers': { subcategory: 'Handheld Computers', category: 'Mobile Computer' },
      'vehicle-mounted-computers': { subcategory: 'Vehicle Mounted Computers', category: 'Mobile Computer' },
      'wearable-computers': { subcategory: 'Wearable Computers', category: 'Mobile Computer' },
      'healthcare-mobile-computers': { subcategory: 'Healthcare Mobile Computers', category: 'Mobile Computer' },
      'Zebra RFID Cards': { subcategory: 'Zebra RFID Cards', category: 'RFID Cards' }
    };
    return subcategoryMap[subcategorySlug] || { subcategory: subcategorySlug, category: 'Products' };
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const categoryName = getCategoryFromSubcategory(subcategorySlug);
        const displayNames = getDisplayNames(subcategorySlug);
        
        setSubcategoryInfo({ display_name: displayNames.subcategory, name: subcategorySlug });
        setCategoryInfo({ display_name: displayNames.category, name: categoryName });

        // Fetch products for this subcategory by getting all products from category and filtering
        const productsResponse = await fetch(`/api/products/category/${displayNames.category}/paginated?page=1&limit=100`);
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          
          // Filter products by subcategory name
          const filteredProducts = (productsData.products || []).filter(product => 
            product.subcategory_name === subcategorySlug || 
            product.subcategory_display_name?.toLowerCase().includes(subcategorySlug.toLowerCase()) ||
            product.subcategory_display_name === displayNames.subcategory
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

    if (subcategorySlug) {
      fetchData();
    }
  }, [subcategorySlug]);

  // Fetch products when page changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const categoryName = getCategoryFromSubcategory(subcategorySlug);
        const displayNames = getDisplayNames(subcategorySlug);
        
        // Fetch all products from category and filter by subcategory
        const response = await fetch(`/api/products/category/${displayNames.category}/paginated?page=1&limit=100`);
        if (response.ok) {
          const data = await response.json();
          
          // Filter products by subcategory name
          const filteredProducts = (data.products || []).filter(product => 
            product.subcategory_name === subcategorySlug || 
            product.subcategory_display_name?.toLowerCase().includes(subcategorySlug.toLowerCase()) ||
            product.subcategory_display_name === displayNames.subcategory
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

    if (subcategorySlug && pagination.currentPage > 1) {
      fetchProducts();
    }
  }, [subcategorySlug, pagination.currentPage]);

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleBackToCategory = () => {
    const categoryName = getCategoryFromSubcategory(subcategorySlug);
    navigate(`/products/${categoryName}`);
  };

  const pageStyles = {
    minHeight: '100vh'
  };

  const headerSectionStyles = {
    background: '#ffffff',
    padding: '48px 0',
    textAlign: 'center',
    color: '#1f2937',
    borderBottom: 'none'
  };

  const headerContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const breadcrumbStyles = {
    marginBottom: '16px',
    fontSize: '14px',
    opacity: 0.9
  };

  const headerTitleStyles = {
    fontSize: '48px',
    fontWeight: '700',
    marginBottom: '16px',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  };

  const headerDescriptionStyles = {
    fontSize: '18px',
    opacity: 0.9,
    maxWidth: '600px',
    margin: '0 auto'
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
    marginBottom: '48px'
  };

  const emptyStateStyles = {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: 'none',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const backButtonStyles = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: 10
  };


  return (
    <div style={pageStyles}>
      <DynamicSEO 
        title={`${subcategoryInfo?.display_name || subcategorySlug} - Zebra Printers India`}
        description={`Explore our ${subcategoryInfo?.display_name || subcategorySlug} collection. Professional solutions for all your business needs.`}
        keywords={`${subcategoryInfo?.display_name || subcategorySlug}, Zebra, barcode, professional solutions`}
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
            onClick={handleBackToCategory}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={16} />
            Back to {categoryInfo?.display_name || 'Category'}
          </motion.button>
          
          <div style={breadcrumbStyles}>
            Products &gt; {categoryInfo?.display_name || 'Category'} &gt; {subcategoryInfo?.display_name || subcategorySlug}
          </div>
          
          <h1 style={headerTitleStyles}>
            {subcategoryInfo?.display_name || subcategorySlug}
          </h1>
          <p style={headerDescriptionStyles}>
            Professional {subcategoryInfo?.display_name || subcategorySlug} solutions for your business needs
          </p>
        </div>
      </motion.section>

      {/* Products Section */}
      <section style={productsSectionStyles}>
        <div style={productsContainerStyles}>
          {isLoading ? (
            <div style={emptyStateStyles}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#374151' }}>
                {isEnglish ? 'Loading Products...' : 'उत्पाद लोड हो रहे हैं...'}
              </h3>
            </div>
          ) : products.length === 0 ? (
            <div style={emptyStateStyles}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#374151' }}>
                {isEnglish ? 'No products found' : 'कोई उत्पाद नहीं मिला'}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                {isEnglish 
                  ? 'We are working on adding products to this category. Please check back soon.'
                  : 'हम इस श्रेणी में उत्पाद जोड़ने पर काम कर रहे हैं। कृपया जल्द ही वापस जांचें।'
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

              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}

            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default DirectSubcategoryPage;
