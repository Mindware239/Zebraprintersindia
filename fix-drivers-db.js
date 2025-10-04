const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDriversTable() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'zebra_db',
      charset: 'utf8mb4'
    });

    console.log('✅ Connected to database');

    // Check if drivers table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "drivers"');
    
    if (tables.length === 0) {
      console.log('❌ Drivers table does not exist. Creating it...');
      
      // Create the drivers table
      const createTableQuery = `
        CREATE TABLE drivers (
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
      
      await connection.execute(createTableQuery);
      console.log('✅ Drivers table created successfully');
    } else {
      console.log('✅ Drivers table exists. Checking structure...');
      
      // Get current table structure
      const [columns] = await connection.execute('DESCRIBE drivers');
      console.log('Current columns:', columns.map(col => col.Field));
      
      // Add missing columns
      const requiredColumns = [
        { name: 'file_path', type: 'VARCHAR(500)' },
        { name: 'file_name', type: 'VARCHAR(255)' },
        { name: 'file_size', type: 'BIGINT' },
        { name: 'download_url', type: 'VARCHAR(500)' },
        { name: 'release_date', type: 'DATE' },
        { name: 'status', type: "ENUM('active', 'inactive') DEFAULT 'active'" },
        { name: 'compatibility', type: 'TEXT' },
        { name: 'category', type: "ENUM('printer', 'scanner', 'mobile', 'utility') NOT NULL DEFAULT 'printer'" },
        { name: 'operating_system', type: "ENUM('windows', 'macos', 'linux', 'android', 'ios') NOT NULL DEFAULT 'windows'" }
      ];
      
      const existingColumns = columns.map(col => col.Field);
      
      for (const column of requiredColumns) {
        if (!existingColumns.includes(column.name)) {
          console.log(`➕ Adding missing column: ${column.name}`);
          try {
            await connection.execute(`ALTER TABLE drivers ADD COLUMN ${column.name} ${column.type}`);
            console.log(`✅ Added column: ${column.name}`);
          } catch (error) {
            console.log(`⚠️  Error adding column ${column.name}:`, error.message);
          }
        } else {
          console.log(`✅ Column ${column.name} already exists`);
        }
      }
    }
    
    // Show final table structure
    console.log('\n📋 Final drivers table structure:');
    const [finalColumns] = await connection.execute('DESCRIBE drivers');
    finalColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    console.log('\n🎉 Database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing drivers table:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the fix
fixDriversTable();
