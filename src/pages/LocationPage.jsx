import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Phone, Mail, Clock, Globe } from 'lucide-react';
import apiService from '../services/api';
import LocationSelector from '../components/LocationSelector';
import { parseCitySlug, createCitySlug } from '../utils/urlUtils';

const LocationPage = () => {
  const { citySlug } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  useEffect(() => {
    if (citySlug) {
      loadLocationDetailsBySlug(citySlug);
    } else {
      setLoading(false);
    }
  }, [citySlug]);

  const loadLocationDetailsBySlug = async (slug) => {
    try {
      setLoading(true);
      console.log('Loading location for slug:', slug);
      const data = await apiService.getLocationSEOBySlug(slug);
      console.log('Location data received:', data);
      
      if (data && data.location) {
        const locationData = {
          id: data.location.id,
          name: data.location.city,
          state: data.location.state,
          country: data.location.country,
          state_name: data.location.state,
          country_name: data.location.country,
          country_code: data.location.country_code
        };
        console.log('Setting location:', locationData);
        setLocation(locationData);
      } else {
        console.error('No location data found in response:', data);
        setError('Location not found');
      }
    } catch (err) {
      console.error('Error loading location details:', err);
      setError('Failed to load location details');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (newLocation) => {
    setLocation({
      id: newLocation.city.id,
      name: newLocation.city.name,
      state: newLocation.state.name,
      country: newLocation.country.name,
      state_name: newLocation.state.name,
      country_name: newLocation.country.name,
      country_code: newLocation.country.code
    });
    setShowLocationSelector(false);
    
    // Update URL with city slug
    const citySlug = createCitySlug(newLocation.city.name);
    navigate(`/location/${citySlug}`, { replace: true });
  };

  const getLocationContent = () => {
    if (!location) {
      console.log('No location data available for content generation');
      return null;
    }

    console.log('Generating content for location:', location);
    const cityName = location.name;
    const stateName = location.state_name;
    const countryName = location.country_name;
    
    console.log('Content variables:', { cityName, stateName, countryName });

    return {
      title: `Zebra Printers & Barcode Solutions in ${cityName}, ${stateName}`,
      description: `Professional Zebra printer and barcode scanner solutions in ${cityName}, ${stateName}, ${countryName}. Expert support and service for all your barcode technology needs.`,
      services: [
        'Zebra Printer Sales & Service',
        'Barcode Scanner Solutions',
        'Label & Ribbon Supplies',
        'Technical Support & Training',
        'Custom Barcode Solutions',
        'Maintenance & Repairs'
      ],
      contactInfo: {
        phone: '+91 8527522688',
        email: 'gm@zebraprintersindia.com',
        address: `${cityName}, ${stateName}, ${countryName}`,
        hours: 'Mon-Fri: 9:00 AM - 6:00 PM'
      },
      features: [
        {
          title: 'Local Expertise',
          description: `Our team in ${cityName} understands the local business needs and provides tailored solutions.`
        },
        {
          title: 'Quick Service',
          description: `Fast response times for service calls and support in the ${cityName} area.`
        },
        {
          title: 'Quality Products',
          description: 'Only genuine Zebra products with full warranty and support.'
        },
        {
          title: 'Training & Support',
          description: `Comprehensive training programs for businesses in ${cityName} and surrounding areas.`
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading location details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MapPin size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Location</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const content = getLocationContent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Home
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center text-gray-700">
                <MapPin size={20} className="mr-2" />
                <span className="font-medium">
                  {location ? `${location.name}, ${location.state_name}` : 'Select Location'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowLocationSelector(!showLocationSelector)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Change Location
            </button>
          </div>
        </div>
      </div>

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Location</h3>
              <LocationSelector
                onLocationChange={handleLocationChange}
                className="mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLocationSelector(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {content && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg text-white p-8 mb-8">
            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
            <p className="text-xl text-blue-100 mb-6">{content.description}</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <Phone size={20} className="mr-2" />
                <span>{content.contactInfo.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail size={20} className="mr-2" />
                <span>{content.contactInfo.email}</span>
              </div>
              <div className="flex items-center">
                <Clock size={20} className="mr-2" />
                <span>{content.contactInfo.hours}</span>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Services</h2>
              <ul className="space-y-3">
                {content.services.map((service, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin size={20} className="text-gray-400 mr-3 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Address</div>
                    <div className="text-gray-600">{content.contactInfo.address}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone size={20} className="text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Phone</div>
                    <div className="text-gray-600">{content.contactInfo.phone}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail size={20} className="text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">{content.contactInfo.email}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock size={20} className="text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Business Hours</div>
                    <div className="text-gray-600">{content.contactInfo.hours}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Why Choose Us in {location.name}?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe size={24} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Location Selected */}
      {!location && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <MapPin size={64} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Your Location</h2>
            <p className="text-gray-600 mb-6">
              Choose your location to see relevant content and services available in your area.
            </p>
            <LocationSelector
              onLocationChange={handleLocationChange}
              className="max-w-md mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPage;
