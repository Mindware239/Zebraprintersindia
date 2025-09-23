import React, { useState } from 'react';
import { MapPin, ChevronDown, X } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import LocationSelector from './LocationSelector';

const LocationBanner = ({ 
  showOnPages = ['/'], 
  className = "",
  variant = "banner" // 'banner' or 'dropdown'
}) => {
  const { currentLocation, updateLocation, updateLocationByCityId, getLocationString } = useLocation();
  const [showSelector, setShowSelector] = useState(false);

  const handleLocationChange = (location) => {
    if (location.city?.id) {
      updateLocationByCityId(location.city.id);
    } else {
      updateLocation(location);
    }
    setShowSelector(false);
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <MapPin size={16} className="text-gray-500" />
          <span className="text-sm text-gray-700">
            {currentLocation ? getLocationString() : 'Select Location'}
          </span>
          <ChevronDown size={16} className="text-gray-500" />
        </button>

        {showSelector && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Location</h3>
              <button
                onClick={() => setShowSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <LocationSelector
              onLocationChange={handleLocationChange}
              selectedCountry={currentLocation?.country}
              selectedState={currentLocation?.state}
              selectedCity={currentLocation?.city}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border-b border-blue-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-blue-800">
              <MapPin size={16} className="mr-2" />
              <span className="text-sm font-medium">
                {currentLocation ? `Serving ${getLocationString()}` : 'Select your location for local services'}
              </span>
            </div>
            {currentLocation && (
              <div className="text-sm text-blue-600">
                • Local support available
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {currentLocation ? (
              <button
                onClick={() => setShowSelector(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Change Location
              </button>
            ) : (
              <button
                onClick={() => setShowSelector(true)}
                className="px-4 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select Location
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Location Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Your Location</h3>
                <button
                  onClick={() => setShowSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <LocationSelector
                onLocationChange={handleLocationChange}
                selectedCountry={currentLocation?.country}
                selectedState={currentLocation?.state}
                selectedCity={currentLocation?.city}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationBanner;
