import React, { useEffect, useState } from 'react';
import { CookieManager, trackInteraction } from '../utils/cookieManager';

const PageTracker = ({ pageName = 'Unknown Page' }) => {
  const [startTime, setStartTime] = useState(null);
  const [interactions, setInteractions] = useState(0);
  const [cookieConsent, setCookieConsent] = useState(null);

  useEffect(() => {
    // Check cookie consent
    const consent = CookieManager.hasConsented();
    setCookieConsent(consent);
    
    if (consent === true) {
      // Start tracking
      const now = Date.now();
      setStartTime(now);
      
      // Track page visit
      trackInteraction('page_visit', {
        page: pageName,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });

      // Track page visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          trackInteraction('page_hidden', {
            page: pageName,
            timeSpent: Math.floor((Date.now() - now) / 1000)
          });
        } else {
          trackInteraction('page_visible', {
            page: pageName,
            timeSpent: Math.floor((Date.now() - now) / 1000)
          });
        }
      };

      // Track clicks and interactions
      const handleInteraction = (event) => {
        setInteractions(prev => prev + 1);
        trackInteraction('user_interaction', {
          page: pageName,
          type: event.type,
          target: event.target.tagName,
          timeSpent: Math.floor((Date.now() - now) / 1000)
        });
      };

      // Track scroll events (throttled)
      let scrollTimeout;
      const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          trackInteraction('page_scroll', {
            page: pageName,
            scrollY: window.scrollY,
            timeSpent: Math.floor((Date.now() - now) / 1000)
          });
        }, 1000);
      };

      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('click', handleInteraction);
      document.addEventListener('scroll', handleScroll);

      // Track page leave
      const handleBeforeUnload = () => {
        const timeSpent = Math.floor((Date.now() - now) / 1000);
        trackInteraction('page_leave', {
          page: pageName,
          timeSpent,
          interactions
        });

        // Send summary email if user spent significant time
        if (timeSpent > 30 && interactions > 3) {
          sendTrackingSummary(pageName, timeSpent, interactions);
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      // Cleanup
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('scroll', handleScroll);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [pageName, cookieConsent]);

  const sendTrackingSummary = async (page, timeSpent, interactions) => {
    try {
      const response = await fetch('/api/tracking/send-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: 'Anonymous User', // Could be enhanced to get from form data
          mobile: 'Not provided',
          email: 'Not provided',
          pageUrl: window.location.href,
          timeSpent,
          interactionsCount: interactions
        })
      });

      if (response.ok) {
        console.log('Tracking summary sent successfully');
      }
    } catch (error) {
      console.error('Error sending tracking summary:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default PageTracker;

