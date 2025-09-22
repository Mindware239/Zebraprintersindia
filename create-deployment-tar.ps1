# CapRover Deployment TAR Creator
Write-Host "Creating CapRover deployment TAR file..." -ForegroundColor Green

# Create a temporary directory for deployment
if (Test-Path "deployment-temp") {
    Remove-Item -Recurse -Force "deployment-temp"
}
New-Item -ItemType Directory -Name "deployment-temp" | Out-Null

Write-Host "Copying files..." -ForegroundColor Yellow

# Copy essential files
$filesToCopy = @(
    "package.json",
    "server.js", 
    "captain-definition",
    "process.env",
    ".env",
    "database_setup.sql",
    "setup_database_caprover.js",
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "eslint.config.js"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file "deployment-temp\"
        Write-Host "✓ Copied $file" -ForegroundColor Green
    } else {
        Write-Host "⚠ File not found: $file" -ForegroundColor Yellow
    }
}

# Copy directories
$directoriesToCopy = @("src", "public")

foreach ($dir in $directoriesToCopy) {
    if (Test-Path $dir) {
        Copy-Item -Recurse $dir "deployment-temp\"
        Write-Host "✓ Copied directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "⚠ Directory not found: $dir" -ForegroundColor Yellow
    }
}

# Create the TAR file
Write-Host "Creating TAR file..." -ForegroundColor Yellow
Compress-Archive -Path "deployment-temp\*" -DestinationPath "zebraprintersindia-deployment.tar" -Force

# Clean up temporary directory
Remove-Item -Recurse -Force "deployment-temp"

Write-Host ""
Write-Host "✅ Deployment TAR file created: zebraprintersindia-deployment.tar" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to CapRover dashboard" -ForegroundColor White
Write-Host "2. Navigate to your app: zebraprintersindia" -ForegroundColor White
Write-Host "3. Scroll down to 'Method 2: Tarball'" -ForegroundColor White
Write-Host "4. Click 'Upload & Deploy' button" -ForegroundColor White
Write-Host "5. Select the zebraprintersindia-deployment.tar file" -ForegroundColor White
Write-Host "6. Wait for deployment to complete" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
