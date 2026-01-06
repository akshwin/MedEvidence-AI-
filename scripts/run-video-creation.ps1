# PowerShell script to create demo video with proper error handling

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MedEvidence AI - Video Creation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "[1/4] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Change to scripts directory
Write-Host ""
Write-Host "[2/4] Changing to scripts directory..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ ERROR: Could not change to scripts directory!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ In scripts directory" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "[3/4] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ ERROR: Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Check if servers are running
Write-Host ""
Write-Host "[4/4] Checking if servers are running..." -ForegroundColor Yellow
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
$backendRunning = Test-NetConnection -ComputerName localhost -Port 8000 -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $frontendRunning) {
    Write-Host "⚠ WARNING: Frontend not running on port 3000!" -ForegroundColor Yellow
    Write-Host "  Please start: cd frontend && npm run dev" -ForegroundColor Yellow
}

if (-not $backendRunning) {
    Write-Host "⚠ WARNING: Backend not running on port 8000!" -ForegroundColor Yellow
    Write-Host "  Please start: cd backend && uvicorn app.main:app --reload" -ForegroundColor Yellow
}

if (-not $frontendRunning -or -not $backendRunning) {
    Write-Host ""
    Write-Host "⚠ The script will continue, but may fail if servers are not running." -ForegroundColor Yellow
    Write-Host "Press any key to continue or Ctrl+C to cancel..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Ensure videos directory exists
Write-Host ""
Write-Host "Creating videos directory..." -ForegroundColor Yellow
$videosPath = Join-Path (Split-Path $PSScriptRoot -Parent) "public\videos"
if (-not (Test-Path $videosPath)) {
    New-Item -ItemType Directory -Path $videosPath -Force | Out-Null
    Write-Host "✓ Created videos directory: $videosPath" -ForegroundColor Green
} else {
    Write-Host "✓ Videos directory exists: $videosPath" -ForegroundColor Green
}

# Run the video creation script
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Video Creation..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will take 3-5 minutes. Please wait..." -ForegroundColor Yellow
Write-Host ""

node create-demo-video-complete.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Video Created Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Video location: $videosPath\demo-video.mp4" -ForegroundColor Cyan
    
    if (Test-Path "$videosPath\demo-video.mp4") {
        $fileSize = (Get-Item "$videosPath\demo-video.mp4").Length / 1MB
        Write-Host "File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✓ The video is now ready and will appear on your homepage!" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ Video Creation Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Frontend is running on http://localhost:3000" -ForegroundColor Yellow
    Write-Host "  2. Backend is running on http://localhost:8000" -ForegroundColor Yellow
    Write-Host "  3. FFmpeg is installed" -ForegroundColor Yellow
    Write-Host "  4. Check error messages above" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")





