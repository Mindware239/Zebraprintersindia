# CapRover Tar File Deployment Guide
## Complete Step-by-Step Guide for Zebra Printers India Website

This guide will walk you through deploying your Zebra Printers India website to CapRover using the tar file method, including database setup.

## Prerequisites

✅ **Completed:**
- CapRover server is running
- MySQL service is installed in CapRover
- Your tar file `my-website.tar` is ready
- CapRover dashboard is accessible

## Step 1: Database Setup

### 1.1 Create MySQL Database in CapRover

1. **Go to CapRover Dashboard** → **Apps** → **One-Click Apps/Databases**
2. **Install MySQL**:
   - App Name: `zebraprintersindia-db`
   - Root Password: `Admin123@` (or your preferred password)
   - Click **Install**

3. **Wait for installation** (usually 2-3 minutes)

### 1.2 Import Database Schema

1. **Access phpMyAdmin**:
   - Go to CapRover Dashboard → **Apps** → **zebraprintersindia-db**
   - Click **phpMyAdmin** button
   - Login with: `root` / `Admin123@`

2. **Create Database**:
   - Click **New** in left sidebar
   - Database name: `zebra_db`
   - Collation: `utf8mb4_unicode_ci`
   - Click **Create**

3. **Import SQL File**:
   - Select `zebra_db` database
   - Click **Import** tab
   - Click **Choose File**
   - Upload `database_setup.sql` from your project
   - Click **Go**

4. **Verify Tables**:
   - You should see these tables:
     - `products`
     - `categories`
     - `subcategories`
     - `brands`
     - `drivers`
     - `admin_users`

## Step 2: Environment Variables Setup

### 2.1 Set Environment Variables in CapRover

1. **Go to your app** in CapRover Dashboard
2. **Click "App Configs"** tab
3. **Add these environment variables**:

```bash
MYSQL_HOST=srv-captain--zebraprintersindia-db
MYSQL_USER=root
MYSQL_PASSWORD=Admin123@
MYSQL_DATABASE=zebra_db
PORT=80
NODE_ENV=production
SESSION_SECRET=your_secure_session_secret_here
JWT_SECRET=your_secure_jwt_secret_here
CORS_ORIGIN=https://zebraprintersindia.com
```

**Important:** Change the secret values to secure random strings!

## Step 3: Deploy Application via Tar File

### 3.1 Upload and Deploy

1. **Go to your app** in CapRover Dashboard
2. **Click "Deployment"** tab
3. **Method 2: Tarball** section:
   - Click **"Click or drag TAR file to this area to upload"**
   - Select your `my-website.tar` file
   - Wait for upload to complete
   - Click **"Upload & Deploy"**

### 3.2 Monitor Deployment

1. **Watch the deployment logs** in real-time
2. **Look for these success messages**:
   ```
   ✅ Connected to MySQL database: zebra_db
   📊 Database connection established successfully
   🚀 Database is ready for use
   Server is running on port 80
   ```

3. **If you see errors**, check:
   - Environment variables are set correctly
   - MySQL service is running
   - Database exists and has correct tables

## Step 4: Verify Deployment

### 4.1 Test Application

1. **Visit your app URL**: `https://zebraprintersindia.com`
2. **Test these features**:
   - Homepage loads correctly
   - Products page shows data
   - Admin login works (`/admin`)
   - File uploads work
   - Database queries work

### 4.2 Test Database Connection

1. **Visit**: `https://zebraprintersindia.com/api/health`
2. **Expected response**:
   ```json
   {
     "status": "success",
     "message": "Database connected successfully",
     "database": "zebra_db",
     "timestamp": "2024-01-XX..."
   }
   ```

## Step 5: Post-Deployment Configuration

### 5.1 Set Up Custom Domain (if needed)

1. **Go to App Configs** → **HTTP Settings**
2. **Add your domain**: `zebraprintersindia.com`
3. **Enable HTTPS** (recommended)
4. **Update CORS_ORIGIN** environment variable

### 5.2 Configure File Storage

1. **Create persistent volumes** for uploads:
   - Go to **App Configs** → **Volumes**
   - Add volume: `/app/uploads` → `zebraprintersindia-uploads`

2. **This ensures uploaded files persist** across deployments

### 5.3 Set Up Monitoring

1. **Enable app monitoring** in CapRover
2. **Set up log rotation** to prevent disk space issues
3. **Configure backup** for database

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Failed
**Error**: `❌ Database connection failed`

**Solution**:
- Check MySQL service is running
- Verify environment variables
- Ensure database `zebra_db` exists
- Check MySQL credentials

#### 2. File Upload Issues
**Error**: `Cannot create directory 'uploads'`

**Solution**:
- Create persistent volume for uploads
- Check file permissions
- Verify upload path in environment

#### 3. CORS Errors
**Error**: `Access to fetch at '...' has been blocked by CORS policy`

**Solution**:
- Update `CORS_ORIGIN` environment variable
- Add your domain to allowed origins
- Check frontend API calls

#### 4. Build Failures
**Error**: `Build failed` or `npm install` errors

**Solution**:
- Check `package.json` dependencies
- Verify Node.js version compatibility
- Check for missing files in tar

### Debug Commands

1. **Check app logs**:
   ```bash
   # In CapRover dashboard → App Logs
   ```

2. **Check database connection**:
   ```bash
   # Visit: https://yourdomain.com/api/health
   ```

3. **Test specific endpoints**:
   ```bash
   # Products: https://yourdomain.com/api/products
   # Health: https://yourdomain.com/api/health
   ```

## Security Checklist

- [ ] Changed default passwords
- [ ] Set secure session secrets
- [ ] Enabled HTTPS
- [ ] Configured proper CORS origins
- [ ] Set up file upload limits
- [ ] Enabled rate limiting
- [ ] Set up database backups

## Performance Optimization

1. **Enable gzip compression** in CapRover
2. **Set up CDN** for static assets
3. **Configure caching** for API responses
4. **Optimize database queries**
5. **Set up monitoring** and alerts

## Backup Strategy

1. **Database backups**: Set up automated MySQL backups
2. **File backups**: Backup uploads directory
3. **Code backups**: Keep your tar file and source code safe
4. **Environment backups**: Document all environment variables

## Maintenance

### Regular Tasks
- Monitor app performance
- Check disk space usage
- Update dependencies regularly
- Review security logs
- Backup database weekly

### Updates
- To update your app, create a new tar file and redeploy
- Test updates in staging environment first
- Keep database backups before major updates

---

## Quick Reference

### Essential Files in Tar
- ✅ `captain-definition` - CapRover configuration
- ✅ `package.json` - Node.js dependencies
- ✅ `server.js` - Main application file
- ✅ `database_setup.sql` - Database schema
- ✅ `dist/` - Built React application
- ✅ `node_modules/` - Dependencies

### Key Environment Variables
```bash
MYSQL_HOST=srv-captain--zebraprintersindia-db
MYSQL_USER=root
MYSQL_PASSWORD=Admin123@
MYSQL_DATABASE=zebra_db
PORT=80
NODE_ENV=production
```

### Important URLs
- **App**: `https://zebraprintersindia.com`
- **Admin**: `https://zebraprintersindia.com/admin`
- **Health Check**: `https://zebraprintersindia.com/api/health`
- **CapRover Dashboard**: `https://captain.captain.zebraprintersindia.com`

---

**Need Help?** Check the CapRover documentation or contact support if you encounter issues not covered in this guide.
