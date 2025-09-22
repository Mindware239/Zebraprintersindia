@echo off
echo Creating CapRover deployment TAR file...

REM Create a temporary directory for deployment
if exist "deployment-temp" rmdir /s /q "deployment-temp"
mkdir "deployment-temp"

REM Copy necessary files for deployment
echo Copying files...

REM Copy package.json
copy "package.json" "deployment-temp\"

REM Copy server.js
copy "server.js" "deployment-temp\"

REM Copy captain-definition
copy "captain-definition" "deployment-temp\"

REM Copy process.env
copy "process.env" "deployment-temp\"

REM Copy .env
copy ".env" "deployment-temp\"

REM Copy database setup files
copy "database_setup.sql" "deployment-temp\"
copy "setup_database_caprover.js" "deployment-temp\"

REM Copy src directory
xcopy "src" "deployment-temp\src\" /e /i

REM Copy public directory
xcopy "public" "deployment-temp\public\" /e /i

REM Copy other necessary files
copy "vite.config.js" "deployment-temp\"
copy "tailwind.config.js" "deployment-temp\"
copy "postcss.config.js" "deployment-temp\"
copy "eslint.config.js" "deployment-temp\"

REM Create the TAR file using PowerShell
echo Creating TAR file...
powershell -Command "Compress-Archive -Path 'deployment-temp\*' -DestinationPath 'zebraprintersindia-deployment.tar' -Force"

REM Clean up temporary directory
rmdir /s /q "deployment-temp"

echo.
echo ✅ Deployment TAR file created: zebraprintersindia-deployment.tar
echo.
echo Next steps:
echo 1. Go to CapRover dashboard
echo 2. Navigate to your app: zebraprintersindia
echo 3. Scroll down to "Method 2: Tarball"
echo 4. Click "Upload & Deploy" button
echo 5. Select the zebraprintersindia-deployment.tar file
echo 6. Wait for deployment to complete
echo.
pause
