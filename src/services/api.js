// API service for connecting frontend with backend
const API_BASE_URL = '/api';

class ApiService {
  // Generic fetch method
  async fetchData(url, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products API
  async getAllProducts() {
    return this.fetchData('/products');
  }

  async getProductById(id) {
    return this.fetchData(`/products/${id}`);
  }

  async getProductsByCategory(category) {
    return this.fetchData(`/products/category/${category}`);
  }

  async searchProducts(query) {
    return this.fetchData(`/products/search/${encodeURIComponent(query)}`);
  }

  async addProduct(productData) {
    return this.fetchData('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.fetchData(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.fetchData(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories API
  async getCategories() {
    return this.fetchData('/categories');
  }

  // Dropdown data API
  async getDropdownData() {
    return this.fetchData('/dropdown-data');
  }

  // Subcategories API
  async getSubcategories() {
    return this.fetchData('/subcategories');
  }

  // Brands API
  async getBrands() {
    return this.fetchData('/brands');
  }

  // Authentication API
  async checkAuth() {
    return this.fetchData('/auth/check');
  }

  async login(credentials) {
    return this.fetchData('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.fetchData('/auth/logout', {
      method: 'POST',
    });
  }

  // Bulk import API
  async bulkImportProducts(formData) {
    return this.fetchData('/products/bulk-import', {
      method: 'POST',
      body: formData,
      headers: {} // Let fetch set Content-Type for FormData
    });
  }

  // Drivers API
  async getDrivers() {
    return this.fetchData('/drivers');
  }

  async getDriverById(id) {
    return this.fetchData(`/drivers/${id}`);
  }

  async createDriver(formData) {
    return this.fetchData('/drivers', {
      method: 'POST',
      body: formData,
      headers: {} // Let fetch set Content-Type for FormData
    });
  }

  async updateDriver(id, formData) {
    return this.fetchData(`/drivers/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {} // Let fetch set Content-Type for FormData
    });
  }

  async deleteDriver(id) {
    return this.fetchData(`/drivers/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
