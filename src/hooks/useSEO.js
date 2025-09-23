import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const useSEO = (seoData) => {
  useEffect(() => {
    if (!seoData) return;

    // Update document title
    if (seoData.title) {
      document.title = seoData.title;
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && seoData.description) {
      metaDescription.setAttribute('content', seoData.description);
    } else if (seoData.description) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = seoData.description;
      document.head.appendChild(meta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && seoData.keywords) {
      metaKeywords.setAttribute('content', seoData.keywords);
    } else if (seoData.keywords) {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = seoData.keywords;
      document.head.appendChild(meta);
    }

    // Update Open Graph tags
    const updateOGTag = (property, content) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (ogTag) {
        ogTag.setAttribute('content', content);
      } else {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        ogTag.setAttribute('content', content);
        document.head.appendChild(ogTag);
      }
    };

    if (seoData.title) {
      updateOGTag('og:title', seoData.title);
    }
    if (seoData.description) {
      updateOGTag('og:description', seoData.description);
    }
    if (seoData.location) {
      updateOGTag('og:locale', 'en_US');
      updateOGTag('og:site_name', 'Zebra Printers India');
    }

    // Update Twitter Card tags
    const updateTwitterTag = (name, content) => {
      let twitterTag = document.querySelector(`meta[name="${name}"]`);
      if (twitterTag) {
        twitterTag.setAttribute('content', content);
      } else {
        twitterTag = document.createElement('meta');
        twitterTag.setAttribute('name', name);
        twitterTag.setAttribute('content', content);
        document.head.appendChild(twitterTag);
      }
    };

    if (seoData.title) {
      updateTwitterTag('twitter:title', seoData.title);
    }
    if (seoData.description) {
      updateTwitterTag('twitter:description', seoData.description);
    }
    updateTwitterTag('twitter:card', 'summary_large_image');

    // Add structured data
    if (seoData.structured_data) {
      let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
      if (structuredDataScript) {
        structuredDataScript.textContent = JSON.stringify(seoData.structured_data);
      } else {
        structuredDataScript = document.createElement('script');
        structuredDataScript.type = 'application/ld+json';
        structuredDataScript.textContent = JSON.stringify(seoData.structured_data);
        document.head.appendChild(structuredDataScript);
      }
    }

    // Add canonical URL
    const canonicalUrl = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      canonicalUrl.setAttribute('href', window.location.href);
    } else {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = window.location.href;
      document.head.appendChild(canonical);
    }

  }, [seoData]);

  return null;
};

export default useSEO;
