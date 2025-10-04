import React, { useState, useEffect } from 'react';
import { Download, Search, Filter, FileText, Monitor, Printer, Smartphone, Wrench } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../translations/translations';
import apiService from '../services/api';

const Drivers = () => {
  const { language } = useLanguage();
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOs, setSelectedOs] = useState('all');

  const categories = [
    { id: 'all', name: 'All Drivers', icon: Wrench },
    { id: 'printer', name: 'Printer Drivers', icon: Printer },
    { id: 'scanner', name: 'Scanner Drivers', icon: Monitor },
    { id: 'mobile', name: 'Mobile Drivers', icon: Smartphone },
    { id: 'utility', name: 'Utility Software', icon: FileText }
  ];

  const operatingSystems = [
    { id: 'all', name: 'All Operating Systems' },
    { id: 'windows', name: 'Windows' },
    { id: 'macos', name: 'macOS' },
    { id: 'linux', name: 'Linux' },
    { id: 'android', name: 'Android' },
    { id: 'ios', name: 'iOS' }
  ];

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [drivers, searchQuery, selectedCategory, selectedOs]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const driversData = await apiService.getDrivers();
      setDrivers(driversData);
    } catch (error) {
      console.error('Error loading drivers:', error);
      // For demo purposes, use mock data
      setDrivers([
        {
          id: 1,
          name: 'Zebra ZD420 Driver',
          version: '2.0.1',
          category: 'printer',
          operatingSystem: 'windows',
          fileSize: '15.2 MB',
          description: 'Official driver for Zebra ZD420 desktop printer',
          downloadUrl: '/downloads/zebra-zd420-driver-v2.0.1.exe',
          releaseDate: '2024-01-15',
          compatibility: 'Windows 10, Windows 11'
        },
        {
          id: 2,
          name: 'Zebra ZD620 Driver',
          version: '1.8.5',
          category: 'printer',
          operatingSystem: 'windows',
          fileSize: '18.7 MB',
          description: 'Official driver for Zebra ZD620 industrial printer',
          downloadUrl: '/downloads/zebra-zd620-driver-v1.8.5.exe',
          releaseDate: '2024-01-10',
          compatibility: 'Windows 10, Windows 11, Windows Server 2019'
        },
        {
          id: 3,
          name: 'Zebra DS2208 Scanner Driver',
          version: '3.2.1',
          category: 'scanner',
          operatingSystem: 'windows',
          fileSize: '12.4 MB',
          description: 'Driver for Zebra DS2208 handheld barcode scanner',
          downloadUrl: '/downloads/zebra-ds2208-driver-v3.2.1.exe',
          releaseDate: '2024-01-08',
          compatibility: 'Windows 10, Windows 11'
        },
        {
          id: 4,
          name: 'Zebra MC3300 Mobile Driver',
          version: '2.1.3',
          category: 'mobile',
          operatingSystem: 'android',
          fileSize: '8.9 MB',
          description: 'Driver for Zebra MC3300 mobile computer',
          downloadUrl: '/downloads/zebra-mc3300-android-driver-v2.1.3.apk',
          releaseDate: '2024-01-05',
          compatibility: 'Android 8.0+'
        },
        {
          id: 5,
          name: 'Zebra Setup Utilities',
          version: '4.1.2',
          category: 'utility',
          operatingSystem: 'windows',
          fileSize: '25.6 MB',
          description: 'Complete setup and configuration utilities for Zebra devices',
          downloadUrl: '/downloads/zebra-setup-utilities-v4.1.2.exe',
          releaseDate: '2024-01-12',
          compatibility: 'Windows 10, Windows 11'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    let filtered = drivers;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(driver =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(driver => driver.category === selectedCategory);
    }

    // Filter by operating system
    if (selectedOs !== 'all') {
      filtered = filtered.filter(driver => driver.operatingSystem === selectedOs);
    }

    setFilteredDrivers(filtered);
  };

  const handleDownload = (driver) => {
    // In a real application, this would trigger the actual download
    console.log('Downloading:', driver.name);
    // For demo purposes, we'll just show an alert
    alert(`Downloading ${driver.name} (${driver.fileSize})`);
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : Wrench;
  };

  const getOsIcon = (os) => {
    switch (os) {
      case 'windows': return '🪟';
      case 'macos': return '🍎';
      case 'linux': return '🐧';
      case 'android': return '🤖';
      case 'ios': return '📱';
      default: return '💻';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {getTranslation('drivers.title', language)}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              {getTranslation('drivers.subtitle', language)}
            </p>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto">
              {getTranslation('drivers.description', language)}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={getTranslation('drivers.searchPlaceholder', language)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* OS Filter */}
            <div>
              <select
                value={selectedOs}
                onChange={(e) => setSelectedOs(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {operatingSystems.map(os => (
                  <option key={os.id} value={os.id}>
                    {os.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredDrivers.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {getTranslation('drivers.noResults', language)}
            </h3>
            <p className="text-gray-500">
              {getTranslation('drivers.noResultsDescription', language)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrivers.map((driver) => {
              const CategoryIcon = getCategoryIcon(driver.category);
              return (
                <div key={driver.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CategoryIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                          <p className="text-sm text-gray-500">Version {driver.version}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {driver.fileSize}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {driver.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getOsIcon(driver.operatingSystem)}</span>
                        <span className="text-sm text-gray-600 capitalize">{driver.operatingSystem}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Released: {new Date(driver.releaseDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Compatibility:</p>
                      <p className="text-sm text-gray-700">{driver.compatibility}</p>
                    </div>

                    <button
                      onClick={() => handleDownload(driver)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Download size={16} />
                      <span>{getTranslation('drivers.download', language)}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {getTranslation('drivers.helpTitle', language)}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {getTranslation('drivers.helpDescription', language)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getTranslation('drivers.help1Title', language)}
              </h3>
              <p className="text-gray-600">
                {getTranslation('drivers.help1Description', language)}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getTranslation('drivers.help2Title', language)}
              </h3>
              <p className="text-gray-600">
                {getTranslation('drivers.help2Description', language)}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getTranslation('drivers.help3Title', language)}
              </h3>
              <p className="text-gray-600">
                {getTranslation('drivers.help3Description', language)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drivers;
