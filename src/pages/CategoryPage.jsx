import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from '../contexts/LocationContext';
import { useNavigate, useParams } from 'react-router-dom';
import DynamicSEO from '../components/DynamicSEO';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const CategoryPage = () => {
  const { isEnglish } = useLanguage();
  const { currentLocation } = useLocation();
  const navigate = useNavigate();
  const { category } = useParams();

  // Categories state removed since filters are removed
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [isLoading, setIsLoading] = useState(true);
  // Search functionality removed

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
    // This is a simple mapping - you might want to make this more sophisticated
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

  // Set category from URL parameter
  useEffect(() => {
    if (category) {
      // Convert URL slug back to category name
      const categoryName = slugToCategory(category);
      console.log('CategoryPage: URL category slug:', category, 'Mapped to:', categoryName);
      // Clear previous products immediately when category changes
      setProducts([]);
      setIsLoading(true);
      setSelectedCategory(categoryName);
    } else {
      setSelectedCategory('all');
      // Clear products when going to 'all'
      setProducts([]);
      setIsLoading(true);
    }
  }, [category]);

  // Categories fetch removed since filters are removed

  // Fetch products when category or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      // Fetching products for category
      
      if (selectedCategory === 'all') {
        // Fetch all products with pagination
        try {
          setIsLoading(true);
          const response = await fetch(`/api/products/paginated?page=${pagination.currentPage}&limit=9&_t=${Date.now()}`, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          if (response.ok) {
            const data = await response.json();
            console.log('CategoryPage: All products data:', data);
            // Use the paginated response structure
            setProducts(data.products || []);
            setPagination(data.pagination || {
              currentPage: parseInt(data.pagination?.currentPage) || pagination.currentPage,
              totalPages: parseInt(data.pagination?.totalPages) || 1,
              totalProducts: parseInt(data.pagination?.totalProducts) || 0,
              hasNextPage: data.pagination?.hasNextPage || false,
              hasPrevPage: data.pagination?.hasPrevPage || false
            });
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          // Set empty products on error to show empty state
          setProducts([]);
          setPagination({
            currentPage: pagination.currentPage,
            totalPages: 0,
            totalProducts: 0,
            hasNextPage: false,
            hasPrevPage: false
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        // Fetch products by category with pagination
        try {
          setIsLoading(true);
              const url = `/api/products/category/${selectedCategory}/paginated?page=${pagination.currentPage}&limit=9&_t=${Date.now()}`;
          console.log('CategoryPage: Fetching from URL:', url);
          const response = await fetch(url, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          if (response.ok) {
            const data = await response.json();
            // Ensure we always set the products array, even if empty
            const productsList = data.products || [];
            console.log('CategoryPage: Setting products:', productsList.length, 'products for category:', selectedCategory);
            console.log('CategoryPage: First product:', productsList[0]?.name);
            setProducts(productsList);
            setPagination(data.pagination || {
              currentPage: parseInt(data.pagination?.currentPage) || 1,
              totalPages: parseInt(data.pagination?.totalPages) || 1,
              totalProducts: parseInt(data.pagination?.totalProducts) || 0,
              hasNextPage: data.pagination?.hasNextPage || false,
              hasPrevPage: data.pagination?.hasPrevPage || false
            });
          } else {
            setProducts([]);
            setPagination({
              currentPage: 1,
              totalPages: 0,
              totalProducts: 0,
              hasNextPage: false,
              hasPrevPage: false
            });
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          // Set empty products on error to show empty state
          setProducts([]);
          setPagination({
            currentPage: 1,
            totalPages: 0,
            totalProducts: 0,
            hasNextPage: false,
            hasPrevPage: false
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();
  }, [selectedCategory, pagination.currentPage]);

  // Category change handlers removed since filters are removed

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // No filtering - show all products for the selected category
  const filteredProducts = products;
  
  // Debug logging
  console.log('CategoryPage render - selectedCategory:', selectedCategory);
  console.log('CategoryPage render - products:', products);
  console.log('CategoryPage render - pagination:', pagination);
  console.log('CategoryPage render - isLoading:', isLoading);

  // Products state management

  const pageStyles = {
    minHeight: '100vh'
  };

  const headerSectionStyles = {
    background: '#ffffff',
    color: '#1f2937',
    padding: '48px 0',
    borderBottom: '1px solid #e5e7eb'
  };

  const headerContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    textAlign: 'center'
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

  // Filter styles removed

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
    <div key={`category-${selectedCategory}`} style={pageStyles}>
      <DynamicSEO 
        title="Zebra Barcode Printers & Scanners | Professional Solutions"
        description="Explore our comprehensive range of Zebra barcode printers, scanners, mobile computers, and label solutions for all your business needs."
        keywords="Zebra barcode printers, barcode scanners, mobile computers, label printers, RFID solutions"
      />
      
      {/* Header Section */}
      <motion.section
        style={headerSectionStyles}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div style={headerContainerStyles}>
          <h1 style={headerTitleStyles}>
            {isEnglish ? 'Our Products' : 'हमारे उत्पाद'}
          </h1>
          <p style={headerDescriptionStyles}>
            {isEnglish 
              ? 'Explore our comprehensive range of Zebra barcode printing and scanning solutions'
              : 'Zebra बारकोड प्रिंटिंग और स्कैनिंग समाधानों की हमारी व्यापक श्रृंखला की खोज करें'
            }
          </p>
        </div>
      </motion.section>

      {/* Filters Section - REMOVED */}

      {/* Products Section */}
      <section style={productsSectionStyles}>
        <div style={productsContainerStyles}>
          {filteredProducts.length === 0 ? (
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
                {filteredProducts.map((product, index) => (
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

              {/* View All Button */}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;

