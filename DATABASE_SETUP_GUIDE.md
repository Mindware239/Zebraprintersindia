# 🗄️ Database Setup Guide for zebra_db

## ✅ Database Configuration Updated

Your project has been updated to use the `zebra_db` database. Here's what was changed:

### Files Updated:
- `server.js` - Updated database name to `zebra_db`
- `setup_database.js` - Updated database name to `zebra_db`
- `database_setup.sql` - Updated database name to `zebra_db`
- Added `test_database.js` - Database connection test script
- Added better error handling and connection management

## 🚀 Quick Setup Steps

### 1. Start XAMPP
- Open XAMPP Control Panel
- Start **Apache** and **MySQL** services
- Make sure both show "Running" status

### 2. Verify Database
- Open phpMyAdmin (http://localhost/phpmyadmin)
- Check if `zebra_db` database exists
- Verify it has the following tables:
  - `products`
  - `categories` 
  - `admin_users`

### 3. Test Database Connection
```bash
npm run test-db
```

This will:
- ✅ Test connection to `zebra_db`
- 📊 Show available tables
- 📦 Display number of products
- 🔍 Verify everything is working

### 4. Start the Application
```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
npm run server    # Backend only
npm run dev       # Frontend only
```

## 🔧 Troubleshooting

### If Database Connection Fails:

1. **Check XAMPP Status**
   - Ensure MySQL service is running
   - Check if port 3306 is available

2. **Verify Database Exists**
   - Open phpMyAdmin
   - Look for `zebra_db` database
   - If missing, create it and import your SQL file

3. **Check Database Import**
   - Make sure all tables were created
   - Verify sample data was inserted

4. **Test Connection**
   ```bash
   npm run test-db
   ```

### Common Issues:

**Error: "Database connection failed"**
- Solution: Start MySQL service in XAMPP

**Error: "Unknown database 'zebra_db'"**
- Solution: Create database in phpMyAdmin and import SQL file

**Error: "Table doesn't exist"**
- Solution: Run the database setup script or import the SQL file

## 📊 Database Health Check

Once the server is running, you can check database health at:
```
http://localhost:5000/api/health
```

This endpoint will return:
```json
{
  "status": "success",
  "message": "Database connected successfully",
  "database": "zebra_db",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🎯 Next Steps

1. **Test the Application**
   - Visit http://localhost:5173 (Frontend)
   - Check http://localhost:5000/api/products (Backend API)

2. **Verify Features**
   - Product listing works
   - Search functionality works
   - Admin panel accessible
   - Database operations successful

3. **Development Ready**
   - Database is fully connected
   - All API endpoints working
   - Frontend-backend communication established

## 📝 Environment Variables (Optional)

For production deployment, create a `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=zebra_db
PORT=5000
```

## 🆘 Need Help?

If you encounter any issues:
1. Run `npm run test-db` to diagnose
2. Check XAMPP MySQL service status
3. Verify database exists in phpMyAdmin
4. Check console logs for specific error messages

---

**✅ Your database is now configured for `zebra_db` and ready to use!**
