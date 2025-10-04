import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config({ path: 'process.env' });

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'zebra_db'
});

console.log('🔍 Checking all tables and their content...\n');

// Get all tables
db.query('SHOW TABLES', (err, tables) => {
  if (err) {
    console.error('❌ Error getting tables:', err.message);
    db.end();
    return;
  }

  const tableNames = tables.map(row => Object.values(row)[0]);
  console.log(`📊 Found ${tableNames.length} tables:`, tableNames.join(', '));
  console.log('');

  let completed = 0;
  const totalTables = tableNames.length;

  tableNames.forEach(tableName => {
    // Get row count for each table
    db.query(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
      if (err) {
        console.log(`❌ ${tableName}: Error - ${err.message}`);
      } else {
        const count = result[0].count;
        console.log(`📋 ${tableName}: ${count} rows`);
        
        // If it has content, show sample data
        if (count > 0 && count <= 1000) {
          db.query(`SELECT * FROM ${tableName} LIMIT 3`, (err, samples) => {
            if (!err && samples.length > 0) {
              console.log(`   Sample data:`, Object.keys(samples[0]).join(', '));
            }
          });
        }
      }
      
      completed++;
      if (completed === totalTables) {
        db.end();
        console.log('\n✅ Database analysis completed!');
      }
    });
  });
});





