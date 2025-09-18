import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import csv from 'csv-parser';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image') {
      cb(null, 'uploads/images/');
    } else if (file.fieldname === 'pdf') {
      cb(null, 'uploads/pdfs/');
    } else if (file.fieldname === 'file') {
      cb(null, 'uploads/temp/'); // For bulk import files
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit for bulk import
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for product images'));
      }
    } else if (file.fieldname === 'pdf') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for datasheets'));
      }
    } else if (file.fieldname === 'file') {
      // Allow CSV and Excel files for bulk import
      const allowedMimes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV and Excel files are allowed for bulk import'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database connection with better error handling
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // XAMPP default password is empty
  database: process.env.DB_NAME || 'zebra_db',
  multipleStatements: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please make sure:');
    console.error('1. XAMPP is running');
    console.error('2. MySQL service is started');
    console.error('3. Database "zebra_db" exists');
    console.error('4. Database has been imported with the correct tables');
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL database: zebra_db');
    console.log('📊 Database connection established successfully');
  }
});

// Handle database disconnection
db.on('error', (err) => {
  console.error('❌ Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Attempting to reconnect to database...');
    db.connect();
  } else {
    throw err;
  }
});

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  db.query('SELECT 1 as test', (err, results) => {
    if (err) {
      res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed',
        error: err.message 
      });
    } else {
      res.json({ 
        status: 'success', 
        message: 'Database connected successfully',
        database: 'zebra_db',
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Products query error:', err);
      res.status(500).json({ error: 'Database query failed' });
    } else {
      res.json(results);
    }
  });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM products WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database query failed' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// Get products by category
app.get('/api/products/category/:category', (req, res) => {
  const { category } = req.params;
  const query = 'SELECT * FROM products WHERE category = ?';
  db.query(query, [category], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database query failed' });
    } else {
      res.json(results);
    }
  });
});

// Search products
app.get('/api/products/search/:query', (req, res) => {
  const { query } = req.params;
  const searchQuery = 'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?';
  const searchTerm = `%${query}%`;
  db.query(searchQuery, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database query failed' });
    } else {
      res.json(results);
    }
  });
});

// Add new product with file upload (for admin panel)
app.post('/api/products', upload.any(), (req, res) => {
  try {
      console.log('Received product data:', req.body);
      console.log('Received files:', req.files);
      
      const {
        name, slug, category, subcategory, shortDescription, description, specifications,
        sku, metaKeywords, metaTitle, metaDescription, status, featured
      } = req.body;

    // Get file paths
    let imagePath = null;
    let pdfPath = null;
    
    if (req.files) {
      req.files.forEach(file => {
        if (file.fieldname === 'image') {
          imagePath = `/uploads/images/${file.filename}`;
        } else if (file.fieldname === 'pdf') {
          pdfPath = `/uploads/pdfs/${file.filename}`;
        }
      });
    }

    // Parse features if it's a string
    let features = [];
    if (specifications) {
      try {
        features = JSON.parse(specifications);
      } catch (e) {
        // If not JSON, split by newlines
        features = specifications.split('\n').filter(f => f.trim());
      }
    }

    const query = `INSERT INTO products (
      name, slug, category, subcategory_id, shortDescription, description, specifications,
      sku, metaKeywords, metaTitle, metaDescription, status, featured,
      image, pdf, features, inStock, rating, reviews
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      name, slug, category, subcategory || null, shortDescription, description, specifications,
      sku, metaKeywords, metaTitle, metaDescription, status, featured ? 1 : 0,
      imagePath, pdfPath, JSON.stringify(features), 1, 0, 0
    ];
    
    db.query(query, values, (err, results) => {
    if (err) {
        console.error('Error adding product:', err);
      res.status(500).json({ error: 'Failed to add product' });
    } else {
        res.json({ 
          id: results.insertId, 
          message: 'Product added successfully' 
        });
    }
  });
  } catch (error) {
    console.error('Error processing product:', error);
    res.status(500).json({ error: 'Failed to process product' });
  }
});

// Update product (for admin panel)
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, price, image, description, features, inStock, rating, reviews } = req.body;
  const query = 'UPDATE products SET name = ?, category = ?, price = ?, image = ?, description = ?, features = ?, inStock = ?, rating = ?, reviews = ? WHERE id = ?';
  const featuresJson = JSON.stringify(features);
  
  db.query(query, [name, category, price, image, description, featuresJson, inStock, rating, reviews, id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to update product' });
    } else {
      res.json({ message: 'Product updated successfully' });
    }
  });
});

// Delete product (for admin panel)
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to delete product' });
    } else {
      res.json({ message: 'Product deleted successfully' });
    }
  });
});

// Bulk import products from CSV/Excel (New enhanced version)
app.post('/api/products/bulk-import', upload.single('file'), async (req, res) => {
  try {
    console.log('Bulk import request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request files:', req.files);
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`File uploaded: ${req.file.originalname}, size: ${req.file.size} bytes`);
    
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let products = [];

    console.log(`Processing ${fileExtension} file...`);

    // Process file based on extension
    if (fileExtension === '.csv') {
      products = await processCSVFile(filePath);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      products = await processExcelFile(filePath);
    } else {
      console.log('Unsupported file format:', fileExtension);
      return res.status(400).json({ error: 'Unsupported file format. Please upload CSV or Excel files.' });
    }

    console.log(`Parsed ${products.length} products from file`);

    // Enhanced validation with detailed error reporting
    const validationResult = validateProductsEnhanced(products);
    if (!validationResult.isValid) {
      console.log('Validation failed:', validationResult.errors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors: validationResult.errors 
      });
    }

    console.log('Validation passed, inserting products...');
    console.log(`Starting database insertion for ${products.length} products...`);

    // Insert products into database with enhanced error handling
    const insertResult = await insertProductsEnhanced(products);
    console.log('Database insertion completed');
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
      console.log('Uploaded file cleaned up');
    } catch (cleanupError) {
      console.warn('Failed to clean up uploaded file:', cleanupError.message);
    }

    console.log('Bulk import completed successfully');
    res.json({
      message: 'Products imported successfully',
      successful: insertResult.successful,
      failed: insertResult.failed,
      total: products.length,
      summary: {
        successRate: `${Math.round((insertResult.successful / products.length) * 100)}%`,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import products', details: error.message });
  }
});

// Legacy import endpoint (keeping for backward compatibility)
app.post('/api/products/import', upload.single('file'), async (req, res) => {
  try {
    console.log('Import request received');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`File uploaded: ${req.file.originalname}, size: ${req.file.size} bytes`);
    
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let products = [];

    console.log(`Processing ${fileExtension} file...`);

    // Process file based on extension
    if (fileExtension === '.csv') {
      products = await processCSVFile(filePath);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      products = await processExcelFile(filePath);
    } else {
      console.log('Unsupported file format:', fileExtension);
      return res.status(400).json({ error: 'Unsupported file format. Please upload CSV or Excel files.' });
    }

    console.log(`Parsed ${products.length} products from file`);

    // Validate products data
    console.log('Validating products...');
    const validationResult = validateProducts(products);
    if (!validationResult.isValid) {
      console.log('Validation failed:', validationResult.errors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.errors 
      });
    }

    console.log('Validation passed, inserting products...');
    console.log(`Starting database insertion for ${products.length} products...`);

    // Insert products into database
    const insertResult = await insertProducts(products);
    console.log('Database insertion completed');
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
      console.log('Uploaded file cleaned up');
    } catch (cleanupError) {
      console.warn('Failed to clean up uploaded file:', cleanupError.message);
    }

    console.log('Import completed successfully');
    res.json({
      message: 'Products imported successfully',
      imported: insertResult.inserted,
      failed: insertResult.failed,
      total: products.length
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import products', details: error.message });
  }
});

// Helper function to process CSV file
async function processCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const products = [];
    console.log(`Reading CSV file: ${filePath}`);
    
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Only log first few rows to avoid spam
        if (products.length < 3) {
          console.log('CSV row sample:', row);
        }
        products.push(row);
      })
      .on('end', () => {
        console.log(`CSV processing completed. Found ${products.length} rows`);
        resolve(products);
      })
      .on('error', (error) => {
        console.error('CSV processing error:', error);
        reject(error);
      });
  });
}

// Helper function to process Excel file
async function processExcelFile(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  return jsonData;
}

// Enhanced validation function with detailed error reporting
function validateProductsEnhanced(products) {
  const errors = [];
  const requiredFields = ['name', 'category'];
  const expectedSchema = [
    'name', 'slug', 'category', 'subcategory', 'shortDescription', 'description', 
    'specifications', 'sku', 'metaKeywords', 'metaTitle', 'metaDescription', 
    'status', 'featured', 'image', 'pdf'
  ];
  
  products.forEach((product, index) => {
    const rowNumber = index + 2; // +2 because CSV starts from row 2 (after header)
    const productName = product.name || `Row ${rowNumber}`;
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!product[field] || product[field].toString().trim() === '') {
        errors.push({
          rowNumber: rowNumber,
          productName: productName,
          error: `${field} is required`
        });
      }
    });

    // Validate status
    if (product.status && !['active', 'inactive'].includes(product.status.toLowerCase())) {
      errors.push({
        rowNumber: rowNumber,
        productName: productName,
        error: `Status must be 'active' or 'inactive', got: ${product.status}`
      });
    }

    // Validate featured
    if (product.featured && !['true', 'false', '1', '0', 'yes', 'no'].includes(product.featured.toString().toLowerCase())) {
      errors.push({
        rowNumber: rowNumber,
        productName: productName,
        error: `Featured must be 'true' or 'false', got: ${product.featured}`
      });
    }

    // Check for local file paths in image field
    if (product.image && (product.image.includes('C:\\') || product.image.includes('C:/'))) {
      errors.push({
        rowNumber: rowNumber,
        productName: productName,
        error: `Image path should not be a local file path. Please use relative paths or URLs.`
      });
    }

    // Check for local file paths in pdf field
    if (product.pdf && (product.pdf.includes('C:\\') || product.pdf.includes('C:/'))) {
      errors.push({
        rowNumber: rowNumber,
        productName: productName,
        error: `PDF path should not be a local file path. Please use relative paths or URLs.`
      });
    }

    // Check for empty columns at the end
    const productKeys = Object.keys(product);
    const lastNonEmptyIndex = productKeys.length - 1;
    for (let i = lastNonEmptyIndex; i >= 0; i--) {
      if (product[productKeys[i]] && product[productKeys[i]].toString().trim() !== '') {
        break;
      }
      if (i < productKeys.length - 1) {
        errors.push({
          rowNumber: rowNumber,
          productName: productName,
          error: `Empty columns detected at the end of the row`
        });
        break;
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Legacy validation function (keeping for backward compatibility)
function validateProducts(products) {
  const errors = [];
  const requiredFields = ['name', 'slug', 'category', 'sku'];
  
  products.forEach((product, index) => {
    const rowNumber = index + 2; // +2 because CSV starts from row 2 (after header)
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!product[field] || product[field].toString().trim() === '') {
        errors.push(`Row ${rowNumber}: ${field} is required`);
      }
    });

    // Validate status
    if (product.status && !['active', 'inactive'].includes(product.status.toLowerCase())) {
      errors.push(`Row ${rowNumber}: Status must be 'active' or 'inactive'`);
    }

    // Validate featured
    if (product.featured && !['true', 'false', '1', '0', 'yes', 'no'].includes(product.featured.toString().toLowerCase())) {
      errors.push(`Row ${rowNumber}: Featured must be 'true' or 'false'`);
    }

    // Check for local file paths in image field
    if (product.image && (product.image.includes('C:\\') || product.image.includes('C:/'))) {
      errors.push(`Row ${rowNumber}: Image path should not be a local file path. Please use relative paths or URLs.`);
    }

    // Check for local file paths in pdf field
    if (product.pdf && (product.pdf.includes('C:\\') || product.pdf.includes('C:/'))) {
      errors.push(`Row ${rowNumber}: PDF path should not be a local file path. Please use relative paths or URLs.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Enhanced insertion function with better error handling
async function insertProductsEnhanced(products) {
  const successful = [];
  const failed = [];

  console.log(`Starting to insert ${products.length} products...`);

  // Process products in batches of 10 for better performance
  const batchSize = 10;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)} (${batch.length} products)`);
    
    for (const product of batch) {
      try {
        const query = `INSERT INTO products (
          name, slug, category, subcategory_id, shortDescription, description, specifications,
          sku, metaKeywords, metaTitle, metaDescription, status, featured,
          image, pdf, features, inStock, rating, reviews
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // Handle subcategory mapping - support both 'subcategory' and 'subcategory_id'
        let subcategoryId = null;
        if (product.subcategory_id) {
          subcategoryId = product.subcategory_id;
        } else if (product.subcategory) {
          // If subcategory is provided as name, we need to find the ID
          // For now, we'll set it to null and let the user know
          subcategoryId = null;
        }

        // Generate unique slug if needed
        let finalSlug = product.slug?.toString().trim() || null;
        if (finalSlug) {
          // Check if slug already exists and make it unique
          const slugCheck = await new Promise((resolve) => {
            db.query('SELECT id FROM products WHERE slug = ?', [finalSlug], (err, results) => {
              if (err) {
                console.error('Slug check error:', err);
                resolve(false);
              } else {
                resolve(results.length > 0);
              }
            });
          });
          
          if (slugCheck) {
            // Generate unique slug by adding random number
            const randomNum = Math.floor(Math.random() * 10000);
            finalSlug = `${finalSlug}-${randomNum}`;
            console.log(`Generated unique slug: ${finalSlug}`);
          }
        }

        // Clean image and PDF paths - remove local file paths
        let imagePath = product.image?.toString().trim() || null;
        let pdfPath = product.pdf?.toString().trim() || null;
        
        if (imagePath && (imagePath.includes('C:\\') || imagePath.includes('C:/'))) {
          imagePath = null; // Don't import local file paths
        }
        
        if (pdfPath && (pdfPath.includes('C:\\') || pdfPath.includes('C:/'))) {
          pdfPath = null; // Don't import local file paths
        }

        const values = [
          product.name?.toString().trim(),
          finalSlug,
          product.category?.toString().trim(),
          subcategoryId,
          product.shortDescription?.toString().trim() || null,
          product.description?.toString().trim() || null,
          product.specifications?.toString().trim() || null,
          product.sku?.toString().trim(),
          product.metaKeywords?.toString().trim() || null,
          product.metaTitle?.toString().trim() || null,
          product.metaDescription?.toString().trim() || null,
          product.status?.toString().toLowerCase() || 'active',
          ['true', '1', 'yes'].includes(product.featured?.toString().toLowerCase()) ? 1 : 0,
          imagePath,
          pdfPath,
          product.features ? JSON.stringify(product.features) : JSON.stringify([]),
          1, // inStock
          0, // rating
          0  // reviews
        ];

        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Database query timeout'));
          }, 15000); // 15 second timeout per product for reliable processing

          db.query(query, values, (err, result) => {
            clearTimeout(timeout);
            if (err) {
              if (err.code === 'ER_DUP_ENTRY') {
                console.log(`Duplicate entry detected for product ${product.name}, trying with unique slug...`);
                // Try again with a unique slug
                const uniqueSlug = `${product.slug || 'product'}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const uniqueValues = [...values];
                uniqueValues[1] = uniqueSlug; // Update slug in values array
                
                db.query(query, uniqueValues, (retryErr, retryResult) => {
                  if (retryErr) {
                    console.error(`Failed to insert product ${product.name} even with unique slug:`, retryErr.message);
                    reject(retryErr);
                  } else {
                    console.log(`Successfully inserted product ${product.name} with unique slug: ${uniqueSlug}`);
                    resolve(retryResult);
                  }
                });
              } else {
                console.error(`Database error for product ${product.name}:`, err.message);
                reject(err);
              }
            } else {
              resolve(result);
            }
          });
        });

        successful.push({
          name: product.name,
          id: result.insertId
        });
      } catch (error) {
        console.error(`Failed to insert product ${product.name}:`, error.message);
        failed.push({
          rowNumber: products.indexOf(product) + 2,
          productName: product.name,
          error: error.message
        });
      }
    }
  }

  console.log(`Import completed. Successful: ${successful.length}, Failed: ${failed.length}`);
  return { successful: successful.length, failed };
}

// Legacy insertion function (keeping for backward compatibility)
async function insertProducts(products) {
  const inserted = [];
  const failed = [];

  console.log(`Starting to insert ${products.length} products...`);

  // Process products in batches of 5 for better performance with larger files
  const batchSize = 5;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)} (${batch.length} products)`);
    
    for (const product of batch) {
      try {
        const query = `INSERT INTO products (
          name, slug, category, subcategory_id, shortDescription, description, specifications,
          sku, metaKeywords, metaTitle, metaDescription, status, featured,
          image, pdf, features, inStock, rating, reviews
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // Handle subcategory mapping - support both 'subcategory' and 'subcategory_id'
        let subcategoryId = null;
        if (product.subcategory_id) {
          subcategoryId = product.subcategory_id;
        } else if (product.subcategory) {
          // If subcategory is provided as name, we need to find the ID
          // For now, we'll set it to null and let the user know
          subcategoryId = null;
        }

        // Generate unique slug if needed
        let finalSlug = product.slug?.toString().trim() || null;
        if (finalSlug) {
          // Check if slug already exists and make it unique
          const slugCheck = await new Promise((resolve) => {
            db.query('SELECT id FROM products WHERE slug = ?', [finalSlug], (err, results) => {
              if (err) {
                console.error('Slug check error:', err);
                resolve(false);
              } else {
                resolve(results.length > 0);
              }
            });
          });
          
          if (slugCheck) {
            // Generate unique slug by adding random number
            const randomNum = Math.floor(Math.random() * 10000);
            finalSlug = `${finalSlug}-${randomNum}`;
            console.log(`Generated unique slug: ${finalSlug}`);
          }
        }

        // Clean image and PDF paths - remove local file paths
        let imagePath = product.image?.toString().trim() || null;
        let pdfPath = product.pdf?.toString().trim() || null;
        
        if (imagePath && (imagePath.includes('C:\\') || imagePath.includes('C:/'))) {
          imagePath = null; // Don't import local file paths
        }
        
        if (pdfPath && (pdfPath.includes('C:\\') || pdfPath.includes('C:/'))) {
          pdfPath = null; // Don't import local file paths
        }

        const values = [
          product.name?.toString().trim(),
          finalSlug,
          product.category?.toString().trim(),
          subcategoryId,
          product.shortDescription?.toString().trim() || null,
          product.description?.toString().trim() || null,
          product.specifications?.toString().trim() || null,
          product.sku?.toString().trim(),
          product.metaKeywords?.toString().trim() || null,
          product.metaTitle?.toString().trim() || null,
          product.metaDescription?.toString().trim() || null,
          product.status?.toString().toLowerCase() || 'active',
          ['true', '1', 'yes'].includes(product.featured?.toString().toLowerCase()) ? 1 : 0,
          imagePath,
          pdfPath,
          product.features ? JSON.stringify(product.features) : JSON.stringify([]),
          1, // inStock
          0, // rating
          0  // reviews
        ];

        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Database query timeout'));
          }, 10000); // 10 second timeout per product for reliable processing

          db.query(query, values, (err, result) => {
            clearTimeout(timeout);
            if (err) {
              if (err.code === 'ER_DUP_ENTRY') {
                console.log(`Duplicate entry detected for product ${product.name}, trying with unique slug...`);
                // Try again with a unique slug
                const uniqueSlug = `${product.slug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const uniqueValues = [...values];
                uniqueValues[1] = uniqueSlug; // Update slug in values array
                
                db.query(query, uniqueValues, (retryErr, retryResult) => {
                  if (retryErr) {
                    console.error(`Failed to insert product ${product.name} even with unique slug:`, retryErr.message);
                    reject(retryErr);
                  } else {
                    console.log(`Successfully inserted product ${product.name} with unique slug: ${uniqueSlug}`);
                    resolve(retryResult);
                  }
                });
              } else {
                console.error(`Database error for product ${product.name}:`, err.message);
                reject(err);
              }
            } else {
              resolve(result);
            }
          });
        });

        inserted.push(product.name);
      } catch (error) {
        console.error(`Failed to insert product ${product.name}:`, error.message);
        failed.push({
          product: product.name,
          error: error.message
        });
      }
    }
  }

  console.log(`Import completed. Inserted: ${inserted.length}, Failed: ${failed.length}`);
  return { inserted, failed };
}

// ==================== CATEGORIES API ====================
// Get all categories
app.get('/api/categories', (req, res) => {
  const query = 'SELECT * FROM categories ORDER BY name ASC';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    } else {
      res.json(results);
    }
  });
});

// Get single category
app.get('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM categories WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch category' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// Create category
app.post('/api/categories', upload.single('image'), (req, res) => {
  try {
    const { name, display_name, description } = req.body;
    const imagePath = req.file ? `/uploads/images/${req.file.filename}` : null;

    const query = `INSERT INTO categories (name, display_name, description, image) 
                   VALUES (?, ?, ?, ?)`;
    
    const values = [name, display_name, description, imagePath];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error adding category:', err);
        res.status(500).json({ error: 'Failed to add category' });
      } else {
        res.json({ id: results.insertId, message: 'Category added successfully' });
      }
    });
  } catch (error) {
    console.error('Error processing category:', error);
    res.status(500).json({ error: 'Failed to process category' });
  }
});

// Update category
app.put('/api/categories/:id', upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, display_name, description } = req.body;
    
    let query = 'UPDATE categories SET name = ?, display_name = ?, description = ?';
    let values = [name, display_name, description];

    if (req.file) {
      query += ', image = ?';
      values.push(`/uploads/images/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    values.push(id);

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ error: 'Failed to update category' });
      } else {
        res.json({ message: 'Category updated successfully' });
      }
    });
  } catch (error) {
    console.error('Error processing category update:', error);
    res.status(500).json({ error: 'Failed to process category update' });
  }
});

// Delete category
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM categories WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to delete category' });
    } else {
      res.json({ message: 'Category deleted successfully' });
    }
  });
});

// ==================== SUBCATEGORIES API ====================
// Get all subcategories
app.get('/api/subcategories', (req, res) => {
  const query = `SELECT s.*, c.name as category_name, c.display_name as category_display_name 
                 FROM subcategories s 
                 LEFT JOIN categories c ON s.category_id = c.id 
                 ORDER BY s.name ASC`;
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch subcategories' });
    } else {
      res.json(results);
    }
  });
});

// ==================== DROPDOWN API ====================
// Get dropdown data for navigation
app.get('/api/dropdown-data', (req, res) => {
  const query = `
    SELECT 
      c.id as category_id,
      c.name as category_name,
      c.display_name as category_display_name,
      c.description as category_description,
      c.image as category_image,
      s.id as subcategory_id,
      s.name as subcategory_name,
      s.display_name as subcategory_display_name,
      s.description as subcategory_description
    FROM categories c
    LEFT JOIN subcategories s ON c.id = s.category_id
    ORDER BY c.display_name ASC, s.display_name ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch dropdown data' });
    } else {
      // Group data by category
      const dropdownData = {};
      results.forEach(row => {
        if (!dropdownData[row.category_name]) {
          dropdownData[row.category_name] = {
            id: row.category_id,
            display_name: row.category_display_name,
            description: row.category_description,
            image: row.category_image,
            subcategories: []
          };
        }
        
        if (row.subcategory_name) {
          dropdownData[row.category_name].subcategories.push({
            id: row.subcategory_id,
            name: row.subcategory_name,
            display_name: row.subcategory_display_name,
            description: row.subcategory_description
          });
        }
      });
      
      res.json(dropdownData);
    }
  });
});

// Get single subcategory
app.get('/api/subcategories/:id', (req, res) => {
  const { id } = req.params;
  const query = `SELECT s.*, c.name as category_name, c.display_name as category_display_name 
                 FROM subcategories s 
                 LEFT JOIN categories c ON s.category_id = c.id 
                 WHERE s.id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch subcategory' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Subcategory not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// Create subcategory
app.post('/api/subcategories', upload.single('image'), (req, res) => {
  try {
    const { name, display_name, category_id, description } = req.body;
    const imagePath = req.file ? `/uploads/images/${req.file.filename}` : null;

    const query = `INSERT INTO subcategories (name, display_name, category_id, description, image) 
                   VALUES (?, ?, ?, ?, ?)`;
    
    const values = [name, display_name, category_id, description, imagePath];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error adding subcategory:', err);
        res.status(500).json({ error: 'Failed to add subcategory' });
      } else {
        res.json({ id: results.insertId, message: 'Subcategory added successfully' });
      }
    });
  } catch (error) {
    console.error('Error processing subcategory:', error);
    res.status(500).json({ error: 'Failed to process subcategory' });
  }
});

// Update subcategory
app.put('/api/subcategories/:id', upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, display_name, category_id, description } = req.body;
    
    let query = 'UPDATE subcategories SET name = ?, display_name = ?, category_id = ?, description = ?';
    let values = [name, display_name, category_id, description];

    if (req.file) {
      query += ', image = ?';
      values.push(`/uploads/images/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    values.push(id);

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error updating subcategory:', err);
        res.status(500).json({ error: 'Failed to update subcategory' });
      } else {
        res.json({ message: 'Subcategory updated successfully' });
      }
    });
  } catch (error) {
    console.error('Error processing subcategory update:', error);
    res.status(500).json({ error: 'Failed to process subcategory update' });
  }
});

// Delete subcategory
app.delete('/api/subcategories/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM subcategories WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to delete subcategory' });
    } else {
      res.json({ message: 'Subcategory deleted successfully' });
    }
  });
});

// ==================== BRANDS API ====================
// Get all brands
app.get('/api/brands', (req, res) => {
  const query = 'SELECT * FROM brands ORDER BY name ASC';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch brands' });
    } else {
      res.json(results);
    }
  });
});

// Get single brand
app.get('/api/brands/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM brands WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch brand' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Brand not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// Create brand
app.post('/api/brands', upload.single('logo'), (req, res) => {
  try {
    const { name, display_name, description, website } = req.body;
    const logoPath = req.file ? `/uploads/images/${req.file.filename}` : null;

    const query = `INSERT INTO brands (name, display_name, description, website, logo) 
                   VALUES (?, ?, ?, ?, ?)`;
    
    const values = [name, display_name, description, website, logoPath];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error adding brand:', err);
        res.status(500).json({ error: 'Failed to add brand' });
      } else {
        res.json({ id: results.insertId, message: 'Brand added successfully' });
      }
    });
  } catch (error) {
    console.error('Error processing brand:', error);
    res.status(500).json({ error: 'Failed to process brand' });
  }
});

// Update brand
app.put('/api/brands/:id', upload.single('logo'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, display_name, description, website } = req.body;
    
    let query = 'UPDATE brands SET name = ?, display_name = ?, description = ?, website = ?';
    let values = [name, display_name, description, website];

    if (req.file) {
      query += ', logo = ?';
      values.push(`/uploads/images/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    values.push(id);

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error updating brand:', err);
        res.status(500).json({ error: 'Failed to update brand' });
      } else {
        res.json({ message: 'Brand updated successfully' });
      }
    });
  } catch (error) {
    console.error('Error processing brand update:', error);
    res.status(500).json({ error: 'Failed to process brand update' });
  }
});

// Delete brand
app.delete('/api/brands/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM brands WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to delete brand' });
    } else {
      res.json({ message: 'Brand deleted successfully' });
    }
  });
});

// Sample Excel download endpoint
app.get('/api/import/sample-excel', (req, res) => {
  try {
    const sampleData = [
      {
        name: 'Zebra ZD421 Desktop Printer',
        slug: 'zebra-zd421-desktop-printer',
        category: 'Printers',
        subcategory: 'Desktop',
        shortDescription: 'High-performance desktop printer for barcode labels',
        description: 'The Zebra ZD421 is a high-performance desktop printer designed for barcode labels. Perfect for small to medium businesses.',
        specifications: 'Print Resolution: 203 DPI\nPrint Width: 4 inches\nConnectivity: USB, Ethernet\nPrint Speed: 6 inches per second',
        sku: 'ZEB-ZD421',
        metaKeywords: 'zebra printer,desktop printer,barcode printer,thermal printer',
        metaTitle: 'Zebra ZD421 Desktop Printer - High Performance Barcode Printer',
        metaDescription: 'Professional desktop barcode printer for small to medium businesses. Features 203 DPI resolution and 4-inch print width.',
        status: 'active',
        featured: 'true',
        image: '/uploads/images/zebra-zd421.jpg',
        pdf: '/uploads/pdfs/zebra-zd421-datasheet.pdf'
      },
      {
        name: 'Zebra ZT411 Industrial Printer',
        slug: 'zebra-zt411-industrial-printer',
        category: 'Printers',
        subcategory: 'Industrial',
        shortDescription: 'Industrial-grade printer for heavy-duty applications',
        description: 'The Zebra ZT411 is built for industrial environments with heavy-duty construction and reliable performance.',
        specifications: 'Print Resolution: 300 DPI\nPrint Width: 6 inches\nConnectivity: USB, Ethernet, Serial\nPrint Speed: 12 inches per second',
        sku: 'ZEB-ZT411',
        metaKeywords: 'zebra printer,industrial printer,heavy duty printer,thermal printer',
        metaTitle: 'Zebra ZT411 Industrial Printer - Heavy Duty Barcode Printer',
        metaDescription: 'Industrial-grade thermal printer for heavy-duty applications. Features 300 DPI resolution and 6-inch print width.',
        status: 'active',
        featured: 'false',
        image: '/uploads/images/zebra-zt411.jpg',
        pdf: '/uploads/pdfs/zebra-zt411-datasheet.pdf'
      }
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="sample_products.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating sample Excel:', error);
    res.status(500).json({ error: 'Failed to generate sample Excel file' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
