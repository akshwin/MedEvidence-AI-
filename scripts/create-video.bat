@echo off
echo ========================================
echo  MedEvidence AI - Demo Video Creator
echo ========================================
echo.

echo [1/3] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found!

echo.
echo [2/3] Changing to scripts directory...
cd /d "%~dp0"
if errorlevel 1 (
    echo ERROR: Could not change to scripts directory!
    pause
    exit /b 1
)

echo [2/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed!

echo.
echo [3/3] Starting video creation...
echo.
echo IMPORTANT: Make sure your app is running!
echo   - Backend: http://localhost:8000
echo   - Frontend: http://localhost:3000
echo.
pause

node create-demo-video.js

if errorlevel 1 (
    echo.
    echo ERROR: Video creation failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Video created successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Review the video at: public\videos\demo-video.mp4
echo 2. Upload to YouTube
echo 3. Update frontend\app\page.tsx with video ID
echo.
pause

