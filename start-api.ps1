# TMS API Starter Script for Windows (PowerShell)
# ================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TMS API Starter for Windows" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set Database URL
$env:DATABASE_URL = "postgresql://tms:tms@localhost:5432/tms?schema=public"

# Function to check and kill process on port
function Stop-ProcessOnPort {
    param($Port)
    
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($connection) {
        $pid = $connection.OwningProcess
        Write-Host "Killing existing process on port $Port (PID: $pid)..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force
        Write-Host "Process killed." -ForegroundColor Green
    } else {
        Write-Host "No process listening on port $Port" -ForegroundColor Gray
    }
}

# Kill any existing process on port 3001
Stop-ProcessOnPort -Port 3001

# Check PostgreSQL service
Write-Host "Checking PostgreSQL service..." -ForegroundColor Cyan
$pgService = Get-Service -Name "postgresql-x64-16" -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL service is not running!" -ForegroundColor Red
    Write-Host "Please start PostgreSQL service first." -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Test database connection
Write-Host "Testing database connection..." -ForegroundColor Cyan
$env:PGPASSWORD = 'tms'
$testResult = & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U tms -d tms -t -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database connection successful" -ForegroundColor Green
} else {
    Write-Host "❌ Cannot connect to database!" -ForegroundColor Red
    Write-Host "Error: $testResult" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
# Navigate to API directory
$apiPath = Join-Path $PSScriptRoot "apps\api"
Set-Location $apiPath
Write-Host "Working directory: $apiPath" -ForegroundColor Gray

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if dist folder exists
if (-not (Test-Path "dist")) {
    Write-Host "⚠️ Build folder not found. Attempting to build..." -ForegroundColor Yellow
    npm run build 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build had issues, but attempting to start anyway..." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting TMS API Server" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database: " -NoNewline; Write-Host "postgresql://tms:tms@localhost:5432/tms" -ForegroundColor Yellow
Write-Host "API URL:  " -NoNewline; Write-Host "http://localhost:3001" -ForegroundColor Yellow
Write-Host "Docs:     " -NoNewline; Write-Host "http://localhost:3001/docs" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the API
try {
    node dist/main.js
} catch {
    Write-Host "Error starting API: $_" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}