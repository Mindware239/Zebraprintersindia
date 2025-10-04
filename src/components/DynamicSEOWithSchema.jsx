import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import useDynamicSchema from '../hooks/useDynamicSchema';
import { generatePageSchema } from '../utils/dynamicSchemaGenerator';

/**
 * Enhanced Dynamic SEO Component with Schema Support
 * Automatically generates and manages meta tags and structured data
 */
const DynamicSEOWithSchema = ({
  // Basic SEO props
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  
  // Schema props
  pageType = 'website',
  content = null,
  breadcrumbs = null,
  faqs = null,
  
  // Dynamic content props
  autoFetchContent = false,
  contentLimit = 10,
  refreshInterval = 300000, // 5 minutes
  
  // Additional meta props
  noindex = false,
  nofollow = false,
  robots = 'index, follow',
  
  // Schema options
  includeBreadcrumbs = true,
  includeFAQs = false,
  faqCategory = null,
  
  // Custom schemas
  customSchemas = [],
  
  // Location-specific SEO
  location = null,
  
  ...props
}) => {
  const [metaTags, setMetaTags] = useState({});

  // Use dynamic schema hook
  const {
    schemas: dynamicSchemas,
    loading: schemaLoading,
    error: schemaError,
    refreshSchemas
  } = useDynamicSchema(pageType, content, {
    autoFetch: autoFetchContent,
    refreshInterval,
    includeBreadcrumbs,
    includeFAQs,
    faqCategory,
    limit: contentLimit
  });

  // Generate final title
  const finalTitle = React.useMemo(() => {
    if (title) return title;
    if (location) return `${pageType.charAt(0).toUpperCase() + pageType.slice(1)} in ${location.city}, ${location.state} | Zebra Printers India`;
    return 'Zebra Printers India - Your Trusted Zebra Partner';
  }, [title, pageType, location]);

  // Generate final description
  const finalDescription = React.useMemo(() => {
    if (description) return description;
    if (location) return `Leading supplier of Zebra barcode printers, scanners, and mobile computers in ${location.city}, ${location.state}. Get expert support and service for all your barcode printing needs.`;
    return 'Your Trusted Zebra Partner - Complete Zebra solutions with expert sales & service support across India. Barcode printers, scanners, mobile computers, and more.';
  }, [description, location]);

  // Generate final keywords
  const finalKeywords = React.useMemo(() => {
    if (keywords) return keywords;
    const baseKeywords = 'Zebra printers, barcode scanners, mobile computers, label printers, RFID solutions, barcode technology';
    if (location) {
      return `${baseKeywords}, ${location.city}, ${location.state}, India`;
    }
    return baseKeywords;
  }, [keywords, location]);

  // Generate canonical URL
  const finalCanonicalUrl = React.useMemo(() => {
    if (canonicalUrl) return canonicalUrl;
    return window.location.href;
  }, [canonicalUrl]);

  // Generate Open Graph image
  const finalOgImage = React.useMemo(() => {
    if (ogImage) return ogImage;
    if (content?.featured_image) return content.featured_image;
    if (content?.image) return content.image;
    return 'https://zebraprintersindia.com/api/placeholder/1200/630';
  }, [ogImage, content]);

  // Update meta tags when props change
  useEffect(() => {
    const newMetaTags = {
      title: finalTitle,
      description: finalDescription,
      keywords: finalKeywords,
      canonical: finalCanonicalUrl,
      ogTitle: finalTitle,
      ogDescription: finalDescription,
      ogImage: finalOgImage,
      ogType,
      ogUrl: finalCanonicalUrl,
      ogSiteName: 'Zebra Printers India',
      twitterCard: 'summary_large_image',
      twitterTitle: finalTitle,
      twitterDescription: finalDescription,
      twitterImage: finalOgImage,
      robots: noindex || nofollow ? `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}` : robots
    };

    setMetaTags(newMetaTags);
  }, [finalTitle, finalDescription, finalKeywords, finalCanonicalUrl, finalOgImage, ogType, noindex, nofollow, robots]);

  // Combine dynamic and custom schemas using useMemo to prevent infinite re-rendering
  const combinedSchemas = React.useMemo(() => {
    return [...dynamicSchemas, ...customSchemas];
  }, [dynamicSchemas, customSchemas]);

  // Note: Dynamic schemas are handled by the useDynamicSchema hook automatically

  // Generate breadcrumb schema if provided
  const breadcrumbSchema = React.useMemo(() => {
    if (!breadcrumbs || !Array.isArray(breadcrumbs)) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
  }, [breadcrumbs]);

  // Generate FAQ schema if provided
  const faqSchema = React.useMemo(() => {
    if (!faqs || !Array.isArray(faqs)) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }, [faqs]);

  // Combine all schemas
  const allSchemas = React.useMemo(() => {
    const schemas = [...combinedSchemas];
    
    if (breadcrumbSchema) schemas.push(breadcrumbSchema);
    if (faqSchema) schemas.push(faqSchema);
    
    return schemas;
  }, [combinedSchemas, breadcrumbSchema, faqSchema]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords} />
      <link rel="canonical" href={metaTags.canonical} />
      <meta name="robots" content={metaTags.robots} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={metaTags.ogTitle} />
      <meta property="og:description" content={metaTags.ogDescription} />
      <meta property="og:image" content={metaTags.ogImage} />
      <meta property="og:type" content={metaTags.ogType} />
      <meta property="og:url" content={metaTags.ogUrl} />
      <meta property="og:site_name" content={metaTags.ogSiteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={metaTags.twitterCard} />
      <meta name="twitter:title" content={metaTags.twitterTitle} />
      <meta name="twitter:description" content={metaTags.twitterDescription} />
      <meta name="twitter:image" content={metaTags.twitterImage} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="author" content="Zebra Printers India" />
      <meta name="publisher" content="Zebra Printers India" />
      <meta name="copyright" content="Zebra Printers India" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Location-specific meta tags */}
      {location && (
        <>
          <meta name="geo.region" content={`IN-${location.state_code || 'DL'}`} />
          <meta name="geo.placename" content={location.city} />
          <meta name="geo.position" content={`${location.latitude || '28.6139'};${location.longitude || '77.2090'}`} />
          <meta name="ICBM" content={`${location.latitude || '28.6139'}, ${location.longitude || '77.2090'}`} />
        </>
      )}

      {/* Structured Data - JSON-LD */}
      {allSchemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          data-dynamic-schema="true"
          data-schema-index={index}
        >
          {JSON.stringify(schema, null, 2)}
        </script>
      ))}

      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DebugInfo",
            "debugInfo": {
              "pageType": pageType,
              "contentProvided": !!content,
              "breadcrumbsProvided": !!breadcrumbs,
              "faqsProvided": !!faqs,
              "schemasGenerated": allSchemas.length,
              "schemaLoading": schemaLoading,
              "schemaError": schemaError,
              "lastUpdated": new Date().toISOString()
            }
          }, null, 2)}
        </script>
      )}
    </Helmet>
  );
};

export default DynamicSEOWithSchema;

