# 🚀 Hostinger CyberPanel Deployment Guide

## 📋 **Step-by-Step Deployment Process**

### **Phase 1: CyberPanel Setup**

#### **1. Access CyberPanel**
- Login to your Hostinger account
- Go to **hPanel** → **CyberPanel**
- Access your domain's CyberPanel

#### **2. Enable Node.js Support**
- Go to **Node.js** in CyberPanel
- Click **Create Node.js App**
- **App Name**: `zebra-website`
- **Domain**: Your domain name
- **Port**: `3000` (or any available port)
- **Node.js Version**: `18.x` or `20.x`

### **Phase 2: Database Setup**

#### **1. Create MySQL Database**
- Go to **Databases** → **MySQL Databases**
- **Database Name**: `zebra_db`
- **Username**: `zebra_user`
- **Password**: Create a strong password
- **Host**: `localhost` (or provided by Hostinger)

#### **2. Import Database Schema**
- Go to **phpMyAdmin**
- Select your `zebra_db` database
- Import the `database_setup.sql` file
- Verify tables are created: `products`, `categories`, `subcategories`, `brands`

### **Phase 3: File Upload**

#### **1. Upload Project Files**
- Use **File Manager** in CyberPanel
- Navigate to your domain's **public_html** folder
- Upload all project files (except `node_modules`)

#### **2. File Structure on Server**
```
public_html/
├── dist/                    # Frontend build files
├── server.js               # Backend server
├── package.json            # Dependencies
├── uploads/                # File uploads directory
│   ├── images/
│   └── pdfs/
└── database_setup.sql      # Database schema
```

### **Phase 4: Environment Configuration**

#### **1. Create .env File**
Create `.env` file in your project root:
```env
DB_HOST=localhost
DB_USER=zebra_user
DB_PASSWORD=your_database_password
DB_NAME=zebra_db
PORT=3000
NODE_ENV=production
```

#### **2. Set Environment Variables in CyberPanel**
- Go to **Node.js** → **Your App** → **Environment Variables**
- Add all variables from your `.env` file

### **Phase 5: Install Dependencies & Start**

#### **1. Install Node.js Dependencies**
In CyberPanel Terminal or SSH:
```bash
cd /home/yourusername/public_html
npm install --production
```

#### **2. Create Upload Directories**
```bash
mkdir -p uploads/images
mkdir -p uploads/pdfs
chmod 755 uploads/images
chmod 755 uploads/pdfs
```

#### **3. Start the Application**
- In CyberPanel Node.js section
- Click **Start** for your Node.js app
- Or use PM2 for process management

### **Phase 6: Domain Configuration**

#### **1. Point Domain to Node.js App**
- Go to **Websites** → **List Websites**
- Edit your domain
- **Document Root**: `/home/yourusername/public_html/dist`
- **Node.js App**: Select your created app

#### **2. SSL Certificate**
- Go to **SSL** → **Let's Encrypt**
- Enable SSL for your domain
- Force HTTPS redirect

### **Phase 7: Testing & Verification**

#### **1. Test Frontend**
- Visit: `https://yourdomain.com`
- Check if React app loads
- Verify Botpress chat widget appears

#### **2. Test Backend API**
- Visit: `https://yourdomain.com/api/health`
- Should return database status
- Test: `https://yourdomain.com/api/products`

#### **3. Test Admin Panel**
- Visit: `https://yourdomain.com/admin`
- Login with admin credentials
- Test product management features

## 🔧 **CyberPanel Specific Settings**

### **Node.js App Configuration**
```json
{
  "name": "zebra-website",
  "script": "server.js",
  "instances": 1,
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000
  }
}
```

### **Nginx Configuration** (if needed)
```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 📁 **Files to Upload**

### **Essential Files:**
- ✅ `dist/` folder (entire contents)
- ✅ `server.js`
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `uploads/` folder (create if not exists)
- ✅ `database_setup.sql`

### **Optional Files:**
- `README.md`
- `SETUP_INSTRUCTIONS.md`
- `QUICK_START.md`

## 🚨 **Common Issues & Solutions**

### **Issue 1: Node.js App Won't Start**
**Solution:**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check environment variables

### **Issue 2: Database Connection Failed**
**Solution:**
- Verify database credentials in `.env`
- Check if MySQL service is running
- Ensure database exists and is accessible

### **Issue 3: File Upload Not Working**
**Solution:**
- Check uploads directory permissions
- Verify multer configuration
- Ensure directory exists

### **Issue 4: Frontend Not Loading**
**Solution:**
- Verify dist folder is in correct location
- Check nginx configuration
- Ensure all assets are accessible

## 📊 **Performance Optimization**

### **1. Enable Gzip Compression**
In CyberPanel → **Websites** → **Your Domain** → **Nginx Settings**
- Enable Gzip compression

### **2. Set Up Caching**
- Enable browser caching for static assets
- Configure CDN if available

### **3. Database Optimization**
- Add indexes to frequently queried columns
- Optimize database queries

## 🔒 **Security Checklist**

- ✅ SSL certificate enabled
- ✅ Strong database passwords
- ✅ File upload restrictions
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Input validation implemented

## 📞 **Support Resources**

### **Hostinger Support:**
- Live Chat: Available 24/7
- Knowledge Base: Comprehensive guides
- Community Forum: User discussions

### **CyberPanel Documentation:**
- Official docs: cyberpanel.net/docs
- Community support: cyberpanel.net/community

## 🎯 **Post-Deployment Checklist**

- [ ] Website loads correctly
- [ ] Botpress chat widget appears
- [ ] Database connection working
- [ ] Admin panel accessible
- [ ] File uploads working
- [ ] SSL certificate active
- [ ] Mobile responsiveness verified
- [ ] All API endpoints functional

---

**🎉 Congratulations! Your Zebra Printers website is now live on Hostinger!**

**Next Steps:**
1. Test all functionality
2. Set up monitoring
3. Configure backups
4. Optimize performance
5. Set up analytics

