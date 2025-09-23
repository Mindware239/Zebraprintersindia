import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Search } from 'lucide-react';
import apiService from '../services/api';

const LocationSelector = ({ 
  onLocationChange, 
  selectedCountry = null, 
  selectedState = null, 
  selectedCity = null,
  showSearch = false,
  placeholder = "Select your location",
  className = ""
}) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Selected values
  const [selectedCountryId, setSelectedCountryId] = useState(selectedCountry?.id || '');
  const [selectedStateId, setSelectedStateId] = useState(selectedState?.id || '');
  const [selectedCityId, setSelectedCityId] = useState(selectedCity?.id || '');
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountryId) {
      loadStates(selectedCountryId);
      setSelectedStateId('');
      setSelectedCityId('');
      setStates([]);
      setCities([]);
    }
  }, [selectedCountryId]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedStateId) {
      loadCities(selectedStateId);
      setSelectedCityId('');
      setCities([]);
    }
  }, [selectedStateId]);

  // Notify parent component when location changes
  useEffect(() => {
    if (selectedCountryId && selectedStateId && selectedCityId) {
      const country = countries.find(c => c.id == selectedCountryId);
      const state = states.find(s => s.id == selectedStateId);
      const city = cities.find(c => c.id == selectedCityId);
      
      if (country && state && city) {
        onLocationChange({
          country: { id: country.id, name: country.name, code: country.sortname },
          state: { id: state.id, name: state.name },
          city: { id: city.id, name: city.name }
        });
      }
    }
  }, [selectedCountryId, selectedStateId, selectedCityId, countries, states, cities]);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCountries();
      setCountries(data);
    } catch (err) {
      console.error('Error loading countries:', err);
      setError('Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  const loadStates = async (countryId) => {
    try {
      setLoading(true);
      const data = await apiService.getStates(countryId);
      setStates(data);
    } catch (err) {
      console.error('Error loading states:', err);
      setError('Failed to load states');
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (stateId) => {
    try {
      setLoading(true);
      const data = await apiService.getCities(stateId);
      setCities(data);
    } catch (err) {
      console.error('Error loading cities:', err);
      setError('Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await apiService.searchLocations(query, 'cities');
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Error searching locations:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchResultClick = (result) => {
    // Find the country and state for this city
    const country = countries.find(c => c.name === result.country);
    const state = states.find(s => s.name === result.state && s.country === result.country);
    
    if (country) {
      setSelectedCountryId(country.id);
      if (state) {
        setSelectedStateId(state.id);
        setSelectedCityId(result.id);
      }
    }
    
    setSearchQuery(result.name);
    setShowSearchResults(false);
  };

  const getDisplayText = () => {
    if (selectedCountryId && selectedStateId && selectedCityId) {
      const country = countries.find(c => c.id == selectedCountryId);
      const state = states.find(s => s.id == selectedStateId);
      const city = cities.find(c => c.id == selectedCityId);
      
      if (country && state && city) {
        return `${city.name}, ${state.name}, ${country.name}`;
      }
    }
    return placeholder;
  };

  if (showSearch) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search for a city..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {showSearchResults && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSearchResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm text-gray-500">{result.state}, {result.country}</div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Country Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin size={16} className="inline mr-1" />
          Country
        </label>
        <select
          value={selectedCountryId}
          onChange={(e) => setSelectedCountryId(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name} ({country.sortname})
            </option>
          ))}
        </select>
      </div>

      {/* State Selector */}
      {selectedCountryId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State/Province
          </label>
          <select
            value={selectedStateId}
            onChange={(e) => setSelectedStateId(e.target.value)}
            disabled={loading || states.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">Select State/Province</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* City Selector */}
      {selectedStateId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            disabled={loading || cities.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Location Display */}
      {selectedCountryId && selectedStateId && selectedCityId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-900">Selected Location:</div>
          <div className="text-blue-700">{getDisplayText()}</div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
