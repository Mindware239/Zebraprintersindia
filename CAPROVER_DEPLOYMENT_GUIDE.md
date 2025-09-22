# CapRover Deployment Guide for Zebra Printers India

## Prerequisites
1. CapRover server running
2. MySQL service enabled in CapRover
3. Domain configured

## Step 1: Create MySQL Database in CapRover

1. Go to CapRover dashboard
2. Navigate to "Apps" → "One-Click Apps/Databases"
3. Install "MySQL" database
4. Note down the connection details:
   - Host: `srv-captain--mysql-db`
   - User: `root`
   - Password: (generated password)
   - Database: `zebra_db`

## Step 2: Configure Environment Variables

In your CapRover app settings, add these environment variables:

```
MYSQL_HOST=srv-captain--mysql-db
MYSQL_USER=root
MYSQL_PASSWORD=your_generated_mysql_password
MYSQL_DATABASE=zebra_db
PORT=80
NODE_ENV=production
```

## Step 3: Deploy Your Application

1. Connect your GitHub repository to CapRover
2. Set the build command: `npm run build`
3. Set the start command: `node server.js`
4. Deploy the application

## Step 4: Setup Database Tables

After deployment, the application will automatically:
1. Connect to the MySQL database
2. Create necessary tables
3. Insert sample data

## Step 5: Verify Deployment

1. Check the application logs in CapRover
2. Visit your domain to ensure the application is running
3. Test the admin panel at `/admin`

## Troubleshooting

### Database Connection Issues
- Verify MySQL service is running in CapRover
- Check environment variables are correctly set
- Ensure database name matches exactly

### 502 Errors
- Check application logs for errors
- Verify all dependencies are installed
- Ensure port 80 is correctly configured

### File Upload Issues
- Check if uploads directory has proper permissions
- Verify multer configuration

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| MYSQL_HOST | MySQL hostname | srv-captain--mysql-db |
| MYSQL_USER | MySQL username | root |
| MYSQL_PASSWORD | MySQL password | generated_password |
| MYSQL_DATABASE | Database name | zebra_db |
| PORT | Application port | 80 |
| NODE_ENV | Environment | production |

## Support

If you encounter issues:
1. Check CapRover logs
2. Verify all environment variables
3. Ensure MySQL service is running
4. Check database permissions
