# FFmpeg Installation Guide

FFmpeg is **REQUIRED** for creating demo videos. Without it, the video files will be corrupted or incomplete.

## Why FFmpeg is Needed

The `puppeteer-screen-recorder` library uses FFmpeg to encode video files. Without FFmpeg:
- Videos will be corrupted (error code 0xC00D36C4)
- Videos will be incomplete or unplayable
- Video creation will fail

## Installation Methods

### Option 1: Using Chocolatey (Recommended for Windows)

1. **Install Chocolatey** (if not already installed):
   ```powershell
   # Run PowerShell as Administrator
   Set-ExecutionPolicy Bypass -Scope Process -Force
   [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
   iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Install FFmpeg**:
   ```powershell
   choco install ffmpeg
   ```

3. **Verify installation**:
   ```powershell
   ffmpeg -version
   ```

### Option 2: Using winget (Windows Package Manager)

```powershell
winget install ffmpeg
```

### Option 3: Manual Installation

1. **Download FFmpeg**:
   - Go to https://ffmpeg.org/download.html
   - Click "Windows" → "Windows builds by BtbN"
   - Download the latest `ffmpeg-master-latest-win64-gpl.zip`

2. **Extract and Install**:
   - Extract the ZIP file
   - Copy the `ffmpeg.exe` file to a folder (e.g., `C:\ffmpeg`)
   - Add that folder to your system PATH:
     - Open "Environment Variables" (search in Start menu)
     - Edit "Path" variable
     - Add `C:\ffmpeg` (or your chosen folder)
     - Click OK

3. **Verify installation**:
   ```cmd
   ffmpeg -version
   ```

### Option 4: Using Scoop

```powershell
scoop install ffmpeg
```

## Verify Installation

After installing, verify FFmpeg works:

```cmd
ffmpeg -version
```

You should see version information. If you get "command not found", FFmpeg is not in your PATH.

## After Installation

1. **Close and reopen** your terminal/command prompt
2. **Restart** your IDE/editor (to pick up PATH changes)
3. **Run the video creation script**:
   ```cmd
   scripts\regenerate-video.bat
   ```

## Troubleshooting

### "FFmpeg not found" error

1. Make sure FFmpeg is installed
2. Restart your terminal/IDE
3. Verify with `ffmpeg -version`
4. If still not found, manually add FFmpeg to PATH

### Video still corrupted after installing FFmpeg

1. Delete the old corrupted video:
   ```cmd
   del public\videos\demo-video.mp4
   ```

2. Regenerate the video:
   ```cmd
   scripts\regenerate-video.bat
   ```

3. Verify the new video:
   ```cmd
   node scripts\verify-video.js
   ```

## Need Help?

If you're still having issues:
1. Check FFmpeg installation: `ffmpeg -version`
2. Check video file: `node scripts\verify-video.js`
3. Review video creation logs for errors





