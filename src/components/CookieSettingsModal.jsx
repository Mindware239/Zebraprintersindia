import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CookieSettingsModal.css';

const CookieSettingsModal = ({ isOpen, onClose, onSavePreferences }) => {
  const [activeTab, setActiveTab] = useState('your-privacy');
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    performance: true,
    functional: true,
    targeting: false
  });

  const cookieCategories = {
    'your-privacy': {
      title: 'Your Privacy',
      description: 'When you visit any web site, it may store or retrieve information on your browser, mostly in the form of cookies. This information might be about you, your preferences or your device and is mostly used to make the site work as you expect it to. The information does not usually directly identify you, but it can give you a more personalised web experience. Because we respect your right to privacy, you can choose not to allow some types of cookies. Click on the different category headings to find out more and change our default settings. However, blocking some types of cookies may impact your experience of the site and the services we are able to offer.'
    },
    'essential': {
      title: 'Strictly Necessary Cookies',
      description: 'These cookies are essential for the website to function properly. They enable basic functions like page navigation, access to secure areas of the website, and remember your cookie preferences. The website cannot function properly without these cookies.',
      dataCollected: [
        'Cookie consent preferences',
        'Session information',
        'Security tokens',
        'User authentication status'
      ],
      purpose: 'Website functionality and security',
      retention: 'Session or until consent is withdrawn'
    },
    'performance': {
      title: 'Performance Cookies',
      description: 'These cookies collect information about how visitors use our website, such as which pages are visited most often and if they get error messages from web pages. This helps us improve how our website works.',
      dataCollected: [
        'Page views and navigation patterns',
        'Time spent on pages',
        'Click tracking and user interactions',
        'Error reports and performance metrics',
        'Device and browser information',
        'IP address (anonymized)',
        'Geographic location (country/city level)'
      ],
      purpose: 'Website performance analysis and improvement',
      retention: 'Up to 24 months'
    },
    'functional': {
      title: 'Functional Cookies',
      description: 'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.',
      dataCollected: [
        'Language preferences',
        'User interface customizations',
        'Form data and preferences',
        'Shopping cart contents',
        'User account information',
        'Location-based settings'
      ],
      purpose: 'Enhanced user experience and personalization',
      retention: 'Up to 12 months'
    },
    'targeting': {
      title: 'Targeting Cookies',
      description: 'These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement as well as help measure the effectiveness of advertising campaigns.',
      dataCollected: [
        'Browsing behavior and interests',
        'Demographic information',
        'Purchase history and preferences',
        'Social media interactions',
        'Advertising engagement data',
        'Cross-site tracking information'
      ],
      purpose: 'Targeted advertising and marketing analytics',
      retention: 'Up to 36 months'
    }
  };

  const handlePreferenceChange = (category, value) => {
    if (category === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSavePreferences = () => {
    onSavePreferences(preferences);
    onClose();
  };

  const handleAllowAll = () => {
    setPreferences({
      essential: true,
      performance: true,
      functional: true,
      targeting: true
    });
    onSavePreferences({
      essential: true,
      performance: true,
      functional: true,
      targeting: true
    });
    onClose();
  };

  const handleRejectAll = () => {
    setPreferences({
      essential: true,
      performance: false,
      functional: false,
      targeting: false
    });
    onSavePreferences({
      essential: true,
      performance: false,
      functional: false,
      targeting: false
    });
    onClose();
  };

  const renderCategoryContent = () => {
    const category = cookieCategories[activeTab];
    
    return (
      <div className="cookie-category-content">
        <h2 className="category-title">{category.title}</h2>
        <p className="category-description">{category.description}</p>
        
        {category.dataCollected && (
          <div className="data-collection-section">
            <h3>📊 Data We Collect</h3>
            <ul className="data-list">
              {category.dataCollected.map((item, index) => (
                <li key={index} className="data-item">
                  <span className="data-icon">🔍</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {category.purpose && (
          <div className="purpose-section">
            <h3>🎯 Purpose</h3>
            <p className="purpose-text">{category.purpose}</p>
          </div>
        )}
        
        {category.retention && (
          <div className="retention-section">
            <h3>⏰ Data Retention</h3>
            <p className="retention-text">{category.retention}</p>
          </div>
        )}
        
        {activeTab !== 'your-privacy' && (
          <div className="cookie-toggle-section">
            <div className="toggle-container">
              <label className="toggle-label">
                <span className="toggle-text">
                  {category.title}
                  {activeTab === 'essential' && (
                    <span className="required-badge">Required</span>
                  )}
                </span>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences[activeTab]}
                    onChange={(e) => handlePreferenceChange(activeTab, e.target.checked)}
                    disabled={activeTab === 'essential'}
                    className="toggle-input"
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
              <p className="toggle-description">
                {activeTab === 'essential' 
                  ? 'These cookies are required for the website to function properly.'
                  : preferences[activeTab] 
                    ? 'This category is currently enabled.'
                    : 'This category is currently disabled.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cookie-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cookie-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="header-left">
                <div className="company-logo">
                  <span className="logo-text">Zebra Printers India</span>
                </div>
              </div>
              <h1 className="modal-title">Privacy Preference Centre</h1>
              <button className="close-button" onClick={onClose}>
                <span className="close-icon">×</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              {/* Left Navigation */}
              <div className="cookie-navigation">
                {Object.keys(cookieCategories).map((key) => (
                  <button
                    key={key}
                    className={`nav-item ${activeTab === key ? 'active' : ''}`}
                    onClick={() => setActiveTab(key)}
                  >
                    <span className="nav-icon">
                      {key === 'your-privacy' && '🔒'}
                      {key === 'essential' && '⚡'}
                      {key === 'performance' && '📊'}
                      {key === 'functional' && '⚙️'}
                      {key === 'targeting' && '🎯'}
                    </span>
                    <span className="nav-text">{cookieCategories[key].title}</span>
                    {key === 'essential' && (
                      <span className="required-indicator">Required</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Right Content */}
              <div className="cookie-content">
                {renderCategoryContent()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button 
                className="footer-button confirm-button"
                onClick={handleSavePreferences}
              >
                Confirm My Choices
              </button>
              <button 
                className="footer-button reject-button"
                onClick={handleRejectAll}
              >
                Reject All
              </button>
              <button 
                className="footer-button allow-button"
                onClick={handleAllowAll}
              >
                Allow All
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieSettingsModal;
