import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Users, Award, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import { useLocation } from '../contexts/LocationContext';
import DynamicContent from '../components/DynamicContent';
import DynamicSEOWithSchema from '../components/DynamicSEOWithSchema';
import useDynamicSchema from '../hooks/useDynamicSchema';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import hero1 from '../assets/hero1.png';
import hero2 from '../assets/hero2.png';
import hero3 from '../assets/img3.png';
import hero4 from '../assets/hero4.png';
import hero5 from '../assets/hero5.png';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
import PageTracker from '../components/PageTracker';
// Removed Card and FeatureCard imports - using inline components

// Styled Card Component
const StyledCard = styled.div`
  .home-banner-card {
    width: 100vw;
    height: 80vh;
    min-height: 700px;
    max-height: 900px;
    background: #f8fafc;
    border-radius: 0;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 15px 30px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    margin: 0;
    padding: 0;
    left: 50%;
    right: 50%;
    transform: translateX(-50%);
    z-index: 1;
  }
  
  .card-content {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    z-index: 2;
  }
  
  .slider-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  .slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.8s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .slide.active {
    opacity: 1;
    transform: translateX(0);
  }
  
  .card-image {
    width: 100vw;
    height: 100%;
    object-fit: cover;
    object-position: center;
    border-radius: 0;
    transition: transform 0.8s ease;
    position: absolute;
    top: 0;
    left: 0;
  }
  
  .slide:hover .card-image {
    transform: scale(1.02);
  }
  
  .slide-indicators {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 10;
  }
  
  .indicator {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.8);
  }
  
  .indicator:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(1.1);
  }
  
  .indicator.active {
    background: #667eea;
    border-color: #667eea;
    transform: scale(1.3);
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  }
  
  .card-text-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    text-align: center;
    width: 90%;
    max-width: 800px;
  }
  
  .text-card {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 40px;
    padding: 4rem 5rem;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2), 0 15px 30px rgba(0, 0, 0, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
    max-width: 900px;
    width: 90%;
    transition: all 0.5s ease;
  }
  
  
  .card-title {
    font-size: clamp(4rem, 8vw, 7rem);
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 1rem 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    letter-spacing: -0.02em;
    transition: all 0.5s ease;
  }
  
  .card-subtitle {
    font-size: clamp(1.5rem, 3vw, 2.2rem);
    font-weight: 500;
    color: #ffffff;
    margin: 0 0 2rem 0;
    opacity: 0.9;
    transition: all 0.5s ease;
  }
  
  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 16px 32px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    text-decoration: none;
    margin-top: 1rem;
  }
  
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
    background: #5a67d8;
  }
  
  .cta-icon {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
  }
  
  .cta-button:hover .cta-icon {
    transform: translateX(4px);
  }
  
  .card-decoration {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 50%;
    z-index: 1;
  }
  
  .card-decoration-2 {
    position: absolute;
    bottom: -30px;
    left: -30px;
    width: 150px;
    height: 150px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 50%;
    z-index: 1;
  }
  
  /* Ensure full-width container */
  .home-banner-wrapper {
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    transform: translateX(-50%);
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  
  @media (max-width: 768px) {
    .home-banner-card {
      height: 70vh;
      min-height: 600px;
      margin: 0;
      padding: 0;
      width: 100vw;
      left: 50%;
      right: 50%;
      transform: translateX(-50%);
    }
    
    .card-image {
      width: 100vw;
      height: 100%;
    }
    
    .text-card {
      padding: 2rem 2.5rem;
      border-radius: 20px;
    }
    
    .card-title {
      font-size: clamp(3rem, 8vw, 5rem);
    }
    
    .card-subtitle {
      font-size: clamp(1.2rem, 4vw, 1.8rem);
    }
  }
    
    .card-image {
      border-radius: 30px;
    }
    
    .slide-indicators {
      bottom: 15px;
    }
    
    .indicator {
      width: 10px;
      height: 10px;
    }
    
    .card-text-overlay {
      right: 1rem;
    }
    
    .text-card {
      padding: 1rem 1.5rem;
      border-radius: 15px;
    }
    
    .card-title {
      font-size: clamp(1.5rem, 5vw, 2.5rem);
    }
    
    .card-decoration {
      width: 150px;
      height: 150px;
      top: -30px;
      right: -30px;
    }
    
    .card-decoration-2 {
      width: 100px;
      height: 100px;
      bottom: -20px;
      left: -20px;
    }
  }
`;

const Home = () => {
  const { language } = useLanguage();
  const { currentLocation } = useLocation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cookieConsent, setCookieConsent] = useState(null);

  // Function to generate product URL (only add location if explicitly selected)
  const getProductUrl = (productSlug) => {
    // Only add location if user has explicitly selected a location
    // Check if location was manually set by user (not auto-detected)
    const isLocationManuallySet = localStorage.getItem('locationManuallySet') === 'true';
    
    if (isLocationManuallySet && currentLocation?.city?.name && currentLocation?.country?.name) {
      const citySlug = currentLocation.city.name.toLowerCase().replace(/\s+/g, '-');
      const countrySlug = currentLocation.country.name.toLowerCase().replace(/\s+/g, '-');
      return `/${productSlug}/in-${citySlug}-${countrySlug}`;
    }
    return `/${productSlug}`;
  };

  // Hero images array
  const bannerContent = [
    {
      image: hero1,
      alt: 'Smart Barcode Printing Solutions',
      heading: 'Smart Barcode Printing Solutions',
      subheading: 'Discover high-performance Zebra printers for every business need.',
      ctaText: 'Explore Printers'
    },
    {
      image: hero2,
      alt: 'Scan Smarter with Zebra',
      heading: 'Scan Smarter with Zebra',
      subheading: 'Fast, reliable, and accurate barcode scanners for retail, logistics & more.',
      ctaText: 'Shop Scanners'
    },
    {
      image: hero3,
      alt: 'Premium Zebra Labels & Ribbons',
      heading: 'Premium Zebra Labels & Ribbons',
      subheading: 'Durable, high-quality supplies for consistent printing results.',
      ctaText: 'View Supplies'
    },
    {
      image: hero4,
      alt: 'Next-Gen RFID Tracking',
      heading: 'Next-Gen RFID Tracking',
      subheading: 'Unlock efficiency with advanced Zebra RFID readers and devices.',
      ctaText: 'Explore RFID'
    },
    {
      image: hero5,
      alt: 'Your Trusted Zebra Partner',
      heading: 'Your Trusted Zebra Partner',
      subheading: 'Complete Zebra solutions with expert sales & service support across India.',
      ctaText: 'Contact Us Today'
    }
  ];

  // Auto-slide every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerContent.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [bannerContent.length]);

  // Fetch featured products on component mount
  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Cookie consent handler
  const handleCookieConsentChange = (consent) => {
    setCookieConsent(consent);
  };
  
  // Inline FeatureCard component
  const FeatureCard = ({ icon: Icon, title, description }) => (
    <div style={{
      background: '#ffffff',
      padding: '32px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        color: '#ffffff'
      }}>
        <Icon size={32} />
      </div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '12px'
      }}>
        {title}
      </h3>
      <p style={{
        color: '#6b7280',
        lineHeight: '1.6'
      }}>
        {description}
      </p>
    </div>
  );

  const features = [
    {
      icon: CheckCircle,
      titleKey: 'home.features.quality.title',
      descriptionKey: 'home.features.quality.description'
    },
    {
      icon: Users,
      titleKey: 'home.features.team.title',
      descriptionKey: 'home.features.team.description'
    },
    {
      icon: Award,
      titleKey: 'home.features.leader.title',
      descriptionKey: 'home.features.leader.description'
    },
    {
      icon: Clock,
      titleKey: 'home.features.support.title',
      descriptionKey: 'home.features.support.description'
    }
  ];

  const stats = [
    { number: '28+', labelKey: 'home.stats.experience' },
    { number: '15,000+', labelKey: 'home.stats.customers' },
    { number: '50+', labelKey: 'home.stats.categories' },
    { number: '99%', labelKey: 'home.stats.satisfaction' }
  ];

  // Featured Products State
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Truncate text function for product descriptions
  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Toggle description expansion
  const toggleDescription = (productId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Fetch featured products from database
  const fetchFeaturedProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch('/api/products/featured');
      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }
      const data = await response.json();
      setFeaturedProducts(data.products || []);
      setProductsError(null);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setProductsError(error.message);
      // Fallback to sample data if API fails
      setFeaturedProducts([
        {
          id: 1,
          name: 'Zebra FS80 Scanner',
          description: 'Superior scanning performance for demanding industrial environments with advanced imaging technology.',
          image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f4e?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 2,
          name: 'Zebra FS42 Scanner',
          description: 'Compact design for medium-duty scanning tasks with flexible mounting options.',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 3,
          name: 'Zebra FS10 Scanner',
          description: 'Reliable and fast scanning for industrial applications with rugged construction.',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 4,
          name: 'Zebra FS20 Scanner',
          description: 'High-speed and accurate scanning for manufacturing environments with flexible connectivity.',
          image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f4e?w=400&h=300&fit=crop&crop=center'
        }
      ]);
    } finally {
      setProductsLoading(false);
    }
  };

  const pageStyles = {
    minHeight: '100vh'
  };

  const statsSectionStyles = {
    padding: '32px 0',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 50%, #c7d2fe 100%)'
  };

  const statsContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '32px'
  };

  const statItemStyles = {
    textAlign: 'center'
  };

  const statNumberStyles = {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px'
  };

  const statLabelStyles = {
    color: '#6b7280',
    fontWeight: '500'
  };

  const featuresSectionStyles = {
    padding: '40px 0 20px 0',
    backgroundColor: '#ffffff'
  };

  const sectionHeaderStyles = {
    textAlign: 'center',
    marginBottom: '32px'
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

  const featuresGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px'
  };


  const ctaSectionStyles = {
    padding: '15px 0',
    background: '#ffffff',
    color: '#1f2937'
  };

  const ctaContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    textAlign: 'center'
  };

  const ctaTitleStyles = {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 'bold',
    marginBottom: '8px'
  };

  const ctaDescriptionStyles = {
    fontSize: '20px',
    marginBottom: '6px',
    maxWidth: '512px',
    margin: '0 auto 6px'
  };

  const ctaButtonsStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center'
  };

  const primaryButtonStyles = {
    backgroundColor: '#667eea',
    color: '#ffffff',
    padding: '12px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: '2px solid #667eea',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  };

  const secondaryButtonStyles = {
    backgroundColor: '#f093fb',
    color: '#ffffff',
    padding: '12px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: '2px solid #f093fb',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  };

  // Featured Products Section Styles
  const featuredProductsSectionStyles = {
    padding: '40px 0 10px 0',
    backgroundColor: '#f8fafc'
  };

  const featuredProductsContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const featuredProductsHeaderStyles = {
    textAlign: 'center',
    marginBottom: '40px'
  };

  const featuredProductsTitleStyles = {
    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  };

  const featuredProductsDescriptionStyles = {
    fontSize: '18px',
    color: '#6b7280',
    maxWidth: '600px',
    margin: '0 auto'
  };

  // Featured Products Grid Styles
  const featuredProductsGridStyles = {
    display: 'grid',
    gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : window.innerWidth <= 1200 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '40px'
  };

  const productCardStyles = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '320px',
    display: 'flex',
    flexDirection: 'column'
  };

  const productImageStyles = {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '12px',
    backgroundColor: '#f3f4f6'
  };

  const productNameStyles = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '6px',
    lineHeight: '1.3'
  };

  const productDescriptionStyles = {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.4',
    marginBottom: '12px',
    flex: 1
  };

  const viewAllButtonStyles = {
    display: 'inline-block',
    textAlign: 'center',
    margin: '0 auto',
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    color: '#ffffff',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    minWidth: '180px',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  };

  // Use dynamic schema for homepage
  const { schemas, loading: schemaLoading, error: schemaError } = useDynamicSchema('homepage', null, {
    autoFetch: true,
    refreshInterval: 600000, // 10 minutes - reduced API calls
    includeBreadcrumbs: false,
    includeFAQs: false,
    limit: 6
  });


  return (
    <div style={pageStyles}>
      {/* Page Tracker */}
      <PageTracker pageName="Home Page" />
      
        
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        
        <DynamicSEOWithSchema
        title="Zebra Barcode Printers India | Professional Barcode Solutions"
        description="Leading supplier of Zebra barcode printers, scanners, and mobile computers in India. Professional barcode technology solutions for businesses."
        keywords="Zebra barcode printers, barcode scanners, mobile computers, label printers, RFID solutions, India"
        pageType="homepage"
        autoFetchContent={true}
        contentLimit={6}
        refreshInterval={300000}
        includeBreadcrumbs={false}
        includeFAQs={false}
        ogType="website"
        ogImage="https://zebraprintersindia.com/api/placeholder/1200/630"
      />
      {/* Hero Section with Home Banner Card */}
      <div className="home-banner-wrapper">
        <StyledCard>
          <div className="home-banner-card">
            <div className="card-decoration"></div>
            <div className="card-decoration-2"></div>
            <div className="card-content">
              <div className="slider-container">
                {/* Banner Slides */}
                {bannerContent.map((banner, index) => (
                  <div
                    key={index}
                    className={`slide ${currentSlide === index ? 'active' : ''}`}
                  >
                    <img
                      src={banner.image}
                      alt={banner.alt}
                      className="card-image"
                    />
                  </div>
                ))}

                {/* Slide Indicators */}
                <div className="slide-indicators">
                  {bannerContent.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${currentSlide === index ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                      style={{ 
                        cursor: 'pointer',
                        border: 'none',
                        background: 'none',
                        padding: 0
                      }}
                    />
                  ))}
                </div>

                {/* Dynamic Text Overlay */}
                <div className="card-text-overlay">
                  <div className="text-card">
                    <h1 className="card-title">{bannerContent[currentSlide].heading}</h1>
                    <p className="card-subtitle">{bannerContent[currentSlide].subheading}</p>
                    <button 
                      className="cta-button"
                      onClick={() => {
                        const currentBanner = bannerContent[currentSlide];
                        if (currentBanner.ctaText === 'Explore Printers') {
                          navigate('/printers');
                        } else if (currentBanner.ctaText === 'Shop Scanners') {
                          navigate('/scanners');
                        } else if (currentBanner.ctaText === 'View Supplies') {
                          navigate('/supplies');
                        } else if (currentBanner.ctaText === 'Explore RFID') {
                          navigate('/rfid');
                        } else if (currentBanner.ctaText === 'Contact Us Today') {
                          navigate('/contact');
                        } else {
                          navigate('/products');
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {bannerContent[currentSlide].ctaText}
                      <ArrowRight className="cta-icon" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </StyledCard>
      </div>

      {/* Featured Products Section */}
      <section style={featuredProductsSectionStyles}>
        <div style={featuredProductsContainerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={featuredProductsHeaderStyles}
          >
            <h2 style={featuredProductsTitleStyles}>
              Featured Products
            </h2>
            <p style={featuredProductsDescriptionStyles}>
              Discover our top-rated barcode printing and scanning solutions designed for businesses of all sizes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={featuredProductsGridStyles}
          >
            {productsLoading ? (
              // Loading state
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{
                    ...productCardStyles,
                    background: '#f3f4f6',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '300px'
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #059669',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading...</p>
                </motion.div>
              ))
            ) : productsError ? (
              // Error state
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                color: '#dc2626'
              }}>
                <h3>Unable to load featured products</h3>
                <p>{productsError}</p>
                <button
                  onClick={fetchFeaturedProducts}
                  style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : featuredProducts.length === 0 ? (
              // No products state
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                color: '#6b7280'
              }}>
                <h3>No featured products available</h3>
                <p>Check back later for our latest products</p>
              </div>
            ) : (
              // Products display
              featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={productCardStyles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }}
                onClick={() => navigate(`/${product.slug || product.id}`)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  style={productImageStyles}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/f3f4f6/6b7280?text=Product+Image';
                  }}
                />
                <h3 style={productNameStyles}>{product.name}</h3>
                <div style={productDescriptionStyles}>
                  <p>
                    {expandedDescriptions[product.id] 
                      ? product.description
                      : truncateText(product.description, 80)
                    }
                  </p>
                  {product.description && product.description.length > 80 && (
                    <span 
                      style={{
                        color: '#10b981',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        textDecoration: 'underline'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(product.id);
                      }}
                    >
                      {expandedDescriptions[product.id] ? 'Read less' : 'Read more'}
                    </span>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  alignItems: 'center',
                  marginTop: 'auto'
                }}>
                  <ArrowRight size={20} color="#059669" />
                </div>
              </motion.div>
              ))
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ textAlign: 'center', marginBottom: '5px' }}
          >
            <button
              onClick={() => navigate('/products')}
              style={viewAllButtonStyles}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)';
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)';
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
              }}
            >
              View All Products
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={statsSectionStyles}>
        <div style={statsContainerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={statsGridStyles}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={statItemStyles}
              >
                <div style={statNumberStyles}>
                  {stat.number}
                </div>
                <div style={statLabelStyles}>{getTranslation(stat.labelKey, language)}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={featuresSectionStyles}>
        <div style={statsContainerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={sectionHeaderStyles}
          >
            <h2 style={sectionTitleStyles}>
              {getTranslation('home.sections.features.title', language)}
            </h2>
            <p style={sectionDescriptionStyles}>
              {getTranslation('home.sections.features.description', language)}
            </p>
          </motion.div>

          <div style={featuresGridStyles}>
            {features.map((feature, index) => (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={getTranslation(feature.titleKey, language)}
                  description={getTranslation(feature.descriptionKey, language)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* About Section */}
      <AboutSection />

      {/* Contact Section */}
      <ContactSection />

      {/* CTA Section */}
      <section style={ctaSectionStyles}>
        <div style={ctaContainerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={ctaTitleStyles}>
              {getTranslation('home.sections.cta.title', language)}
            </h2>
            <p style={ctaDescriptionStyles}>
              {getTranslation('home.sections.cta.description', language)}
            </p>
            <div style={ctaButtonsStyles}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={primaryButtonStyles}
                onClick={() => navigate('/contact')}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a67d8';
                  e.target.style.borderColor = '#5a67d8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#667eea';
                  e.target.style.borderColor = '#667eea';
                }}
              >
                <span>{getTranslation('home.sections.cta.buttons.quote', language)}</span>
                <ArrowRight size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={secondaryButtonStyles}
                onClick={() => navigate('/products')}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e879f9';
                  e.target.style.borderColor = '#e879f9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f093fb';
                  e.target.style.borderColor = '#f093fb';
                }}
              >
                {getTranslation('home.sections.cta.buttons.products', language)}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
