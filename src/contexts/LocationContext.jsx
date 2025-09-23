import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationData, setLocationData] = useState({
    countries: [],
    states: [],
    cities: []
  });
  const [seoData, setSeoData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-detect user location on mount
  useEffect(() => {
    detectUserLocation();
  }, []);

  // Load SEO and content data when location changes
  useEffect(() => {
    if (currentLocation?.city?.id) {
      loadLocationData(currentLocation.city.id);
    }
  }, [currentLocation]);

  const detectUserLocation = async () => {
    try {
      // Try to get location from browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await reverseGeocode(latitude, longitude);
          },
          (error) => {
            console.log('Geolocation error:', error);
            // Fallback to IP-based location detection
            detectLocationByIP();
          }
        );
      } else {
        // Fallback to IP-based location detection
        detectLocationByIP();
      }
    } catch (err) {
      console.error('Location detection error:', err);
      detectLocationByIP();
    }
  };

  const detectLocationByIP = async () => {
    try {
      // This would typically use a service like ipapi.co or similar
      // For now, we'll set a default location
      setCurrentLocation({
        country: { id: 101, name: 'India', code: 'IN' },
        state: { id: 22, name: 'Maharashtra' },
        city: { id: 859, name: 'Mumbai' }
      });
    } catch (err) {
      console.error('IP location detection error:', err);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      // This would typically use a reverse geocoding service
      // For now, we'll set a default location
      setCurrentLocation({
        country: { id: 101, name: 'India', code: 'IN' },
        state: { id: 22, name: 'Maharashtra' },
        city: { id: 859, name: 'Mumbai' }
      });
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  };

  const loadLocationData = async (cityId) => {
    try {
      setLoading(true);
      const [seoResponse, contentResponse] = await Promise.all([
        apiService.getLocationSEO(cityId),
        apiService.getLocationContent(cityId)
      ]);
      setSeoData(seoResponse);
      setContentData(contentResponse);
    } catch (err) {
      console.error('Error loading location data:', err);
      setError('Failed to load location data');
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCountries();
      setLocationData(prev => ({ ...prev, countries: data }));
      return data;
    } catch (err) {
      console.error('Error loading countries:', err);
      setError('Failed to load countries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadStates = async (countryId) => {
    try {
      setLoading(true);
      const data = await apiService.getStates(countryId);
      setLocationData(prev => ({ ...prev, states: data }));
      return data;
    } catch (err) {
      console.error('Error loading states:', err);
      setError('Failed to load states');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (stateId) => {
    try {
      setLoading(true);
      const data = await apiService.getCities(stateId);
      setLocationData(prev => ({ ...prev, cities: data }));
      return data;
    } catch (err) {
      console.error('Error loading cities:', err);
      setError('Failed to load cities');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (location) => {
    setCurrentLocation(location);
    // Store in localStorage for persistence
    localStorage.setItem('userLocation', JSON.stringify(location));
    
    // Load location-specific data
    if (location.city?.id) {
      await loadLocationData(location.city.id);
    }
  };

  const updateLocationByCityId = async (cityId) => {
    try {
      setLoading(true);
      const [seoResponse, contentResponse] = await Promise.all([
        apiService.getLocationSEO(cityId),
        apiService.getLocationContent(cityId)
      ]);
      
      const location = {
        country: { 
          id: seoResponse.location.country_id, 
          name: seoResponse.location.country, 
          code: seoResponse.location.country_code 
        },
        state: { 
          id: seoResponse.location.state_id, 
          name: seoResponse.location.state 
        },
        city: { 
          id: seoResponse.location.city_id, 
          name: seoResponse.location.city 
        }
      };
      
      setCurrentLocation(location);
      setSeoData(seoResponse);
      setContentData(contentResponse);
      
      // Store in localStorage for persistence
      localStorage.setItem('userLocation', JSON.stringify(location));
      
    } catch (err) {
      console.error('Error updating location by city ID:', err);
      setError('Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const getLocationString = () => {
    if (!currentLocation) return '';
    const { country, state, city } = currentLocation;
    return `${city.name}, ${state.name}, ${country.name}`;
  };

  const getLocationForSEO = () => {
    // Don't return location-specific SEO for product pages
    if (window.location.pathname.includes('/product/')) {
      return null;
    }
    
    if (seoData) {
      return seoData.seo;
    }
    
    if (!currentLocation) return null;
    const { country, state, city } = currentLocation;
    return {
      title: `Zebra Printers in ${city.name}, ${state.name}, ${country.name}`,
      description: `Find the best Zebra printers, scanners, and barcode solutions in ${city.name}, ${state.name}, ${country.name}. Professional barcode technology solutions.`,
      keywords: `zebra printers ${city.name}, barcode scanners ${state.name}, ${country.name}, zebra solutions ${city.name}`,
      location: `${city.name}, ${state.name}, ${country.name}`
    };
  };

  const getLocationContent = () => {
    if (contentData) {
      return contentData.content;
    }
    
    if (!currentLocation) return {};
    const { country, state, city } = currentLocation;
    return {
      banner_title: `Zebra Barcode Solutions in ${city.name}`,
      banner_subtitle: `Serving ${city.name} with premium barcode printing technology`,
      hero_title: `Professional Barcode Printers in ${city.name}, ${state.name}`,
      hero_subtitle: `Transform your business operations with our cutting-edge Zebra barcode printing solutions designed for ${city.name}'s dynamic business environment.`,
      services_title: `Our Services in ${city.name}`,
      services_subtitle: `Comprehensive barcode solutions tailored for ${city.name} businesses`,
      contact_title: `Get in Touch - ${city.name} Office`,
      contact_subtitle: `Ready to upgrade your barcode printing system? Contact our ${city.name} team today.`,
      testimonials_title: `What ${city.name} Businesses Say`,
      testimonials_subtitle: `Hear from satisfied customers across ${city.name} and ${state.name}`
    };
  };

  // Load location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setCurrentLocation(location);
        if (location.city?.id) {
          loadLocationData(location.city.id);
        }
      } catch (err) {
        console.error('Error parsing saved location:', err);
      }
    }
  }, []);

  const value = {
    currentLocation,
    locationData,
    seoData,
    contentData,
    loading,
    error,
    updateLocation,
    updateLocationByCityId,
    loadCountries,
    loadStates,
    loadCities,
    getLocationString,
    getLocationForSEO,
    getLocationContent,
    detectUserLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};