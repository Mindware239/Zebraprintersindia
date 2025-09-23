import React, { useState } from 'react';
import { MapPin, Search, Globe, Users, Building, Phone } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import LocationSelector from '../components/LocationSelector';

const LocationDemo = () => {
  const { currentLocation, getLocationString, getLocationForSEO } = useLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const seoData = getLocationForSEO();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Location-Based Content Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            This demo showcases how the location system works with dynamic content rendering,
            SEO optimization, and geo-targeted features.
          </p>
        </div>

        {/* Current Location Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <MapPin size={24} className="mr-2 text-blue-600" />
            Current Location Status
          </h2>
          
          {currentLocation ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detected Location</h3>
                <p className="text-gray-700 mb-4">{getLocationString()}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Globe size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      Country: {currentLocation.country.name} ({currentLocation.country.code})
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Building size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      State: {currentLocation.state.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      City: {currentLocation.city.name}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SEO Data Generated</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Page Title:</label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {seoData.title}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Meta Description:</label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {seoData.description}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Keywords:</label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {seoData.keywords}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No location detected. Please select your location below.</p>
            </div>
          )}
        </div>

        {/* Location Selector Demo */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Search size={24} className="mr-2 text-blue-600" />
            Location Selector Demo
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cascading Dropdowns */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cascading Dropdowns</h3>
              <LocationSelector
                onLocationChange={handleLocationChange}
                selectedCountry={currentLocation?.country}
                selectedState={currentLocation?.state}
                selectedCity={currentLocation?.city}
                className="mb-4"
              />
            </div>

            {/* Search Functionality */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Functionality</h3>
              <LocationSelector
                onLocationChange={handleLocationChange}
                showSearch={true}
                placeholder="Search for a city..."
                className="mb-4"
              />
            </div>
          </div>

          {selectedLocation && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Selected Location:</h4>
              <p className="text-blue-700">
                {selectedLocation.city.name}, {selectedLocation.state.name}, {selectedLocation.country.name}
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Content Examples */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Services Based on Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users size={20} className="mr-2 text-green-600" />
              Location-Specific Services
            </h3>
            
            {currentLocation ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Services available in {currentLocation.city.name}, {currentLocation.state.name}:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Local Zebra Printer Support</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>On-site Service Calls</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Local Training Programs</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Emergency Support</span>
                  </li>
                </ul>
              </div>
            ) : (
              <p className="text-gray-500">Select a location to see available services</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Phone size={20} className="mr-2 text-blue-600" />
              Local Contact Information
            </h3>
            
            {currentLocation ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Local Office:</label>
                  <p className="text-gray-600">
                    {currentLocation.city.name} Branch Office
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone:</label>
                  <p className="text-gray-600">+91 8527522688</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email:</label>
                  <p className="text-gray-600">gm@zebraprintersindia.com</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Service Area:</label>
                  <p className="text-gray-600">
                    {currentLocation.city.name} and surrounding areas
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a location to see contact information</p>
            )}
          </div>
        </div>

        {/* API Endpoints Demo */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Available API Endpoints</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Location Data:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GET /api/locations/countries</li>
                <li>• GET /api/locations/states/:countryId</li>
                <li>• GET /api/locations/cities/:stateId</li>
                <li>• GET /api/locations/city/:cityId</li>
                <li>• GET /api/locations/search?q=query&type=cities</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auto-location detection</li>
                <li>• Cascading dropdowns</li>
                <li>• Search functionality</li>
                <li>• SEO-friendly URLs</li>
                <li>• Dynamic content rendering</li>
                <li>• Geo-targeted pages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDemo;
