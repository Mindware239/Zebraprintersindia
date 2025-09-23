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
import process from 'process';
import session from 'express-session';
import { setupDatabase, checkDatabaseConnection } from './setup_database_caprover.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: 'process.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image') {
      cb(null, 'uploads/images/');
    } else if (file.fieldname === 'pdf') {
      cb(null, 'uploads/pdfs/');
    } else if (file.fieldname === 'file') {
      if (req.path.includes('/drivers')) {
        cb(null, 'uploads/drivers/');
      } else {
        cb(null, 'uploads/temp/'); // For bulk import files
      }
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
      if (req.path.includes('/drivers')) {
        // For driver files
        const allowedTypes = [
          'application/x-msdownload', // .exe
          'application/x-msi', // .msi
          'application/x-apple-diskimage', // .dmg
          'application/x-pkg', // .pkg
          'application/vnd.debian.binary-package', // .deb
          'application/x-rpm', // .rpm
          'application/vnd.android.package-archive', // .apk
          'application/octet-stream' // Generic binary files
        ];
        const allowedExtensions = ['.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.apk', '.ipa'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
          cb(null, true);
        } else {
          cb(new Error('Only executable files (.exe, .msi, .dmg, .pkg, .deb, .rpm, .apk, .ipa) are allowed for drivers'));
        }
      } else {
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
      }
    } else {
      cb(null, true);
    }
  }
});

// Middleware
app.use(cors({
  origin: true, // Allow all origins for CapRover
  credentials: true,
  optionsSuccessStatus: 200
}));

// Additional CORS headers to ensure credentials are properly set
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'zebra-printers-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
// Database connection pool with better error handling
const db = mysql.createPool({
  // Use environment variables from CapRover or local defaults
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'zebra_db',
  multipleStatements: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/downloads', express.static('uploads/drivers'));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Database connection middleware
app.use((req, res, next) => {
  // Add database connection to request object
  req.db = db;
  next();
});

// Database connection will be tested when first API call is made
console.log('⚠️  Database connection will be tested on first API call');

// Handle database pool errors
db.on('error', (err) => {
  console.error('❌ Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Connection lost, pool will handle reconnection...');
  } else {
    console.error('❌ Database error (non-fatal):', err.message);
    console.log('⚠️  Continuing with fallback data...');
  }
});

// Handle uncaught database errors
process.on('uncaughtException', (err) => {
  if (err.code === 'ECONNREFUSED' && err.syscall === 'connect') {
    console.error('❌ Database connection refused - continuing with fallback data');
    console.log('⚠️  Server will continue running without database');
    // Don't exit, continue running
  } else {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
  }
});

// Routes

// Simple health check for CapRover
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint for CapRover health check - immediate response
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  db.getConnection((err, connection) => {
    if (err) {
      res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } else {
      connection.query('SELECT 1 as test', (queryErr) => {
        connection.release(); // Always release the connection back to the pool
        
        if (queryErr) {
          res.status(500).json({ 
            status: 'error', 
            message: 'Database query failed',
            error: queryErr.message,
            timestamp: new Date().toISOString()
          });
        } else {
          res.json({ 
            status: 'success', 
            message: 'Database connected successfully',
            database: process.env.MYSQL_DATABASE || 'zebra_db',
            timestamp: new Date().toISOString()
          });
        }
      });
    }
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  const query = `
    SELECT 
      p.*,
      s.name as subcategory_name,
      s.display_name as subcategory_display_name
    FROM products p
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    ORDER BY p.created_at DESC
  `;
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

// Get product by slug
app.get('/api/products/slug/:slug', (req, res) => {
  const { slug } = req.params;
  const query = 'SELECT * FROM products WHERE slug = ?';
  db.query(query, [slug], (err, results) => {
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
      } catch {
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
app.put('/api/products/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), (req, res) => {
  try {
    const { id } = req.params;
    console.log('PUT /api/products/:id - Received product data:', req.body);
    console.log('PUT /api/products/:id - Received files:', req.files);
    console.log('PUT /api/products/:id - Request headers:', req.headers);
    
    // Check if req.body exists and has data
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('PUT /api/products/:id - No data in req.body');
      return res.status(400).json({ error: 'No data received in request body' });
    }
    
    // Safely destructure with defaults
    const {
      name = '', slug = '', category = '', subcategory_id = '', 
      shortDescription = '', description = '', specifications = '',
      sku = '', metaKeywords = '', metaTitle = '', metaDescription = '', 
      status = 'active', featured = false
    } = req.body;

    // Get file paths
    let imagePath = null;
    let pdfPath = null;
    
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        imagePath = `/uploads/images/${req.files.image[0].filename}`;
      }
      if (req.files.pdf && req.files.pdf[0]) {
        pdfPath = `/uploads/pdfs/${req.files.pdf[0].filename}`;
      }
    }

    // Parse features if it's a string
    let features = [];
    if (specifications) {
      try {
        features = JSON.parse(specifications);
      } catch {
        // If not JSON, split by newlines
        features = specifications.split('\n').filter(f => f.trim());
      }
    }

    // Build dynamic query based on what fields are provided
    let query = 'UPDATE products SET ';
    let values = [];
    let setClauses = [];

    if (name) { setClauses.push('name = ?'); values.push(name); }
    if (slug) { setClauses.push('slug = ?'); values.push(slug); }
    if (category) { setClauses.push('category = ?'); values.push(category); }
    if (subcategory_id !== undefined) { setClauses.push('subcategory_id = ?'); values.push(subcategory_id || null); }
    if (shortDescription) { setClauses.push('shortDescription = ?'); values.push(shortDescription); }
    if (description) { setClauses.push('description = ?'); values.push(description); }
    if (specifications) { setClauses.push('specifications = ?'); values.push(specifications); }
    if (sku) { setClauses.push('sku = ?'); values.push(sku); }
    if (metaKeywords) { setClauses.push('metaKeywords = ?'); values.push(metaKeywords); }
    if (metaTitle) { setClauses.push('metaTitle = ?'); values.push(metaTitle); }
    if (metaDescription) { setClauses.push('metaDescription = ?'); values.push(metaDescription); }
    if (status) { setClauses.push('status = ?'); values.push(status); }
    if (featured !== undefined) { setClauses.push('featured = ?'); values.push(featured ? 1 : 0); }
    if (imagePath) { setClauses.push('image = ?'); values.push(imagePath); }
    if (pdfPath) { setClauses.push('pdf = ?'); values.push(pdfPath); }
    
    setClauses.push('features = ?'); values.push(JSON.stringify(features));
    setClauses.push('updated_at = NOW()'); // Always update the timestamp

    query += setClauses.join(', ') + ' WHERE id = ?';
    values.push(id);
    
    console.log('Update query:', query);
    console.log('Update values:', values);
    
    db.query(query, values, (err) => {
      if (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Failed to update product' });
      } else {
        res.json({ 
          id: id, 
          message: 'Product updated successfully' 
        });
      }
    });
  } catch (error) {
    console.error('Error processing product update:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to process product update',
      details: error.message 
    });
  }
});

// Delete product (for admin panel)
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  
  db.query(query, [id], (err) => {
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
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Uploaded file cleaned up after error');
      } catch (cleanupError) {
        console.warn('Failed to clean up uploaded file after error:', cleanupError.message);
      }
    }
    
    // Always return JSON response
    res.status(500).json({ 
      error: 'Failed to import products', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
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
    
    fs.createReadStream(filePath)
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
  // const expectedSchema = [
  //   'name', 'slug', 'category', 'subcategory', 'shortDescription', 'description', 
  //   'specifications', 'sku', 'metaKeywords', 'metaTitle', 'metaDescription', 
  //   'status', 'featured', 'image', 'pdf'
  // ];
  
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

    // Check for empty columns at the end (only warn, don't fail)
    const productKeys = Object.keys(product);
    const lastNonEmptyIndex = productKeys.length - 1;
    let emptyColumnsCount = 0;
    for (let i = lastNonEmptyIndex; i >= 0; i--) {
      if (product[productKeys[i]] && product[productKeys[i]].toString().trim() !== '') {
        break;
      }
      emptyColumnsCount++;
    }
    
    // Only warn if there are more than 3 empty columns (likely a real issue)
    if (emptyColumnsCount > 3) {
      console.warn(`Row ${rowNumber}: ${emptyColumnsCount} empty columns detected at the end`);
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
          // If subcategory is provided as name, find the corresponding ID
          try {
            const subcategoryQuery = 'SELECT id FROM subcategories WHERE name = ? OR display_name = ?';
            const subcategoryResult = await new Promise((resolve, reject) => {
              db.query(subcategoryQuery, [product.subcategory, product.subcategory], (err, result) => {
                if (err) reject(err);
                else resolve(result);
              });
            });
            
            if (subcategoryResult.length > 0) {
              subcategoryId = subcategoryResult[0].id;
            } else {
              console.warn(`Subcategory not found: ${product.subcategory}`);
            }
          } catch (error) {
            console.warn(`Error finding subcategory for ${product.subcategory}:`, error.message);
          }
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
          // If subcategory is provided as name, find the corresponding ID
          try {
            const subcategoryQuery = 'SELECT id FROM subcategories WHERE name = ? OR display_name = ?';
            const subcategoryResult = await new Promise((resolve, reject) => {
              db.query(subcategoryQuery, [product.subcategory, product.subcategory], (err, result) => {
                if (err) reject(err);
                else resolve(result);
              });
            });
            
            if (subcategoryResult.length > 0) {
              subcategoryId = subcategoryResult[0].id;
            } else {
              console.warn(`Subcategory not found: ${product.subcategory}`);
            }
          } catch (error) {
            console.warn(`Error finding subcategory for ${product.subcategory}:`, error.message);
          }
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

        await new Promise((resolve, reject) => {
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

    db.query(query, values, (err) => {
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
  
  db.query(query, [id], (err) => {
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

    db.query(query, values, (err) => {
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
  
  db.query(query, [id], (err) => {
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

    db.query(query, values, (err) => {
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
  
  db.query(query, [id], (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to delete brand' });
    } else {
      res.json({ message: 'Brand deleted successfully' });
    }
  });
});

// ==================== DRIVERS API ====================

// Get all drivers
app.get('/api/drivers', (req, res) => {
  const query = 'SELECT * FROM drivers WHERE status = "active" ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch drivers' });
    } else {
      // Format the results to match frontend expectations
      const formattedResults = results.map(driver => ({
        id: driver.id,
        name: driver.name,
        version: driver.version,
        category: driver.category,
        operatingSystem: driver.operating_system,
        description: driver.description,
        compatibility: driver.compatibility,
        fileName: driver.file_name,
        fileSize: driver.file_size ? formatFileSize(driver.file_size) : '0 Bytes',
        downloadUrl: driver.download_url || `/downloads/${driver.file_name}`,
        releaseDate: driver.release_date,
        status: driver.status
      }));
      res.json(formattedResults);
    }
  });
});

// Get single driver
app.get('/api/drivers/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM drivers WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch driver' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Driver not found' });
    } else {
      const driver = results[0];
      res.json({
        id: driver.id,
        name: driver.name,
        version: driver.version,
        category: driver.category,
        operatingSystem: driver.operating_system,
        description: driver.description,
        compatibility: driver.compatibility,
        fileName: driver.file_name,
        fileSize: driver.file_size ? formatFileSize(driver.file_size) : '0 Bytes',
        downloadUrl: driver.download_url || `/downloads/${driver.file_name}`,
        releaseDate: driver.release_date,
        status: driver.status
      });
    }
  });
});

// Create driver
app.post('/api/drivers', upload.single('file'), (req, res) => {
  try {
    const { name, version, category, operatingSystem, description, compatibility } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'Driver file is required' });
    }

    const filePath = `/uploads/drivers/${file.filename}`;
    const downloadUrl = `/downloads/${file.filename}`;
    const fileSize = file.size;

    const query = `INSERT INTO drivers (name, version, category, operating_system, description, compatibility, file_name, file_path, file_size, download_url, release_date)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
      name,
      version,
      category,
      operatingSystem,
      description,
      compatibility,
      file.originalname,
      filePath,
      fileSize,
      downloadUrl,
      new Date().toISOString().split('T')[0]
    ];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to create driver' });
      } else {
        res.json({ 
          message: 'Driver created successfully',
          id: results.insertId 
        });
      }
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ error: 'Failed to create driver' });
  }
});

// Update driver
app.put('/api/drivers/:id', upload.single('file'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, version, category, operatingSystem, description, compatibility } = req.body;
    const file = req.file;

    let query, values;

    if (file) {
      // Update with new file
      const filePath = `/uploads/drivers/${file.filename}`;
      const downloadUrl = `/downloads/${file.filename}`;
      const fileSize = file.size;

      query = `UPDATE drivers SET name = ?, version = ?, category = ?, operating_system = ?, 
               description = ?, compatibility = ?, file_name = ?, file_path = ?, file_size = ?, 
               download_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      values = [
        name, version, category, operatingSystem, description, compatibility,
        file.originalname, filePath, fileSize, downloadUrl, id
      ];
    } else {
      // Update without changing file
      query = `UPDATE drivers SET name = ?, version = ?, category = ?, operating_system = ?, 
               description = ?, compatibility = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      values = [name, version, category, operatingSystem, description, compatibility, id];
    }

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to update driver' });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ error: 'Driver not found' });
      } else {
        res.json({ message: 'Driver updated successfully' });
      }
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

// Delete driver
app.delete('/api/drivers/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM drivers WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to delete driver' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Driver not found' });
    } else {
      res.json({ message: 'Driver deleted successfully' });
    }
  });
});

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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

// ==================== AUTHENTICATION API ====================
// Check authentication status
app.get('/api/auth/check', (req, res) => {
  // Check if user is authenticated via session
  if (req.session && req.session.user) {
    res.json({ 
      isAuthenticated: true, 
      user: req.session.user 
    });
  } else {
    res.json({ 
      isAuthenticated: false, 
      user: null 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password, rememberMe } = req.body;
  
  console.log('Login attempt:', { username, password, rememberMe });
  
  // Simple hardcoded admin credentials for now
  if (username === 'admin' && password === 'admin123') {
    // Store user data in session
    const user = {
      id: 1,
      username: 'admin',
      email: 'admin@zebra.com',
      role: 'admin'
    };
    
    req.session.user = user;
    
    // Set session cookie expiration based on rememberMe
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    }
    
    res.json({
      success: true,
      user: user,
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

// Register endpoint (placeholder)
app.post('/api/auth/register', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Registration not implemented yet'
  });
});

// Change password endpoint (placeholder)
app.post('/api/auth/change-password', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Change password not implemented yet'
  });
});

// Update profile endpoint (placeholder)
app.put('/api/auth/profile', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Update profile not implemented yet'
  });
});

// All React routes are handled by the catch-all route below

// Global error handler to ensure JSON responses
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }
  
  // Always return JSON response
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// ==================== AUTHENTICATION MIDDLEWARE ====================
// Simple admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  // For now, we'll allow all requests (you can add proper authentication later)
  // In production, you should implement proper JWT or session-based authentication
  next();
};

// ==================== BLOGS API ====================
// Get all blogs
app.get('/api/blogs', (req, res) => {
  const { page = 1, limit = 10, category, status = 'published' } = req.query;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM blogs WHERE status = ?';
  let params = [status];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Blogs query error:', err);
      
      // If database is not available, return sample data for development
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample blog data');
        const sampleBlogs = [
          {
            id: 1,
            title: 'The Future of Barcode Technology in 2024',
            slug: 'future-barcode-technology-2024',
            excerpt: 'Explore the latest trends and innovations in barcode technology that are shaping the industry in 2024.',
            content: 'Barcode technology has evolved significantly over the past few decades, and 2024 promises to bring even more exciting developments...',
            featured_image: '/api/placeholder/800/400',
            author: 'John Smith',
            category: 'Technology',
            tags: JSON.stringify(['barcode', 'technology', 'innovation', '2024']),
            status: 'published',
            featured: true,
            views: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'How to Choose the Right Zebra Printer for Your Business',
            slug: 'choose-right-zebra-printer',
            excerpt: 'A comprehensive guide to selecting the perfect Zebra printer based on your business needs and requirements.',
            content: 'Selecting the right printer for your business is crucial for efficiency and productivity. Here are the key factors to consider...',
            featured_image: '/api/placeholder/800/400',
            author: 'Sarah Johnson',
            category: 'Guide',
            tags: JSON.stringify(['zebra', 'printer', 'business', 'guide']),
            status: 'published',
            featured: true,
            views: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        return res.json(sampleBlogs);
      }
      
      res.status(500).json({ 
        error: 'Failed to fetch blogs',
        details: err.message,
        code: err.code
      });
    } else {
      res.json(results);
    }
  });
});

// Get single blog by slug
app.get('/api/blogs/:slug', (req, res) => {
  const { slug } = req.params;
  const query = 'SELECT * FROM blogs WHERE slug = ? AND status = "published"';
  
  db.query(query, [slug], (err, results) => {
    if (err) {
      console.error('Blog detail query error:', err);
      
      // If database is not available, return sample data for development
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample blog detail');
        const sampleBlogs = [
          {
            id: 1,
            title: 'The Future of Barcode Technology in 2024',
            slug: 'future-barcode-technology-2024',
            excerpt: 'Explore the latest trends and innovations in barcode technology that are shaping the industry in 2024.',
            content: 'Barcode technology has evolved significantly over the past few decades, and 2024 promises to bring even more exciting developments. From traditional linear barcodes to advanced 2D codes like QR codes and Data Matrix, the industry continues to innovate and adapt to changing business needs.\n\nIn this comprehensive guide, we\'ll explore the key trends driving barcode technology forward, including:\n\n• Enhanced data capacity and error correction\n• Integration with IoT and smart systems\n• Mobile-first scanning solutions\n• Sustainability and eco-friendly materials\n• Advanced security features\n\nThese innovations are not just technical improvements; they represent a fundamental shift in how businesses manage inventory, track products, and interact with customers. As we move through 2024, we can expect to see even more sophisticated applications that will transform industries from retail to healthcare, manufacturing to logistics.\n\nThe future of barcode technology is bright, and businesses that embrace these innovations will find themselves at the forefront of efficiency and customer satisfaction.',
            featured_image: '/api/placeholder/800/400',
            author: 'John Smith',
            category: 'Technology',
            tags: JSON.stringify(['barcode', 'technology', 'innovation', '2024']),
            status: 'published',
            featured: true,
            views: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'How to Choose the Right Zebra Printer for Your Business',
            slug: 'choose-right-zebra-printer',
            excerpt: 'A comprehensive guide to selecting the perfect Zebra printer based on your business needs and requirements.',
            content: 'Selecting the right printer for your business is crucial for efficiency and productivity. Here are the key factors to consider when choosing a Zebra printer:\n\n**1. Print Volume and Speed**\nConsider your daily printing needs. High-volume environments require industrial-grade printers with faster print speeds and larger media capacity.\n\n**2. Print Quality Requirements**\nDifferent applications require different print resolutions. For detailed graphics or small text, you\'ll need higher DPI (dots per inch) capabilities.\n\n**3. Media Compatibility**\nEnsure the printer supports the label sizes, materials, and ribbon types you plan to use. This includes thermal transfer ribbons, direct thermal media, and various label adhesives.\n\n**4. Connectivity Options**\nModern printers offer multiple connectivity options including USB, Ethernet, Wi-Fi, and Bluetooth. Choose based on your network infrastructure and integration needs.\n\n**5. Durability and Environment**\nConsider where the printer will be used. Industrial environments may require rugged printers that can withstand dust, temperature variations, and physical stress.\n\n**6. Software Integration**\nLook for printers that integrate well with your existing software systems, including ERP, WMS, and label design applications.\n\nBy carefully evaluating these factors, you can select a Zebra printer that perfectly matches your business requirements and provides years of reliable service.',
            featured_image: '/api/placeholder/800/400',
            author: 'Sarah Johnson',
            category: 'Guide',
            tags: JSON.stringify(['zebra', 'printer', 'business', 'guide']),
            status: 'published',
            featured: true,
            views: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        const blog = sampleBlogs.find(b => b.slug === slug);
        if (blog) {
          return res.json(blog);
        } else {
          return res.status(404).json({ error: 'Blog not found' });
        }
      }
      
      res.status(500).json({ error: 'Failed to fetch blog' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Blog not found' });
    } else {
      // Increment view count
      db.query('UPDATE blogs SET views = views + 1 WHERE slug = ?', [slug]);
      res.json(results[0]);
    }
  });
});

// Create blog (Admin only)
app.post('/api/blogs', authenticateAdmin, (req, res) => {
  const { title, slug, excerpt, content, featured_image, author, category, tags, status, featured } = req.body;
  
  const query = `INSERT INTO blogs (title, slug, excerpt, content, featured_image, author, category, tags, status, featured) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.query(query, [title, slug, excerpt, content, featured_image, author, category, JSON.stringify(tags), status, featured], (err, result) => {
    if (err) {
      console.error('Blog creation error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, simulating blog creation');
        return res.json({ id: Date.now(), message: 'Blog created successfully (simulated)' });
      }
      res.status(500).json({ error: 'Failed to create blog' });
    } else {
      res.json({ id: result.insertId, message: 'Blog created successfully' });
    }
  });
});

// Update blog (Admin only)
app.put('/api/blogs/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { title, slug, excerpt, content, featured_image, author, category, tags, status, featured } = req.body;
  
  const query = `UPDATE blogs SET title = ?, slug = ?, excerpt = ?, content = ?, featured_image = ?, 
                 author = ?, category = ?, tags = ?, status = ?, featured = ? WHERE id = ?`;
  
  db.query(query, [title, slug, excerpt, content, featured_image, author, category, JSON.stringify(tags), status, featured, id], (err) => {
    if (err) {
      console.error('Blog update error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, simulating blog update');
        return res.json({ message: 'Blog updated successfully (simulated)' });
      }
      res.status(500).json({ error: 'Failed to update blog' });
    } else {
      res.json({ message: 'Blog updated successfully' });
    }
  });
});

// Delete blog (Admin only)
app.delete('/api/blogs/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM blogs WHERE id = ?';
  
  db.query(query, [id], (err) => {
    if (err) {
      console.error('Blog delete error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, simulating blog deletion');
        return res.json({ message: 'Blog deleted successfully (simulated)' });
      }
      res.status(500).json({ error: 'Failed to delete blog' });
    } else {
      res.json({ message: 'Blog deleted successfully' });
    }
  });
});

// ==================== JOBS API ====================
// Get all jobs
app.get('/api/jobs', (req, res) => {
  const { page = 1, limit = 10, job_type, experience_level, status = 'active' } = req.query;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM jobs WHERE status = ?';
  let params = [status];
  
  if (job_type) {
    query += ' AND job_type = ?';
    params.push(job_type);
  }
  
  if (experience_level) {
    query += ' AND experience_level = ?';
    params.push(experience_level);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Jobs query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample job data');
        const sampleJobs = [
          {
            id: 1,
            title: 'Senior Software Engineer',
            slug: 'senior-software-engineer',
            company: 'Zebra Technologies',
            location: 'Bangalore, India',
            job_type: 'Full-time',
            experience_level: 'Senior',
            salary_range: '₹15,00,000 - ₹25,00,000',
            description: 'We are looking for a Senior Software Engineer to join our dynamic team and help build cutting-edge solutions for our clients.',
            requirements: 'Bachelor\'s degree in Computer Science, 5+ years of experience, proficiency in JavaScript, React, Node.js',
            responsibilities: 'Design and develop web applications, mentor junior developers, collaborate with cross-functional teams',
            benefits: 'Health insurance, flexible working hours, professional development opportunities',
            application_email: 'careers@zebraprintersindia.com',
            application_url: 'https://zebraprintersindia.com/careers',
            status: 'active',
            featured: true,
            views: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Product Manager',
            slug: 'product-manager',
            company: 'Zebra Technologies',
            location: 'Mumbai, India',
            job_type: 'Full-time',
            experience_level: 'Mid-level',
            salary_range: '₹12,00,000 - ₹18,00,000',
            description: 'Join our product team to drive innovation and deliver exceptional user experiences.',
            requirements: 'MBA or equivalent, 3+ years of product management experience, strong analytical skills',
            responsibilities: 'Define product strategy, work with engineering teams, analyze market trends',
            benefits: 'Competitive salary, stock options, work-life balance',
            application_email: 'careers@zebraprintersindia.com',
            application_url: 'https://zebraprintersindia.com/careers',
            status: 'active',
            featured: false,
            views: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            title: 'Sales Executive',
            slug: 'sales-executive',
            company: 'Zebra Technologies',
            location: 'Delhi, India',
            job_type: 'Full-time',
            experience_level: 'Entry-level',
            salary_range: '₹6,00,000 - ₹10,00,000',
            description: 'Drive sales growth and build strong relationships with clients in the printing technology sector.',
            requirements: 'Bachelor\'s degree, excellent communication skills, sales experience preferred',
            responsibilities: 'Generate leads, conduct sales presentations, maintain client relationships',
            benefits: 'Commission structure, travel opportunities, career growth',
            application_email: 'careers@zebraprintersindia.com',
            application_url: 'https://zebraprintersindia.com/careers',
            status: 'active',
            featured: false,
            views: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        return res.json(sampleJobs);
      }
      res.status(500).json({
        error: 'Failed to fetch jobs',
        details: err.message,
        code: err.code
      });
    } else {
      res.json(results);
    }
  });
});

// Get single job by slug
app.get('/api/jobs/:slug', (req, res) => {
  const { slug } = req.params;
  const query = 'SELECT * FROM jobs WHERE slug = ? AND status = "active"';
  
  db.query(query, [slug], (err, results) => {
    if (err) {
      console.error('Single job query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample job data');
        // Return the first sample job for any slug when database is unavailable
        const sampleJob = {
          id: 1,
          title: 'Senior Software Engineer',
          slug: slug,
          company: 'Zebra Technologies',
          location: 'Bangalore, India',
          job_type: 'Full-time',
          experience_level: 'Senior',
          salary_range: '₹15,00,000 - ₹25,00,000',
          description: 'We are looking for a Senior Software Engineer to join our dynamic team and help build cutting-edge solutions for our clients.',
          requirements: 'Bachelor\'s degree in Computer Science, 5+ years of experience, proficiency in JavaScript, React, Node.js',
          responsibilities: 'Design and develop web applications, mentor junior developers, collaborate with cross-functional teams',
          benefits: 'Health insurance, flexible working hours, professional development opportunities',
          application_email: 'careers@zebraprintersindia.com',
          application_url: 'https://zebraprintersindia.com/careers',
          status: 'active',
          featured: true,
          views: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return res.json(sampleJob);
      }
      res.status(500).json({
        error: 'Failed to fetch job',
        details: err.message,
        code: err.code
      });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Job not found' });
    } else {
      // Increment view count
      db.query('UPDATE jobs SET views = views + 1 WHERE slug = ?', [slug]);
      res.json(results[0]);
    }
  });
});

// Create job (Admin only)
app.post('/api/jobs', authenticateAdmin, (req, res) => {
  const { title, slug, company, location, job_type, experience_level, salary_range, description, requirements, responsibilities, benefits, application_email, application_url, status, featured } = req.body;
  
  const query = `INSERT INTO jobs (title, slug, company, location, job_type, experience_level, salary_range, description, requirements, responsibilities, benefits, application_email, application_url, status, featured) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.query(query, [title, slug, company, location, job_type, experience_level, salary_range, description, requirements, responsibilities, benefits, application_email, application_url, status, featured], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Failed to create job' });
    } else {
      res.json({ id: result.insertId, message: 'Job created successfully' });
    }
  });
});

// Update job (Admin only)
app.put('/api/jobs/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { title, slug, company, location, job_type, experience_level, salary_range, description, requirements, responsibilities, benefits, application_email, application_url, status, featured } = req.body;
  
  const query = `UPDATE jobs SET title = ?, slug = ?, company = ?, location = ?, job_type = ?, experience_level = ?, 
                 salary_range = ?, description = ?, requirements = ?, responsibilities = ?, benefits = ?, 
                 application_email = ?, application_url = ?, status = ?, featured = ? WHERE id = ?`;
  
  db.query(query, [title, slug, company, location, job_type, experience_level, salary_range, description, requirements, responsibilities, benefits, application_email, application_url, status, featured, id], (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to update job' });
    } else {
      res.json({ message: 'Job updated successfully' });
    }
  });
});

// Delete job (Admin only)
app.delete('/api/jobs/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM jobs WHERE id = ?';
  
  db.query(query, [id], (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to delete job' });
    } else {
      res.json({ message: 'Job deleted successfully' });
    }
  });
});

// ==================== JOB APPLICATIONS API ====================
// Submit job application
app.post('/api/job-applications', upload.single('resume'), (req, res) => {
  const {
    jobId,
    jobTitle,
    firstName,
    lastName,
    email,
    phone,
    location,
    experience,
    education,
    coverLetter,
    portfolio,
    linkedin,
    expectedSalary,
    availability,
    additionalInfo
  } = req.body;

  // Validate required fields
  if (!jobId || !firstName || !lastName || !email || !phone || !location || !experience || !education || !coverLetter) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Handle file upload
  let resumePath = null;
  if (req.file) {
    resumePath = `/uploads/resumes/${req.file.filename}`;
  }

  const query = `INSERT INTO job_applications 
    (job_id, job_title, first_name, last_name, email, phone, location, experience, education, 
     cover_letter, portfolio, linkedin, expected_salary, availability, additional_info, resume_path, status, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`;

  const values = [
    jobId, jobTitle, firstName, lastName, email, phone, location, experience, education,
    coverLetter, portfolio || null, linkedin || null, expectedSalary || null, availability || null, 
    additionalInfo || null, resumePath, 'pending'
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Job application error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, simulating job application submission');
        return res.json({ 
          message: 'Application submitted successfully (simulated)',
          applicationId: Date.now()
        });
      }
      res.status(500).json({ error: 'Failed to submit application' });
    } else {
      res.json({ 
        message: 'Application submitted successfully',
        applicationId: result.insertId
      });
    }
  });
});

// Get job applications (Admin only)
app.get('/api/job-applications', authenticateAdmin, (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM job_applications';
  let params = [];
  
  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Job applications query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample job applications');
        const sampleApplications = [
          {
            id: 1,
            job_id: 1,
            job_title: 'Senior Barcode Solutions Engineer',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '+91 9876543210',
            location: 'New Delhi, India',
            experience: '5-10',
            education: 'Bachelor\'s in Computer Science',
            cover_letter: 'I am very interested in this position...',
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ];
        return res.json(sampleApplications);
      }
      res.status(500).json({ error: 'Failed to fetch applications' });
    } else {
      res.json(results);
    }
  });
});

// Update application status (Admin only)
app.put('/api/job-applications/:id/status', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const query = 'UPDATE job_applications SET status = ? WHERE id = ?';
  
  db.query(query, [status, id], (err) => {
    if (err) {
      console.error('Application status update error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, simulating status update');
        return res.json({ message: 'Status updated successfully (simulated)' });
      }
      res.status(500).json({ error: 'Failed to update status' });
    } else {
      res.json({ message: 'Status updated successfully' });
    }
  });
});

// ==================== DATABASE INSPECTION ====================
// Check what tables exist
app.get('/api/debug/tables', (req, res) => {
  const query = 'SHOW TABLES';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Tables query error:', err);
      res.status(500).json({ error: 'Failed to fetch tables', details: err.message });
    } else {
      res.json(results);
    }
  });
});

// Check cities table structure
app.get('/api/debug/cities-structure', (req, res) => {
  const query = 'DESCRIBE city';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Cities structure query error:', err);
      res.status(500).json({ error: 'Failed to fetch cities structure', details: err.message });
    } else {
      res.json(results);
    }
  });
});

// Check if cities table has data
app.get('/api/debug/cities-count', (req, res) => {
  const query = 'SELECT COUNT(*) as count FROM city';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Cities count query error:', err);
      res.status(500).json({ error: 'Failed to fetch cities count', details: err.message });
    } else {
      res.json(results[0]);
    }
  });
});

// Debug endpoint to get sample cities
app.get('/api/debug/sample-cities', (req, res) => {
  const query = 'SELECT id, city, state FROM city LIMIT 10';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Sample cities query error:', err);
      res.status(500).json({ error: 'Failed to get sample cities' });
    } else {
      res.json(results);
    }
  });
});

// ==================== DYNAMIC SEO API ====================
// Get location-specific SEO content by city slug
app.get('/api/location-seo-by-slug/:citySlug', (req, res) => {
  const { citySlug } = req.params;
  const query = `
    SELECT 
      c.id as country_id,
      c.name as country_name,
      c.sortname as country_code,
      s.id as state_id,
      s.name as state_name,
      city.id as city_id,
      city.city as city_name
    FROM city
    LEFT JOIN states s ON city.state = s.name
    LEFT JOIN countries c ON s.country_id = c.id
    WHERE LOWER(REPLACE(city.city, ' ', '-')) = LOWER(?)
  `;
  
  db.query(query, [citySlug], (err, results) => {
    if (err) {
      console.error('Location SEO by slug query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample SEO data');
        const sampleData = {
          location: {
            id: 859,
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            country_code: 'IN'
          },
          seo: {
            title: `Zebra Barcode Printers in Mumbai, Maharashtra | Zebra Printers India`,
            description: `Leading supplier of Zebra barcode printers, scanners, and mobile computers in Mumbai, Maharashtra. Get expert support and service for all your barcode printing needs.`,
            keywords: `Zebra barcode printers Mumbai, barcode scanners Maharashtra, mobile computers Mumbai, label printers India, RFID solutions Mumbai, Zebra printer service Mumbai`,
            h1: `Zebra Barcode Printers in Mumbai, Maharashtra`,
            h2: `Professional Barcode Solutions for Mumbai Businesses`,
            structured_data: {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Zebra Printers India - Mumbai",
              "description": "Leading supplier of Zebra barcode printers and solutions in Mumbai, Maharashtra",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Mumbai",
                "addressRegion": "Maharashtra",
                "addressCountry": "India"
              },
              "areaServed": {
                "@type": "City",
                "name": "Mumbai"
              },
              "serviceType": "Barcode Printers, Scanners, Mobile Computers"
            }
          }
        };
        res.json(sampleData);
        return;
      }
      res.status(500).json({ error: 'Failed to fetch location SEO data' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }
      
      const location = results[0];
      const seoData = {
        location: {
          id: location.city_id,
          city: location.city_name,
          state: location.state_name,
          country: location.country_name,
          country_code: location.country_code
        },
        seo: {
          title: `Zebra Barcode Printers in ${location.city_name}, ${location.state_name} | Zebra Printers India`,
          description: `Leading supplier of Zebra barcode printers, scanners, and mobile computers in ${location.city_name}, ${location.state_name}. Get expert support and service for all your barcode printing needs.`,
          keywords: `Zebra barcode printers ${location.city_name}, barcode scanners ${location.state_name}, mobile computers ${location.city_name}, label printers ${location.country_name}, RFID solutions ${location.city_name}, Zebra printer service ${location.city_name}`,
          h1: `Zebra Barcode Printers in ${location.city_name}, ${location.state_name}`,
          h2: `Professional Barcode Solutions for ${location.city_name} Businesses`,
          structured_data: {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": `Zebra Printers India - ${location.city_name}`,
            "description": `Leading supplier of Zebra barcode printers and solutions in ${location.city_name}, ${location.state_name}`,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": location.city_name,
              "addressRegion": location.state_name,
              "addressCountry": location.country_name
            },
            "areaServed": {
              "@type": "City",
              "name": location.city_name
            },
            "serviceType": "Barcode Printers, Scanners, Mobile Computers"
          }
        }
      };
      res.json(seoData);
    }
  });
});

// Get location-specific SEO content by ID (keep for backward compatibility)
app.get('/api/location-seo/:locationId', (req, res) => {
  const { locationId } = req.params;
  const query = `
    SELECT 
      c.id as country_id,
      c.name as country_name,
      c.sortname as country_code,
      s.id as state_id,
      s.name as state_name,
      city.id as city_id,
      city.city as city_name
    FROM city
    LEFT JOIN states s ON city.state = s.name
    LEFT JOIN countries c ON s.country_id = c.id
    WHERE city.id = ?
  `;
  
  db.query(query, [locationId], (err, results) => {
    if (err) {
      console.error('Location SEO query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample SEO data');
        const sampleData = {
          location: {
            id: locationId,
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            country_code: 'IN'
          },
          seo: {
            title: `Zebra Barcode Printers in Mumbai, Maharashtra | Zebra Printers India`,
            description: `Leading supplier of Zebra barcode printers, scanners, and mobile computers in Mumbai, Maharashtra. Get expert support and service for all your barcode printing needs.`,
            keywords: `Zebra barcode printers Mumbai, barcode scanners Maharashtra, mobile computers Mumbai, label printers India, RFID solutions Mumbai, Zebra printer service Mumbai`,
            h1: `Zebra Barcode Printers in Mumbai, Maharashtra`,
            h2: `Professional Barcode Solutions for Mumbai Businesses`,
            structured_data: {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Zebra Printers India - Mumbai",
              "description": "Leading supplier of Zebra barcode printers and solutions in Mumbai, Maharashtra",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Mumbai",
                "addressRegion": "Maharashtra",
                "addressCountry": "India"
              },
              "areaServed": {
                "@type": "City",
                "name": "Mumbai"
              },
              "serviceType": "Barcode Printers, Scanners, Mobile Computers"
            }
          }
        };
        res.json(sampleData);
        return;
      }
      res.status(500).json({ error: 'Failed to fetch location SEO data' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }
      
      const location = results[0];
      const seoData = {
        location: {
          id: locationId,
          city: location.city_name,
          state: location.state_name,
          country: location.country_name,
          country_code: location.country_code
        },
        seo: {
          title: `Zebra Barcode Printers in ${location.city_name}, ${location.state_name} | Zebra Printers India`,
          description: `Leading supplier of Zebra barcode printers, scanners, and mobile computers in ${location.city_name}, ${location.state_name}. Get expert support and service for all your barcode printing needs.`,
          keywords: `Zebra barcode printers ${location.city_name}, barcode scanners ${location.state_name}, mobile computers ${location.city_name}, label printers ${location.country_name}, RFID solutions ${location.city_name}, Zebra printer service ${location.city_name}`,
          h1: `Zebra Barcode Printers in ${location.city_name}, ${location.state_name}`,
          h2: `Professional Barcode Solutions for ${location.city_name} Businesses`,
          structured_data: {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": `Zebra Printers India - ${location.city_name}`,
            "description": `Leading supplier of Zebra barcode printers and solutions in ${location.city_name}, ${location.state_name}`,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": location.city_name,
              "addressRegion": location.state_name,
              "addressCountry": location.country_name
            },
            "areaServed": {
              "@type": "City",
              "name": location.city_name
            },
            "serviceType": "Barcode Printers, Scanners, Mobile Computers"
          }
        }
      };
      res.json(seoData);
    }
  });
});

// Get location-specific content templates
app.get('/api/location-content/:locationId', (req, res) => {
  const { locationId } = req.params;
  const query = `
    SELECT 
      c.id as country_id,
      c.name as country_name,
      c.sortname as country_code,
      s.id as state_id,
      s.name as state_name,
      city.id as city_id,
      city.city as city_name
    FROM city
    LEFT JOIN states s ON city.state = s.name
    LEFT JOIN countries c ON s.country_id = c.id
    WHERE city.id = ?
  `;
  
  db.query(query, [locationId], (err, results) => {
    if (err) {
      console.error('Location content query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample content data');
        const sampleData = {
          location: {
            id: locationId,
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            country_code: 'IN'
          },
          content: {
            banner_title: `Zebra Barcode Solutions in Mumbai`,
            banner_subtitle: `Serving ${locationId === '859' ? 'Mumbai' : 'your city'} with premium barcode printing technology`,
            hero_title: `Professional Barcode Printers in Mumbai, Maharashtra`,
            hero_subtitle: `Transform your business operations with our cutting-edge Zebra barcode printing solutions designed for Mumbai's dynamic business environment.`,
            services_title: `Our Services in Mumbai`,
            services_subtitle: `Comprehensive barcode solutions tailored for Mumbai businesses`,
            contact_title: `Get in Touch - Mumbai Office`,
            contact_subtitle: `Ready to upgrade your barcode printing system? Contact our Mumbai team today.`,
            testimonials_title: `What Mumbai Businesses Say`,
            testimonials_subtitle: `Hear from satisfied customers across Mumbai and Maharashtra`
          }
        };
        res.json(sampleData);
        return;
      }
      res.status(500).json({ error: 'Failed to fetch location content data' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }
      
      const location = results[0];
      const contentData = {
        location: {
          id: locationId,
          city: location.city_name,
          state: location.state_name,
          country: location.country_name,
          country_code: location.country_code
        },
        content: {
          banner_title: `Zebra Barcode Solutions in ${location.city_name}`,
          banner_subtitle: `Serving ${location.city_name} with premium barcode printing technology`,
          hero_title: `Professional Barcode Printers in ${location.city_name}, ${location.state_name}`,
          hero_subtitle: `Transform your business operations with our cutting-edge Zebra barcode printing solutions designed for ${location.city_name}'s dynamic business environment.`,
          services_title: `Our Services in ${location.city_name}`,
          services_subtitle: `Comprehensive barcode solutions tailored for ${location.city_name} businesses`,
          contact_title: `Get in Touch - ${location.city_name} Office`,
          contact_subtitle: `Ready to upgrade your barcode printing system? Contact our ${location.city_name} team today.`,
          testimonials_title: `What ${location.city_name} Businesses Say`,
          testimonials_subtitle: `Hear from satisfied customers across ${location.city_name} and ${location.state_name}`
        }
      };
      res.json(contentData);
    }
  });
});

// ==================== NETWORK API ====================
// Get all locations for network page
app.get('/api/network/all-locations', (req, res) => {
  const query = `
    SELECT 
      c.id as country_id,
      c.name as country_name,
      c.sortname as country_code,
      s.id as state_id,
      s.name as state_name,
      city.id as city_id,
      city.city as city_name
    FROM city
    LEFT JOIN states s ON city.state = s.name
    LEFT JOIN countries c ON s.country_id = c.id
    WHERE city.city IS NOT NULL AND city.city != ''
    ORDER BY c.name ASC, s.name ASC, city.city ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('All locations query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample network data');
        const sampleData = [
          // India
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 1, state_name: 'Andhra Pradesh', city_id: 1, city_name: 'Hyderabad' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 1, state_name: 'Andhra Pradesh', city_id: 2, city_name: 'Visakhapatnam' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 2, state_name: 'Karnataka', city_id: 3, city_name: 'Bangalore' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 2, state_name: 'Karnataka', city_id: 4, city_name: 'Mysore' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 3, state_name: 'Tamil Nadu', city_id: 5, city_name: 'Chennai' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 3, state_name: 'Tamil Nadu', city_id: 6, city_name: 'Coimbatore' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 4, state_name: 'Kerala', city_id: 7, city_name: 'Kochi' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 4, state_name: 'Kerala', city_id: 8, city_name: 'Thiruvananthapuram' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 5, state_name: 'Maharashtra', city_id: 9, city_name: 'Mumbai' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 5, state_name: 'Maharashtra', city_id: 10, city_name: 'Pune' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 5, state_name: 'Maharashtra', city_id: 11, city_name: 'Nagpur' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 6, state_name: 'Gujarat', city_id: 12, city_name: 'Ahmedabad' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 6, state_name: 'Gujarat', city_id: 13, city_name: 'Surat' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 7, state_name: 'Rajasthan', city_id: 14, city_name: 'Jaipur' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 7, state_name: 'Rajasthan', city_id: 15, city_name: 'Jodhpur' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 8, state_name: 'Uttar Pradesh', city_id: 16, city_name: 'Lucknow' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 8, state_name: 'Uttar Pradesh', city_id: 17, city_name: 'Kanpur' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 9, state_name: 'Delhi', city_id: 18, city_name: 'New Delhi' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 10, state_name: 'West Bengal', city_id: 19, city_name: 'Kolkata' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 10, state_name: 'West Bengal', city_id: 20, city_name: 'Howrah' },
          
          // United States
          { country_id: 231, country_name: 'United States', country_code: 'US', state_id: 11, state_name: 'California', city_id: 21, city_name: 'Los Angeles' },
          { country_id: 231, country_name: 'United States', country_code: 'US', state_id: 11, state_name: 'California', city_id: 22, city_name: 'San Francisco' },
          { country_id: 231, country_name: 'United States', country_code: 'US', state_id: 11, state_name: 'California', city_id: 23, city_name: 'San Diego' },
          { country_id: 231, country_name: 'United States', country_code: 'US', state_id: 12, state_name: 'Texas', city_id: 24, city_name: 'Houston' },
          { country_id: 231, country_name: 'United States', country_code: 'US', state_id: 12, state_name: 'Texas', city_id: 25, city_name: 'Dallas' },
          { country_id: 231, country_name: 'United States', country_code: 'US', state_id: 12, state_name: 'Texas', city_id: 26, city_name: 'Austin' },
          { country_id: 231, country_name: 'United States', country_code: 'US', state_id: 13, state_name: 'New York', city_id: 27, city_name: 'New York City' },
          { country_id: 231, country_name: 'United States', country_code: 'US', state_id: 13, state_name: 'New York', city_id: 28, city_name: 'Buffalo' },
          { country_id: 231, country_name: 'United States', country_code: 'US', state_id: 14, state_name: 'Florida', city_id: 29, city_name: 'Miami' },
          { country_id: 231, country_name: 'United States', country_code: 'US', state_id: 14, state_name: 'Florida', city_id: 30, city_name: 'Orlando' },
          { country_id: 231, country_name: 'United States', country_code: 'US', state_id: 15, state_name: 'Illinois', city_id: 31, city_name: 'Chicago' },
          
          // United Kingdom
          { country_id: 232, country_name: 'United Kingdom', country_code: 'GB', state_id: 16, state_name: 'England', city_id: 32, city_name: 'London' },
          { country_id: 232, country_name: 'United Kingdom', country_code: 'GB', state_id: 16, state_name: 'England', city_id: 33, city_name: 'Manchester' },
          { country_id: 232, country_name: 'United Kingdom', country_code: 'GB', state_id: 16, state_name: 'England', city_id: 34, city_name: 'Birmingham' },
          { country_id: 232, country_name: 'United Kingdom', country_code: 'GB', state_id: 17, state_name: 'Scotland', city_id: 35, city_name: 'Edinburgh' },
          { country_id: 232, country_name: 'United Kingdom', country_code: 'GB', state_id: 17, state_name: 'Scotland', city_id: 36, city_name: 'Glasgow' },
          
          // Canada
          { country_id: 38, country_name: 'Canada', country_code: 'CA', state_id: 18, state_name: 'Ontario', city_id: 37, city_name: 'Toronto' },
          { country_id: 38, country_name: 'Canada', country_code: 'CA', state_id: 18, state_name: 'Ontario', city_id: 38, city_name: 'Ottawa' },
          { country_id: 38, country_name: 'Canada', country_code: 'CA', state_id: 19, state_name: 'Quebec', city_id: 39, city_name: 'Montreal' },
          { country_id: 38, country_name: 'Canada', country_code: 'CA', state_id: 19, state_name: 'Quebec', city_id: 40, city_name: 'Quebec City' },
          { country_id: 38, country_name: 'Canada', country_code: 'CA', state_id: 20, state_name: 'British Columbia', city_id: 41, city_name: 'Vancouver' },
          
          // Australia
          { country_id: 13, country_name: 'Australia', country_code: 'AU', state_id: 21, state_name: 'New South Wales', city_id: 42, city_name: 'Sydney' },
          { country_id: 13, country_name: 'Australia', country_code: 'AU', state_id: 21, state_name: 'New South Wales', city_id: 43, city_name: 'Newcastle' },
          { country_id: 13, country_name: 'Australia', country_code: 'AU', state_id: 22, state_name: 'Victoria', city_id: 44, city_name: 'Melbourne' },
          { country_id: 13, country_name: 'Australia', country_code: 'AU', state_id: 22, state_name: 'Victoria', city_id: 45, city_name: 'Geelong' },
          { country_id: 13, country_name: 'Australia', country_code: 'AU', state_id: 23, state_name: 'Queensland', city_id: 46, city_name: 'Brisbane' },
          { country_id: 13, country_name: 'Australia', country_code: 'AU', state_id: 23, state_name: 'Queensland', city_id: 47, city_name: 'Gold Coast' },
          
          // Germany
          { country_id: 81, country_name: 'Germany', country_code: 'DE', state_id: 24, state_name: 'Bavaria', city_id: 48, city_name: 'Munich' },
          { country_id: 81, country_name: 'Germany', country_code: 'DE', state_id: 24, state_name: 'Bavaria', city_id: 49, city_name: 'Nuremberg' },
          { country_id: 81, country_name: 'Germany', country_code: 'DE', state_id: 25, state_name: 'North Rhine-Westphalia', city_id: 50, city_name: 'Cologne' },
          { country_id: 81, country_name: 'Germany', country_code: 'DE', state_id: 25, state_name: 'North Rhine-Westphalia', city_id: 51, city_name: 'Düsseldorf' },
          { country_id: 81, country_name: 'Germany', country_code: 'DE', state_id: 26, state_name: 'Berlin', city_id: 52, city_name: 'Berlin' },
          
          // France
          { country_id: 73, country_name: 'France', country_code: 'FR', state_id: 27, state_name: 'Île-de-France', city_id: 53, city_name: 'Paris' },
          { country_id: 73, country_name: 'France', country_code: 'FR', state_id: 27, state_name: 'Île-de-France', city_id: 54, city_name: 'Versailles' },
          { country_id: 73, country_name: 'France', country_code: 'FR', state_id: 28, state_name: 'Provence-Alpes-Côte d\'Azur', city_id: 55, city_name: 'Marseille' },
          { country_id: 73, country_name: 'France', country_code: 'FR', state_id: 28, state_name: 'Provence-Alpes-Côte d\'Azur', city_id: 56, city_name: 'Nice' },
          
          // Japan
          { country_id: 107, country_name: 'Japan', country_code: 'JP', state_id: 29, state_name: 'Tokyo', city_id: 57, city_name: 'Tokyo' },
          { country_id: 107, country_name: 'Japan', country_code: 'JP', state_id: 30, state_name: 'Osaka', city_id: 58, city_name: 'Osaka' },
          { country_id: 107, country_name: 'Japan', country_code: 'JP', state_id: 30, state_name: 'Osaka', city_id: 59, city_name: 'Kyoto' },
          
          // China
          { country_id: 44, country_name: 'China', country_code: 'CN', state_id: 31, state_name: 'Beijing', city_id: 60, city_name: 'Beijing' },
          { country_id: 44, country_name: 'China', country_code: 'CN', state_id: 32, state_name: 'Shanghai', city_id: 61, city_name: 'Shanghai' },
          { country_id: 44, country_name: 'China', country_code: 'CN', state_id: 33, state_name: 'Guangdong', city_id: 62, city_name: 'Guangzhou' },
          { country_id: 44, country_name: 'China', country_code: 'CN', state_id: 33, state_name: 'Guangdong', city_id: 63, city_name: 'Shenzhen' },
          
          // Singapore
          { country_id: 188, country_name: 'Singapore', country_code: 'SG', state_id: 34, state_name: 'Singapore', city_id: 64, city_name: 'Singapore' },
          
          // UAE
          { country_id: 225, country_name: 'United Arab Emirates', country_code: 'AE', state_id: 35, state_name: 'Dubai', city_id: 65, city_name: 'Dubai' },
          { country_id: 225, country_name: 'United Arab Emirates', country_code: 'AE', state_id: 36, state_name: 'Abu Dhabi', city_id: 66, city_name: 'Abu Dhabi' }
        ];
        res.json(sampleData);
        return;
      }
      res.status(500).json({ error: 'Failed to fetch all locations' });
    } else {
      res.json(results);
    }
  });
});

// Get countries with state and city counts
app.get('/api/network/countries-summary', (req, res) => {
  const query = `
    SELECT 
      c.id,
      c.name,
      c.sortname,
      COUNT(DISTINCT s.id) as state_count,
      COUNT(DISTINCT city.id) as city_count
    FROM countries c
    LEFT JOIN states s ON c.id = s.country_id
    LEFT JOIN city ON s.name = city.state
    GROUP BY c.id, c.name, c.sortname
    ORDER BY c.name ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Countries summary query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample countries summary');
        const sampleData = [
          { id: 101, name: 'India', sortname: 'IN', state_count: 10, city_count: 20 },
          { id: 231, name: 'United States', sortname: 'US', state_count: 5, city_count: 11 },
          { id: 232, name: 'United Kingdom', sortname: 'GB', state_count: 2, city_count: 5 },
          { id: 38, name: 'Canada', sortname: 'CA', state_count: 3, city_count: 5 },
          { id: 13, name: 'Australia', sortname: 'AU', state_count: 3, city_count: 6 },
          { id: 81, name: 'Germany', sortname: 'DE', state_count: 3, city_count: 5 },
          { id: 73, name: 'France', sortname: 'FR', state_count: 2, city_count: 4 },
          { id: 107, name: 'Japan', sortname: 'JP', state_count: 2, city_count: 3 },
          { id: 44, name: 'China', sortname: 'CN', state_count: 3, city_count: 4 },
          { id: 188, name: 'Singapore', sortname: 'SG', state_count: 1, city_count: 1 },
          { id: 225, name: 'United Arab Emirates', sortname: 'AE', state_count: 2, city_count: 2 }
        ];
        res.json(sampleData);
        return;
      }
      res.status(500).json({ error: 'Failed to fetch countries summary' });
    } else {
      res.json(results);
    }
  });
});

// ==================== LOCATION API ====================
// Get all countries
app.get('/api/locations/countries', (req, res) => {
  const query = 'SELECT * FROM countries ORDER BY name ASC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Countries query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample countries data');
        const sampleCountries = [
          { id: 1, sortname: 'IN', name: 'India', phonecode: '+91' },
          { id: 2, sortname: 'US', name: 'United States', phonecode: '+1' },
          { id: 3, sortname: 'GB', name: 'United Kingdom', phonecode: '+44' },
          { id: 4, sortname: 'CA', name: 'Canada', phonecode: '+1' },
          { id: 5, sortname: 'AU', name: 'Australia', phonecode: '+61' },
          { id: 6, sortname: 'DE', name: 'Germany', phonecode: '+49' },
          { id: 7, sortname: 'FR', name: 'France', phonecode: '+33' },
          { id: 8, sortname: 'JP', name: 'Japan', phonecode: '+81' },
          { id: 9, sortname: 'CN', name: 'China', phonecode: '+86' },
          { id: 10, sortname: 'BR', name: 'Brazil', phonecode: '+55' }
        ];
        return res.json(sampleCountries);
      }
      res.status(500).json({ error: 'Failed to fetch countries' });
    } else {
      res.json(results);
    }
  });
});

// Get states by country ID
app.get('/api/locations/states/:countryId', (req, res) => {
  const { countryId } = req.params;
  const query = 'SELECT * FROM states WHERE country_id = ? ORDER BY name ASC';
  
  db.query(query, [countryId], (err, results) => {
    if (err) {
      console.error('States query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample states data');
        const sampleStates = {
          1: [ // India
            { id: 1, name: 'Delhi', country_id: 1, country: 'India' },
            { id: 2, name: 'Maharashtra', country_id: 1, country: 'India' },
            { id: 3, name: 'Karnataka', country_id: 1, country: 'India' },
            { id: 4, name: 'Tamil Nadu', country_id: 1, country: 'India' },
            { id: 5, name: 'Gujarat', country_id: 1, country: 'India' }
          ],
          2: [ // United States
            { id: 11, name: 'California', country_id: 2, country: 'United States' },
            { id: 12, name: 'Texas', country_id: 2, country: 'United States' },
            { id: 13, name: 'New York', country_id: 2, country: 'United States' },
            { id: 14, name: 'Florida', country_id: 2, country: 'United States' },
            { id: 15, name: 'Illinois', country_id: 2, country: 'United States' }
          ]
        };
        return res.json(sampleStates[countryId] || []);
      }
      res.status(500).json({ error: 'Failed to fetch states' });
    } else {
      res.json(results);
    }
  });
});

// Get cities by state ID
app.get('/api/locations/cities/:stateId', (req, res) => {
  const { stateId } = req.params;
  // First get the state name from states table
  const stateQuery = 'SELECT name FROM states WHERE id = ?';
  
  db.query(stateQuery, [stateId], (err, stateResults) => {
    if (err) {
      console.error('State query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample cities data');
        const sampleCities = [
          { id: 1, state: 'Maharashtra', city: 'Mumbai' },
          { id: 2, state: 'Maharashtra', city: 'Pune' },
          { id: 3, state: 'Maharashtra', city: 'Nagpur' },
          { id: 4, state: 'Maharashtra', city: 'Nashik' },
          { id: 5, state: 'Maharashtra', city: 'Aurangabad' }
        ];
        res.json(sampleCities);
        return;
      }
      res.status(500).json({ error: 'Failed to fetch state' });
      return;
    }
    
    if (stateResults.length === 0) {
      res.status(404).json({ error: 'State not found' });
      return;
    }
    
    const stateName = stateResults[0].name;
    const query = 'SELECT * FROM city WHERE state = ? ORDER BY city ASC';
    
    db.query(query, [stateName], (err, results) => {
    if (err) {
      console.error('Cities query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample cities data');
        const sampleCities = {
          1: [ // Delhi
            { id: 1, name: 'New Delhi', state_id: 1, state: 'Delhi', country: 'India' }
          ],
          2: [ // Maharashtra
            { id: 2, name: 'Mumbai', state_id: 2, state: 'Maharashtra', country: 'India' },
            { id: 3, name: 'Pune', state_id: 2, state: 'Maharashtra', country: 'India' }
          ],
          3: [ // Karnataka
            { id: 4, name: 'Bangalore', state_id: 3, state: 'Karnataka', country: 'India' }
          ],
          11: [ // California
            { id: 11, name: 'Los Angeles', state_id: 11, state: 'California', country: 'United States' },
            { id: 12, name: 'San Francisco', state_id: 11, state: 'California', country: 'United States' }
          ],
          12: [ // Texas
            { id: 13, name: 'Houston', state_id: 12, state: 'Texas', country: 'United States' },
            { id: 14, name: 'Dallas', state_id: 12, state: 'Texas', country: 'United States' }
          ]
        };
        return res.json(sampleCities[stateId] || []);
      }
      res.status(500).json({ error: 'Failed to fetch cities' });
    } else {
      res.json(results);
    }
    });
  });
});

// Get location by city ID (for geo-targeted pages)
app.get('/api/locations/city/:cityId', (req, res) => {
  const { cityId } = req.params;
  const query = `
    SELECT c.*, c.state as state_name, co.name as country_name, co.sortname as country_code
    FROM city c
    JOIN states s ON c.state = s.name
    JOIN countries co ON s.country_id = co.id
    WHERE c.id = ?
  `;
  
  db.query(query, [cityId], (err, results) => {
    if (err) {
      console.error('City details query error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample city data');
        const sampleCity = {
          id: 1,
          name: 'New Delhi',
          state_id: 1,
          state: 'Delhi',
          country: 'India',
          state_name: 'Delhi',
          country_name: 'India',
          country_code: 'IN'
        };
        return res.json(sampleCity);
      }
      res.status(500).json({ error: 'Failed to fetch city details' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.json(results[0]);
    }
  });
});

// Search locations (for autocomplete)
app.get('/api/locations/search', (req, res) => {
  const { q, type } = req.query;
  
  if (!q || q.length < 2) {
    return res.json([]);
  }
  
  let query = '';
  let params = [];
  
  if (type === 'cities') {
    query = `
      SELECT c.id, c.city as name, c.state, co.name as country, 'city' as type
      FROM city c
      JOIN states s ON c.state = s.name
      JOIN countries co ON s.country_id = co.id
      WHERE c.city LIKE ?
      ORDER BY c.city ASC
      LIMIT 10
    `;
    params = [`%${q}%`];
  } else if (type === 'states') {
    query = `
      SELECT s.id, s.name, co.name as country, 'state' as type
      FROM states s
      JOIN countries co ON s.country_id = co.id
      WHERE s.name LIKE ?
      ORDER BY s.name ASC
      LIMIT 10
    `;
    params = [`%${q}%`];
  } else {
    query = `
      SELECT co.id, co.name, 'country' as type
      FROM countries co
      WHERE co.name LIKE ?
      ORDER BY co.name ASC
      LIMIT 10
    `;
    params = [`%${q}%`];
  }
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Location search error:', err);
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample search results');
        const sampleResults = [
          { id: 1, name: 'New Delhi', state: 'Delhi', country: 'India', type: 'city' },
          { id: 2, name: 'Mumbai', state: 'Maharashtra', country: 'India', type: 'city' },
          { id: 3, name: 'Bangalore', state: 'Karnataka', country: 'India', type: 'city' }
        ];
        return res.json(sampleResults);
      }
      res.status(500).json({ error: 'Failed to search locations' });
    } else {
      res.json(results);
    }
  });
});

// Serve React app for all other routes (catch-all) - MUST BE LAST
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving React app:', err);
      res.status(500).send('Error loading application');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`⚠️  Database connection will be tested on first API call`);
});
