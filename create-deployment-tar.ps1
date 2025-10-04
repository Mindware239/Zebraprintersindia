# PowerShell script to create CapRover deployment tar file
# This script excludes development files and creates a clean deployment package

Write-Host "🚀 Creating CapRover deployment package..." -ForegroundColor Green

# Create deployment directory
$deploymentDir = "caprover-deployment-$(Get-Date -Format 'yyyyMMdd-HHmm')"
New-Item -ItemType Directory -Path $deploymentDir -Force | Out-Null

Write-Host "📁 Created deployment directory: $deploymentDir" -ForegroundColor Yellow

# Copy essential files
$filesToCopy = @(
    "package.json",
    "package-lock.json", 
    "server.js",
    "database.js",
    "setup_database_caprover.js",
    "sitemap-generator.js",
    "captain-definition",
    "Dockerfile",
    "process.env",
    "src/",
    "public/",
    "uploads/",
    "utils/",
    "dist/"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Write-Host "📄 Copying: $file" -ForegroundColor Cyan
        Copy-Item -Path $file -Destination $deploymentDir -Recurse -Force
    } else {
        Write-Host "⚠️  File not found: $file" -ForegroundColor Red
    }
}

# Create .gitignore for deployment
$gitignoreContent = @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log

# Temporary files
tmp/
temp/
"@

Set-Content -Path "$deploymentDir\.gitignore" -Value $gitignoreContent

# Remove node_modules if it exists
if (Test-Path "$deploymentDir\node_modules") {
    Remove-Item -Path "$deploymentDir\node_modules" -Recurse -Force
    Write-Host "🗑️  Removed node_modules from deployment" -ForegroundColor Yellow
}

# Create tar file
$tarFileName = "$deploymentDir.tar"
Write-Host "📦 Creating tar file: $tarFileName" -ForegroundColor Green

# Use PowerShell's Compress-Archive as alternative to tar
Compress-Archive -Path $deploymentDir -DestinationPath $tarFileName -Force

# Clean up deployment directory
Remove-Item -Path $deploymentDir -Recurse -Force

Write-Host "✅ Deployment package created successfully: $tarFileName" -ForegroundColor Green
Write-Host "📊 Package size: $((Get-Item $tarFileName).Length / 1MB) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Ready for CapRover deployment!" -ForegroundColor Green
Write-Host "1. Upload $tarFileName to CapRover" -ForegroundColor White
Write-Host "2. Set environment variables in CapRover dashboard" -ForegroundColor White
Write-Host "3. Deploy the application" -ForegroundColor White
