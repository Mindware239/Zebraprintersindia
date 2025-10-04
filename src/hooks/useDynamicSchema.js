import { useState, useEffect, useCallback, useRef } from 'react';
import { generatePageSchema } from '../utils/dynamicSchemaGenerator';

// Global cache to prevent excessive API calls
const contentCache = new Map();
const CACHE_DURATION = 300000; // 5 minutes

/**
 * Custom hook for managing dynamic schemas
 * Automatically fetches and generates JSON-LD schemas based on page type and content
 */
const useDynamicSchema = (pageType, content = null, options = {}) => {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Default options
  const {
    autoFetch = true,
    refreshInterval = 300000, // 5 minutes
    includeBreadcrumbs = true,
    includeFAQs = false,
    faqCategory = null,
    limit = 10
  } = options;

  /**
   * Fetch latest content from API with caching
   */
  const fetchLatestContent = useCallback(async (contentType = null, contentId = null, contentSlug = null) => {
    try {
      // Create cache key
      const cacheKey = `${contentType || 'latest'}_${contentId || ''}_${contentSlug || ''}_${limit}`;
      const now = Date.now();
      
      // Check cache first
      if (contentCache.has(cacheKey)) {
        const cached = contentCache.get(cacheKey);
        if (now - cached.timestamp < CACHE_DURATION) {
          console.log('📦 Using cached content for schema');
          return cached.data;
        }
      }

      setLoading(true);
      setError(null);

      let url = '/api/schema/latest-content';
      const params = new URLSearchParams({ limit });

      if (contentType && (contentId || contentSlug)) {
        url = `/api/schema/${contentType}`;
        if (contentId) params.append('id', contentId);
        if (contentSlug) params.append('slug', contentSlug);
      }

      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      contentCache.set(cacheKey, {
        data,
        timestamp: now
      });
      
      return data;
    } catch (err) {
      console.error('Error fetching content for schema:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [limit]);

  /**
   * Fetch breadcrumb data
   */
  const fetchBreadcrumbs = useCallback(async () => {
    if (!includeBreadcrumbs) return null;

    try {
      const currentPath = window.location.pathname;
      const response = await fetch(`/api/schema/breadcrumbs${currentPath}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.breadcrumbs;
    } catch (err) {
      console.error('Error fetching breadcrumbs:', err);
      return null;
    }
  }, [includeBreadcrumbs]);

  /**
   * Fetch FAQ data
   */
  const fetchFAQs = useCallback(async () => {
    if (!includeFAQs) return null;

    try {
      const params = new URLSearchParams();
      if (faqCategory) params.append('category', faqCategory);
      params.append('limit', limit);

      const response = await fetch(`/api/schema/faqs?${params}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.faqs;
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      return null;
    }
  }, [includeFAQs, faqCategory, limit]);

  /**
   * Generate schemas based on page type and content
   */
  const generateSchemas = useCallback(async (contentData = null, breadcrumbData = null, faqData = null) => {
    try {
      let finalContent = contentData || content;
      let finalBreadcrumbs = breadcrumbData;
      let finalFAQs = faqData;

      // Fetch additional data if not provided
      if (!breadcrumbData && includeBreadcrumbs) {
        finalBreadcrumbs = await fetchBreadcrumbs();
      }

      if (!faqData && includeFAQs) {
        finalFAQs = await fetchFAQs();
      }

      // Generate schemas
      const additionalData = {
        breadcrumbs: finalBreadcrumbs,
        faqs: finalFAQs
      };

      const generatedSchemas = generatePageSchema(pageType, finalContent, additionalData);
      
      setSchemas(generatedSchemas);
      setLastUpdated(new Date());
      
      return generatedSchemas;
    } catch (err) {
      console.error('Error generating schemas:', err);
      setError(err.message);
      return [];
    }
  }, [pageType, includeBreadcrumbs, includeFAQs, fetchBreadcrumbs, fetchFAQs]);

  /**
   * Refresh schemas with latest content
   */
  const refreshSchemas = useCallback(async () => {
    if (!autoFetch) return;

    const contentData = await fetchLatestContent();
    if (contentData) {
      await generateSchemas(contentData);
    }
  }, [autoFetch, fetchLatestContent]);

  /**
   * Update schemas with new content
   */
  const updateSchemas = useCallback(async (newContent) => {
    await generateSchemas(newContent);
  }, []);

  /**
   * Get schema for specific content type
   */
  const getSchemaForContent = useCallback(async (contentType, contentId = null, contentSlug = null) => {
    const contentData = await fetchLatestContent(contentType, contentId, contentSlug);
    if (contentData) {
      const schemas = generatePageSchema(contentType, contentData.data || contentData);
      return schemas;
    }
    return [];
  }, [fetchLatestContent]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && !content) {
      refreshSchemas();
    } else if (content) {
      generateSchemas(content);
    }
  }, [autoFetch, content, pageType, refreshSchemas]);

  // Set up refresh interval
  useEffect(() => {
    if (!autoFetch || refreshInterval <= 0) return;

    const interval = setInterval(refreshSchemas, refreshInterval);
    return () => clearInterval(interval);
  }, [autoFetch, refreshInterval, refreshSchemas]);

  // Inject schemas into DOM
  useEffect(() => {
    // Remove existing schema scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"][data-dynamic-schema]');
    existingScripts.forEach(script => script.remove());

    // Add new schema scripts
    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic-schema', 'true');
      script.setAttribute('data-schema-index', index);
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });

    // Cleanup function
    return () => {
      const scriptsToRemove = document.querySelectorAll('script[data-dynamic-schema]');
      scriptsToRemove.forEach(script => script.remove());
    };
  }, [schemas]);

  return {
    schemas,
    loading,
    error,
    lastUpdated,
    refreshSchemas,
    updateSchemas,
    getSchemaForContent,
    generateSchemas
  };
};

export default useDynamicSchema;
