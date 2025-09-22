import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Download, Upload, Search, Filter, FileText, Monitor, Printer, Smartphone, Wrench } from 'lucide-react';
import apiService from '../services/api';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOs, setSelectedOs] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const [formData, setFormData] = useState({
    name: '',
    version: '',
    category: 'printer',
    operatingSystem: 'windows',
    description: '',
    compatibility: '',
    file: null
  });

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
          compatibility: 'Windows 10, Windows 11',
          fileName: 'zebra-zd420-driver-v2.0.1.exe'
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
          compatibility: 'Windows 10, Windows 11, Windows Server 2019',
          fileName: 'zebra-zd620-driver-v1.8.5.exe'
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
          compatibility: 'Windows 10, Windows 11',
          fileName: 'zebra-ds2208-driver-v3.2.1.exe'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    let filtered = drivers;

    if (searchQuery) {
      filtered = filtered.filter(driver =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(driver => driver.category === selectedCategory);
    }

    if (selectedOs !== 'all') {
      filtered = filtered.filter(driver => driver.operatingSystem === selectedOs);
    }

    setFilteredDrivers(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file,
        fileName: file.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('version', formData.version);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('operatingSystem', formData.operatingSystem);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('compatibility', formData.compatibility);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      if (editingDriver) {
        await apiService.updateDriver(editingDriver.id, formDataToSend);
      } else {
        await apiService.createDriver(formDataToSend);
      }

      await loadDrivers();
      setShowAddModal(false);
      setEditingDriver(null);
      setFormData({
        name: '',
        version: '',
        category: 'printer',
        operatingSystem: 'windows',
        description: '',
        compatibility: '',
        file: null
      });
    } catch (error) {
      console.error('Error saving driver:', error);
      alert('Error saving driver. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      version: driver.version,
      category: driver.category,
      operatingSystem: driver.operatingSystem,
      description: driver.description,
      compatibility: driver.compatibility,
      file: null
    });
    setShowAddModal(true);
  };

  const handleDelete = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await apiService.deleteDriver(driverId);
        await loadDrivers();
      } catch (error) {
        console.error('Error deleting driver:', error);
        alert('Error deleting driver. Please try again.');
      }
    }
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Driver Management</h1>
          <p>Manage drivers and software downloads</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <h1>Driver Management</h1>
        <p>Manage drivers and software downloads for your website</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedOs}
              onChange={(e) => setSelectedOs(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {operatingSystems.map(os => (
                <option key={os.id} value={os.id}>
                  {os.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => {
                setEditingDriver(null);
                setFormData({
                  name: '',
                  version: '',
                  category: 'printer',
                  operatingSystem: 'windows',
                  description: '',
                  compatibility: '',
                  file: null
                });
                setShowAddModal(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Driver</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Drivers ({filteredDrivers.length})</h3>
        </div>

        {filteredDrivers.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or add a new driver.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDrivers.map((driver) => {
              const CategoryIcon = getCategoryIcon(driver.category);
              return (
                <div key={driver.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CategoryIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{driver.name}</h4>
                          <span className="text-sm text-gray-500">v{driver.version}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {driver.fileSize}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{driver.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span className="text-lg">{getOsIcon(driver.operatingSystem)}</span>
                            <span className="capitalize">{driver.operatingSystem}</span>
                          </div>
                          <span>Released: {new Date(driver.releaseDate).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Compatibility:</p>
                          <p className="text-sm text-gray-700">{driver.compatibility}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(driver)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit driver"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete driver"
                      >
                        <Trash2 size={16} />
                      </button>
                      <a
                        href={driver.downloadUrl}
                        download
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Download driver"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Zebra ZD420 Driver"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version *
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2.0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.filter(cat => cat.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operating System *
                  </label>
                  <select
                    name="operatingSystem"
                    value={formData.operatingSystem}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {operatingSystems.filter(os => os.id !== 'all').map(os => (
                      <option key={os.id} value={os.id}>
                        {os.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the driver..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compatibility
                </label>
                <input
                  type="text"
                  name="compatibility"
                  value={formData.compatibility}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Windows 10, Windows 11"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver File {!editingDriver && '*'}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".exe,.msi,.dmg,.pkg,.deb,.rpm,.apk,.ipa"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      EXE, MSI, DMG, PKG, DEB, RPM, APK, IPA up to 100MB
                    </p>
                    {formData.fileName && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {formData.fileName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingDriver(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {uploading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{uploading ? 'Saving...' : (editingDriver ? 'Update Driver' : 'Add Driver')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
