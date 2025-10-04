import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, ChevronDown, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductDropdown from './ProductDropdown';
import ProductSearch from './ProductSearch';
import LocationBanner from './LocationBanner';
import logoImage from '../assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 1024;
      setIsMobile(mobile);
      if (width >= 1024) {
        setIsMenuOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      // Cleanup timeout on unmount
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products', hasDropdown: true },
    { name: 'Service & Support', path: '/service-support', hasDropdown: true, dropdownItems: [
      { name: 'Service & Support', path: '/service-support' },
      { name: 'Drivers', path: '/drivers' }
    ]},
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Blogs', path: '/blogs' }
  ];

  const headerStyles = {
    position: 'fixed',
    width: '100%',
    zIndex: 50,
    transition: 'all 0.3s ease',
    backgroundColor: isScrolled ? '#ffffff' : 'transparent',
    boxShadow: isScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
  };

  const topBarStyles = {
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    padding: '8px 0',
    display: isMobile ? 'none' : 'block'
  };

  const topBarContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px'
  };

  const navStyles = {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  };

  const navContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    height: '80px',
    gap: '24px'
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: 'inherit'
  };

  const desktopNavStyles = {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
      gap: '16px',
    flex: '0 0 auto'
  };

  const searchContainerStyles = {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    flex: '0 0 auto',
    maxWidth: '240px',
    minWidth: '180px',
    marginLeft: 'auto'
  };

  const navLinkStyles = (isActive) => ({
    padding: '12px 16px',
    fontSize: '18px',
    fontWeight: '600',
    textDecoration: 'none',
    color: isActive ? '#2563eb' : '#374151',
    transition: 'color 0.2s ease',
    position: 'relative',
    borderRadius: '8px',
    letterSpacing: '0.3px'
  });

  const mobileMenuButtonStyles = {
    display: isMobile ? 'block' : 'none',
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#374151',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease'
  };

  const mobileMenuOverlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
    display: isMobile ? 'block' : 'none'
  };

  const mobileMenuContentStyles = {
    position: 'fixed',
    top: 0,
    right: '50px',
    width: '75%',
    maxWidth: '300px',
    height: '100%',
    backgroundColor: '#ffffff',
    zIndex: 50,
    padding: '24px',
    boxShadow: '-4px 0 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const mobileMenuHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  };

  const mobileLogoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'inherit'
  };

  const mobileNavStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const mobileNavLinkStyles = (isActive) => ({
    display: 'block',
    padding: '14px 18px',
    fontSize: '18px',
    fontWeight: '600',
    textDecoration: 'none',
    color: isActive ? '#2563eb' : '#374151',
    backgroundColor: isActive ? '#eff6ff' : 'transparent',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    letterSpacing: '0.3px'
  });

  const closeButtonStyles = {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease'
  };

  return (
    <>
      {/* Location Banner */}
      <LocationBanner />
      
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        style={headerStyles}
      >
        {/* Top Bar - Hidden on Mobile */}
        <div className="top-bar" style={topBarStyles}>
          <div style={topBarContainerStyles}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageCircle size={16} style={{ color: '#25D366' }} />
                <a 
                  href="https://wa.me/918800839490" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#ffffff', 
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#25D366'}
                  onMouseLeave={(e) => e.target.style.color = '#ffffff'}
                >
                  +91 8800839490
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={16} style={{ color: '#3B82F6' }} />
                <a 
                  href="tel:+918800122315" 
                  style={{ 
                    color: '#ffffff', 
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#3B82F6'}
                  onMouseLeave={(e) => e.target.style.color = '#ffffff'}
                >
                  +91 8800122315
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} />
              <span>gm@zebraprintersindia.com</span>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px'
          }}>
            <span>GST No. 07AFDPM9463K1ZY</span>
            <span>|</span>
            <span>New Delhi, India</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={navStyles}>
        <div style={navContainerStyles}>
          {/* Logo */}
          <Link to="/" style={logoStyles}>
            <img 
              src={logoImage} 
              alt="MINDWARE Logo" 
              style={{
                width: isMobile ? 80 : 120,
                height: isMobile ? 45 : 68,
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.error('Header logo failed to load:', e.target.src);
                e.target.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Header logo loaded successfully');
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-nav" style={desktopNavStyles}>
            {navItems.map((item) => (
              <div
                key={item.name}
                style={{ position: 'relative' }}
                onMouseEnter={() => {
                  if (item.hasDropdown) {
                    // Clear any existing timeout
                    if (hoverTimeout) {
                      clearTimeout(hoverTimeout);
                      setHoverTimeout(null);
                    }
                    
                    if (item.name === 'Products') {
                      setIsProductDropdownOpen(true);
                    } else if (item.name === 'Service & Support') {
                      setIsServiceDropdownOpen(true);
                    }
                  }
                }}
                onMouseLeave={() => {
                  if (item.hasDropdown) {
                    // Add delay before closing to allow mouse to move to dropdown
                    const timeout = setTimeout(() => {
                      if (item.name === 'Products') {
                        setIsProductDropdownOpen(false);
                      } else if (item.name === 'Service & Support') {
                        setIsServiceDropdownOpen(false);
                      }
                    }, 200); // 200ms delay
                    setHoverTimeout(timeout);
                  }
                }}
              >
                <Link
                  to={item.path}
                  style={{
                    ...navLinkStyles(location.pathname === item.path),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#2563eb';
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = location.pathname === item.path ? '#2563eb' : '#374151';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>{item.name}</span>
                  {item.hasDropdown && <ChevronDown size={14} />}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeTab"
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '0',
                        right: '0',
                        height: '2px',
                        backgroundColor: '#2563eb',
                        borderRadius: '1px'
                      }}
                    />
                  )}
                </Link>

                {/* Service & Support Dropdown - positioned relative to its parent */}
                {item.name === 'Service & Support' && item.hasDropdown && (
                  <AnimatePresence>
                    {isServiceDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          zIndex: 50,
                          minWidth: '200px',
                          padding: '8px 0',
                          marginTop: '8px'
                        }}
                        onMouseEnter={() => setIsServiceDropdownOpen(true)}
                        onMouseLeave={() => setIsServiceDropdownOpen(false)}
                      >
                        {item.dropdownItems?.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.path}
                            style={{
                              display: 'block',
                              padding: '12px 16px',
                              fontSize: '14px',
                              fontWeight: '500',
                              textDecoration: 'none',
                              color: location.pathname === dropdownItem.path ? '#2563eb' : '#374151',
                              backgroundColor: location.pathname === dropdownItem.path ? '#eff6ff' : 'transparent',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#2563eb';
                              e.target.style.backgroundColor = '#eff6ff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = location.pathname === dropdownItem.path ? '#2563eb' : '#374151';
                              e.target.style.backgroundColor = location.pathname === dropdownItem.path ? '#eff6ff' : 'transparent';
                            }}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Search Box - Positioned at the end of navigation */}
          <div style={searchContainerStyles}>
            <ProductSearch 
              placeholder="Search products..."
              className="header-search"
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            style={mobileMenuButtonStyles}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Product Dropdown */}
      <ProductDropdown
        isOpen={isProductDropdownOpen}
        onClose={() => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          setIsProductDropdownOpen(false);
        }}
        onMouseEnter={() => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          setIsProductDropdownOpen(true);
        }}
        onMouseLeave={() => {
          const timeout = setTimeout(() => {
            setIsProductDropdownOpen(false);
          }, 200);
          setHoverTimeout(timeout);
        }}
      />


      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={mobileMenuOverlayStyles}
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, type: 'spring', damping: 25 }}
              style={mobileMenuContentStyles}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Menu Header */}
              <div style={mobileMenuHeaderStyles}>
                <Link to="/" style={mobileLogoStyles} onClick={() => setIsMenuOpen(false)}>
                  <MINDWARELogo size={68} showText={true} isMobile={true} />
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  style={closeButtonStyles}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Search Box */}
              <div style={{ marginBottom: '24px' }}>
                <ProductSearch 
                  placeholder="Search products..."
                  className="mobile-search"
                />
              </div>

              {/* Mobile Navigation Links */}
              <div style={mobileNavStyles}>
                {navItems.map((item) => (
                  <div key={item.name}>
                    <Link
                      to={item.path}
                      style={{
                        ...mobileNavLinkStyles(location.pathname === item.path),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onClick={() => setIsMenuOpen(false)}
                      onMouseEnter={(e) => {
                        if (location.pathname !== item.path) {
                          e.target.style.backgroundColor = '#f3f4f6';
                          e.target.style.color = '#2563eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (location.pathname !== item.path) {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#374151';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.name === 'Home' && (
                          <img 
                            src={logoImage} 
                            alt="MINDWARE Logo" 
                            style={{
                              width: '20px',
                              height: '20px',
                              objectFit: 'contain'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <span>{item.name}</span>
                      </div>
                      {item.hasDropdown && (
                        <ChevronDown 
                          size={16} 
                          style={{ 
                            marginLeft: '8px',
                            transition: 'transform 0.2s ease'
                          }} 
                        />
                      )}
                    </Link>
                    {/* Mobile Dropdown Items */}
                    {item.dropdownItems && (
                      <div style={{ paddingLeft: '16px', marginTop: '4px' }}>
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.path}
                            style={{
                              ...mobileNavLinkStyles(location.pathname === dropdownItem.path),
                              fontSize: '14px',
                              padding: '8px 16px',
                              marginBottom: '4px'
                            }}
                            onClick={() => setIsMenuOpen(false)}
                            onMouseEnter={(e) => {
                              if (location.pathname !== dropdownItem.path) {
                                e.target.style.backgroundColor = '#f3f4f6';
                                e.target.style.color = '#2563eb';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (location.pathname !== dropdownItem.path) {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#374151';
                              }
                            }}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Contact Info */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} />
                    <span>+91 8800839490</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} />
                    <span>gm@zebraprintersindia.com</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    </>
  );
};

export default Header;
