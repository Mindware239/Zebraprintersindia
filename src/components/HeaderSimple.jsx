import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, ChevronDown, Printer, Scan, Smartphone, Settings, Wrench, Search, Globe, ChevronUp } from 'lucide-react';
import { useLanguage, INDIAN_LANGUAGES } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import ProductDropdown from './ProductDropdown';
import logoImage from '../assets/logo.png';
import './HeaderSimple.css';

const HeaderSimple = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const location = useLocation();
  const { language, setLanguage, currentLanguage } = useLanguage();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLanguageDropdownOpen && !event.target.closest('[data-language-dropdown]')) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLanguageDropdownOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const navItems = [
    { 
      nameKey: 'nav.home', 
      path: '/' 
    },
    { 
      nameKey: 'nav.products', 
      path: '/products',
      hasDropdown: true
    },
    { 
      nameKey: 'nav.serviceSupport', 
      path: '/service-support',
      hasDropdown: true,
      dropdownItems: [
        { nameKey: 'nav.service', path: '/service-support' },
        { nameKey: 'nav.drivers', path: '/drivers' }
      ]
    },
    { 
      nameKey: 'nav.jobs', 
      path: '/jobs' 
    },
    { 
      nameKey: 'nav.about', 
      path: '/about' 
    },
    { 
      nameKey: 'nav.contact', 
      path: '/contact' 
    }
  ];

  return (
    <>
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: 1000
    }}>

      {/* Main Navigation */}
      <nav className={`header-main-nav ${isMobile ? 'header-mobile' : ''}`} style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: isMobile ? '70px' : '80px',
        gap: isMobile ? '16px' : '24px',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        position: 'relative'
      }}>
        
        {/* Logo Section */}
        <div style={{ flex: '0 0 auto', minWidth: 'fit-content' }}>
          <Link to="/" className="header-logo" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <img 
              src={logoImage} 
              alt="MINDWARE Logo" 
              style={{
                width: isMobile ? '120px' : '140px',
                height: isMobile ? '120px' : '140px',
                objectFit: 'contain'
              }}
            />
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        {!isMobile && (
          <div className="header-nav-links" style={{ 
            display: 'flex', 
            gap: '8px', 
            position: 'relative', 
            flex: '1',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '600px',
            margin: '0 40px'
          }}>
            {navItems.map((item) => (
              <div
                key={item.nameKey}
                style={{ position: 'relative' }}
                onMouseEnter={() => {
                  if (item.hasDropdown) {
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current);
                      hoverTimeoutRef.current = null;
                    }
                    setHoveredNavItem(item.nameKey);
                    setIsProductDropdownOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  if (item.hasDropdown) {
                    hoverTimeoutRef.current = setTimeout(() => {
                      setHoveredNavItem(null);
                      setIsProductDropdownOpen(false);
                    }, 300);
                  }
                }}
              >
                <Link
                  to={item.path}
                  className="header-nav-link"
                  style={{
                    padding: '12px 20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    color: location.pathname === item.path ? '#667eea' : '#374151',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#667eea';
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = location.pathname === item.path ? '#667eea' : '#374151';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  {getTranslation(item.nameKey, language)}
                  {item.hasDropdown && <ChevronDown size={18} />}
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Product Dropdown - Only show when products is hovered */}
        {hoveredNavItem === 'nav.products' && (
          <ProductDropdown
            isOpen={isProductDropdownOpen}
            onClose={() => {
              setIsProductDropdownOpen(false);
              setHoveredNavItem(null);
            }}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              setIsProductDropdownOpen(true);
            }}
            onMouseLeave={() => {
              hoverTimeoutRef.current = setTimeout(() => {
                setIsProductDropdownOpen(false);
                setHoveredNavItem(null);
              }, 200);
            }}
          />
        )}

        {/* Service & Support Dropdown */}
        {hoveredNavItem === 'nav.serviceSupport' && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: '8px 0',
              minWidth: '200px',
              zIndex: 1000,
              marginTop: '8px'
            }}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
            }}
            onMouseLeave={() => {
              hoverTimeoutRef.current = setTimeout(() => {
                setIsProductDropdownOpen(false);
                setHoveredNavItem(null);
              }, 200);
            }}
          >
            {navItems.find(item => item.nameKey === 'nav.serviceSupport')?.dropdownItems?.map((dropdownItem) => (
              <Link
                key={dropdownItem.nameKey}
                to={dropdownItem.path}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  color: location.pathname === dropdownItem.path ? '#667eea' : '#374151',
                  transition: 'all 0.2s ease',
                  borderBottom: '1px solid #f3f4f6'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.color = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = location.pathname === dropdownItem.path ? '#667eea' : '#374151';
                }}
              >
                {getTranslation(dropdownItem.nameKey, language)}
              </Link>
            ))}
          </div>
        )}

        {/* Right Section - Search and Language */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flex: '0 0 auto',
            minWidth: 'fit-content'
          }}>
            {/* Search Box */}
            <div className="header-search" style={{
              position: 'relative',
              minWidth: '50px',
              maxWidth: '50px',
              width: '50px',
              transition: 'all 0.3s ease',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.minWidth = '280px';
              e.currentTarget.style.maxWidth = '320px';
              e.currentTarget.style.width = '280px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.minWidth = '50px';
              e.currentTarget.style.maxWidth = '50px';
              e.currentTarget.style.width = '50px';
            }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Search 
                  size={20} 
                  className="header-search-icon"
                  style={{
                    position: 'absolute',
                    left: '16px',
                    color: isSearchFocused ? '#667eea' : '#9ca3af',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                />
                <input
                  type="text"
                  placeholder={getTranslation('search.placeholder', language)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  style={{
                    width: '100%',
                    padding: '14px 20px 14px 50px',
                    border: `2px solid ${isSearchFocused ? '#667eea' : '#e5e7eb'}`,
                    borderRadius: '25px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#ffffff',
                    boxShadow: isSearchFocused ? '0 4px 12px rgba(102, 126, 234, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
                    opacity: 0,
                    transform: 'translateX(-20px)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSearchFocused) {
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSearchFocused) {
                      e.target.style.borderColor = '#e5e7eb';
                    }
                  }}
                />
              </div>
            </div>

            {/* Language Switcher */}
            <div 
              className="header-language"
              data-language-dropdown
              style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <button
                className="header-language-button"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  backgroundColor: isLanguageDropdownOpen ? '#f0f4ff' : 'transparent',
                  border: `2px solid ${isLanguageDropdownOpen ? '#667eea' : '#e5e7eb'}`,
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isLanguageDropdownOpen ? '#667eea' : '#374151',
                  transition: 'all 0.3s ease',
                  minWidth: '130px',
                  justifyContent: 'space-between',
                  boxShadow: isLanguageDropdownOpen ? '0 4px 12px rgba(102, 126, 234, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.color = '#667eea';
                  e.target.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.color = '#374151';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{currentLanguage.flag}</span>
                  <span>{currentLanguage.native}</span>
                </div>
                {isLanguageDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* Language Dropdown */}
              {isLanguageDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  padding: '8px 0',
                  minWidth: '280px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  marginTop: '8px'
                }}>
                  {Object.values(INDIAN_LANGUAGES).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLanguageDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        backgroundColor: language === lang.code ? '#f0f4ff' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: language === lang.code ? '#667eea' : '#374151',
                        transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (language !== lang.code) {
                          e.target.style.backgroundColor = '#f8fafc';
                          e.target.style.color = '#667eea';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (language !== lang.code) {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#374151';
                        }
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: '500' }}>{lang.native}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{lang.name}</span>
                      </div>
                      {language === lang.code && (
                        <div style={{ marginLeft: 'auto', color: '#667eea' }}>
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            className="header-mobile-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px',
              backgroundColor: isMenuOpen ? '#f0f4ff' : 'transparent',
              border: `2px solid ${isMenuOpen ? '#667eea' : '#e5e7eb'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              color: isMenuOpen ? '#667eea' : '#374151',
              transition: 'all 0.3s ease',
              boxShadow: isMenuOpen ? '0 4px 12px rgba(102, 126, 234, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

      </nav>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav {
            display: none !important;
          }
        }
        
        @media (max-width: 768px) {
          .header-container {
            padding: 0 12px !important;
            height: 56px !important;
          }
          
          .logo-text {
            display: none !important;
          }
          
          .search-box {
            display: none !important;
          }
          
          .language-switcher {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .header-container {
            padding: 0 8px !important;
            gap: 12px !important;
          }
          
          .logo-icon {
            width: 32px !important;
            height: 32px !important;
            font-size: 16px !important;
          }
        }
      `}</style>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }} onClick={() => setIsMenuOpen(false)}>
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '75%',
            maxWidth: '300px',
            height: '100%',
            backgroundColor: '#ffffff',
            padding: '24px',
            boxShadow: '-4px 0 10px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Mobile Menu Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  Z
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
                    {getTranslation('brand.name', language)}
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Mindware</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search Box */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Search 
                  size={18} 
                  style={{
                    position: 'absolute',
                    left: '12px',
                    color: '#9ca3af'
                  }}
                />
                <input
                  type="text"
                  placeholder={getTranslation('search.placeholder', language)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f9fafb'
                  }}
                />
              </div>
            </div>

            {/* Mobile Language Switcher */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  margin: '0 0 8px 0' 
                }}>
                  {getTranslation('language.select', language)}
                </h3>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {Object.values(INDIAN_LANGUAGES).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 8px',
                      backgroundColor: language === lang.code ? '#f0f4ff' : '#f8fafc',
                      border: language === lang.code ? '2px solid #667eea' : '2px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: language === lang.code ? '#667eea' : '#374151',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      flexDirection: 'column',
                      minHeight: '60px'
                    }}
                    onMouseEnter={(e) => {
                      if (language !== lang.code) {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.backgroundColor = '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (language !== lang.code) {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.backgroundColor = '#f8fafc';
                      }
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{lang.flag}</span>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '500', fontSize: '12px' }}>{lang.native}</div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>{lang.name}</div>
                    </div>
                    {language === lang.code && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '4px', 
                        right: '4px', 
                        color: '#667eea',
                        fontSize: '12px'
                      }}>
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navItems.map((item) => (
                <div key={item.nameKey}>
                <Link
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    fontSize: '16px',
                    fontWeight: '500',
                    textDecoration: 'none',
                      color: location.pathname === item.path ? '#667eea' : '#374151',
                      backgroundColor: 'transparent',
                    borderRadius: '0px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {getTranslation(item.nameKey, language)}
                </Link>
                  
                  {/* Mobile Dropdown */}
                  {item.hasDropdown && (
                    <div style={{ marginLeft: '16px', marginTop: '4px' }}>
                      {Object.entries(item.dropdownContent).map(([categoryName, categoryData]) => (
                        <div key={categoryName} style={{ marginBottom: '12px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px',
                            padding: '8px 0',
                            borderBottom: '1px solid #f3f4f6'
                          }}>
                            <categoryData.icon size={16} color="#667eea" />
                            <h4 style={{
                              margin: 0,
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#1f2937'
                            }}>
                              {categoryName}
                            </h4>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {categoryData.subcategories.map((subcategory) => (
                              <Link
                                key={subcategory.name}
                                to={subcategory.path}
                                onClick={() => setIsMenuOpen(false)}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '13px',
                                  color: '#6b7280',
                                  textDecoration: 'none',
                                  borderRadius: '4px',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#f0f4ff';
                                  e.target.style.color = '#667eea';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#6b7280';
                                }}
                              >
                                {subcategory.name}
                              </Link>
                            ))}
                          </div>
                        </div>
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
                  <span>+91 9717122688</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} />
                  <span>info@zebraprintersindia.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>

    </>
  );
};

export default HeaderSimple;

