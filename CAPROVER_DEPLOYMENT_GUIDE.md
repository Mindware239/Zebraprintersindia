# CapRover TAR File Deployment Guide

## Method 1: Using the Automated Script

### Option A: Windows Batch File
1. Double-click `create-deployment-tar.bat`
2. Wait for the script to complete
3. You'll get a file named `zebraprintersindia-deployment.tar`

### Option B: PowerShell Script
1. Right-click on `create-deployment-tar.ps1`
2. Select "Run with PowerShell"
3. Wait for the script to complete
4. You'll get a file named `zebraprintersindia-deployment.tar`

## Method 2: Manual TAR Creation

### Using 7-Zip (Recommended)
1. Install 7-Zip if you don't have it
2. Select all these files and folders:
   - `package.json`
   - `server.js`
   - `captain-definition`
   - `process.env`
   - `.env`
   - `database_setup.sql`
   - `setup_database_caprover.js`
   - `src/` (entire folder)
   - `public/` (entire folder)
   - `vite.config.js`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `eslint.config.js`
3. Right-click → 7-Zip → "Add to archive..."
4. Set Archive format to "tar"
5. Name it `zebraprintersindia-deployment.tar`

### Using WinRAR
1. Select all the files mentioned above
2. Right-click → "Add to archive..."
3. Set Archive format to "TAR"
4. Name it `zebraprintersindia-deployment.tar`

## Method 3: Command Line (Git Bash or WSL)

```bash
# Create TAR file
tar -czf zebraprintersindia-deployment.tar \
  package.json \
  server.js \
  captain-definition \
  process.env \
  .env \
  database_setup.sql \
  setup_database_caprover.js \
  src/ \
  public/ \
  vite.config.js \
  tailwind.config.js \
  postcss.config.js \
  eslint.config.js
```

## Deployment Steps

1. **Go to CapRover Dashboard**
   - Navigate to `captain.captain.zebraprintersindia.com`
   - Login to your account

2. **Select Your App**
   - Click on "Apps" in the left sidebar
   - Click on "zebraprintersindia" app

3. **Upload TAR File**
   - Scroll down to "Method 2: Tarball"
   - Click "Upload & Deploy" button
   - Select your `zebraprintersindia-deployment.tar` file
   - Wait for upload to complete

4. **Monitor Deployment**
   - Watch the deployment logs
   - Wait for "Deployment completed successfully" message
   - Your app should be available at `zebraprintersindia.com`

## Important Notes

- ✅ The TAR file **MUST** contain `captain-definition` file
- ✅ Make sure all source files are included
- ✅ Environment variables are set in `process.env` and `.env`
- ✅ Database setup will run automatically on first deployment

## Troubleshooting

### If deployment fails:
1. Check the logs in CapRover dashboard
2. Verify all required files are in the TAR
3. Ensure `captain-definition` is present
4. Check environment variables are correct

### If website doesn't load:
1. Check if database connection is working
2. Verify all routes are properly configured
3. Check server logs for errors

## File Structure in TAR

```
zebraprintersindia-deployment.tar
├── package.json
├── server.js
├── captain-definition
├── process.env
├── .env
├── database_setup.sql
├── setup_database_caprover.js
├── src/
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   ├── services/
│   ├── translations/
│   └── ...
├── public/
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

## Quick Test

After deployment, test these URLs:
- `https://zebraprintersindia.com/` - Home page
- `https://zebraprintersindia.com/products` - Products page
- `https://zebraprintersindia.com/jobs` - Jobs page
- `https://zebraprintersindia.com/blogs` - Blogs page
- `https://zebraprintersindia.com/admin` - Admin panel