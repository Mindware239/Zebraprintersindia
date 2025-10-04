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

  async getProductBySlug(slug) {
    return this.fetchData(`/products/slug/${slug}`);
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

  // Blogs API
  async getBlogs(page = 1, limit = 10, category = null) {
    const params = new URLSearchParams({ page, limit });
    if (category) params.append('category', category);
    return this.fetchData(`/blogs?${params}`);
  }

  async getBlogBySlug(slug) {
    return this.fetchData(`/blogs/${slug}`);
  }

  async createBlog(blogData) {
    return this.fetchData('/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData)
    });
  }

  async updateBlog(id, blogData) {
    return this.fetchData(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData)
    });
  }

  async deleteBlog(id) {
    return this.fetchData(`/blogs/${id}`, {
      method: 'DELETE'
    });
  }

  // Jobs API
  async getJobs(page = 1, limit = 10, jobType = null, experienceLevel = null) {
    const params = new URLSearchParams({ page, limit });
    if (jobType) params.append('job_type', jobType);
    if (experienceLevel) params.append('experience_level', experienceLevel);
    return this.fetchData(`/jobs?${params}`);
  }

  async getJobBySlug(slug) {
    return this.fetchData(`/jobs/${slug}`);
  }

  // Job Applications API
  async submitJobApplication(applicationData) {
    return this.fetchData('/job-applications', {
      method: 'POST',
      body: applicationData
    });
  }

  async getJobApplications(page = 1, limit = 10, status = null) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    return this.fetchData(`/job-applications?${params}`);
  }

  async updateApplicationStatus(id, status) {
    return this.fetchData(`/job-applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Location API
  async getCountries() {
    return this.fetchData('/locations/countries');
  }

  async getStates(countryId) {
    return this.fetchData(`/locations/states/${countryId}`);
  }

  async getCities(stateId) {
    return this.fetchData(`/locations/cities/${stateId}`);
  }

  async getCityDetails(cityId) {
    return this.fetchData(`/locations/city/${cityId}`);
  }

  async searchLocations(query, type = 'cities') {
    const params = new URLSearchParams({ q: query, type });
    return this.fetchData(`/locations/search?${params}`);
  }

  // Network API
  async getAllLocations() {
    return this.fetchData('/network/all-locations');
  }

  async getCountriesSummary() {
    return this.fetchData('/network/countries-summary');
  }

  // Dynamic SEO API
  async getLocationSEO(locationId) {
    return this.fetchData(`/location-seo/${locationId}`);
  }

  async getLocationSEOBySlug(citySlug) {
    return this.fetchData(`/location-seo-by-slug/${citySlug}`);
  }

  async getLocationContent(locationId) {
    return this.fetchData(`/location-content/${locationId}`);
  }

  async createJob(jobData) {
    return this.fetchData('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  }

  async updateJob(id, jobData) {
    return this.fetchData(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    });
  }

  async deleteJob(id) {
    return this.fetchData(`/jobs/${id}`, {
      method: 'DELETE'
    });
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
