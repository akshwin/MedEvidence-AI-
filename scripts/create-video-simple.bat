@echo off
echo ========================================
echo  MedEvidence AI - Video Creation
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [2/3] Checking servers...
echo Frontend (port 3000): 
netstat -an | findstr ":3000" >nul
if errorlevel 1 (
    echo   WARNING: Frontend may not be running!
) else (
    echo   OK: Frontend is running
)

echo Backend (port 8000):
netstat -an | findstr ":8000" >nul
if errorlevel 1 (
    echo   WARNING: Backend may not be running!
) else (
    echo   OK: Backend is running
)

echo.
echo [3/3] Creating video...
echo.
echo IMPORTANT: Make sure both servers are running!
echo   - Frontend: http://localhost:3000
echo   - Backend: http://localhost:8000
echo.
echo This will take 3-5 minutes. A browser window will open.
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
echo Video location: ..\public\videos\demo-video.mp4
echo.
pause





