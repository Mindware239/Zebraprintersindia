/**
 * Utility functions for generating clean, SEO-friendly URL slugs
 */

/**
 * Generate a clean URL slug from a product name
 * @param {string} name - The product name
 * @returns {string} - Clean URL slug
 */
export function generateSlug(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .toLowerCase()                    // Convert to lowercase
    .trim()                          // Remove leading/trailing spaces
    .replace(/[^\w\s-]/g, '')        // Remove special characters except hyphens and spaces
    .replace(/[\s_-]+/g, '-')        // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');        // Remove leading/trailing hyphens
}

/**
 * Generate product URL from product data
 * @param {Object} product - Product object with name, slug, or id
 * @returns {string} - Complete product URL
 */
export function generateProductUrl(product, baseUrl = 'https://www.zebraprintersindia.com') {
  if (!product) return '';
  
  // Use existing slug if available, otherwise generate from name
  const slug = product.slug || generateSlug(product.name);
  
  if (!slug) return '';
  
  return `${baseUrl}/${slug}`;
}

/**
 * Generate category URL from category data
 * @param {Object} category - Category object with name or slug
 * @returns {string} - Complete category URL
 */
export function generateCategoryUrl(category, baseUrl = 'https://www.zebraprintersindia.com') {
  if (!category) return '';
  
  // Convert category name to slug by removing spaces and special characters
  const slug = category.slug || category.name
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters
  
  if (!slug) return '';
  
  return `${baseUrl}/products/${slug}`;
}

/**
 * Generate subcategory URL from subcategory data
 * @param {Object} subcategory - Subcategory object with name or slug
 * @param {string} categoryName - Parent category name
 * @returns {string} - Complete subcategory URL
 */
export function generateSubcategoryUrl(subcategory, categoryName, baseUrl = 'https://www.zebraprintersindia.com') {
  if (!subcategory || !categoryName) return '';
  
  // Convert names to slugs by removing spaces and special characters
  const subcategorySlug = subcategory.slug || subcategory.name
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters
    
  const categorySlug = categoryName
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters
  
  if (!subcategorySlug || !categorySlug) return '';
  
  return `${baseUrl}/products/${categorySlug}/${subcategorySlug}`;
}

/**
 * Generate blog URL from blog data
 * @param {Object} blog - Blog object with slug
 * @returns {string} - Complete blog URL
 */
export function generateBlogUrl(blog, baseUrl = 'https://www.zebraprintersindia.com') {
  if (!blog || !blog.slug) return '';
  
  return `${baseUrl}/blog/${blog.slug}`;
}

/**
 * Generate job URL from job data
 * @param {Object} job - Job object with slug
 * @returns {string} - Complete job URL
 */
export function generateJobUrl(job, baseUrl = 'https://www.zebraprintersindia.com') {
  if (!job || !job.slug) return '';
  
  return `${baseUrl}/careers/${job.slug}`;
}

/**
 * Remove duplicate URLs from an array
 * @param {Array} urls - Array of URL objects
 * @returns {Array} - Array with unique URLs
 */
export function removeDuplicateUrls(urls) {
  const seen = new Set();
  return urls.filter(url => {
    if (seen.has(url.loc)) {
      return false;
    }
    seen.add(url.loc);
    return true;
  });
}

export default {
  generateSlug,
  generateProductUrl,
  generateCategoryUrl,
  generateBlogUrl,
  generateJobUrl,
  removeDuplicateUrls
};



