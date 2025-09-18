# 🚀 CyberPanel Deployment Guide

## 📋 **Step-by-Step Instructions**

### **Step 1: Access CyberPanel**
- **URL**: https://72.60.96.179:8090/base/
- **Login** with your credentials
- **Accept SSL certificate** if prompted

### **Step 2: Create Website**
1. **Navigate to**: `Websites` → `List Websites`
2. **Click**: `Create Website`
3. **Fill in**:
   - **Domain**: `yourdomain.com` (replace with your actual domain)
   - **Email**: Your email address
   - **Package**: Select appropriate package
   - **PHP Version**: 8.1 or 8.2
   - **SSL**: ✅ Enable SSL
   - **Create**: Click Create Website

### **Step 3: Set Up Node.js Application**
1. **Navigate to**: `Node.js` → `Create Node.js App`
2. **Fill in**:
   - **App Name**: `zebra-website`
   - **Domain**: Select your created domain
   - **Port**: `3000`
   - **Node.js Version**: `18.x` or `20.x`
   - **Startup File**: `server.js`
   - **Create**: Click Create App

### **Step 4: Create MySQL Database**
1. **Navigate to**: `Databases` → `MySQL Databases`
2. **Create Database**:
   - **Database Name**: `zebra_db`
   - **Username**: `zebra_user`
   - **Password**: Create a strong password (save this!)
   - **Host**: `localhost`
   - **Create**: Click Create Database

### **Step 5: Upload Files**
1. **Navigate to**: `File Manager`
2. **Go to**: `/home/yourusername/public_html/`
3. **Upload**: `cyberpanel-deployment.zip`
4. **Extract**: Right-click → Extract Here
5. **Delete**: Remove the zip file after extraction

### **Step 6: Import Database**
1. **Navigate to**: `Databases` → `phpMyAdmin`
2. **Select**: `zebra_db` database
3. **Click**: `Import` tab
4. **Choose File**: Select `database_setup.sql`
5. **Click**: `Go` to import

### **Step 7: Configure Environment Variables**
1. **Navigate to**: `Node.js` → `Your App` → `Environment Variables`
2. **Add Variables**:
   ```
   DB_HOST=localhost
   DB_USER=zebra_user
   DB_PASSWORD=your_database_password
   DB_NAME=zebra_db
   PORT=3000
   NODE_ENV=production
   ```

### **Step 8: Install Dependencies**
1. **Navigate to**: `Node.js` → `Your App` → `Terminal`
2. **Run Commands**:
   ```bash
   cd /home/yourusername/public_html
   npm install --production
   ```

### **Step 9: Create Upload Directories**
1. **In File Manager**, navigate to your domain folder
2. **Create folders**:
   - `uploads/images/`
   - `uploads/pdfs/`
3. **Set permissions**: 755 for both folders

### **Step 10: Start the Application**
1. **Navigate to**: `Node.js` → `Your App`
2. **Click**: `Start` button
3. **Check**: Status should show "Running"

### **Step 11: Configure Domain**
1. **Navigate to**: `Websites` → `List Websites`
2. **Edit** your domain
3. **Set Document Root**: `/home/yourusername/public_html/dist`
4. **Save** changes

### **Step 12: Test Your Website**
1. **Visit**: `https://yourdomain.com`
2. **Check**: Website loads correctly
3. **Test**: Botpress chat widget appears
4. **Test**: Admin panel at `https://yourdomain.com/admin`

## 🔧 **Troubleshooting**

### **If Node.js App Won't Start:**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check environment variables
- Check server.js file exists

### **If Database Connection Fails:**
- Verify database credentials
- Check if MySQL service is running
- Ensure database exists and is accessible

### **If Frontend Not Loading:**
- Check if dist folder is in correct location
- Verify nginx configuration
- Check file permissions

### **If File Upload Not Working:**
- Check uploads directory permissions
- Verify multer configuration
- Ensure directory exists

## 📁 **File Structure After Upload**
```
/home/yourusername/public_html/
├── dist/                    # Frontend build files
├── server.js               # Backend server
├── package.json            # Dependencies
├── database_setup.sql      # Database schema
├── uploads/                # File uploads directory
│   ├── images/
│   └── pdfs/
└── node_modules/           # Installed dependencies
```

## 🎯 **Success Checklist**
- [ ] Website loads at your domain
- [ ] Botpress chat widget appears
- [ ] Database connection working
- [ ] Admin panel accessible
- [ ] File uploads working
- [ ] SSL certificate active
- [ ] Mobile responsiveness verified

## 📞 **Need Help?**
- **CyberPanel Docs**: https://cyberpanel.net/docs
- **Community Forum**: https://cyberpanel.net/community
- **Support**: Available through CyberPanel interface

---

**🎉 Your Zebra Printers website will be live on CyberPanel!**

