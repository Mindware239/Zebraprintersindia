import mysql from 'mysql2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // XAMPP default password is empty
  multipleStatements: true
});

console.log('Setting up zebra_db database...');

// Read SQL file
const sqlFile = fs.readFileSync(path.join(__dirname, 'database_setup.sql'), 'utf8');

// Execute SQL
db.query(sqlFile, (err, results) => {
  if (err) {
    console.error('Error setting up database:', err);
  } else {
    console.log('Database setup completed successfully!');
    console.log('Tables created:');
    console.log('- products');
    console.log('- categories');
    console.log('- admin_users');
    console.log('Sample data inserted.');
  }
  db.end();
});
