@echo off
echo ========================================
echo  MedEvidence AI - Complete MVP Demo Video
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
echo [3/3] Starting complete MVP video creation...
echo.
echo IMPORTANT: Make sure your app is running!
echo   - Backend: http://localhost:8000
echo   - Frontend: http://localhost:3000
echo.
echo This will create a comprehensive demo showing:
echo   - Homepage (all sections)
echo   - Pricing page (all plans)
echo   - Research page (both features)
echo   - PDF downloads
echo   - Theme toggle
echo.
pause

node create-demo-video-complete.js

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
echo Video location: public\videos\demo-video.mp4
echo.
echo The video is now ready and will be displayed on the homepage!
echo.
pause







