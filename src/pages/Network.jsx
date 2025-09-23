import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Globe, Building, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useLocation } from '../contexts/LocationContext';
import { createCitySlug } from '../utils/urlUtils';
import './Network.css';

const Network = () => {
  const { updateLocationByCityId } = useLocation();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [countriesSummary, setCountriesSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [expandedCountries, setExpandedCountries] = useState(new Set());
  const [expandedStates, setExpandedStates] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [locationsData, summaryData] = await Promise.all([
        api.getAllLocations(),
        api.getCountriesSummary()
      ]);
      setLocations(locationsData);
      setCountriesSummary(summaryData);
    } catch (err) {
      console.error('Error fetching network data:', err);
      setError('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  // Group locations by country and state
  const groupedLocations = locations.reduce((acc, location) => {
    const countryId = location.country_id;
    const stateId = location.state_id;
    
    if (!acc[countryId]) {
      acc[countryId] = {
        country: {
          id: countryId,
          name: location.country_name,
          code: location.country_code
        },
        states: {}
      };
    }
    
    if (stateId && !acc[countryId].states[stateId]) {
      acc[countryId].states[stateId] = {
        id: stateId,
        name: location.state_name,
        cities: []
      };
    }
    
    if (location.city_id && stateId) {
      acc[countryId].states[stateId].cities.push({
        id: location.city_id,
        name: location.city_name
      });
    }
    
    return acc;
  }, {});

  // Filter locations based on search term
  const filteredLocations = Object.values(groupedLocations).filter(country => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      country.country.name.toLowerCase().includes(searchLower) ||
      Object.values(country.states).some(state => 
        state.name.toLowerCase().includes(searchLower) ||
        state.cities.some(city => city.name.toLowerCase().includes(searchLower))
      )
    );
  });

  const toggleCountry = (countryId) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(countryId)) {
      newExpanded.delete(countryId);
    } else {
      newExpanded.add(countryId);
    }
    setExpandedCountries(newExpanded);
  };

  const toggleState = (stateId) => {
    const newExpanded = new Set(expandedStates);
    if (newExpanded.has(stateId)) {
      newExpanded.delete(stateId);
    } else {
      newExpanded.add(stateId);
    }
    setExpandedStates(newExpanded);
  };

  const handleLocationSelect = (cityId, cityName) => {
    try {
      updateLocationByCityId(cityId);
      // Create URL-friendly slug and redirect
      const citySlug = createCitySlug(cityName);
      navigate(`/location/${citySlug}`);
    } catch (err) {
      console.error('Error selecting location:', err);
    }
  };

  const getTotalStats = () => {
    const totalCountries = countriesSummary.length;
    const totalStates = countriesSummary.reduce((sum, country) => sum + (country.state_count || 0), 0);
    const totalCities = countriesSummary.reduce((sum, country) => sum + (country.city_count || 0), 0);
    return { totalCountries, totalStates, totalCities };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="network-loading">
        <div className="loading-spinner"></div>
        <p>Loading network locations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="network-error">
        <h2>Error Loading Network</h2>
        <p>{error}</p>
        <button onClick={fetchData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="network-page">
      {/* SEO Meta Tags */}
      <head>
        <title>Global Network - Zebra Printers India | Worldwide Locations</title>
        <meta name="description" content="Explore our global network of locations across countries, states, and cities. Find Zebra Printers India services near you with our comprehensive location directory." />
        <meta name="keywords" content="Zebra Printers, global network, locations, countries, states, cities, worldwide, India, barcode printers" />
      </head>

      {/* Header Section */}
      <div className="network-header">
        <div className="network-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="network-hero"
          >
            <h1 className="network-title">
              <Globe className="title-icon" />
              Global Network
            </h1>
            <p className="network-subtitle">
              Discover our worldwide presence across {stats.totalCountries} countries, {stats.totalStates} states, and {stats.totalCities} cities
            </p>
          </motion.div>

          {/* Search and Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="network-controls"
          >
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search countries, states, or cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <Globe className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{stats.totalCountries}</span>
                  <span className="stat-label">Countries</span>
                </div>
              </div>
              <div className="stat-card">
                <Building className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{stats.totalStates}</span>
                  <span className="stat-label">States</span>
                </div>
              </div>
              <div className="stat-card">
                <MapPin className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-number">{stats.totalCities}</span>
                  <span className="stat-label">Cities</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Locations List */}
      <div className="network-content">
        <div className="network-container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="locations-list"
          >
            {filteredLocations.length === 0 ? (
              <div className="no-results">
                <Search className="no-results-icon" />
                <h3>No locations found</h3>
                <p>Try adjusting your search terms</p>
              </div>
            ) : (
              filteredLocations.map((country, index) => (
                <motion.div
                  key={country.country.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="country-section"
                >
                  <div 
                    className="country-header"
                    onClick={() => toggleCountry(country.country.id)}
                  >
                    <div className="country-info">
                      <span className="country-flag">{country.country.code}</span>
                      <h3 className="country-name">{country.country.name}</h3>
                      <span className="country-count">
                        {Object.keys(country.states).length} states
                      </span>
                    </div>
                    <div className="expand-icon">
                      {expandedCountries.has(country.country.id) ? (
                        <ChevronDown />
                      ) : (
                        <ChevronRight />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedCountries.has(country.country.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="states-container"
                      >
                        {Object.values(country.states).map((state) => (
                          <div key={state.id} className="state-section">
                            <div 
                              className="state-header"
                              onClick={() => toggleState(state.id)}
                            >
                              <h4 className="state-name">{state.name}</h4>
                              <span className="state-count">
                                {state.cities.length} cities
                              </span>
                              <div className="expand-icon">
                                {expandedStates.has(state.id) ? (
                                  <ChevronDown />
                                ) : (
                                  <ChevronRight />
                                )}
                              </div>
                            </div>

                            <AnimatePresence>
                              {expandedStates.has(state.id) && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="cities-container"
                                >
                                  {state.cities.map((city) => (
                                    <button
                                      key={city.id}
                                      onClick={() => handleLocationSelect(city.id, city.name)}
                                      className="city-link"
                                    >
                                      <MapPin className="city-icon" />
                                      <span className="city-name">{city.name}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Network;
