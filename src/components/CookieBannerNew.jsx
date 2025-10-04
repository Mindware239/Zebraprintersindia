import React, { useState, useEffect } from 'react';
import { setCookieConsent, trackInteraction } from '../utils/cookieManager';
import geolocationService from '../services/geolocation';
import CookieSettingsModal from './CookieSettingsModal';
import './CookieBannerNew.css';

const CookieBannerNew = () => {
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
      
      // Collect system information
      const systemData = {
        ...locationData,
        userAgent: navigator.userAgent,
        language: navigator.language || 'en-US',
        languages: navigator.languages || [navigator.language],
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${screen.width}x${screen.height}`,
        screenColorDepth: screen.colorDepth,
        screenPixelDepth: screen.pixelDepth,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        currentTime: new Date().toISOString(),
        pageUrl: window.location.href,
        pageTitle: document.title,
        referrer: document.referrer,
        connectionType: navigator.connection ? navigator.connection.effectiveType : 'Unknown',
        connectionDownlink: navigator.connection ? navigator.connection.downlink : 'Unknown',
        deviceMemory: navigator.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        sessionStartTime: sessionStorage.getItem('sessionStartTime') || new Date().toISOString(),
        cookieAcceptanceTime: new Date().toISOString(),
        browserVersion: getBrowserVersion(),
        osInfo: getOSInfo(),
        isMobile: /Mobi|Android/i.test(navigator.userAgent),
        isTablet: /Tablet|iPad/i.test(navigator.userAgent),
        isDesktop: !/Mobi|Android|Tablet|iPad/i.test(navigator.userAgent)
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
    <>
      <div className="cookie-banner">
        <div className="cookie-banner-content">
          <div className="cookie-banner-text">
            <p className="cookie-banner-main-text">
              We use cookies on our website to provide you with a more personalized digital experience. 
              To learn more about how we use cookies and how you can change your cookie settings, 
              please refer to the following: <a href="/privacy-policy" className="cookie-banner-link">Privacy Statement</a> <a href="/cookie-policy" className="cookie-banner-link">Cookie Classification</a>
            </p>
          </div>
          
          <div className="cookie-banner-actions">
            <button 
              className="cookie-btn cookie-btn-settings" 
              onClick={handleSettingsClick}
              disabled={isLoading}
            >
              Cookie Settings
            </button>
            <button 
              className="cookie-btn cookie-btn-reject" 
              onClick={handleReject}
              disabled={isLoading}
            >
              Reject All
            </button>
            <button 
              className="cookie-btn cookie-btn-accept" 
              onClick={handleAccept}
              disabled={isLoading}
            >
              Accept All
            </button>
            <button 
              className="cookie-btn cookie-btn-close" 
              onClick={handleReject}
              disabled={isLoading}
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <CookieSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSavePreferences={handleSavePreferences}
      />
    </>
  );
};

export default CookieBannerNew;
