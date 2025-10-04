// Cookie Management Utility
export class CookieManager {
  static getConsent() {
    try {
      const consent = localStorage.getItem('cookieConsent');
      if (!consent) return null;
      
      const consentData = JSON.parse(consent);
      
      // Check if consent has expired
      if (new Date() > new Date(consentData.expires)) {
        this.clearConsent();
        return null;
      }
      
      return consentData;
    } catch (error) {
      console.error('Error reading cookie consent:', error);
      return null;
    }
  }

  static hasConsented() {
    const consent = this.getConsent();
    return consent ? consent.accepted : null;
  }

  static setConsent(accepted) {
    const consentData = {
      accepted,
      timestamp: new Date().toISOString(),
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };
    
    try {
      localStorage.setItem('cookieConsent', JSON.stringify(consentData));
      return true;
    } catch (error) {
      console.error('Error setting cookie consent:', error);
      return false;
    }
  }

  static clearConsent() {
    try {
      localStorage.removeItem('cookieConsent');
      return true;
    } catch (error) {
      console.error('Error clearing cookie consent:', error);
      return false;
    }
  }

  static setCookie(name, value, days = 365) {
    const consent = this.hasConsented();
    if (consent === false) {
      // User rejected cookies, don't set non-essential cookies
      return false;
    }
    
    if (consent === true || this.isEssentialCookie(name)) {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      return true;
    }
    
    return false;
  }

  static getCookie(name) {
    const consent = this.hasConsented();
    if (consent === false && !this.isEssentialCookie(name)) {
      return null;
    }
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  static deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  static isEssentialCookie(name) {
    const essentialCookies = [
      'cookieConsent',
      'sessionId',
      'csrfToken',
      'userPreferences'
    ];
    return essentialCookies.includes(name);
  }

  static async trackUserInteraction(action, data = {}) {
    const consent = this.hasConsented();
    if (consent !== true) return false;

    const trackingData = {
      action,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      pageTitle: document.title
    };

    // Send to server for database storage and email
    try {
      const response = await fetch('/api/tracking/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      });

      if (response.ok) {
        return true;
      } else {
        console.error('Failed to track interaction:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error tracking user interaction:', error);
      return false;
    }
  }

  static async getTrackingData() {
    const consent = this.hasConsented();
    if (consent !== true) return null;

    try {
      const response = await fetch('/api/tracking/data');
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error getting tracking data:', error);
      return null;
    }
  }

  static async clearTrackingData() {
    try {
      const response = await fetch('/api/tracking/clear', { method: 'DELETE' });
      return response.ok;
    } catch (error) {
      console.error('Error clearing tracking data:', error);
      return false;
    }
  }
}

// Utility functions for easy access
export const getCookieConsent = () => CookieManager.getConsent();
export const hasCookieConsent = () => CookieManager.hasConsented();
export const setCookieConsent = (accepted) => CookieManager.setConsent(accepted);
export const trackInteraction = (action, data) => CookieManager.trackUserInteraction(action, data);

