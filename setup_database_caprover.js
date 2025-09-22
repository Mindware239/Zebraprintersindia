import mysql from 'mysql2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection for setup
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'srv-captain--zebraprintersindia-db',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'Admin123@',
  database: process.env.MYSQL_DATABASE || 'zebra_db',
  multipleStatements: true
});

// Function to setup database
export async function setupDatabase() {
  return new Promise((resolve, reject) => {
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
        // Don't reject, just log the error and continue
        console.log('⚠️  Continuing without database setup...');
        resolve();
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
    db.query('SELECT 1 as test', (err) => {
      if (err) {
        console.error('❌ Database connection check failed:', err.message);
        resolve(false);
      } else {
        console.log('✅ Database connection check passed');
        resolve(true);
      }
    });
  });
}

export default db;
