@echo off
echo ========================================
echo  TMS API Starter for Windows
echo ========================================
echo.

REM Set Database URL
set DATABASE_URL=postgresql://tms:tms@localhost:5432/tms?schema=public

REM Kill any existing process on port 3001
echo Checking for existing process on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing existing process PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Check if PostgreSQL is running
echo Checking PostgreSQL service...
sc query postgresql-x64-16 | findstr RUNNING >nul
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL service is not running!
    echo Please start PostgreSQL service first.
    echo.
    pause
    exit /b 1
)

REM Navigate to API directory
cd /d "%~dp0apps\api"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Check if dist folder exists
if not exist "dist" (
    echo Building API...
    call npm run build 2>nul
    if %errorlevel% neq 0 (
        echo Build failed, but attempting to start anyway...
    )
)

echo.
echo Starting TMS API Server...
echo ========================================
echo Database: postgresql://tms:tms@localhost:5432/tms
echo API URL:  http://localhost:3001
echo Docs:     http://localhost:3001/docs
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the API
node dist/main.js