import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Database configuration for CapRover deployment
const dbConfig = {
  host: process.env.MYSQL_HOST || 'srv-captain--zebraprintersindia-db',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'Admin123@',
  database: process.env.MYSQL_DATABASE || 'zebra_db',
  charset: 'utf8mb4',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  multipleStatements: true,
  queueLimit: 0
};

// Create connection pool
const db = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Get database connection
export function getConnection() {
  return db;
}

// Execute query with error handling
export async function executeQuery(query, params = []) {
  try {
    const [results] = await db.query(query, params);
    return { success: true, data: results };
  } catch (error) {
    console.error('Database query error:', error.message);
    return { success: false, error: error.message };
  }
}

// Close database connection
export async function closeConnection() {
  try {
    await db.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
}

export default db;
