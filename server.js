import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getConnection, testConnection } from './database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import csv from 'csv-parser';
import fs from 'fs';
import nodemailer from 'nodemailer';
import process from 'process';
import session from 'express-session';
import cron from 'node-cron';
import { setupDatabase, checkDatabaseConnection } from './setup_database_caprover.js';
import SitemapGenerator from './sitemap-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: 'process.env' });

// Email configuration
// Email configuration using Gmail with app password
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gm@indianbarcode.com',
    pass: 'lgzm bfew gypf wttg'
  }
});

const app = express();
const PORT = process.env.PORT || 80;

// FORCE ALL requests to be handled by Express - bypass Nginx static serving
app.use((req, res, next) => {
    console.log(`[EXPRESS] Handling request: ${req.method} ${req.url}`);
    next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image') {
      cb(null, 'uploads/images/');
    } else if (file.fieldname === 'pdf') {
      cb(null, 'uploads/pdfs/');
    } else if (file.fieldname === 'receipt') {
      cb(null, 'uploads/temp/'); // For receipt files
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
  // No file size limits for drivers
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
    } else if (file.fieldname === 'receipt') {
      // Allow PDF, images, and common document formats for receipts
      const allowedMimes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, JPG, PNG, DOC, DOCX files are allowed for receipts'));
      }
    } else if (file.fieldname === 'file') {
      if (req.path.includes('/drivers')) {
        // For driver files - accept ALL file types including .zip and all extensions
        // Accept all file types for drivers
        cb(null, true);
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

// Set proper encoding for all responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

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
// Use centralized database connection
const db = getConnection();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CRITICAL: Handle all problematic requests BEFORE static middleware
app.get('/favicon.ico', (req, res) => {
  console.log('[EXPRESS] Serving favicon.ico');
  res.sendFile(path.join(__dirname, 'dist', 'favicon.ico'));
});

app.get('/robots.txt', (req, res) => {
  console.log('[EXPRESS] Serving robots.txt');
  res.sendFile(path.join(__dirname, 'dist', 'robots.txt'));
});

app.get('/health', (req, res) => {
  console.log('[EXPRESS] Health check endpoint');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle all API routes explicitly - using proper Express syntax
app.use('/api', (req, res, next) => {
  console.log(`[EXPRESS] API request: ${req.url}`);
  next();
});

app.use('/uploads', express.static('uploads'));
app.use('/downloads', express.static('uploads/drivers'));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve .well-known directory for ACME challenges
app.use('/.well-known', express.static(path.join(__dirname, 'public', '.well-known')));

// Additional fallback for .well-known directory
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));

// Database connection middleware
app.use((req, res, next) => {
  // Add database connection to request object
  req.db = db;
  next();
});

// Test database connection on startup
testConnection();

// Health check endpoint for CapRover
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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

// ACME Challenge route for Let's Encrypt SSL certificates
app.get('/.well-known/acme-challenge/:token', (req, res) => {
  const { token } = req.params;
  console.log(`ACME challenge requested for token: ${token}`);
  
  // Try multiple possible locations for the challenge file
  const possiblePaths = [
    path.join(__dirname, 'public', '.well-known', 'acme-challenge', token),
    path.join(__dirname, '.well-known', 'acme-challenge', token),
    path.join('/tmp', 'acme-challenge', token), // CapRover might use this
    path.join('/var/www/html', '.well-known', 'acme-challenge', token) // Alternative location
  ];
  
  let foundPath = null;
  
  // Check each possible path
  for (const challengePath of possiblePaths) {
    try {
      if (fs.existsSync(challengePath)) {
        foundPath = challengePath;
        break;
      }
    } catch (err) {
      // Continue to next path
    }
  }
  
  if (!foundPath) {
    console.log(`ACME challenge file not found for token: ${token}`);
    console.log('Searched paths:', possiblePaths);
    return res.status(404).send('Challenge file not found');
  }
  
  // Read and serve the challenge file
  fs.readFile(foundPath, 'utf8', (readErr, data) => {
    if (readErr) {
      console.error('Error reading ACME challenge file:', readErr);
      return res.status(500).send('Error reading challenge file');
    }
    
    console.log(`Serving ACME challenge file: ${foundPath}`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(data);
  });
});

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

// Get paginated products (all products) - Enhanced for admin panel
app.get('/api/products/paginated', (req, res) => {
  const { page = 1, limit = 20, search, category } = req.query;
  const offset = (page - 1) * limit;
  
  // Build WHERE conditions
  let whereConditions = [];
  let queryParams = [];
  
  // For admin panel, show all products (not just active)
  // whereConditions.push('p.status = ?');
  // queryParams.push('active');
  
  // Add search condition
  if (search && search.trim()) {
    whereConditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ? OR p.shortDescription LIKE ?)');
    const searchPattern = `%${search.trim()}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }
  
  // Add category condition
  if (category && category !== 'all') {
    whereConditions.push('(p.category = ? OR p.category_name = ? OR c.name = ?)');
    queryParams.push(category, category, category);
  }
  
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  // First, get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM products p
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    LEFT JOIN categories c ON s.category_id = c.id
    ${whereClause}
  `;
  
  db.query(countQuery, queryParams, (err, countResult) => {
    if (err) {
      console.error('Count query failed:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    
    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / limit);
    
    // Then get paginated products
    const productsQuery = `
      SELECT 
        p.*,
        s.name as subcategory_name,
        s.display_name as subcategory_display_name,
        c.name as category_name,
        c.display_name as category_display_name
      FROM products p
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    db.query(productsQuery, [...queryParams, parseInt(limit), parseInt(offset)], (err, results) => {
      if (err) {
        console.error('Products query failed:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }
      
      res.json({
        products: results,
        pagination: {
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalProducts: totalProducts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      });
    });
  });
});

// Get featured products (must be before /:id route)
app.get('/api/products/featured', (req, res) => {
  const { limit = 4 } = req.query;

  const query = `
    SELECT * FROM products 
    WHERE status = 'active' AND featured = 1
    ORDER BY created_at DESC
    LIMIT ?
  `;

  db.query(query, [parseInt(limit)], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      products: results,
      count: results.length
    });
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
  
  // Try exact match first
  let query = 'SELECT * FROM products WHERE slug = ?';
  db.query(query, [slug], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database query failed' });
    } else if (results.length > 0) {
      res.json(results[0]);
    } else {
      // If no exact match, try to find by name or category variations
      // Handle common slug variations like rfidcards -> rfid-cards
      const variations = [
        slug.replace(/cards?$/, '-cards'),
        slug.replace(/printers?$/, '-printers'),
        slug.replace(/scanners?$/, '-scanners'),
        slug.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
        slug.replace(/([a-z])(\d)/g, '$1-$2'),
        slug.replace(/(\d)([a-z])/g, '$1-$2')
      ];
      
      // Try variations
      const variationQueries = variations.map(variation => 
        new Promise((resolve) => {
          db.query('SELECT * FROM products WHERE slug = ?', [variation], (err, results) => {
            if (err) resolve([]);
            else resolve(results);
          });
        })
      );
      
      Promise.all(variationQueries).then(results => {
        const foundProduct = results.find(result => result.length > 0);
        if (foundProduct && foundProduct.length > 0) {
          res.json(foundProduct[0]);
        } else {
          res.status(404).json({ error: 'Product not found' });
        }
      });
    }
  });
});

// Get products by category
app.get('/api/products/category/:category', (req, res) => {
  const { category } = req.params;
  
  // First try exact match
  let query = 'SELECT * FROM products WHERE category = ?';
  db.query(query, [category], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database query failed' });
    } else if (results.length > 0) {
      res.json(results);
    } else {
      // Try category variations
      const variations = [
        category.replace(/cards?$/, '-cards'),
        category.replace(/printers?$/, '-printers'),
        category.replace(/scanners?$/, '-scanners'),
        category.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      ];
      
      // Try variations
      const variationQueries = variations.map(variation => 
        new Promise((resolve) => {
          db.query('SELECT * FROM products WHERE category = ?', [variation], (err, results) => {
            if (err) resolve([]);
            else resolve(results);
          });
        })
      );
      
      Promise.all(variationQueries).then(results => {
        const foundResults = results.find(result => result.length > 0);
        if (foundResults && foundResults.length > 0) {
          res.json(foundResults);
        } else {
          res.json([]);
        }
      });
    }
  });
});

// Search products - Enhanced with better search functionality
app.get('/api/products/search/:query', (req, res) => {
  const { query } = req.params;
  
  if (!query || query.trim().length === 0) {
    return res.json([]);
  }
  
  const searchTerm = `%${query.trim()}%`;
  
  // Enhanced search query that searches across multiple fields
  const searchQuery = `
    SELECT 
      p.*
    FROM products p
    WHERE 
      p.name LIKE ? OR 
      p.description LIKE ? OR 
      p.shortDescription LIKE ? OR
      p.category LIKE ? OR
      p.specifications LIKE ? OR
      p.metaKeywords LIKE ? OR
      p.brand LIKE ? OR
      p.model LIKE ?
    ORDER BY 
      CASE 
        WHEN p.name LIKE ? THEN 1
        WHEN p.name LIKE ? THEN 2
        ELSE 3
      END,
      p.name
    LIMIT 50
  `;
  
  const exactMatch = `${query.trim()}%`;
  const partialMatch = searchTerm;
  
  db.query(searchQuery, [
    searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
    exactMatch, partialMatch
  ], (err, results) => {
    if (err) {
      console.error('Product search error:', err);
      
      // If database is not available, return sample search results
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample search results');
        const sampleResults = [
          {
            id: 1,
            name: `Sample ${query} Product 1`,
            description: `This is a sample product matching your search for "${query}"`,
            price: 25000,
            category: 'Desktop Printers',
            brand: 'Zebra',
            model: 'Sample Model 1',
            image: '/uploads/sample-product-1.jpg',
            slug: `sample-${query.toLowerCase().replace(/\s+/g, '-')}-product-1`
          },
          {
            id: 2,
            name: `Sample ${query} Product 2`,
            description: `Another sample product matching your search for "${query}"`,
            price: 35000,
            category: 'Industrial Printers',
            brand: 'Zebra',
            model: 'Sample Model 2',
            image: '/uploads/sample-product-2.jpg',
            slug: `sample-${query.toLowerCase().replace(/\s+/g, '-')}-product-2`
          }
        ];
        return res.json(sampleResults);
      }
      
      res.status(500).json({ error: 'Database query failed' });
    } else {
      console.log(`Found ${results.length} products matching "${query}"`);
      res.json(results);
    }
  });
});

// Real-time product search suggestions
app.get('/api/products/search-suggestions/:query', (req, res) => {
  const { query } = req.params;
  
  if (!query || query.trim().length < 2) {
    return res.json([]);
  }
  
  const searchTerm = `%${query.trim()}%`;
  
  const suggestionsQuery = `
    SELECT DISTINCT 
      name,
      slug,
      category,
      brand
    FROM products 
    WHERE name LIKE ? OR category LIKE ? OR brand LIKE ?
    ORDER BY 
      CASE WHEN name LIKE ? THEN 1 ELSE 2 END,
      name
    LIMIT 10
  `;
  
  const exactMatch = `${query.trim()}%`;
  
  db.query(suggestionsQuery, [searchTerm, searchTerm, searchTerm, exactMatch], (err, results) => {
    if (err) {
      console.error('Search suggestions error:', err);
      
      // If database is not available, return sample suggestions
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('Database not available, returning sample search suggestions');
        const sampleSuggestions = [
          { name: `Sample ${query} Printer`, slug: `sample-${query.toLowerCase()}-printer`, category: 'Desktop Printers', brand: 'Zebra' },
          { name: `Sample ${query} Scanner`, slug: `sample-${query.toLowerCase()}-scanner`, category: 'Scanners', brand: 'Zebra' }
        ];
        return res.json(sampleSuggestions);
      }
      
      res.status(500).json({ error: 'Database query failed' });
    } else {
      res.json(results);
    }
  });
});

// ==================== PAGINATED PRODUCTS API ====================
// Get paginated products by category
app.get('/api/products/category/:category/paginated', (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 8 } = req.query;
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT 
      p.*,
      s.name as subcategory_name,
      s.display_name as subcategory_display_name,
      c.name as category_name,
      c.display_name as category_display_name
    FROM products p
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE c.name = ? OR p.category = ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE c.name = ? OR p.category = ?
  `;
  
  db.query(query, [category, category, parseInt(limit), offset], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database query failed' });
    } else {
      db.query(countQuery, [category, category], (err, countResult) => {
        if (err) {
          res.status(500).json({ error: 'Count query failed' });
        } else {
          const total = countResult[0].total;
          const totalPages = Math.ceil(total / limit);
          res.json({
            products: results,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalProducts: total,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1
            }
          });
        }
      });
    }
  });
});

// Get paginated products by subcategory
app.get('/api/products/subcategory/:subcategory/paginated', (req, res) => {
  const { subcategory } = req.params;
  const { page = 1, limit = 8 } = req.query;
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT 
      p.*,
      s.name as subcategory_name,
      s.display_name as subcategory_display_name,
      c.name as category_name,
      c.display_name as category_display_name
    FROM products p
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE s.name = ? OR p.subcategory_name = ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    WHERE s.name = ? OR p.subcategory_name = ?
  `;
  
  db.query(query, [subcategory, subcategory, parseInt(limit), offset], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database query failed' });
    } else {
      db.query(countQuery, [subcategory, subcategory], (err, countResult) => {
        if (err) {
          res.status(500).json({ error: 'Count query failed' });
        } else {
          const total = countResult[0].total;
          const totalPages = Math.ceil(total / limit);
          res.json({
            products: results,
            pagination: {
              currentPage: parseInt(page),
              totalPages,
              totalProducts: total,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1
            }
          });
        }
      });
    }
  });
});

// Get subcategories by category
app.get('/api/categories/:category/subcategories', (req, res) => {
  const { category } = req.params;
  const query = `
    SELECT s.*, c.name as category_name, c.display_name as category_display_name
    FROM subcategories s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE c.name = ?
    ORDER BY s.name ASC
  `;
  
  db.query(query, [category], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch subcategories' });
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

    // Check for slug conflicts before updating
    if (slug) {
      const slugCheckQuery = 'SELECT id FROM products WHERE slug = ? AND id != ?';
      db.query(slugCheckQuery, [slug, id], (err, results) => {
        if (err) {
          console.error('Slug check error:', err);
          return res.status(500).json({ error: 'Failed to check slug uniqueness' });
        }
        
        if (results.length > 0) {
          // Slug already exists for another product, generate unique slug
          const uniqueSlug = `${slug}-${id}`;
          console.log(`Slug conflict detected. Using unique slug: ${uniqueSlug}`);
          
          // Build dynamic query with unique slug
          buildUpdateQuery(uniqueSlug);
        } else {
          // Slug is unique, proceed with update
          buildUpdateQuery(slug);
        }
      });
    } else {
      // No slug provided, proceed without slug update
      buildUpdateQuery(null);
    }

    function buildUpdateQuery(finalSlug) {
      // Build dynamic query based on what fields are provided
      let query = 'UPDATE products SET ';
      let values = [];
      let setClauses = [];

      if (name) { setClauses.push('name = ?'); values.push(name); }
      if (finalSlug) { setClauses.push('slug = ?'); values.push(finalSlug); }
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
    }
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

// Test database connection and table
app.get('/api/drivers/test', (req, res) => {
  const testQuery = 'SHOW TABLES LIKE "drivers"';
  db.query(testQuery, (err, results) => {
    if (err) {
      console.error('Database test error:', err);
      res.status(500).json({ error: 'Database connection failed', details: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Drivers table does not exist' });
    } else {
      // Test table structure
      const structureQuery = 'DESCRIBE drivers';
      db.query(structureQuery, (err, structure) => {
        if (err) {
          res.status(500).json({ error: 'Failed to get table structure', details: err.message });
        } else {
          res.json({ 
            success: true, 
            message: 'Database and table are working',
            tableExists: true,
            columns: structure
          });
        }
      });
    }
  });
});

// Setup drivers table if it doesn't exist
app.post('/api/drivers/setup', (req, res) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS drivers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      version VARCHAR(50) NOT NULL,
      category ENUM('printer', 'scanner', 'mobile', 'utility') NOT NULL,
      operating_system ENUM('windows', 'macos', 'linux', 'android', 'ios') NOT NULL,
      description TEXT,
      compatibility TEXT,
      file_name VARCHAR(255),
      file_path VARCHAR(500),
      file_size BIGINT,
      download_url VARCHAR(500),
      release_date DATE,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  db.query(createTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating drivers table:', err);
      res.status(500).json({ 
        error: 'Failed to create drivers table', 
        details: err.message 
      });
    } else {
      console.log('Drivers table created successfully');
      res.json({ 
        success: true, 
        message: 'Drivers table created successfully' 
      });
    }
  });
});

// Fix drivers table schema - add missing columns
app.post('/api/drivers/fix-schema', (req, res) => {
  const fixQueries = [
    "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS file_path VARCHAR(500)",
    "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS file_name VARCHAR(255)",
    "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS file_size BIGINT",
    "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS download_url VARCHAR(500)",
    "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS release_date DATE",
    "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active'",
    "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS compatibility TEXT",
    "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS category ENUM('printer', 'scanner', 'mobile', 'utility') NOT NULL DEFAULT 'printer'",
    "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS operating_system ENUM('windows', 'macos', 'linux', 'android', 'ios') NOT NULL DEFAULT 'windows'"
  ];

  let completed = 0;
  let errors = [];

  fixQueries.forEach((query, index) => {
    db.query(query, (err, results) => {
      if (err) {
        console.error(`Error executing query ${index + 1}:`, err);
        errors.push({ query: index + 1, error: err.message });
      } else {
        console.log(`✅ Query ${index + 1} executed successfully`);
      }
      
      completed++;
      
      if (completed === fixQueries.length) {
        if (errors.length > 0) {
          res.status(500).json({ 
            error: 'Some queries failed', 
            details: errors,
            success: false
          });
        } else {
          res.json({ 
            success: true, 
            message: 'Drivers table schema fixed successfully',
            queriesExecuted: fixQueries.length
          });
        }
      }
    });
  });
});

// Get all drivers
app.get('/api/drivers', (req, res) => {
  const query = 'SELECT * FROM drivers WHERE status = "active" ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Drivers query error:', err);
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

// Contact form submission endpoint
app.post('/api/contact/submit', async (req, res) => {
  try {
    console.log('Contact form submission received:', req.body);
    
    const { name, email, mobile, company, city, message, country, cookieConsent } = req.body;
    
    // Validate required fields
    if (!name || !email || !mobile || !city || !message) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ error: 'Name, email, mobile number, city, and message are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed - invalid email format');
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    // Validate mobile number (10+ digits)
    const mobileRegex = /^[0-9]{10,}$/;
    if (!mobileRegex.test(mobile.replace(/\s/g, ''))) {
      console.log('Validation failed - invalid mobile number');
      return res.status(400).json({ error: 'Mobile number must contain only digits and be at least 10 digits long' });
    }
    
    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');
    const timestamp = new Date().toISOString();
    
    // Insert into database
    const insertQuery = `
      INSERT INTO contact_form (name, email, mobile, company, city, message, country, ip_address, user_agent, cookie_consent, submission_timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(insertQuery, [name, email, mobile, company, city, message, country, ipAddress, userAgent, cookieConsent, timestamp], async (err, result) => {
      if (err) {
        console.error('Database insert error:', err);
        return res.status(500).json({ error: 'Failed to save contact form. Please try again.' });
      }
      
      console.log('Contact form saved to database with ID:', result.insertId);
      
      // Prepare email content
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New User Form Submission from Website
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Contact Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Full Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email Address:</td>
                <td style="padding: 8px 0; color: #1f2937;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Mobile Number:</td>
                <td style="padding: 8px 0; color: #1f2937;">${mobile}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Company/Organization:</td>
                <td style="padding: 8px 0; color: #1f2937;">${company || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Country:</td>
                <td style="padding: 8px 0; color: #1f2937;">${country || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">City:</td>
                <td style="padding: 8px 0; color: #1f2937;">${city}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Cookie Consent:</td>
                <td style="padding: 8px 0; color: #1f2937;">${cookieConsent ? 'Yes' : 'No'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Message/Requirement</h3>
            <p style="color: #374151; line-height: 1.6; margin: 0;">${message}</p>
          </div>
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">Submission Details</h4>
            <p style="color: #374151; margin: 5px 0;"><strong>Submission ID:</strong> ${result.insertId}</p>
            <p style="color: #374151; margin: 5px 0;"><strong>Date & Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p style="color: #374151; margin: 5px 0;"><strong>IP Address:</strong> ${ipAddress}</p>
            <p style="color: #374151; margin: 5px 0;"><strong>Browser:</strong> ${userAgent}</p>
            <p style="color: #374151; margin: 5px 0;"><strong>Cookie Consent:</strong> ${cookieConsent ? 'Accepted' : 'Rejected'}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">Next Steps</h4>
            <p style="color: #374151; margin: 5px 0;">Please respond to this inquiry within 24 hours for better customer satisfaction.</p>
            <p style="color: #374151; margin: 5px 0;">You can reply directly to this email or contact the customer using the provided details.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
            This email was automatically generated from the Zebra Printers India contact form.<br>
            For support, contact: gm@zebraprintersindia.com | +91 8800839490
          </p>
        </div>
      `;
      
      // Email options
      const mailOptions = {
        from: '"Zebra Printers India Contact Form" <gm@indianbarcode.com>',
        to: 'gm@indianbarcode.com',
        replyTo: email,
        subject: 'New User Form Submission from Website',
        text: `
New User Form Submission from Website

Contact Details:
- Full Name: ${name}
- Email Address: ${email}
- Mobile Number: ${mobile}
- Company/Organization: ${company || 'Not provided'}
- City: ${city}

Message/Requirement:
${message}

Submission Details:
- Submission ID: ${result.insertId}
- Date & Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
- IP Address: ${ipAddress}
- Browser: ${userAgent}
- Cookie Consent: ${cookieConsent ? 'Accepted' : 'Rejected'}

Please respond to this inquiry within 24 hours for better customer satisfaction.

Best regards,
Zebra Printers India System
        `,
        html: emailContent
      };
      
      // Send email with retry logic
      const sendEmailWithRetry = async (mailOptions, retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            console.log(`📧 Sending contact form email (attempt ${attempt}/${retries})...`);
            const info = await emailTransporter.sendMail(mailOptions);
            console.log('✅ Contact form email sent successfully!');
            console.log('📧 Message ID:', info.messageId);
            return info;
          } catch (emailError) {
            console.error(`❌ Email attempt ${attempt} failed:`, emailError.message);
            if (attempt === retries) {
              throw emailError;
            }
            console.log(`⏳ Waiting 2 seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      };
      
      try {
        await sendEmailWithRetry(mailOptions);
        console.log('✅ Contact form processed successfully!');
        
        // Log form data to file as backup
        const formDataLog = {
          timestamp: new Date().toISOString(),
          id: result.insertId,
          name,
          email,
          mobile,
          company,
          city,
          message,
          ipAddress,
          userAgent,
          cookieConsent
        };
        
        fs.appendFileSync('form_submissions.log', JSON.stringify(formDataLog) + '\n');
        
        res.json({ 
          success: true, 
          message: 'Thank you for your message! We will get back to you within 24 hours.',
          submissionId: result.insertId
        });
        
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
        
        // Still log the form data even if email fails
        const formDataLog = {
          timestamp: new Date().toISOString(),
          id: result.insertId,
          name,
          email,
          mobile,
          company,
          city,
          message,
          ipAddress,
          userAgent,
          cookieConsent,
          emailError: emailError.message
        };
        
        fs.appendFileSync('form_submissions.log', JSON.stringify(formDataLog) + '\n');
        
        // Return success even if email fails, but log the issue
        res.json({ 
          success: true, 
          message: 'Thank you for your message! We have received your inquiry and will get back to you soon.',
          submissionId: result.insertId,
          warning: 'Email notification failed, but your message was saved.'
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

// Cookie acceptance email generation function
function generateWelcomeEmail(userData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #667eea; margin-bottom: 10px;">🎉 Welcome to Zebra Printers India!</h1>
        <p style="color: #666; font-size: 16px;">Thank you for accepting our cookies and trusting us with your data.</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <h2 style="color: #333; margin-top: 0;">🍪 Cookie Consent Confirmed</h2>
        <p style="color: #555; line-height: 1.6;">
          Your cookie preferences have been saved successfully. We use cookies to:
        </p>
        <ul style="color: #555; line-height: 1.8;">
          <li>✅ Enhance your browsing experience</li>
          <li>📊 Analyze website traffic and performance</li>
          <li>🎯 Personalize content and recommendations</li>
          <li>🔒 Ensure website security and functionality</li>
        </ul>
      </div>
      
      <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #1e40af; margin-top: 0;">🌍 Your Location Data</h3>
        <p style="color: #374151; margin: 5px 0;">
          <strong>Country:</strong> ${userData?.detectedCountry || 'Unknown'}
        </p>
        <p style="color: #374151; margin: 5px 0;">
          <strong>City:</strong> ${userData?.detectedCity || 'Unknown'}
        </p>
        <p style="color: #374151; margin: 5px 0;">
          <strong>Timezone:</strong> ${userData?.timezone || 'Unknown'}
        </p>
      </div>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #15803d; margin-top: 0;">💻 System Information</h3>
        <p style="color: #374151; margin: 5px 0;">
          <strong>Browser:</strong> ${userData?.browserVersion || 'Unknown'}
        </p>
        <p style="color: #374151; margin: 5px 0;">
          <strong>Operating System:</strong> ${userData?.osInfo || 'Unknown'}
        </p>
        <p style="color: #374151; margin: 5px 0;">
          <strong>Device:</strong> ${userData?.isMobile ? 'Mobile' : userData?.isDesktop ? 'Desktop' : 'Unknown'}
        </p>
        <p style="color: #374151; margin: 5px 0;">
          <strong>Language:</strong> ${userData?.language || 'Unknown'}
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <h3 style="color: #333;">🚀 What's Next?</h3>
        <p style="color: #666; line-height: 1.6;">
          Now that you've accepted cookies, you'll get the best experience on our website with:
        </p>
        <ul style="color: #666; line-height: 1.8; text-align: left; max-width: 400px; margin: 0 auto;">
          <li>🎯 Personalized product recommendations</li>
          <li>📱 Optimized mobile experience</li>
          <li>⚡ Faster page loading</li>
          <li>🔍 Enhanced search functionality</li>
        </ul>
      </div>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #856404; margin-top: 0;">🔒 Your Privacy Matters</h3>
        <p style="color: #856404; margin: 0;">
          We respect your privacy and handle your data with care. You can change your cookie preferences at any time by clicking the cookie settings in our footer.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://zebraprintersindia.com/products" 
           style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          🛍️ Explore Our Products
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <div style="text-align: center; color: #6b7280; font-size: 14px;">
        <p style="margin: 5px 0;">
          <strong>Zebra Printers India</strong><br>
          📧 Email: gm@indianbarcode.com | 📞 Phone: +91 8800839490
        </p>
        <p style="margin: 5px 0; font-size: 12px;">
          This email was sent because you accepted cookies on our website.<br>
          If you have any questions about our cookie policy, please contact us.
        </p>
      </div>
    </div>
  `;
}

function generateCookieAcceptanceEmail(userData, serverIp, trackingId) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
        🍪 New Cookie Acceptance - ${userData?.detectedCountry || 'Unknown Country'} | ${new Date().toLocaleDateString('en-IN')}
      </h2>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">🎯 Cookie Acceptance Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Action:</td>
            <td style="padding: 8px 0; color: #1f2937;">✅ Cookies Accepted</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Timestamp:</td>
            <td style="padding: 8px 0; color: #1f2937;">📅 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">Tracking ID:</td>
            <td style="padding: 8px 0; color: #1f2937;">#${trackingId}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">🌍 Location Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151; width: 140px;">Country:</td>
            <td style="padding: 6px 0; color: #1f2937;">🌍 ${userData?.detectedCountry || 'Unknown'} (${userData?.countryCode || 'N/A'})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">City:</td>
            <td style="padding: 6px 0; color: #1f2937;">🏙️ ${userData?.detectedCity || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Region:</td>
            <td style="padding: 6px 0; color: #1f2937;">🗺️ ${userData?.detectedRegion || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">IP Address:</td>
            <td style="padding: 6px 0; color: #1f2937;">🌐 ${serverIp || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Geolocation:</td>
            <td style="padding: 6px 0; color: #1f2937;">${userData?.isGeolocationEnabled ? '✅ Enabled' : '❌ Disabled'}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #15803d; margin-top: 0;">💻 System Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151; width: 140px;">Browser:</td>
            <td style="padding: 6px 0; color: #1f2937;">🌐 ${userData?.browserVersion || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Operating System:</td>
            <td style="padding: 6px 0; color: #1f2937;">💻 ${userData?.osInfo || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Device Type:</td>
            <td style="padding: 6px 0; color: #1f2937;">
              ${userData?.isMobile ? '📱 Mobile' : userData?.isTablet ? '📱 Tablet' : userData?.isDesktop ? '🖥️ Desktop' : '❓ Unknown'}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Language:</td>
            <td style="padding: 6px 0; color: #1f2937;">🗣️ ${userData?.language || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Timezone:</td>
            <td style="padding: 6px 0; color: #1f2937;">⏰ ${userData?.timezone || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Screen Resolution:</td>
            <td style="padding: 6px 0; color: #1f2937;">📱 ${userData?.screenResolution || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Connection:</td>
            <td style="padding: 6px 0; color: #1f2937;">📶 ${userData?.connectionType || 'Unknown'}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">🔗 Page & Session Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151; width: 140px;">Page URL:</td>
            <td style="padding: 6px 0; color: #1f2937;">🌐 ${userData?.pageUrl || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Page Title:</td>
            <td style="padding: 6px 0; color: #1f2937;">📄 ${userData?.pageTitle || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Referrer:</td>
            <td style="padding: 6px 0; color: #1f2937;">🔗 ${userData?.referrer || 'Direct visit'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Session Start:</td>
            <td style="padding: 6px 0; color: #1f2937;">⏰ ${new Date(userData?.sessionStartTime || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Online Status:</td>
            <td style="padding: 6px 0; color: #1f2937;">${userData?.onLine ? '🟢 Online' : '🔴 Offline'}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">🎯 Marketing Intelligence</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151; width: 140px;">Traffic Source:</td>
            <td style="padding: 6px 0; color: #1f2937;">${userData?.referrer?.includes('google') ? '🔍 Google Search' : userData?.referrer?.includes('facebook') ? '📘 Facebook' : userData?.referrer?.includes('linkedin') ? '💼 LinkedIn' : '🌐 Direct/Other'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Device Priority:</td>
            <td style="padding: 6px 0; color: #1f2937;">${userData?.isMobile ? '📱 Mobile-First' : userData?.isDesktop ? '🖥️ Desktop-First' : '📱 Mixed'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Language Preference:</td>
            <td style="padding: 6px 0; color: #1f2937;">🗣️ ${userData?.language || 'Unknown'} ${userData?.languages ? `(${userData.languages.join(', ')})` : ''}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #374151;">Technical Level:</td>
            <td style="padding: 6px 0; color: #1f2937;">⚙️ ${userData?.hardwareConcurrency ? `${userData.hardwareConcurrency} cores` : 'Unknown'} | ${userData?.deviceMemory ? `${userData.deviceMemory}GB RAM` : 'Unknown'}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h3 style="color: #92400e; margin-top: 0;">🎯 Action Items</h3>
        <ul style="color: #374151; margin: 0; padding-left: 20px;">
          <li>📊 <strong>Track Engagement</strong> - User accepted cookies from ${userData?.detectedCountry || 'Unknown'}</li>
          <li>🎯 <strong>Geographic Targeting</strong> - ${userData?.detectedCity || 'Unknown'} market opportunity</li>
          <li>📱 <strong>Device Optimization</strong> - ${userData?.isMobile ? 'Mobile' : userData?.isDesktop ? 'Desktop' : 'Mixed'} user experience</li>
          <li>🌐 <strong>Traffic Source Analysis</strong> - ${userData?.referrer?.includes('google') ? 'Google search traffic' : 'Direct/other traffic'}</li>
          <li>📈 <strong>Marketing Attribution</strong> - ${userData?.referrer || 'Direct visit'} source</li>
        </ul>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
        🚀 <strong>Automated Cookie Tracking System</strong><br>
        📧 Support: gm@zebraprintersindia.com | 📞 +91 8800839490<br>
        🕒 Tracking ID: #${trackingId} | 📅 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      </p>
    </div>
  `;
}

// Cookie acceptance tracking endpoint
app.post('/api/cookie-acceptance', async (req, res) => {
  try {
    console.log('🍪 Cookie acceptance data received:', req.body);
    
    const { action, userData, timestamp } = req.body;
    
    if (action !== 'cookie_accepted') {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    // Get server-side data
    const serverIpAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const serverUserAgent = req.get('User-Agent');
    const serverTimestamp = new Date().toISOString();
    
    // Store tracking data in database
    const insertQuery = `
      INSERT INTO user_tracking (action, data, timestamp, user_agent, url, page_title, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const trackingData = {
      action: 'cookie_accepted',
      userData: userData,
      timestamp: timestamp,
      serverData: {
        serverIp: serverIpAddress,
        serverUserAgent: serverUserAgent,
        serverTimestamp: serverTimestamp
      }
    };
    
    db.query(insertQuery, [
      'cookie_accepted',
      JSON.stringify(trackingData),
      serverTimestamp,
      serverUserAgent,
      userData?.pageUrl || 'Unknown',
      userData?.pageTitle || 'Unknown',
      serverIpAddress
    ], async (err, result) => {
      if (err) {
        console.error('Database insert error:', err);
        return res.status(500).json({ error: 'Failed to save tracking data' });
      }
      
      console.log('✅ Cookie acceptance tracking data saved with ID:', result.insertId);
      
      // Send comprehensive email notification
      try {
        const emailContent = generateCookieAcceptanceEmail(userData, serverIpAddress, result.insertId);
        
        const mailOptions = {
          from: `"Zebra Printers India Cookie Tracker" <${process.env.GMAIL_USER}>`,
          to: process.env.GMAIL_USER,
          subject: `🍪 New Cookie Acceptance - ${userData?.detectedCountry || 'Unknown Country'} | ${new Date().toLocaleDateString('en-IN')}`,
          html: emailContent
        };
        
        console.log('📧 Sending cookie acceptance email notification...');
        const emailResult = await emailTransporter.sendMail(mailOptions);
        console.log('✅ Cookie acceptance email sent successfully!');
        console.log('📧 Message ID:', emailResult.messageId);
        
        res.json({ 
          success: true, 
          message: 'Cookie acceptance tracked and email sent',
          trackingId: result.insertId
        });
        
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        res.json({ 
          success: true, 
          message: 'Cookie acceptance tracked but email failed',
          trackingId: result.insertId,
          emailError: emailError.message
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Cookie acceptance tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send welcome email to user when they accept cookies
app.post('/api/send-welcome-email', async (req, res) => {
  try {
    console.log('📧 Welcome email request received:', req.body);
    
    const { userData, timestamp } = req.body;
    
    if (!userData) {
      return res.status(400).json({ error: 'User data is required' });
    }
    
    // Generate welcome email content
    const welcomeEmailContent = generateWelcomeEmail(userData);
    
    const mailOptions = {
      from: `"Zebra Printers India" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // You can change this to user's email if they provide it
      subject: `🎉 Welcome to Zebra Printers India - Cookie Consent Confirmed`,
      html: welcomeEmailContent
    };
    
    console.log('📧 Sending welcome email to user...');
    const emailResult = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully!');
    console.log('📧 Message ID:', emailResult.messageId);
    
    res.json({ 
      success: true, 
      message: 'Welcome email sent successfully',
      messageId: emailResult.messageId
    });
    
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    res.status(500).json({ 
      error: 'Failed to send welcome email',
      details: error.message
    });
  }
});

// Contact form submission endpoint (alternative route)
app.post('/api/contact-form', async (req, res) => {
  try {
    console.log('📝 Contact form submission received:', req.body);
    
    const { 
      name, email, phone, company, city, message, country, cookieConsent,
      userAgent, language, timezone, screenResolution, viewportSize, referrer,
      detectedCountry, detectedCity, detectedRegion, ipAddress, countryCode,
      cookiesEnabled, javascriptEnabled, onlineStatus, platform, browserLanguage,
      pageUrl, pageTitle, formSubmissionTime, isGeolocationEnabled
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !message) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ error: 'Name, email, phone number, and message are required' });
    }

    // Validate cookie consent
    if (!cookieConsent) {
      console.log('Validation failed - cookie consent not given');
      return res.status(400).json({ error: 'You must accept cookies to submit the form' });
    }

    console.log('✅ All validations passed');
    console.log('📝 Form data:', { name, email, phone, company, city, message, country, cookieConsent });

    // Get client IP and user agent (server-side)
    const serverIpAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const serverUserAgent = req.get('User-Agent');
    const timestamp = new Date().toISOString();
    
    // Insert into database
    const insertQuery = `
      INSERT INTO contact_form (name, email, mobile, company, city, message, country, ip_address, user_agent, cookie_consent, submission_timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(insertQuery, [name, email, phone, company, city, message, country, serverIpAddress, serverUserAgent, cookieConsent, timestamp], async (err, result) => {
      if (err) {
        console.error('Database insert error:', err);
        return res.status(500).json({ error: 'Failed to save contact form. Please try again.' });
      }
      
      console.log('Contact form saved to database with ID:', result.insertId);
      
      // Prepare comprehensive email content
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            🎉 New Lead: ${name} from ${detectedCountry || country} | ${new Date().toLocaleDateString('en-IN')}
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">👤 Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Full Name:</td>
                <td style="padding: 8px 0; color: #1f2937;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email Address:</td>
                <td style="padding: 8px 0; color: #1f2937;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Mobile Number:</td>
                <td style="padding: 8px 0; color: #1f2937;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Company/Organization:</td>
                <td style="padding: 8px 0; color: #1f2937;">${company || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Country (Form):</td>
                <td style="padding: 8px 0; color: #1f2937;">${country || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Country (Detected):</td>
                <td style="padding: 8px 0; color: #1f2937;">🌍 ${detectedCountry || 'Unknown'} (${countryCode || 'N/A'})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">City:</td>
                <td style="padding: 8px 0; color: #1f2937;">${city || detectedCity || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Region:</td>
                <td style="padding: 8px 0; color: #1f2937;">${detectedRegion || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Cookie Consent:</td>
                <td style="padding: 8px 0; color: #1f2937;">✅ ${cookieConsent ? 'Yes - User accepted cookies' : 'No'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Submission Time:</td>
                <td style="padding: 8px 0; color: #1f2937;">📅 ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">🌐 System Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151; width: 140px;">IP Address:</td>
                <td style="padding: 6px 0; color: #1f2937;">🌐 ${ipAddress || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Browser Language:</td>
                <td style="padding: 6px 0; color: #1f2937;">🗣️ ${language || browserLanguage || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Timezone:</td>
                <td style="padding: 6px 0; color: #1f2937;">⏰ ${timezone || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Platform:</td>
                <td style="padding: 6px 0; color: #1f2937;">💻 ${platform || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Screen Resolution:</td>
                <td style="padding: 6px 0; color: #1f2937;">📱 ${screenResolution || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Viewport Size:</td>
                <td style="padding: 6px 0; color: #1f2937;">📏 ${viewportSize || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Referrer:</td>
                <td style="padding: 6px 0; color: #1f2937;">🔗 ${referrer || 'Direct visit'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Page URL:</td>
                <td style="padding: 6px 0; color: #1f2937;">🌐 ${pageUrl || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Online Status:</td>
                <td style="padding: 6px 0; color: #1f2937;">${onlineStatus ? '🟢 Online' : '🔴 Offline'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Geolocation:</td>
                <td style="padding: 6px 0; color: #1f2937;">${isGeolocationEnabled ? '✅ Enabled' : '❌ Disabled'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">💬 Message/Requirement</h3>
            <p style="color: #374151; line-height: 1.6; margin: 0; background-color: #f9fafb; padding: 15px; border-radius: 6px;">${message}</p>
          </div>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h3 style="color: #15803d; margin-top: 0;">🎯 Action Items</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px;">
              <li>📞 <strong>Contact within 24 hours</strong> - Priority lead from ${detectedCountry || country}</li>
              <li>📧 <strong>Reply directly</strong> to this email or use provided contact details</li>
              <li>📝 <strong>Follow up</strong> on their specific requirements</li>
              <li>💼 <strong>Convert lead</strong> - User has shown interest in Zebra products</li>
              <li>🌍 <strong>Location context</strong> - Customer from ${detectedCountry || country} ${detectedCity ? `(${detectedCity})` : ''}</li>
            </ul>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
            🚀 <strong>Automated Lead Capture System</strong><br>
            📧 Support: gm@zebraprintersindia.com | 📞 +91 8800839490<br>
            🕒 Submission ID: #${result.insertId} | 📅 ${formSubmissionTime || new Date().toISOString()}
          </p>
        </div>
      `;
      
      // Email options
      const mailOptions = {
        from: '"Zebra Printers India Contact Form" <gm@indianbarcode.com>',
        to: 'gm@indianbarcode.com',
        replyTo: email,
        subject: `🎉 New Lead: ${name} - ${company || 'Individual'} from ${country || 'Unknown Country'} | ${new Date().toLocaleDateString('en-IN')}`,
        html: emailContent
      };
      
      // Send email with retry logic
      const sendEmailWithRetry = async (mailOptions, retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            console.log(`📧 Sending contact form email (attempt ${attempt}/${retries})...`);
            const info = await emailTransporter.sendMail(mailOptions);
            console.log('✅ Contact form email sent successfully!');
            console.log('📧 Message ID:', info.messageId);
            console.log('📬 Response:', info.response);
            return info;
          } catch (emailError) {
            console.error(`❌ Email attempt ${attempt} failed:`, emailError.message);
            if (attempt === retries) {
              throw emailError;
            }
            console.log(`⏳ Waiting 2 seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      };

      try {
        await sendEmailWithRetry(mailOptions);
        console.log('🎉 Contact form submission completed successfully!');
        res.json({ 
          success: true, 
          message: 'Thank you for your inquiry! We will contact you soon.',
          submissionId: result.insertId
        });
      } catch (emailError) {
        console.error('❌ Failed to send email after all retries:', emailError);
        // Still return success since data was saved
        res.json({ 
          success: true, 
          message: 'Your message has been received. We will contact you soon.',
          submissionId: result.insertId,
          warning: 'Email notification failed but your message was saved'
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

// Enhanced contact form endpoint
app.post('/api/contact/enhanced-submit', async (req, res) => {
  try {
    console.log('📝 Enhanced contact form submission received:', req.body);
    
    const { 
      name, email, mobile, location, company, productService, message, cookieConsent
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !mobile || !location || !productService || !message) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed - invalid email format');
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    
    // Validate mobile number (10+ digits)
    const mobileRegex = /^(\+?\d{1,3}[-.\s]?)?\d{10,}$/;
    if (!mobileRegex.test(mobile.replace(/\s/g, ''))) {
      console.log('Validation failed - invalid mobile number');
      return res.status(400).json({ error: 'Mobile number must contain only digits and be at least 10 digits long' });
    }

    console.log('✅ All validations passed');
    console.log('📝 Enhanced form data:', { name, email, mobile, location, company, productService, message, cookieConsent });

    // Get client IP and user agent (server-side)
    const serverIpAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const serverUserAgent = req.get('User-Agent');
    const timestamp = new Date().toISOString();
    
    // Insert into database (using the same contact_form table but with enhanced fields)
    const insertQuery = `
      INSERT INTO contact_form (name, email, mobile, company, city, message, country, ip_address, user_agent, cookie_consent, submission_timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Map enhanced form fields to database fields
    const dbCity = location; // location maps to city in database
    const dbMessage = `Product/Service: ${productService}\n\nMessage: ${message}`; // Combine product and message
    const dbCountry = 'India'; // Default country
    
    db.query(insertQuery, [name, email, mobile, company, dbCity, dbMessage, dbCountry, serverIpAddress, serverUserAgent, cookieConsent, timestamp], async (err, result) => {
      if (err) {
        console.error('Database insert error:', err);
        return res.status(500).json({ error: 'Failed to save contact form. Please try again.' });
      }
      
      console.log('Enhanced contact form saved to database with ID:', result.insertId);
      
      // Prepare comprehensive email content
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            🚀 New Enhanced Contact Form Submission
          </h2>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">👤 Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151; width: 140px;">Name:</td>
                <td style="padding: 6px 0; color: #1f2937;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 6px 0; color: #1f2937;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Mobile:</td>
                <td style="padding: 6px 0; color: #1f2937;">${mobile}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Location:</td>
                <td style="padding: 6px 0; color: #1f2937;">${location}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Company:</td>
                <td style="padding: 6px 0; color: #1f2937;">${company || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #374151;">Product/Service:</td>
                <td style="padding: 6px 0; color: #1f2937; font-weight: bold; background-color: #dbeafe; padding: 4px 8px; border-radius: 4px;">${productService}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">💬 Message/Requirement</h3>
            <p style="color: #374151; line-height: 1.6; margin: 0; background-color: #f9fafb; padding: 15px; border-radius: 6px;">${message}</p>
          </div>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h3 style="color: #15803d; margin-top: 0;">🎯 Action Items</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px;">
              <li>📞 <strong>Contact within 24 hours</strong> - Enhanced form submission from ${location}</li>
              <li>📧 <strong>Reply directly</strong> to this email or use provided contact details</li>
              <li>📝 <strong>Follow up</strong> on their specific requirements for ${productService}</li>
              <li>💼 <strong>Convert lead</strong> - User has shown specific interest in ${productService}</li>
              <li>🌍 <strong>Location context</strong> - Customer from ${location}</li>
            </ul>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0;">
            🚀 <strong>Enhanced Lead Capture System</strong><br>
            📧 Support: gm@indianbarcode.com | 📞 +91 8800839490<br>
            🕒 Submission ID: #${result.insertId} | 📅 ${timestamp}
          </p>
        </div>
      `;
      
      // Email configuration
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@zebraprintersindia.com',
        to: 'gm@indianbarcode.com',
        subject: `🚀 Enhanced Contact Form: ${name} - ${productService} Inquiry`,
        html: emailContent
      };

      // Send email with retry logic
      const sendEmailWithRetry = async (mailOptions, retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            console.log(`📧 Sending enhanced contact form email (attempt ${attempt}/${retries})...`);
            await emailTransporter.sendMail(mailOptions);
            console.log('✅ Enhanced contact form email sent successfully!');
            return;
          } catch (emailError) {
            console.error(`❌ Email attempt ${attempt} failed:`, emailError.message);
            if (attempt === retries) {
              throw emailError;
            }
            console.log(`⏳ Waiting 2 seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      };

      try {
        await sendEmailWithRetry(mailOptions);
        console.log('🎉 Enhanced contact form submission completed successfully!');
        res.json({ 
          success: true, 
          message: 'Thank you for your inquiry! We will contact you soon.',
          submissionId: result.insertId
        });
      } catch (emailError) {
        console.error('❌ Failed to send email after all retries:', emailError);
        // Still return success since data was saved
        res.json({ 
          success: true, 
          message: 'Your message has been received. We will contact you soon.',
          submissionId: result.insertId,
          warning: 'Email notification failed but your message was saved'
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Enhanced contact form submission error:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

// Get contact information endpoint
app.get('/api/contact-info', (req, res) => {
  try {
    // Return static contact information
    const contactInfo = [
      { 
        id: "1", 
        type: "phone", 
        title: "Sales Phone", 
        value: "+91-8800839490", 
        description: "Call us for sales inquiries", 
        icon: "Phone", 
        isActive: true, 
        sortOrder: 1 
      },
      { 
        id: "2", 
        type: "phone", 
        title: "Support Phone", 
        value: "+91-8800122315", 
        description: "Call us for technical support", 
        icon: "Phone", 
        isActive: true, 
        sortOrder: 2 
      },
      { 
        id: "3", 
        type: "email", 
        title: "General Email", 
        value: "gm@zebraprintersindia.com", 
        description: "Email us for general inquiries", 
        icon: "Mail", 
        isActive: true, 
        sortOrder: 3 
      },
      { 
        id: "4", 
        type: "address", 
        title: "Office Address", 
        value: "MINDWARE, S-4, Plot No-7, Pocket-7, Pankaj Plaza, Near Metro Station, Sector-12, Dwarka, New Delhi-110078, India", 
        description: "Visit our office for personalized consultation", 
        icon: "MapPin", 
        isActive: true, 
        sortOrder: 4 
      },
      { 
        id: "5", 
        type: "social_media", 
        title: "LinkedIn", 
        value: "https://linkedin.com/company/indianbarcode", 
        description: "Follow us on LinkedIn", 
        icon: "Linkedin", 
        isActive: true, 
        sortOrder: 5 
      },
      { 
        id: "6", 
        type: "social_media", 
        title: "Instagram", 
        value: "https://instagram.com/indianbarcode", 
        description: "Follow us on Instagram", 
        icon: "Instagram", 
        isActive: true, 
        sortOrder: 6 
      },
      { 
        id: "7", 
        type: "social_media", 
        title: "Facebook", 
        value: "https://facebook.com/indianbarcode", 
        description: "Follow us on Facebook", 
        icon: "Facebook", 
        isActive: true, 
        sortOrder: 7 
      },
      { 
        id: "8", 
        type: "social_media", 
        title: "Twitter", 
        value: "https://twitter.com/indianbarcode", 
        description: "Follow us on Twitter/X", 
        icon: "Twitter", 
        isActive: true, 
        sortOrder: 8 
      }
    ];

    res.json(contactInfo);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({ error: 'Failed to fetch contact information' });
  }
});

// User tracking endpoints
app.post('/api/tracking/interaction', async (req, res) => {
  try {
    const { action, data, timestamp, userAgent, url, pageTitle } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // Insert tracking data into database
    const insertQuery = `
      INSERT INTO user_tracking (action, data, timestamp, user_agent, url, page_title, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(insertQuery, [action, JSON.stringify(data), timestamp, userAgent, url, pageTitle, ipAddress], (err, result) => {
      if (err) {
        console.error('Error saving tracking data:', err);
        return res.status(500).json({ error: 'Failed to save tracking data' });
      }
      
      console.log('Tracking data saved:', { action, url, id: result.insertId });
      res.json({ success: true, id: result.insertId });
    });
  } catch (error) {
    console.error('Tracking endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tracking data (for admin purposes)
app.get('/api/tracking/data', (req, res) => {
  try {
    const query = `
      SELECT action, data, timestamp, url, page_title, ip_address 
      FROM user_tracking 
      ORDER BY timestamp DESC 
      LIMIT 100
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching tracking data:', err);
        return res.status(500).json({ error: 'Failed to fetch tracking data' });
      }
      
      res.json(results);
    });
  } catch (error) {
    console.error('Get tracking data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear tracking data
app.delete('/api/tracking/clear', (req, res) => {
  try {
    const query = 'DELETE FROM user_tracking';
    
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error clearing tracking data:', err);
        return res.status(500).json({ error: 'Failed to clear tracking data' });
      }
      
      console.log('Tracking data cleared:', result.affectedRows, 'records deleted');
      res.json({ success: true, deletedCount: result.affectedRows });
    });
  } catch (error) {
    console.error('Clear tracking data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send tracking summary email
app.post('/api/tracking/send-summary', async (req, res) => {
  try {
    const { userName, mobile, email, pageUrl, timeSpent, interactionsCount } = req.body;
    
    // Insert into tracking_emails table
    const insertQuery = `
      INSERT INTO tracking_emails (user_name, mobile, email, page_url, time_spent, interactions_count, last_activity)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    
    db.query(insertQuery, [userName, mobile, email, pageUrl, timeSpent, interactionsCount], async (err, result) => {
      if (err) {
        console.error('Error saving tracking email data:', err);
        return res.status(500).json({ error: 'Failed to save tracking data' });
      }
      
      // Send email notification
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            User Tracking Summary - Website Analytics
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">User Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Name:</td><td style="padding: 8px 0; color: #1f2937;">${userName || 'Not provided'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Mobile:</td><td style="padding: 8px 0; color: #1f2937;">${mobile || 'Not provided'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td><td style="padding: 8px 0; color: #1f2937;">${email || 'Not provided'}</td></tr>
            </table>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Page Activity</h3>
            <p style="color: #374151; margin: 5px 0;"><strong>Page URL:</strong> ${pageUrl}</p>
            <p style="color: #374151; margin: 5px 0;"><strong>Time Spent:</strong> ${timeSpent} seconds</p>
            <p style="color: #374151; margin: 5px 0;"><strong>Interactions:</strong> ${interactionsCount} actions</p>
          </div>
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">Tracking Details</h4>
            <p style="color: #374151; margin: 5px 0;"><strong>Date & Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            <p style="color: #374151; margin: 5px 0;"><strong>Tracking ID:</strong> ${result.insertId}</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: '"Zebra Printers India Analytics" <gm@indianbarcode.com>',
        to: 'gm@indianbarcode.com',
        subject: 'User Tracking Summary - Website Analytics',
        text: `
User Tracking Summary - Website Analytics

User Information:
- Name: ${userName || 'Not provided'}
- Mobile: ${mobile || 'Not provided'}
- Email: ${email || 'Not provided'}

Page Activity:
- Page URL: ${pageUrl}
- Time Spent: ${timeSpent} seconds
- Interactions: ${interactionsCount} actions

Tracking Details:
- Date & Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
- Tracking ID: ${result.insertId}

Best regards,
Zebra Printers India Analytics System
        `,
        html: emailContent
      };

      try {
        await emailTransporter.sendMail(mailOptions);
        console.log('Tracking summary email sent successfully');
        
        // Update email_sent status
        db.query('UPDATE tracking_emails SET email_sent = TRUE WHERE id = ?', [result.insertId]);
        
        res.json({ success: true, message: 'Tracking summary sent successfully' });
      } catch (emailError) {
        console.error('Error sending tracking email:', emailError);
        res.status(500).json({ error: 'Failed to send tracking email' });
      }
    });
  } catch (error) {
    console.error('Send tracking summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create driver
app.post('/api/drivers', upload.single('file'), (req, res) => {
  try {
    console.log('Creating driver with data:', req.body);
    console.log('File received:', req.file);
    
    const { name, version, category, operatingSystem, description, compatibility } = req.body;
    const file = req.file;
    
    if (!file) {
      console.log('No file received');
      return res.status(400).json({ error: 'Driver file is required' });
    }

    // Ensure uploads/drivers directory exists
    const driversDir = path.join(__dirname, 'uploads', 'drivers');
    if (!fs.existsSync(driversDir)) {
      fs.mkdirSync(driversDir, { recursive: true });
      console.log('Created uploads/drivers directory');
    }

    // First check if drivers table exists
    const checkTableQuery = 'SHOW TABLES LIKE "drivers"';
    db.query(checkTableQuery, (err, results) => {
      if (err) {
        console.error('Error checking drivers table:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          details: err.message 
        });
      }
      
      if (results.length === 0) {
        console.error('Drivers table does not exist');
        return res.status(500).json({ 
          error: 'Drivers table does not exist. Please run database setup first.' 
        });
      }
      
      // Table exists, proceed with creation
      createDriverRecord();
    });

    function createDriverRecord() {
      // No file size restrictions for drivers
      const downloadUrl = `/downloads/${file.filename}`;
      const fileSize = file.size;

      const query = `INSERT INTO drivers (name, version, category, operating_system, description, compatibility, file_name, file_path, file_size, download_url, release_date)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const filePath = `/uploads/drivers/${file.filename}`;
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

      console.log('Executing query with values:', values);

      db.query(query, values, (err, results) => {
        if (err) {
          console.error('Database error:', err);
          console.error('Query:', query);
          console.error('Values:', values);
          res.status(500).json({ 
            error: 'Failed to create driver',
            details: err.message,
            sqlState: err.sqlState,
            errno: err.errno
          });
        } else {
          console.log('Driver created successfully with ID:', results.insertId);
          res.json({ 
            success: true,
            message: 'Driver created successfully',
            id: results.insertId 
          });
        }
      });
    }
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ 
      error: 'Failed to create driver',
      details: error.message 
    });
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

// Download request endpoint
app.post('/api/drivers/download-request', upload.single('receipt'), async (req, res) => {
  try {
    console.log('Download request received:', req.body);
    console.log('Receipt file:', req.file);
    
    const { driverId, driverName, fullName, companyName, address, mobileNumber, purpose, email } = req.body;
    const receiptFile = req.file;

    // Validate required fields
    if (!fullName || !companyName || !address || !mobileNumber || !purpose || !email) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate receipt file is mandatory
    if (!receiptFile) {
      console.log('Validation failed - no receipt file');
      return res.status(400).json({ error: 'Purchase receipt/document is required' });
    }

    // Get driver details from database
    const driverQuery = 'SELECT * FROM drivers WHERE id = ?';
    db.query(driverQuery, [driverId], async (err, driverResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to get driver details' });
      }

      if (driverResults.length === 0) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      const driver = driverResults[0];

      // Prepare email content matching your working format
      const emailContent = `
        <p>Dear Sir,</p>
        
        <p><strong>New Driver Download Request Received from Zebra Printers India Website.</strong></p>
        
        <h3>Driver Details:</h3>
        <ul>
          <li><strong>Driver Name:</strong> ${driver.name}</li>
          <li><strong>Version:</strong> ${driver.version}</li>
          <li><strong>Category:</strong> ${driver.category}</li>
          <li><strong>Operating System:</strong> ${driver.operating_system}</li>
          <li><strong>File Size:</strong> ${driver.file_size ? (driver.file_size / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'}</li>
        </ul>

        <h3>Customer Details:</h3>
        <ul>
          <li><strong>Full Name:</strong> ${fullName}</li>
          <li><strong>Company Name:</strong> ${companyName}</li>
          <li><strong>Address:</strong> ${address}</li>
          <li><strong>Mobile Number:</strong> ${mobileNumber}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Purpose:</strong> ${purpose}</li>
        </ul>

        <h3>Download Information:</h3>
        <p><strong>Download URL:</strong> ${req.protocol}://${req.get('host')}/api/drivers/${driverId}/download</p>
        <p><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>
        
        <p>Please process this request and contact the customer if needed.</p>
        
        <p>Best regards,<br>Zebra Printers India System</p>
      `;

      // Email options using Gmail
      const mailOptions = {
        from: '"Zebra Printers India" <gm@indianbarcode.com>',
        to: 'gm@indianbarcode.com',
        replyTo: email,
        subject: 'Notification From Indian Barcode Admin Panel',
        text: `
Dear Sir,

New Driver Download Request Received from Zebra Printers India Website.

Driver Details:
- Driver Name: ${driver.name}
- Version: ${driver.version}
- Category: ${driver.category}
- Operating System: ${driver.operating_system}

Customer Details:
- Full Name: ${fullName}
- Company Name: ${companyName}
- Address: ${address}
- Mobile Number: ${mobileNumber}
- Email: ${email}
- Purpose: ${purpose}

Download Information:
- Download URL: ${req.protocol}://${req.get('host')}/api/drivers/${driverId}/download
- Request Time: ${new Date().toLocaleString()}

Please process this request and contact the customer if needed.

Best regards,
Zebra Printers India System
        `,
        html: emailContent,
        attachments: receiptFile ? [{
          filename: receiptFile.originalname,
          path: receiptFile.path
        }] : []
      };

      // Enhanced email sending with retry logic
      const sendEmailWithRetry = async (mailOptions, retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            console.log(`📧 Sending email (attempt ${attempt}/${retries})...`);
            const info = await emailTransporter.sendMail(mailOptions);
            console.log('✅ Download request email sent successfully!');
            console.log('📧 Message ID:', info.messageId);
            console.log('📬 Response:', info.response);
            return info;
          } catch (emailError) {
            console.error(`❌ Email attempt ${attempt} failed:`, emailError.message);
            if (attempt === retries) {
              throw emailError;
            }
            console.log(`⏳ Waiting 2 seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      };

      // Log form data to file as backup
      const formDataLog = {
        timestamp: new Date().toLocaleString(),
        driverId,
        driverName: driver.name,
        fullName,
        companyName,
        address,
        mobileNumber,
        purpose,
        email,
        receiptFile: receiptFile ? {
          originalname: receiptFile.originalname,
          filename: receiptFile.filename,
          size: receiptFile.size
        } : null
      };
      
      // Write to log file
      const logEntry = `\n=== FORM SUBMISSION - ${new Date().toLocaleString()} ===\n${JSON.stringify(formDataLog, null, 2)}\n`;
      fs.appendFileSync('form_submissions.log', logEntry);
      console.log('📝 Form data logged to form_submissions.log');
      
      // Also create a simple readable file
      const simpleLogEntry = `
========================================
FORM SUBMISSION - ${new Date().toLocaleString()}
========================================
Driver ID: ${driverId}
Driver Name: ${driver.name}
Full Name: ${fullName}
Company Name: ${companyName}
Address: ${address}
Mobile Number: ${mobileNumber}
Email: ${email}
Purpose: ${purpose}
Receipt File: ${receiptFile ? receiptFile.originalname : 'None'}
========================================

`;
      fs.appendFileSync('form_data_simple.txt', simpleLogEntry);
      console.log('📝 Form data also saved to form_data_simple.txt');

      try {
        // Send email with retry logic
        await sendEmailWithRetry(mailOptions);

        // Send confirmation email to customer
        const customerMailOptions = {
          from: '"Zebra Printers India" <gm@indianbarcode.com>',
          to: email,
          subject: `✅ Download Confirmation - ${driver.name}`,
          html: `
            <h2>Download Request Confirmed</h2>
            <p>Dear ${fullName},</p>
            <p>Thank you for your download request for <strong>${driver.name}</strong>.</p>
            <p>Your request has been processed and you can now download the driver.</p>
            <p>If you have any questions, please contact us at gm@indianbarcode.com</p>
            <p>Best regards,<br>Zebra Printers India Team</p>
          `,
          headers: {
            'X-Mailer': 'Zebra Printers India System'
          }
        };

        await sendEmailWithRetry(customerMailOptions);
        console.log('✅ Confirmation email sent to customer');

        res.json({ 
          success: true, 
          message: 'Download request submitted successfully',
          downloadUrl: `/api/drivers/${driverId}/download`
        });

      } catch (emailError) {
        console.error('Email error details:', {
          message: emailError.message,
          code: emailError.code,
          response: emailError.response,
          command: emailError.command
        });
        
        // Still allow download even if email fails
        res.json({ 
          success: true, 
          message: 'Download request submitted successfully! Check your email for confirmation.',
          downloadUrl: `/api/drivers/${driverId}/download`,
          emailNote: 'Email notification failed - please check server logs'
        });
      }
    });

  } catch (error) {
    console.error('Error processing download request:', error);
    res.status(500).json({ error: 'Failed to process download request' });
  }
});

// Download driver file endpoint
app.get('/api/drivers/:id/download', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM drivers WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to get driver details' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const driver = results[0];
    const filePath = path.join(__dirname, 'uploads', 'drivers', driver.file_name);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Driver file not found' });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${driver.file_name}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
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
  
  // Handle multer errors specifically
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large', 
      message: 'File size exceeds the maximum limit of 1GB',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: 'Unexpected file field', 
      message: 'Unexpected file field in upload',
      details: error.message,
      timestamp: new Date().toISOString()
    });
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
            location: 'New Delhi, India',
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
            id: 18,
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
            country_code: 'IN'
          },
          seo: {
            title: `Zebra Barcode Printers in New Delhi, Delhi | Zebra Printers India`,
            description: `Leading supplier of Zebra barcode printers, scanners, and mobile computers in New Delhi, Delhi. Get expert support and service for all your barcode printing needs.`,
            keywords: `Zebra barcode printers New Delhi, barcode scanners Delhi, mobile computers New Delhi, label printers India, RFID solutions New Delhi, Zebra printer service New Delhi`,
            h1: `Zebra Barcode Printers in New Delhi, Delhi`,
            h2: `Professional Barcode Solutions for New Delhi Businesses`,
            structured_data: {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Zebra Printers India - New Delhi",
              "description": "Leading supplier of Zebra barcode printers and solutions in New Delhi, Delhi",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "New Delhi",
                "addressRegion": "Delhi",
                "addressCountry": "India"
              },
              "areaServed": {
                "@type": "City",
                "name": "New Delhi"
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
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
            country_code: 'IN'
          },
          seo: {
            title: `Zebra Barcode Printers in New Delhi, Delhi | Zebra Printers India`,
            description: `Leading supplier of Zebra barcode printers, scanners, and mobile computers in New Delhi, Delhi. Get expert support and service for all your barcode printing needs.`,
            keywords: `Zebra barcode printers New Delhi, barcode scanners Delhi, mobile computers New Delhi, label printers India, RFID solutions New Delhi, Zebra printer service New Delhi`,
            h1: `Zebra Barcode Printers in New Delhi, Delhi`,
            h2: `Professional Barcode Solutions for New Delhi Businesses`,
            structured_data: {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Zebra Printers India - New Delhi",
              "description": "Leading supplier of Zebra barcode printers and solutions in New Delhi, Delhi",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "New Delhi",
                "addressRegion": "Delhi",
                "addressCountry": "India"
              },
              "areaServed": {
                "@type": "City",
                "name": "New Delhi"
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
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
            country_code: 'IN'
          },
          content: {
            banner_title: `Zebra Barcode Solutions in New Delhi`,
            banner_subtitle: `Serving ${locationId === '859' ? 'New Delhi' : 'your city'} with premium barcode printing technology`,
            hero_title: `Professional Barcode Printers in New Delhi, Delhi`,
            hero_subtitle: `Transform your business operations with our cutting-edge Zebra barcode printing solutions designed for New Delhi's dynamic business environment.`,
            services_title: `Our Services in New Delhi`,
            services_subtitle: `Comprehensive barcode solutions tailored for New Delhi businesses`,
            contact_title: `Get in Touch - New Delhi Office`,
            contact_subtitle: `Ready to upgrade your barcode printing system? Contact our New Delhi team today.`,
            testimonials_title: `What New Delhi Businesses Say`,
            testimonials_subtitle: `Hear from satisfied customers across New Delhi and Delhi`
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

// ==================== DYNAMIC SCHEMA API ====================
// Test endpoint to verify API is working
app.get('/api/schema/test', (req, res) => {
  res.json({ 
    message: 'Dynamic Schema API is working!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Get latest content for dynamic schema generation
app.get('/api/schema/latest-content', (req, res) => {
  console.log('📡 Schema API called: /api/schema/latest-content');
  const { limit = 5 } = req.query;
  const limitNum = parseInt(limit);
  
  console.log('📊 Fetching latest content with limit:', limitNum);

  // Fetch latest blogs
  const blogsQuery = `
    SELECT id, title, slug, excerpt, featured_image, author, category, tags, created_at, updated_at
    FROM blogs 
    WHERE status = 'published' 
    ORDER BY created_at DESC 
    LIMIT ?
  `;

  // Fetch latest jobs
  const jobsQuery = `
    SELECT id, title, slug, company, location, job_type, experience_level, salary_range, description, created_at, updated_at
    FROM jobs 
    WHERE status = 'active' 
    ORDER BY created_at DESC 
    LIMIT ?
  `;

  // Fetch latest products
  const productsQuery = `
    SELECT id, name, slug, description, image, category, price, sku, model_number, created_at, updated_at
    FROM products 
    WHERE status = 'active' 
    ORDER BY created_at DESC 
    LIMIT ?
  `;

  // Check if database is available
  if (!db) {
    console.log('⚠️ Database not available, returning sample data');
    const sampleData = {
      blogs: [
        {
          id: 1,
          title: "The Future of Barcode Technology in 2024",
          slug: "future-barcode-technology-2024",
          excerpt: "Explore the latest trends and innovations in barcode technology",
          featured_image: "/api/placeholder/800/400",
          author: "John Smith",
          category: "Technology",
          tags: ["barcode", "technology", "innovation"],
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        }
      ],
      jobs: [
        {
          id: 1,
          title: "Senior Barcode Solutions Engineer",
          slug: "senior-barcode-solutions-engineer",
          company: "Zebra Printers India",
          location: "New Delhi",
          job_type: "full-time",
          experience_level: "senior",
          salary_range: "₹8,00,000 - ₹12,00,000",
          description: "Lead technical solutions for barcode technology implementations",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        }
      ],
      products: [
        {
          id: 1,
          name: "Zebra ZT411 Industrial Printer",
          slug: "zebra-zt411-industrial-printer",
          description: "High-performance industrial barcode printer for demanding environments",
          image: "/api/placeholder/400/400",
          category: "Industrial Printers",
          price: "Contact for Price",
          sku: "ZT411-203-000",
          model_number: "ZT411",
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        }
      ],
      generated_at: new Date().toISOString()
    };
    return res.json(sampleData);
  }

  // Execute all queries in parallel
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(blogsQuery, [limitNum], (err, results) => {
        if (err) {
          console.error('Blogs query error:', err);
          resolve([]); // Return empty array on error
        } else {
          resolve(results);
        }
      });
    }),
    new Promise((resolve, reject) => {
      db.query(jobsQuery, [limitNum], (err, results) => {
        if (err) {
          console.error('Jobs query error:', err);
          resolve([]); // Return empty array on error
        } else {
          resolve(results);
        }
      });
    }),
    new Promise((resolve, reject) => {
      db.query(productsQuery, [limitNum], (err, results) => {
        if (err) {
          console.error('Products query error:', err);
          resolve([]); // Return empty array on error
        } else {
          resolve(results);
        }
      });
    })
  ]).then(([blogs, jobs, products]) => {
    console.log('✅ Successfully fetched content:', { blogs: blogs.length, jobs: jobs.length, products: products.length });
    res.json({
      blogs,
      jobs,
      products,
      generated_at: new Date().toISOString()
    });
  }).catch(error => {
    console.error('Error fetching latest content:', error);
    res.status(500).json({ error: 'Failed to fetch latest content' });
  });
});

// Get schema data for specific content type
app.get('/api/schema/:contentType', (req, res) => {
  const { contentType } = req.params;
  const { id, slug, limit = 10 } = req.query;

  let query, params;

  switch (contentType) {
    case 'blog':
      if (id) {
        query = 'SELECT * FROM blogs WHERE id = ?';
        params = [id];
      } else if (slug) {
        query = 'SELECT * FROM blogs WHERE slug = ?';
        params = [slug];
      } else {
        query = 'SELECT * FROM blogs WHERE status = "published" ORDER BY created_at DESC LIMIT ?';
        params = [parseInt(limit)];
      }
      break;
    
    case 'job':
      if (id) {
        query = 'SELECT * FROM jobs WHERE id = ?';
        params = [id];
      } else if (slug) {
        query = 'SELECT * FROM jobs WHERE slug = ?';
        params = [slug];
      } else {
        query = 'SELECT * FROM jobs WHERE status = "active" ORDER BY created_at DESC LIMIT ?';
        params = [parseInt(limit)];
      }
      break;
    
    case 'product':
      if (id) {
        query = 'SELECT * FROM products WHERE id = ?';
        params = [id];
      } else if (slug) {
        query = 'SELECT * FROM products WHERE slug = ?';
        params = [slug];
      } else {
        query = 'SELECT * FROM products WHERE status = "active" ORDER BY created_at DESC LIMIT ?';
        params = [parseInt(limit)];
      }
      break;
    
    default:
      return res.status(400).json({ error: 'Invalid content type. Use: blog, job, or product' });
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(`${contentType} query error:`, err);
      res.status(500).json({ error: `Failed to fetch ${contentType} data` });
    } else {
      res.json({
        contentType,
        data: results,
        count: results.length,
        generated_at: new Date().toISOString()
      });
    }
  });
});

// Get breadcrumb data for navigation
app.get('/api/schema/breadcrumbs/:path', (req, res) => {
  const { path: urlPath } = req.params;
  
  // Parse the URL path to generate breadcrumbs
  const pathSegments = urlPath.split('/').filter(segment => segment);
  const breadcrumbs = [
    { name: 'Home', url: 'https://zebraprintersindia.com' }
  ];

  let currentPath = 'https://zebraprintersindia.com';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Map segments to readable names
    let name = segment;
    switch (segment) {
      case 'products':
        name = 'Products';
        break;
      case 'blogs':
        name = 'Blogs';
        break;
      case 'jobs':
        name = 'Careers';
        break;
      case 'about':
        name = 'About Us';
        break;
      case 'contact':
        name = 'Contact';
        break;
      case 'service':
        name = 'Service & Support';
        break;
      default:
        // Try to get name from database if it's a slug
        name = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    breadcrumbs.push({ name, url: currentPath });
  });

  res.json({
    breadcrumbs,
    generated_at: new Date().toISOString()
  });
});

// Get FAQ data for schema
app.get('/api/schema/faqs', (req, res) => {
  const { category, limit = 10 } = req.query;
  
  let query = 'SELECT * FROM faqs WHERE status = "active"';
  let params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY sort_order ASC, created_at DESC LIMIT ?';
  params.push(parseInt(limit));

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('FAQ query error:', err);
      res.status(500).json({ error: 'Failed to fetch FAQ data' });
    } else {
      res.json({
        faqs: results,
        count: results.length,
        generated_at: new Date().toISOString()
      });
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
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 5, state_name: 'Delhi', city_id: 9, city_name: 'New Delhi' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 5, state_name: 'Delhi', city_id: 10, city_name: 'Pune' },
          { country_id: 101, country_name: 'India', country_code: 'IN', state_id: 5, state_name: 'Delhi', city_id: 11, city_name: 'Nagpur' },
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
            { id: 2, name: 'Delhi', country_id: 1, country: 'India' },
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
          { id: 1, state: 'Delhi', city: 'New Delhi' },
          { id: 2, state: 'Delhi', city: 'Pune' },
          { id: 3, state: 'Delhi', city: 'Nagpur' },
          { id: 4, state: 'Delhi', city: 'Nashik' },
          { id: 5, state: 'Delhi', city: 'Aurangabad' }
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
          2: [ // Delhi
            { id: 2, name: 'New Delhi', state_id: 2, state: 'Delhi', country: 'India' },
            { id: 3, name: 'Pune', state_id: 2, state: 'Delhi', country: 'India' }
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
          { id: 2, name: 'New Delhi', state: 'Delhi', country: 'India', type: 'city' },
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

// Sitemap generation route
app.get('/generate-sitemap', async (req, res) => {
  try {
    console.log('🔄 Manual sitemap generation requested...');
    const generator = new SitemapGenerator();
    
    await generator.generateSitemaps();
    generator.closeConnection();
    
    res.json({ 
      success: true, 
      message: 'Sitemap generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate sitemap',
      message: error.message 
    });
  }
});

// Serve main sitemap.xml (single consolidated sitemap)
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  
  if (fs.existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml');
    res.sendFile(sitemapPath);
  } else {
    res.status(404).json({ error: 'Sitemap file not found' });
  }
});

// Serve sitemap index (only if multiple sitemaps exist)
app.get('/sitemap-index.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, 'public', 'sitemap-index.xml');
  
  if (fs.existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml');
    res.sendFile(sitemapPath);
  } else {
    res.status(404).json({ error: 'Sitemap index not found' });
  }
});

// Serve individual sitemap files (only if multiple sitemaps exist)
app.get('/sitemaps/:filename', (req, res) => {
  const { filename } = req.params;
  
  // Validate filename to prevent directory traversal
  if (!filename.match(/^sitemap(-[0-9]+)?\.xml$/)) {
    return res.status(400).json({ error: 'Invalid sitemap filename' });
  }
  
  const sitemapPath = path.join(__dirname, 'public', 'sitemaps', filename);
  
  if (fs.existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml');
    res.sendFile(sitemapPath);
  } else {
    res.status(404).json({ error: 'Sitemap file not found' });
  }
});

// Serve React app for all other routes (catch-all) - MUST BE LAST
// But exclude API routes
app.use((req, res) => {
  // Don't serve React app for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving React app:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Placeholder image endpoint
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const w = parseInt(width) || 400;
  const h = parseInt(height) || 300;
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
        ${w} × ${h}
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.send(svg);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Setup cron job for automatic sitemap generation (every night at 2 AM)
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🕐 Running scheduled sitemap generation...');
      const generator = new SitemapGenerator();
      await generator.generateSitemaps();
      generator.closeConnection();
      console.log('✅ Scheduled sitemap generation completed');
    } catch (error) {
      console.error('❌ Scheduled sitemap generation failed:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
  
  console.log('⏰ Sitemap generation scheduled for 2:00 AM daily');
});
/ /   F o r c e   r e b u i l d   -   1 0 / 0 4 / 2 0 2 5   1 3 : 4 9 : 1 5  
 