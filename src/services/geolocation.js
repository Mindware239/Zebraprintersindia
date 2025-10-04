// Geolocation service for automatic country detection
class GeolocationService {
  constructor() {
    this.country = null;
    this.city = null;
    this.region = null;
    this.timezone = null;
    this.language = null;
    this.userAgent = null;
    this.ipAddress = null;
  }

  // Get user's browser language
  getUserLanguage() {
    return navigator.language || navigator.userLanguage || 'en-US';
  }

  // Get user's timezone
  getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  // Get user agent information
  getUserAgent() {
    return navigator.userAgent;
  }

  // Detect country from timezone
  getCountryFromTimezone(timezone) {
    const timezoneToCountry = {
      'Asia/Kolkata': 'India',
      'Asia/Kathmandu': 'Nepal',
      'Asia/Dhaka': 'Bangladesh',
      'Asia/Karachi': 'Pakistan',
      'Asia/Colombo': 'Sri Lanka',
      'America/New_York': 'United States',
      'America/Los_Angeles': 'United States',
      'Europe/London': 'United Kingdom',
      'Europe/Paris': 'France',
      'Europe/Berlin': 'Germany',
      'Asia/Tokyo': 'Japan',
      'Asia/Shanghai': 'China',
      'Asia/Singapore': 'Singapore',
      'Australia/Sydney': 'Australia',
      'Asia/Dubai': 'United Arab Emirates',
      'Asia/Riyadh': 'Saudi Arabia',
      'Africa/Cairo': 'Egypt',
      'America/Sao_Paulo': 'Brazil',
      'America/Mexico_City': 'Mexico',
      'Asia/Bangkok': 'Thailand',
      'Asia/Jakarta': 'Indonesia',
      'Asia/Manila': 'Philippines',
      'Asia/Seoul': 'South Korea',
      'Europe/Moscow': 'Russia',
      'Asia/Kolkata': 'India'
    };
    
    return timezoneToCountry[timezone] || 'Unknown';
  }

  // Detect country from language
  getCountryFromLanguage(language) {
    const languageToCountry = {
      'hi-IN': 'India',
      'ne-NP': 'Nepal',
      'bn-BD': 'Bangladesh',
      'ur-PK': 'Pakistan',
      'si-LK': 'Sri Lanka',
      'en-US': 'United States',
      'en-GB': 'United Kingdom',
      'fr-FR': 'France',
      'de-DE': 'Germany',
      'ja-JP': 'Japan',
      'zh-CN': 'China',
      'ko-KR': 'South Korea',
      'es-ES': 'Spain',
      'pt-BR': 'Brazil',
      'ar-SA': 'Saudi Arabia',
      'th-TH': 'Thailand',
      'id-ID': 'Indonesia'
    };
    
    return languageToCountry[language] || 'Unknown';
  }

  // Get city from timezone
  getCityFromTimezone(timezone) {
    const timezoneToCity = {
      'Asia/Kolkata': 'New Delhi',
      'Asia/Kathmandu': 'Kathmandu',
      'Asia/Dhaka': 'Dhaka',
      'Asia/Karachi': 'Karachi',
      'Asia/Colombo': 'Colombo',
      'America/New_York': 'New York',
      'America/Los_Angeles': 'Los Angeles',
      'Europe/London': 'London',
      'Europe/Paris': 'Paris',
      'Europe/Berlin': 'Berlin',
      'Asia/Tokyo': 'Tokyo',
      'Asia/Shanghai': 'Shanghai',
      'Asia/Singapore': 'Singapore',
      'Australia/Sydney': 'Sydney',
      'Asia/Dubai': 'Dubai',
      'Asia/Riyadh': 'Riyadh',
      'Africa/Cairo': 'Cairo',
      'America/Sao_Paulo': 'São Paulo',
      'America/Mexico_City': 'Mexico City',
      'Asia/Bangkok': 'Bangkok'
    };
    
    return timezoneToCity[timezone] || 'Unknown';
  }

  // Get region from timezone
  getRegionFromTimezone(timezone) {
    const timezoneToRegion = {
      'Asia/Kolkata': 'Delhi',
      'Asia/Kathmandu': 'Bagmati Pradesh',
      'Asia/Dhaka': 'Dhaka Division',
      'Asia/Karachi': 'Sindh',
      'Asia/Colombo': 'Western Province',
      'America/New_York': 'New York',
      'America/Los_Angeles': 'California',
      'Europe/London': 'England',
      'Europe/Paris': 'Île-de-France',
      'Europe/Berlin': 'Berlin',
      'Asia/Tokyo': 'Tokyo',
      'Asia/Shanghai': 'Shanghai',
      'Asia/Singapore': 'Singapore',
      'Australia/Sydney': 'New South Wales',
      'Asia/Dubai': 'Dubai',
      'Asia/Riyadh': 'Riyadh Province',
      'Africa/Cairo': 'Cairo',
      'America/Sao_Paulo': 'São Paulo',
      'America/Mexico_City': 'Mexico City',
      'Asia/Bangkok': 'Bangkok'
    };
    
    return timezoneToRegion[timezone] || 'Unknown';
  }

  // Get country code from timezone
  getCountryCodeFromTimezone(timezone) {
    const timezoneToCountryCode = {
      'Asia/Kolkata': 'IN',
      'Asia/Kathmandu': 'NP',
      'Asia/Dhaka': 'BD',
      'Asia/Karachi': 'PK',
      'Asia/Colombo': 'LK',
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Asia/Tokyo': 'JP',
      'Asia/Shanghai': 'CN',
      'Asia/Singapore': 'SG',
      'Australia/Sydney': 'AU',
      'Asia/Dubai': 'AE',
      'Asia/Riyadh': 'SA',
      'Africa/Cairo': 'EG',
      'America/Sao_Paulo': 'BR',
      'America/Mexico_City': 'MX',
      'Asia/Bangkok': 'TH'
    };
    
    return timezoneToCountryCode[timezone] || 'Unknown';
  }

  // Get geolocation data (if permission granted)
  async getGeolocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000
        }
      );
    });
  }

  // Get user's IP-based location (fallback)
  async getIPLocation() {
    try {
      // Try multiple IP geolocation services for better accuracy
      const services = [
        'https://ipapi.co/json/',
        'https://ipinfo.io/json',
        'https://api.ipify.org?format=json'
      ];
      
      for (const service of services) {
        try {
          console.log('🌍 Fetching location from:', service);
          const response = await fetch(service, { 
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            timeout: 10000
          });
          
          if (!response.ok) {
            console.log('Service response not OK:', response.status);
            continue;
          }
          
          const data = await response.json();
          console.log('📍 Raw location data received:', data);
          
          // Parse data based on service format
          let locationData;
          if (service.includes('ipapi.co')) {
            locationData = {
              country: data.country_name || data.country || 'Unknown',
              city: data.city || 'Unknown',
              region: data.region || data.region_name || 'Unknown',
              ip: data.ip || 'Unknown',
              timezone: data.timezone || 'Unknown',
              country_code: data.country_code || 'Unknown'
            };
          } else if (service.includes('ipinfo.io')) {
            locationData = {
              country: data.country || 'Unknown',
              city: data.city || 'Unknown',
              region: data.region || 'Unknown',
              ip: data.ip || 'Unknown',
              timezone: data.timezone || 'Unknown',
              country_code: data.country || 'Unknown'
            };
          } else {
            // For ipify, we only get IP, so use browser timezone
            const timezone = this.getUserTimezone();
            const countryFromTimezone = this.getCountryFromTimezone(timezone);
            locationData = {
              country: countryFromTimezone,
              city: this.getCityFromTimezone(timezone),
              region: this.getRegionFromTimezone(timezone),
              ip: data.ip || 'Unknown',
              timezone: timezone,
              country_code: this.getCountryCodeFromTimezone(timezone)
            };
          }
          
          console.log('✅ Processed location data:', locationData);
          
          // Validate that we got real data (not dummy)
          if (locationData.country && locationData.country !== 'Unknown') {
            return locationData;
          }
          
        } catch (serviceError) {
          console.log('Service failed:', service, serviceError.message);
          continue;
        }
      }
      
      // If all services fail, use browser timezone
      console.log('⚠️ All IP services failed, using browser timezone');
      const timezone = this.getUserTimezone();
      const countryFromTimezone = this.getCountryFromTimezone(timezone);
      
      // For localhost, always use timezone-based detection
      return {
        country: countryFromTimezone,
        city: this.getCityFromTimezone(timezone),
        region: this.getRegionFromTimezone(timezone),
        ip: 'Local/Localhost',
        timezone: timezone,
        country_code: this.getCountryCodeFromTimezone(timezone)
      };
      
    } catch (error) {
      console.error('❌ IP location error:', error);
      return null;
    }
  }

  // Collect all user data
  async collectUserData() {
    try {
      // Get browser information
      const language = this.getUserLanguage();
      const timezone = this.getUserTimezone();
      const userAgent = this.getUserAgent();
      
      // Try to get IP-based location
      const ipLocation = await this.getIPLocation();
      
      // Determine country with better fallback logic
      let country = 'Unknown';
      let city = 'Unknown';
      let region = 'Unknown';
      let countryCode = 'Unknown';
      
      if (ipLocation && ipLocation.country && ipLocation.country !== 'Unknown') {
        // Use IP location data if available and valid
        country = ipLocation.country;
        city = ipLocation.city || this.getCityFromTimezone(timezone);
        region = ipLocation.region || this.getRegionFromTimezone(timezone);
        countryCode = ipLocation.country_code || this.getCountryCodeFromTimezone(timezone);
      } else {
        // Fallback to timezone/language detection
        const timezoneCountry = this.getCountryFromTimezone(timezone);
        const languageCountry = this.getCountryFromLanguage(language);
        
        if (timezoneCountry !== 'Unknown') {
          country = timezoneCountry;
          city = this.getCityFromTimezone(timezone);
          region = this.getRegionFromTimezone(timezone);
          countryCode = this.getCountryCodeFromTimezone(timezone);
        } else if (languageCountry !== 'Unknown') {
          country = languageCountry;
          city = this.getCityFromTimezone(timezone);
          region = this.getRegionFromTimezone(timezone);
          countryCode = this.getCountryCodeFromTimezone(timezone);
        }
      }

      return {
        detectedCountry: country,
        detectedCity: city,
        detectedRegion: region,
        country: country,
        city: city,
        region: region,
        timezone: timezone,
        language: language,
        userAgent: userAgent,
        ipAddress: ipLocation?.ip || 'Unknown',
        countryCode: countryCode,
        timestamp: new Date().toISOString(),
        isGeolocationEnabled: navigator.geolocation ? true : false
      };
    } catch (error) {
      console.error('Error collecting user data:', error);
      const timezone = this.getUserTimezone();
      const language = this.getUserLanguage();
      
      return {
        detectedCountry: this.getCountryFromTimezone(timezone),
        detectedCity: this.getCityFromTimezone(timezone),
        detectedRegion: this.getRegionFromTimezone(timezone),
        country: this.getCountryFromTimezone(timezone),
        city: this.getCityFromTimezone(timezone),
        region: this.getRegionFromTimezone(timezone),
        timezone: timezone,
        language: language,
        userAgent: this.getUserAgent(),
        ipAddress: 'Unknown',
        countryCode: this.getCountryCodeFromTimezone(timezone),
        timestamp: new Date().toISOString(),
        isGeolocationEnabled: false,
        error: error.message
      };
    }
  }

  // Store user data in localStorage
  storeUserData(userData) {
    try {
      localStorage.setItem('userLocationData', JSON.stringify(userData));
      localStorage.setItem('userLocationTimestamp', Date.now().toString());
      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  }

  // Get stored user data
  getStoredUserData() {
    try {
      const data = localStorage.getItem('userLocationData');
      const timestamp = localStorage.getItem('userLocationTimestamp');
      
      if (data && timestamp) {
        // Check if data is less than 1 hour old
        const dataAge = Date.now() - parseInt(timestamp);
        if (dataAge < 3600000) { // 1 hour
          return JSON.parse(data);
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting stored user data:', error);
      return null;
    }
  }
}

export default new GeolocationService();
