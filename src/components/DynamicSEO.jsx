import React, { useEffect } from 'react';
import { useLocation } from '../contexts/LocationContext';

const DynamicSEO = ({ 
  title, 
  description, 
  keywords, 
  structuredData,
  canonicalUrl,
  ogImage,
  ...props 
}) => {
  const { getLocationForSEO, currentLocation } = useLocation();
  const seoData = getLocationForSEO();

  // Use location-specific SEO data if available, otherwise use props
  const finalTitle = seoData?.title || title;
  const finalDescription = seoData?.description || description;
  const finalKeywords = seoData?.keywords || keywords;
  const finalStructuredData = seoData?.structured_data || structuredData;

  useEffect(() => {
    console.log('DynamicSEO: Setting meta tags', {
      finalTitle,
      finalDescription,
      finalKeywords,
      originalTitle: title,
      originalKeywords: keywords
    });
    
    // Update document title
    if (finalTitle) {
      document.title = finalTitle;
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && finalDescription) {
      metaDescription.setAttribute('content', finalDescription);
    } else if (finalDescription) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = finalDescription;
      document.head.appendChild(meta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && finalKeywords) {
      metaKeywords.setAttribute('content', finalKeywords);
    } else if (finalKeywords) {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = finalKeywords;
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

    if (finalTitle) {
      updateOGTag('og:title', finalTitle);
    }
    if (finalDescription) {
      updateOGTag('og:description', finalDescription);
    }
    if (currentLocation) {
      updateOGTag('og:locale', 'en_US');
      updateOGTag('og:site_name', 'Zebra Printers India');
    }
    if (ogImage) {
      updateOGTag('og:image', ogImage);
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

    if (finalTitle) {
      updateTwitterTag('twitter:title', finalTitle);
    }
    if (finalDescription) {
      updateTwitterTag('twitter:description', finalDescription);
    }
    updateTwitterTag('twitter:card', 'summary_large_image');

    // Add structured data
    if (finalStructuredData) {
      let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
      if (structuredDataScript) {
        structuredDataScript.textContent = JSON.stringify(finalStructuredData);
      } else {
        structuredDataScript = document.createElement('script');
        structuredDataScript.type = 'application/ld+json';
        structuredDataScript.textContent = JSON.stringify(finalStructuredData);
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

  }, [finalTitle, finalDescription, finalKeywords, finalStructuredData, currentLocation, ogImage]);

  return null;
};

export default DynamicSEO;