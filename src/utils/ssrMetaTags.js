// Utility for setting meta tags that will be visible in View Source
export const setSSRMetaTags = (product) => {
  if (!product) return;

  // Update document title
  document.title = `${product.name} | Zebra Printers India`;
  
  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', product.description);
  
  // Update or create meta keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', product.metaKeywords || `${product.name}, Zebra printer, barcode printer, ${product.category}, professional printing`);
  
  // Update Open Graph tags for social media
  const ogTags = [
    { property: 'og:title', content: `${product.name} | Zebra Printers India` },
    { property: 'og:description', content: product.description },
    { property: 'og:type', content: 'product' },
    { property: 'og:url', content: window.location.href },
    { property: 'og:image', content: product.image || '/default-product-image.jpg' },
    { property: 'og:site_name', content: 'Zebra Printers India' }
  ];
  
  ogTags.forEach(tag => {
    let element = document.querySelector(`meta[property="${tag.property}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('property', tag.property);
      document.head.appendChild(element);
    }
    element.setAttribute('content', tag.content);
  });
  
  // Update Twitter Card tags
  const twitterTags = [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `${product.name} | Zebra Printers India` },
    { name: 'twitter:description', content: product.description },
    { name: 'twitter:image', content: product.image || '/default-product-image.jpg' }
  ];
  
  twitterTags.forEach(tag => {
    let element = document.querySelector(`meta[name="${tag.name}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', tag.name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', tag.content);
  });
  
  // Update canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', window.location.href);
  
  // Update structured data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Zebra"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    }
  };

  let structuredDataScript = document.getElementById('structured-data');
  if (!structuredDataScript) {
    structuredDataScript = document.createElement('script');
    structuredDataScript.setAttribute('type', 'application/ld+json');
    structuredDataScript.setAttribute('id', 'structured-data');
    document.head.appendChild(structuredDataScript);
  }
  structuredDataScript.textContent = JSON.stringify(structuredData);
  
  console.log('✅ Meta tags updated for:', product.name);
  console.log('📝 Title:', document.title);
  console.log('🔑 Keywords:', metaKeywords.getAttribute('content'));
  console.log('📄 Description:', metaDescription.getAttribute('content'));
};

// Function to check if meta tags are properly set
export const checkMetaTags = () => {
  const title = document.title;
  const description = document.querySelector('meta[name="description"]')?.content;
  const keywords = document.querySelector('meta[name="keywords"]')?.content;
  const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
  
  console.log('🔍 Current Meta Tags:');
  console.log('Title:', title);
  console.log('Description:', description);
  console.log('Keywords:', keywords);
  console.log('OG Title:', ogTitle);
  
  return {
    title,
    description,
    keywords,
    ogTitle
  };
};
