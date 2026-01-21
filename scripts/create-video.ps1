# MedEvidence AI - Demo Video Creator (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " MedEvidence AI - Demo Video Creator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/3] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "[2/3] Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "Dependencies installed!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Run script
Write-Host ""
Write-Host "[3/3] Starting video creation..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Make sure your app is running!" -ForegroundColor Yellow
Write-Host "  - Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"

node create-demo-video.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Video creation failed!" -ForegroundColor Red
    Write-Host "Check the error messages above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Video created successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the video at: public\videos\demo-video.mp4"
Write-Host "2. Upload to YouTube"
Write-Host "3. Update frontend\app\page.tsx with video ID"
Write-Host ""
Read-Host "Press Enter to exit"








