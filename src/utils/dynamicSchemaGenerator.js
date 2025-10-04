/**
 * Dynamic Schema Generator for Zebra Printers India
 * Automatically generates JSON-LD structured data for different content types
 */

// Base website information
const SITE_INFO = {
  name: "Zebra Printers India",
  url: "https://zebraprintersindia.com",
  logo: "https://zebraprintersindia.com/logo.png",
  description: "Your Trusted Zebra Partner - Complete Zebra solutions with expert sales & service support across India",
  phone: "+91 8800839490",
  email: "gm@zebraprintersindia.com",
  address: {
    streetAddress: "New Delhi",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    postalCode: "110001",
    addressCountry: "IN"
  },
  gstNumber: "07AFDPM9463K1ZY"
};

/**
 * Generate Organization Schema
 */
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_INFO.name,
    "url": SITE_INFO.url,
    "logo": SITE_INFO.logo,
    "description": SITE_INFO.description,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": SITE_INFO.phone,
      "contactType": "customer service",
      "email": SITE_INFO.email
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SITE_INFO.address.streetAddress,
      "addressLocality": SITE_INFO.address.addressLocality,
      "addressRegion": SITE_INFO.address.addressRegion,
      "postalCode": SITE_INFO.address.postalCode,
      "addressCountry": SITE_INFO.address.addressCountry
    },
    "sameAs": [
      "https://www.facebook.com/zebraprintersindia",
      "https://www.linkedin.com/company/zebraprintersindia",
      "https://twitter.com/zebraprintersindia"
    ]
  };
};

/**
 * Generate Website Schema
 */
export const generateWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_INFO.name,
    "url": SITE_INFO.url,
    "description": SITE_INFO.description,
    "publisher": {
      "@type": "Organization",
      "name": SITE_INFO.name,
      "url": SITE_INFO.url
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_INFO.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};

/**
 * Generate Blog Schema for individual blog post
 */
export const generateBlogSchema = (blog) => {
  if (!blog) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt || blog.description,
    "image": blog.featured_image || `${SITE_INFO.url}/api/placeholder/800/400`,
    "author": {
      "@type": "Person",
      "name": blog.author || "Zebra Printers India Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_INFO.name,
      "logo": {
        "@type": "ImageObject",
        "url": SITE_INFO.logo
      }
    },
    "datePublished": blog.created_at,
    "dateModified": blog.updated_at || blog.created_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_INFO.url}/blogs/${blog.slug}`
    },
    "url": `${SITE_INFO.url}/blogs/${blog.slug}`,
    "keywords": Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags,
    "articleSection": blog.category,
    "wordCount": blog.content ? blog.content.split(' ').length : 0,
    "inLanguage": "en-US"
  };
};

/**
 * Generate Blog Collection Schema for blogs listing page
 */
export const generateBlogCollectionSchema = (blogs) => {
  if (!blogs || !Array.isArray(blogs)) return null;

  const blogItems = blogs.map(blog => ({
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt,
    "image": blog.featured_image || `${SITE_INFO.url}/api/placeholder/800/400`,
    "author": {
      "@type": "Person",
      "name": blog.author || "Zebra Printers India Team"
    },
    "datePublished": blog.created_at,
    "url": `${SITE_INFO.url}/blogs/${blog.slug}`
  }));

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Zebra Printers India Blog",
    "description": "Latest insights, guides, and updates about Zebra printers, barcode scanners, and mobile computers",
    "url": `${SITE_INFO.url}/blogs`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": blogItems.length,
      "itemListElement": blogItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": item
      }))
    }
  };
};

/**
 * Generate Job Posting Schema for individual job
 */
export const generateJobPostingSchema = (job) => {
  if (!job) return null;

  const baseSalary = job.salary_range ? {
    "@type": "MonetaryAmount",
    "currency": "INR",
    "value": job.salary_range
  } : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.created_at,
    "validThrough": job.updated_at,
    "employmentType": job.job_type,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company || SITE_INFO.name,
      "sameAs": SITE_INFO.url
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "IN"
      }
    },
    "baseSalary": baseSalary,
    "url": `${SITE_INFO.url}/jobs/${job.slug}`,
    "jobBenefits": job.benefits,
    "qualifications": job.requirements,
    "responsibilities": job.responsibilities,
    "workHours": job.job_type === 'full-time' ? '40 hours per week' : 'Variable',
    "experienceRequirements": {
      "@type": "OccupationalExperienceRequirements",
      "monthsOfExperience": getExperienceMonths(job.experience_level)
    }
  };
};

/**
 * Generate Job Collection Schema for jobs listing page
 */
export const generateJobCollectionSchema = (jobs) => {
  if (!jobs || !Array.isArray(jobs)) return null;

  const jobItems = jobs.map(job => ({
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.created_at,
    "employmentType": job.job_type,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company || SITE_INFO.name
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "IN"
      }
    },
    "url": `${SITE_INFO.url}/jobs/${job.slug}`
  }));

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Zebra Printers India Careers",
    "description": "Join our team and help businesses across India with cutting-edge Zebra technology solutions",
    "url": `${SITE_INFO.url}/jobs`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": jobItems.length,
      "itemListElement": jobItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": item
      }))
    }
  };
};

/**
 * Generate Product Schema for individual product
 */
export const generateProductSchema = (product) => {
  if (!product) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image || `${SITE_INFO.url}/api/placeholder/400/400`,
    "brand": {
      "@type": "Brand",
      "name": "Zebra"
    },
    "category": product.category,
    "sku": product.sku || product.id,
    "mpn": product.model_number || product.sku,
    "offers": {
      "@type": "Offer",
      "price": product.price || "Contact for Price",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": SITE_INFO.name,
        "url": SITE_INFO.url
      },
      "url": `${SITE_INFO.url}/products/${product.slug || product.id}`
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.review_count || 1
    } : undefined,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Model",
        "value": product.model || product.name
      },
      {
        "@type": "PropertyValue",
        "name": "Type",
        "value": product.type || product.category
      }
    ].filter(prop => prop.value)
  };
};

/**
 * Generate Product Collection Schema for products listing page
 */
export const generateProductCollectionSchema = (products) => {
  if (!products || !Array.isArray(products)) return null;

  const productItems = products.map(product => ({
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image || `${SITE_INFO.url}/api/placeholder/400/400`,
    "brand": {
      "@type": "Brand",
      "name": "Zebra"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price || "Contact for Price",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    },
    "url": `${SITE_INFO.url}/products/${product.slug || product.id}`
  }));

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Zebra Products - Printers, Scanners & Mobile Computers",
    "description": "Complete range of Zebra printers, barcode scanners, and mobile computers for all your business needs",
    "url": `${SITE_INFO.url}/products`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": productItems.length,
      "itemListElement": productItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": item
      }))
    }
  };
};

/**
 * Generate Service Schema
 */
export const generateServiceSchema = (service) => {
  if (!service) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "name": SITE_INFO.name,
      "url": SITE_INFO.url
    },
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "serviceType": service.category,
    "url": `${SITE_INFO.url}/services/${service.slug || service.id}`,
    "offers": {
      "@type": "Offer",
      "price": service.price || "Contact for Quote",
      "priceCurrency": "INR"
    }
  };
};

/**
 * Generate Breadcrumb Schema
 */
export const generateBreadcrumbSchema = (breadcrumbs) => {
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
};

/**
 * Generate FAQ Schema
 */
export const generateFAQSchema = (faqs) => {
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
};

/**
 * Generate Local Business Schema
 */
export const generateLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": SITE_INFO.name,
    "description": SITE_INFO.description,
    "url": SITE_INFO.url,
    "telephone": SITE_INFO.phone,
    "email": SITE_INFO.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SITE_INFO.address.streetAddress,
      "addressLocality": SITE_INFO.address.addressLocality,
      "addressRegion": SITE_INFO.address.addressRegion,
      "postalCode": SITE_INFO.address.postalCode,
      "addressCountry": SITE_INFO.address.addressCountry
    },
    "openingHours": "Mo-Fr 09:00-18:00",
    "priceRange": "$$",
    "paymentAccepted": "Cash, Credit Card, Bank Transfer",
    "currenciesAccepted": "INR",
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Zebra Products & Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Zebra Printers"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Barcode Scanners"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Mobile Computers"
          }
        }
      ]
    }
  };
};

/**
 * Generate comprehensive schema for homepage
 */
export const generateHomepageSchema = (latestContent) => {
  const schemas = [
    generateOrganizationSchema(),
    generateWebsiteSchema(),
    generateLocalBusinessSchema()
  ];

  // Add latest content schemas if available
  if (latestContent) {
    if (latestContent.blogs && latestContent.blogs.length > 0) {
      schemas.push(generateBlogCollectionSchema(latestContent.blogs.slice(0, 3)));
    }
    if (latestContent.jobs && latestContent.jobs.length > 0) {
      schemas.push(generateJobCollectionSchema(latestContent.jobs.slice(0, 3)));
    }
    if (latestContent.products && latestContent.products.length > 0) {
      schemas.push(generateProductCollectionSchema(latestContent.products.slice(0, 6)));
    }
  }

  return schemas.filter(schema => schema !== null);
};

/**
 * Helper function to convert experience level to months
 */
const getExperienceMonths = (level) => {
  const experienceMap = {
    'entry': 0,
    'mid': 24,
    'senior': 60,
    'executive': 120
  };
  return experienceMap[level] || 0;
};

/**
 * Generate schema based on page type and content
 */
export const generatePageSchema = (pageType, content, additionalData = {}) => {
  const schemas = [];

  // Always include organization schema
  schemas.push(generateOrganizationSchema());

  switch (pageType) {
    case 'homepage':
      return generateHomepageSchema(content);
    
    case 'blog':
      if (Array.isArray(content)) {
        schemas.push(generateBlogCollectionSchema(content));
      } else {
        schemas.push(generateBlogSchema(content));
      }
      break;
    
    case 'job':
      if (Array.isArray(content)) {
        schemas.push(generateJobCollectionSchema(content));
      } else {
        schemas.push(generateJobPostingSchema(content));
      }
      break;
    
    case 'product':
      if (Array.isArray(content)) {
        schemas.push(generateProductCollectionSchema(content));
      } else {
        schemas.push(generateProductSchema(content));
      }
      break;
    
    case 'service':
      schemas.push(generateServiceSchema(content));
      break;
    
    case 'about':
      schemas.push(generateLocalBusinessSchema());
      break;
    
    case 'contact':
      schemas.push(generateLocalBusinessSchema());
      break;
  }

  // Add breadcrumbs if provided
  if (additionalData.breadcrumbs) {
    schemas.push(generateBreadcrumbSchema(additionalData.breadcrumbs));
  }

  // Add FAQ if provided
  if (additionalData.faqs) {
    schemas.push(generateFAQSchema(additionalData.faqs));
  }

  return schemas.filter(schema => schema !== null);
};

export default {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateBlogSchema,
  generateBlogCollectionSchema,
  generateJobPostingSchema,
  generateJobCollectionSchema,
  generateProductSchema,
  generateProductCollectionSchema,
  generateServiceSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateHomepageSchema,
  generatePageSchema
};

