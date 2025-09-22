import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MINDWARELogo from './MINDWARELogo';
import ProductDropdown from './ProductDropdown';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
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
    };
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products', hasDropdown: true },
    { name: 'Service & Support', path: '/service-support' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Jobs', path: '/jobs' },
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
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px'
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
    gap: '32px'
  };

  const navLinkStyles = (isActive) => ({
    padding: '8px 12px',
    fontSize: '16px',
    fontWeight: '500',
    textDecoration: 'none',
    color: isActive ? '#2563eb' : '#374151',
    transition: 'color 0.2s ease',
    position: 'relative',
    borderRadius: '6px'
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
    right: 0,
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
    gap: '8px',
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
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: '500',
    textDecoration: 'none',
    color: isActive ? '#2563eb' : '#374151',
    backgroundColor: isActive ? '#eff6ff' : 'transparent',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} />
              <span>+91 9717122688</span>
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
            <MINDWARELogo size={40} showText={!isMobile} isMobile={isMobile} />
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-nav" style={desktopNavStyles}>
            {navItems.map((item) => (
              <div
                key={item.name}
                style={{ position: 'relative' }}
                onMouseEnter={() => {
                  if (item.hasDropdown) {
                    setIsProductDropdownOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  if (item.hasDropdown) {
                    setIsProductDropdownOpen(false);
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
              </div>
            ))}
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
        onClose={() => setIsProductDropdownOpen(false)}
        onMouseEnter={() => setIsProductDropdownOpen(true)}
        onMouseLeave={() => setIsProductDropdownOpen(false)}
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
                  <MINDWARELogo size={36} showText={true} isMobile={true} />
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

              {/* Mobile Navigation Links */}
              <div style={mobileNavStyles}>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    style={mobileNavLinkStyles(location.pathname === item.path)}
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
                    {item.name}
                  </Link>
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
                    <span>+91 8527522688</span>
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
  );
};

export default Header;
