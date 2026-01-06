@echo off
echo ========================================
echo  Regenerating Demo Video
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking prerequisites...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found

REM Check if FFmpeg is installed
where ffmpeg >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠ WARNING: FFmpeg is not installed!
    echo FFmpeg is required for video encoding.
    echo.
    echo Please install FFmpeg:
    echo   1. Download from: https://ffmpeg.org/download.html
    echo   2. Or use Chocolatey: choco install ffmpeg
    echo   3. Or use winget: winget install ffmpeg
    echo.
    echo The script will continue, but video creation may fail.
    echo.
    pause
) else (
    echo ✓ FFmpeg found
)

echo.
echo [2/4] Removing old video file (if exists)...
if exist "..\public\videos\demo-video.mp4" (
    del /f /q "..\public\videos\demo-video.mp4"
    echo ✓ Old video deleted
) else (
    echo ✓ No old video to delete
)

echo.
echo [3/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [4/4] Checking servers...
echo.
echo IMPORTANT: Make sure both servers are running:
echo   - Frontend: http://localhost:3000
echo   - Backend: http://localhost:8000
echo.
echo If servers are not running, start them now:
echo   Terminal 1: cd frontend ^&^& npm run dev
echo   Terminal 2: cd backend ^&^& uvicorn app.main:app --reload
echo.
pause

echo.
echo ========================================
echo  Starting Video Creation...
echo ========================================
echo.
echo This will take 3-5 minutes.
echo A browser window will open automatically.
echo.
echo Watch the console for detailed progress logs.
echo.

node create-demo-video-complete.js

if errorlevel 1 (
    echo.
    echo ========================================
    echo  ERROR: Video creation failed!
    echo ========================================
    echo.
    echo Please check:
    echo   1. Both servers are running (frontend and backend)
    echo   2. FFmpeg is installed correctly
    echo   3. Check error messages above
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Verifying Video File...
echo ========================================
echo.

node verify-video.js

if errorlevel 1 (
    echo.
    echo ⚠ WARNING: Video file verification failed!
    echo The video may be corrupted.
    echo.
) else (
    echo.
    echo ========================================
    echo  ✓ Video Created Successfully!
    echo ========================================
    echo.
    echo Video location: ..\public\videos\demo-video.mp4
    echo.
    echo Next steps:
    echo   1. Restart your Next.js dev server
    echo   2. Visit http://localhost:3000
    echo   3. Scroll to the Demo Video section
    echo   4. Click play to test the video
    echo.
)

pause





