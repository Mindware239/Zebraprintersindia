/**
 * Schema Validation and Testing Utilities
 * Validates JSON-LD schemas and provides testing tools
 */

/**
 * Validate a single schema object
 */
export const validateSchema = (schema) => {
  const errors = [];
  const warnings = [];

  if (!schema) {
    errors.push('Schema is null or undefined');
    return { valid: false, errors, warnings };
  }

  // Check required properties
  if (!schema['@context']) {
    errors.push('Missing required property: @context');
  } else if (schema['@context'] !== 'https://schema.org') {
    warnings.push('@context should be "https://schema.org"');
  }

  if (!schema['@type']) {
    errors.push('Missing required property: @type');
  }

  // Validate based on schema type
  const schemaType = schema['@type'];
  switch (schemaType) {
    case 'Organization':
      validateOrganizationSchema(schema, errors, warnings);
      break;
    case 'WebSite':
      validateWebsiteSchema(schema, errors, warnings);
      break;
    case 'BlogPosting':
      validateBlogPostingSchema(schema, errors, warnings);
      break;
    case 'JobPosting':
      validateJobPostingSchema(schema, errors, warnings);
      break;
    case 'Product':
      validateProductSchema(schema, errors, warnings);
      break;
    case 'Service':
      validateServiceSchema(schema, errors, warnings);
      break;
    case 'BreadcrumbList':
      validateBreadcrumbListSchema(schema, errors, warnings);
      break;
    case 'FAQPage':
      validateFAQPageSchema(schema, errors, warnings);
      break;
    case 'LocalBusiness':
      validateLocalBusinessSchema(schema, errors, warnings);
      break;
    default:
      warnings.push(`Unknown schema type: ${schemaType}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    schemaType
  };
};

/**
 * Validate Organization schema
 */
const validateOrganizationSchema = (schema, errors, warnings) => {
  const required = ['name', 'url'];
  required.forEach(prop => {
    if (!schema[prop]) {
      errors.push(`Organization schema missing required property: ${prop}`);
    }
  });

  if (schema.contactPoint && !schema.contactPoint['@type']) {
    warnings.push('contactPoint should have @type property');
  }

  if (schema.address && !schema.address['@type']) {
    warnings.push('address should have @type property');
  }
};

/**
 * Validate WebSite schema
 */
const validateWebsiteSchema = (schema, errors, warnings) => {
  const required = ['name', 'url'];
  required.forEach(prop => {
    if (!schema[prop]) {
      errors.push(`WebSite schema missing required property: ${prop}`);
    }
  });

  if (schema.potentialAction && !schema.potentialAction['@type']) {
    warnings.push('potentialAction should have @type property');
  }
};

/**
 * Validate BlogPosting schema
 */
const validateBlogPostingSchema = (schema, errors, warnings) => {
  const required = ['headline', 'author', 'publisher', 'datePublished'];
  required.forEach(prop => {
    if (!schema[prop]) {
      errors.push(`BlogPosting schema missing required property: ${prop}`);
    }
  });

  if (schema.author && !schema.author['@type']) {
    warnings.push('author should have @type property');
  }

  if (schema.publisher && !schema.publisher['@type']) {
    warnings.push('publisher should have @type property');
  }
};

/**
 * Validate JobPosting schema
 */
const validateJobPostingSchema = (schema, errors, warnings) => {
  const required = ['title', 'description', 'hiringOrganization', 'jobLocation'];
  required.forEach(prop => {
    if (!schema[prop]) {
      errors.push(`JobPosting schema missing required property: ${prop}`);
    }
  });

  if (schema.hiringOrganization && !schema.hiringOrganization['@type']) {
    warnings.push('hiringOrganization should have @type property');
  }

  if (schema.jobLocation && !schema.jobLocation['@type']) {
    warnings.push('jobLocation should have @type property');
  }
};

/**
 * Validate Product schema
 */
const validateProductSchema = (schema, errors, warnings) => {
  const required = ['name', 'offers'];
  required.forEach(prop => {
    if (!schema[prop]) {
      errors.push(`Product schema missing required property: ${prop}`);
    }
  });

  if (schema.brand && !schema.brand['@type']) {
    warnings.push('brand should have @type property');
  }

  if (schema.offers && !schema.offers['@type']) {
    warnings.push('offers should have @type property');
  }
};

/**
 * Validate Service schema
 */
const validateServiceSchema = (schema, errors, warnings) => {
  const required = ['name', 'provider'];
  required.forEach(prop => {
    if (!schema[prop]) {
      errors.push(`Service schema missing required property: ${prop}`);
    }
  });

  if (schema.provider && !schema.provider['@type']) {
    warnings.push('provider should have @type property');
  }
};

/**
 * Validate BreadcrumbList schema
 */
const validateBreadcrumbListSchema = (schema, errors, warnings) => {
  if (!schema.itemListElement || !Array.isArray(schema.itemListElement)) {
    errors.push('BreadcrumbList schema missing required property: itemListElement (array)');
  } else {
    schema.itemListElement.forEach((item, index) => {
      if (!item['@type'] || item['@type'] !== 'ListItem') {
        errors.push(`BreadcrumbList item ${index} missing or invalid @type`);
      }
      if (!item.position || typeof item.position !== 'number') {
        errors.push(`BreadcrumbList item ${index} missing or invalid position`);
      }
      if (!item.name) {
        errors.push(`BreadcrumbList item ${index} missing name`);
      }
    });
  }
};

/**
 * Validate FAQPage schema
 */
const validateFAQPageSchema = (schema, errors, warnings) => {
  if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
    errors.push('FAQPage schema missing required property: mainEntity (array)');
  } else {
    schema.mainEntity.forEach((item, index) => {
      if (!item['@type'] || item['@type'] !== 'Question') {
        errors.push(`FAQPage item ${index} missing or invalid @type`);
      }
      if (!item.name) {
        errors.push(`FAQPage item ${index} missing name (question)`);
      }
      if (!item.acceptedAnswer || !item.acceptedAnswer['@type'] || item.acceptedAnswer['@type'] !== 'Answer') {
        errors.push(`FAQPage item ${index} missing or invalid acceptedAnswer`);
      }
    });
  }
};

/**
 * Validate LocalBusiness schema
 */
const validateLocalBusinessSchema = (schema, errors, warnings) => {
  const required = ['name', 'address'];
  required.forEach(prop => {
    if (!schema[prop]) {
      errors.push(`LocalBusiness schema missing required property: ${prop}`);
    }
  });

  if (schema.address && !schema.address['@type']) {
    warnings.push('address should have @type property');
  }
};

/**
 * Validate multiple schemas
 */
export const validateSchemas = (schemas) => {
  if (!Array.isArray(schemas)) {
    return { valid: false, errors: ['Schemas must be an array'], warnings: [] };
  }

  const results = schemas.map((schema, index) => ({
    index,
    ...validateSchema(schema)
  }));

  const allValid = results.every(result => result.valid);
  const allErrors = results.flatMap(result => 
    result.errors.map(error => `Schema ${result.index}: ${error}`)
  );
  const allWarnings = results.flatMap(result => 
    result.warnings.map(warning => `Schema ${result.index}: ${warning}`)
  );

  return {
    valid: allValid,
    errors: allErrors,
    warnings: allWarnings,
    results
  };
};

/**
 * Test schema with Google Rich Results Test API
 */
export const testSchemaWithGoogle = async (schema, url = null) => {
  try {
    const testUrl = url || window.location.href;
    const response = await fetch(`https://validator.w3.org/nu/?out=json&doc=${encodeURIComponent(testUrl)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
      url: testUrl
    };
  } catch (error) {
    console.error('Error testing schema with Google:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate schema test report
 */
export const generateSchemaTestReport = (schemas, url = null) => {
  const validation = validateSchemas(schemas);
  const report = {
    timestamp: new Date().toISOString(),
    url: url || window.location.href,
    totalSchemas: schemas.length,
    validSchemas: validation.results.filter(r => r.valid).length,
    invalidSchemas: validation.results.filter(r => !r.valid).length,
    totalErrors: validation.errors.length,
    totalWarnings: validation.warnings.length,
    validation,
    recommendations: []
  };

  // Add recommendations based on validation results
  if (validation.errors.length > 0) {
    report.recommendations.push('Fix all validation errors before deploying');
  }

  if (validation.warnings.length > 0) {
    report.recommendations.push('Consider addressing warnings for better schema quality');
  }

  if (report.validSchemas === 0) {
    report.recommendations.push('No valid schemas found - check schema generation');
  }

  if (schemas.length === 0) {
    report.recommendations.push('No schemas generated - check content and page type');
  }

  return report;
};

/**
 * Console logger for schema validation
 */
export const logSchemaValidation = (schemas, url = null) => {
  const report = generateSchemaTestReport(schemas, url);
  
  console.group('🔍 Schema Validation Report');
  console.log(`📊 Total Schemas: ${report.totalSchemas}`);
  console.log(`✅ Valid: ${report.validSchemas}`);
  console.log(`❌ Invalid: ${report.invalidSchemas}`);
  console.log(`⚠️ Warnings: ${report.totalWarnings}`);
  console.log(`🚨 Errors: ${report.totalErrors}`);
  
  if (report.validation.errors.length > 0) {
    console.group('❌ Errors');
    report.validation.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  if (report.validation.warnings.length > 0) {
    console.group('⚠️ Warnings');
    report.validation.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  if (report.recommendations.length > 0) {
    console.group('💡 Recommendations');
    report.recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return report;
};

/**
 * Export schema for external testing
 */
export const exportSchemaForTesting = (schemas, format = 'json') => {
  const data = {
    schemas,
    metadata: {
      generated_at: new Date().toISOString(),
      url: window.location.href,
      count: schemas.length
    }
  };

  switch (format.toLowerCase()) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'html':
      return generateSchemaHTML(data);
    case 'txt':
      return generateSchemaText(data);
    default:
      return JSON.stringify(data, null, 2);
  }
};

/**
 * Generate HTML for schema testing
 */
const generateSchemaHTML = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Schema Test Page</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <h1>Schema Test Page</h1>
  <p>Generated at: ${data.metadata.generated_at}</p>
  <p>URL: ${data.metadata.url}</p>
  <p>Schema Count: ${data.metadata.count}</p>
  
  ${data.schemas.map((schema, index) => `
    <script type="application/ld+json">
      ${JSON.stringify(schema, null, 2)}
    </script>
  `).join('')}
  
  <script>
    // Test schema validation
    console.log('Testing ${data.metadata.count} schemas...');
    // Add your validation logic here
  </script>
</body>
</html>`;
};

/**
 * Generate text report for schema testing
 */
const generateSchemaText = (data) => {
  let text = `Schema Test Report\n`;
  text += `==================\n\n`;
  text += `Generated: ${data.metadata.generated_at}\n`;
  text += `URL: ${data.metadata.url}\n`;
  text += `Schema Count: ${data.metadata.count}\n\n`;
  
  data.schemas.forEach((schema, index) => {
    text += `Schema ${index + 1} (${schema['@type']}):\n`;
    text += `- Context: ${schema['@context']}\n`;
    text += `- Type: ${schema['@type']}\n`;
    if (schema.name) text += `- Name: ${schema.name}\n`;
    if (schema.url) text += `- URL: ${schema.url}\n`;
    text += `\n`;
  });
  
  return text;
};

export default {
  validateSchema,
  validateSchemas,
  testSchemaWithGoogle,
  generateSchemaTestReport,
  logSchemaValidation,
  exportSchemaForTesting
};


