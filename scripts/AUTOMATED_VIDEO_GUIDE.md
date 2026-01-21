# 🤖 Automated Demo Video Creation Guide

This guide will help you automatically create and upload a demo video using the provided scripts.

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd scripts
npm install puppeteer puppeteer-screen-recorder
```

Or use the provided script:
```bash
npm run install-deps
```

### Step 2: Start Your Application

Make sure both frontend and backend are running:

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

### Step 3: Run the Video Creation Script

```bash
cd scripts
node create-demo-video.js
```

The script will:
1. ✅ Launch a browser
2. ✅ Navigate to your app
3. ✅ Perform demo actions (ask question, search papers)
4. ✅ Record everything
5. ✅ Save video to `public/videos/demo-video.mp4`

---

## 📋 Prerequisites

### Required Software:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **FFmpeg** (for video encoding)
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - Mac: `brew install ffmpeg`
  - Linux: `sudo apt-get install ffmpeg`

### Required Services:
- Your app must be running on `http://localhost:3000`
- Backend API must be accessible

---

## 🎬 What the Script Does

The automated script performs these actions:

1. **Homepage** (3 seconds)
   - Shows the homepage
   - Scrolls to demo section

2. **Navigate to Research** (2 seconds)
   - Clicks "Start Researching" button
   - Waits for page load

3. **Ask Clinical Question** (30-60 seconds)
   - Types: "What are the latest treatment options for type 2 diabetes?"
   - Clicks Send
   - Waits for AI response
   - Scrolls through answer
   - Shows citations

4. **Search Medical Papers** (20-30 seconds)
   - Switches to Search tab
   - Types: "cancer immunotherapy"
   - Shows search results
   - Scrolls through results

5. **Theme Toggle** (3 seconds)
   - Demonstrates dark/light mode

**Total Duration**: ~2-3 minutes

---

## ⚙️ Configuration

Edit `scripts/create-demo-video.js` to customize:

```javascript
const CONFIG = {
  frontendUrl: 'http://localhost:3000', // Your app URL
  videoPath: '../public/videos/demo-video.mp4', // Output path
  videoOptions: {
    fps: 30, // Frame rate
    videoFrame: {
      width: 1920, // Resolution
      height: 1080,
    },
  },
  timings: {
    waitForPageLoad: 3000, // Milliseconds
    waitAfterAction: 2000,
    // ... more timing options
  }
};
```

---

## 🎥 Video Quality Settings

### High Quality (Large File):
```javascript
videoOptions: {
  fps: 60,
  videoFrame: { width: 1920, height: 1080 },
  videoCrf: 18, // Lower = better quality
  videoBitrate: 2000,
}
```

### Balanced (Recommended):
```javascript
videoOptions: {
  fps: 30,
  videoFrame: { width: 1920, height: 1080 },
  videoCrf: 23,
  videoBitrate: 1000,
}
```

### Smaller File:
```javascript
videoOptions: {
  fps: 24,
  videoFrame: { width: 1280, height: 720 },
  videoCrf: 28,
  videoBitrate: 500,
}
```

---

## 📤 Uploading to YouTube (Optional)

### Manual Upload (Easiest):
1. Go to [YouTube Studio](https://studio.youtube.com)
2. Click "Create" → "Upload video"
3. Select `public/videos/demo-video.mp4`
4. Fill in title, description, thumbnail
5. Set visibility to "Unlisted" or "Public"
6. Publish

### Automated Upload (Advanced):

Requires YouTube API setup:

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project
   - Enable "YouTube Data API v3"

2. **Create OAuth2 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Create OAuth2 Client ID
   - Download credentials JSON

3. **Install Google APIs Package**
   ```bash
   npm install googleapis
   ```

4. **Set Up Environment Variables**
   ```bash
   export GOOGLE_CLIENT_ID="your-client-id"
   export GOOGLE_CLIENT_SECRET="your-client-secret"
   export GOOGLE_REDIRECT_URI="http://localhost:3000/oauth2callback"
   ```

5. **Run with Upload**
   ```bash
   UPLOAD_TO_YOUTUBE=true node create-demo-video.js
   ```

**Note**: Automated YouTube upload requires OAuth2 authentication flow, which is complex. Manual upload is recommended for most users.

---

## 🐛 Troubleshooting

### Browser doesn't launch:
- **Solution**: Make sure Chrome/Chromium is installed
- Puppeteer downloads Chromium automatically, but you can specify a path:
  ```javascript
  browser = await puppeteer.launch({
    executablePath: '/path/to/chrome',
  });
  ```

### Video is blank/black:
- **Solution**: Make sure `headless: false` in the script
- Check that the browser window is visible during recording

### FFmpeg not found:
- **Solution**: Install FFmpeg and add to PATH
- Verify: `ffmpeg -version`

### App not loading:
- **Solution**: Verify frontend is running on `http://localhost:3000`
- Check backend is running and accessible
- Verify no CORS errors in console

### Video file too large:
- **Solution**: Adjust `videoCrf` (higher = smaller file)
- Reduce resolution or frame rate
- Use video compression tools

### Actions not working:
- **Solution**: Check selectors match your UI
- Increase wait times in `timings` config
- Check browser console for errors

---

## 🎨 Customizing the Demo

### Change Questions:
Edit the script:
```javascript
const question = "Your custom question here?";
const searchQuery = "your search query";
```

### Add More Actions:
```javascript
// Example: Click on a citation
const citation = await page.$('[class*="citation"]');
if (citation) {
  await citation.click();
  await page.waitForTimeout(2000);
}
```

### Change Timing:
```javascript
timings: {
  waitForPageLoad: 5000, // Wait longer
  waitAfterAction: 3000,
}
```

---

## 📊 Output

The script creates:
- **Video File**: `public/videos/demo-video.mp4`
- **Console Logs**: Step-by-step progress
- **File Size**: Displayed at the end

After creation:
1. Review the video
2. Edit if needed (trim, add captions)
3. Upload to YouTube/Vimeo
4. Update `frontend/app/page.tsx` with video ID

---

## 🔄 Workflow

### Recommended Workflow:

1. **First Time Setup**:
   ```bash
   cd scripts
   npm install
   ```

2. **Before Recording**:
   - Start frontend: `cd frontend && npm run dev`
   - Start backend: `cd backend && uvicorn app.main:app --reload`
   - Test app manually to ensure it works

3. **Record Video**:
   ```bash
   cd scripts
   node create-demo-video.js
   ```

4. **Review & Edit**:
   - Watch the video
   - Use video editor if needed (DaVinci Resolve, etc.)
   - Add captions/subtitles (optional)

5. **Upload**:
   - Upload to YouTube (manual or automated)
   - Get video ID
   - Update `frontend/app/page.tsx`

6. **Deploy**:
   - Commit changes
   - Deploy to production

---

## 📝 Notes

- The script records in **real-time** - actual API calls will be made
- Make sure your backend API is working correctly
- The video will show actual loading times
- For faster demo, you could mock API responses (advanced)

---

## 🆘 Need Help?

- Check browser console for errors
- Verify all dependencies are installed
- Ensure app is running and accessible
- Review script logs for specific issues

---

**Last Updated**: Current  
**Status**: Ready to Use








