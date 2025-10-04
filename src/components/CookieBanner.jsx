import React, { useState, useEffect } from 'react';
import { setCookieConsent, trackInteraction } from '../utils/cookieManager';
import geolocationService from '../services/geolocation';
import CookieSettingsModal from './CookieSettingsModal';
import './CookieBanner.css';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = async () => {
    setIsLoading(true);
    
    try {
      // Set cookie consent
      setCookieConsent(true);
      
      // Collect comprehensive user data
      const userData = await collectUserData();
      
      // Send tracking data to backend
      await sendCookieAcceptanceData(userData);
      
      // Send welcome email to user if they provide email
      await sendWelcomeEmailToUser(userData);
      
      // Hide banner
      setIsVisible(false);
      
      // Track the acceptance event
      await trackInteraction('cookie_accepted', {
        timestamp: new Date().toISOString(),
        userData: userData
      });
      
      console.log('✅ Cookies accepted, user data collected:', userData);
      
    } catch (error) {
      console.error('Error handling cookie acceptance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      // Set cookie consent to false
      setCookieConsent(false);
      
      // Hide banner
      setIsVisible(false);
      
      // Track the rejection (minimal data)
      await trackInteraction('cookie_rejected', {
        timestamp: new Date().toISOString()
      });
      
      console.log('❌ Cookies rejected');
      
    } catch (error) {
      console.error('Error handling cookie rejection:', error);
    }
  };

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  const handleSavePreferences = async (preferences) => {
    try {
      // Save preferences to localStorage
      localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
      
      // Set consent based on preferences
      const hasAnyConsent = Object.values(preferences).some(Boolean);
      setCookieConsent(hasAnyConsent);
      
      if (hasAnyConsent) {
        // Collect and send user data if any consent is given
        const userData = await collectUserData();
        await sendCookieAcceptanceData(userData);
      }
      
      // Hide banner
      setIsVisible(false);
      
      console.log('Cookie preferences saved:', preferences);
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  };

  const collectUserData = async () => {
    try {
      // Get geolocation data
      const locationData = await geolocationService.collectUserData();
      
      // Collect comprehensive system data
      const systemData = {
        // Browser Information
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        
        // Screen Information
        screenResolution: `${screen.width}x${screen.height}`,
        screenColorDepth: screen.colorDepth,
        screenPixelDepth: screen.pixelDepth,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        
        // Time Information
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        currentTime: new Date().toISOString(),
        
        // Location Data
        detectedCountry: locationData.country || 'Unknown',
        detectedCity: locationData.city || 'Unknown',
        detectedRegion: locationData.region || 'Unknown',
        countryCode: locationData.countryCode || 'Unknown',
        isGeolocationEnabled: locationData.isGeolocationEnabled || false,
        
        // Page Information
        pageUrl: window.location.href,
        pageTitle: document.title,
        referrer: document.referrer || 'Direct visit',
        
        // Technical Information
        connectionType: navigator.connection?.effectiveType || 'Unknown',
        connectionDownlink: navigator.connection?.downlink || 'Unknown',
        deviceMemory: navigator.deviceMemory || 'Unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
        
        // Session Information
        sessionStartTime: new Date().toISOString(),
        cookieAcceptanceTime: new Date().toISOString(),
        
        // Additional Metadata
        browserVersion: getBrowserVersion(),
        osInfo: getOSInfo(),
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTablet: /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent),
        isDesktop: !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
      };
      
      return systemData;
      
    } catch (error) {
      console.error('Error collecting user data:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        pageUrl: window.location.href
      };
    }
  };

  const sendCookieAcceptanceData = async (userData) => {
    try {
      const response = await fetch('/api/cookie-acceptance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cookie_accepted',
          userData: userData,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Cookie acceptance data sent successfully');
      } else {
        console.error('❌ Failed to send cookie acceptance data');
      }
    } catch (error) {
      console.error('❌ Error sending cookie acceptance data:', error);
    }
  };

  const sendWelcomeEmailToUser = async (userData) => {
    try {
      // Check if user wants to receive updates (you can add a checkbox for this)
      const response = await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: userData,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Welcome email sent to user');
      } else {
        console.log('ℹ️ Welcome email not sent (user may not have provided email)');
      }
    } catch (error) {
      console.log('ℹ️ Welcome email not sent:', error.message);
    }
  };

  const getBrowserVersion = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getOSInfo = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner">
        <div className="cookie-banner-content">
          <div className="cookie-banner-header">
            <h3>🍪 We use cookies to enhance your experience</h3>
            <button 
              className="cookie-banner-close" 
              onClick={handleReject}
              disabled={isLoading}
            >
              ×
            </button>
          </div>
          
          <div className="cookie-banner-body">
            <p>
              We use cookies to improve your browsing experience, analyze site traffic, 
              and personalize content. By clicking "Accept", you consent to our use of cookies. 
              You can also choose to reject non-essential cookies.
            </p>
            
            <div className="cookie-features">
              <div className="cookie-feature">
                <span className="cookie-icon">🛡️</span>
                <span>Secure & Encrypted</span>
              </div>
              <div className="cookie-feature">
                <span className="cookie-icon">⚙️</span>
                <span>Essential & Analytics</span>
              </div>
              <div className="cookie-feature">
                <span className="cookie-icon">🔒</span>
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
          
          <div className="cookie-banner-actions">
            <button 
              className="cookie-btn cookie-btn-reject" 
              onClick={handleReject}
              disabled={isLoading}
            >
              Reject
            </button>
            <button 
              className="cookie-btn cookie-btn-accept" 
              onClick={handleAccept}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Accepting...
                </>
              ) : (
                'Accept Cookies'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
