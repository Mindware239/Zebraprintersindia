import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getConnection } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use centralized database connection
const db = getConnection();

// Function to setup database
export async function setupDatabase() {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.log('⚠️  Database connection not available, skipping setup');
      resolve();
      return;
    }
    
    console.log('🔧 Setting up database...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'database_setup.sql');
    
    if (!fs.existsSync(sqlFile)) {
      console.log('⚠️  Database setup file not found, skipping setup');
      resolve();
      return;
    }
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    db.query(sqlContent, (err, results) => {
      if (err) {
        console.error('❌ Database setup failed:', err.message);
        // If database connection fails, just continue without setup
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
          console.log('⚠️  Database not available, continuing without setup...');
          resolve();
        } else {
          console.log('⚠️  Continuing without database setup...');
          resolve();
        }
      } else {
        console.log('✅ Database setup completed successfully');
        resolve();
      }
    });
  });
}

// Function to check if database is ready
export async function checkDatabaseConnection() {
  return new Promise((resolve) => {
    if (!db) {
      console.log('⚠️  Database connection not available, using fallback data');
      resolve(false);
      return;
    }
    
    db.query('SELECT 1 as test', (err) => {
      if (err) {
        console.error('❌ Database connection check failed:', err.message);
        // If database is not available, return false but don't crash
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
          console.log('⚠️  Database not available, using fallback data');
        }
        resolve(false);
      } else {
        console.log('✅ Database connection check passed');
        resolve(true);
      }
    });
  });
}

export default db;
