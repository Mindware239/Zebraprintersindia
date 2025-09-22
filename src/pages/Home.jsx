import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Users, Award, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import styled from 'styled-components';
import hero1 from '../assets/hero1.png';
import hero2 from '../assets/hero2.png';
import hero3 from '../assets/img3.png';
import hero4 from '../assets/hero4.png';
import hero5 from '../assets/hero5.png';
import AboutSection from '../components/AboutSection';
import ContactSection from '../components/ContactSection';
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
  const [currentSlide, setCurrentSlide] = useState(0);

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
    { number: '25+', labelKey: 'home.stats.experience' },
    { number: '1000+', labelKey: 'home.stats.customers' },
    { number: '50+', labelKey: 'home.stats.categories' },
    { number: '99%', labelKey: 'home.stats.satisfaction' }
  ];

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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
    color: '#ffffff'
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
    backgroundColor: '#ffffff',
    color: '#667eea',
    padding: '12px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  };

  const secondaryButtonStyles = {
    backgroundColor: 'transparent',
    color: '#ffffff',
    padding: '12px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: '2px solid #ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  };

  // Popular Products Section Styles
  const popularProductsSectionStyles = {
    padding: '40px 0 10px 0',
    backgroundColor: '#f8fafc'
  };

  const popularProductsContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  };

  const popularProductsHeaderStyles = {
    textAlign: 'center',
    marginBottom: '24px'
  };

  const popularProductsTitleStyles = {
    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  };

  const popularProductsDescriptionStyles = {
    fontSize: '18px',
    color: '#6b7280',
    maxWidth: '600px',
    margin: '0 auto'
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

  return (
    <div style={pageStyles}>
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
                    <div
                      key={index}
                      className={`indicator ${currentSlide === index ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>

                {/* Dynamic Text Overlay */}
                <div className="card-text-overlay">
                  <div className="text-card">
                    <h1 className="card-title">{bannerContent[currentSlide].heading}</h1>
                    <p className="card-subtitle">{bannerContent[currentSlide].subheading}</p>
                    <button className="cta-button">
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

      {/* Popular Products Section */}
      <section style={popularProductsSectionStyles}>
        <div style={popularProductsContainerStyles}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={popularProductsHeaderStyles}
          >
            <h2 style={popularProductsTitleStyles}>
              {getTranslation('home.sections.popularProducts.title', language)}
            </h2>
            <p style={popularProductsDescriptionStyles}>
              {getTranslation('home.sections.popularProducts.description', language)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px',
              marginBottom: '32px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: '16px',
              border: '2px dashed #cbd5e1'
            }}
          >
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Product Showcase</h3>
              <p>Featured products will be displayed here</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ textAlign: 'center', marginBottom: '5px' }}
          >
            <a
              href="/products"
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
            </a>
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
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f0f4ff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                }}
              >
                <span>{getTranslation('home.sections.cta.buttons.quote', language)}</span>
                <ArrowRight size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={secondaryButtonStyles}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.color = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#ffffff';
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
