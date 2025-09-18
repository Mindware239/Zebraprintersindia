// API service for connecting frontend with backend
const API_BASE_URL = 'http://localhost:5000/api';

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
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
