# 🎬 Complete MVP Demo Video Script

This script creates a comprehensive demo video showing **ALL pages and ALL features** of MedEvidence AI.

## What Gets Recorded

### 1. **Homepage** (Complete Tour)
   - Hero section with main CTA
   - About section
   - Demo video section
   - Stats section
   - Features section

### 2. **Pricing Page**
   - All 3 pricing plans (Free, Pro, Enterprise)
   - Feature comparison table
   - FAQ section

### 3. **Research Page**
   - **Feature 1: Ask Clinical Questions**
     - Typing a clinical question
     - Viewing AI response with citations
     - PDF download button
   
   - **Feature 2: Search Medical Papers**
     - Searching for papers
     - Viewing search results
     - PDF download for results

### 4. **Theme Toggle**
   - Demonstrating dark/light mode switch

### 5. **Navigation**
   - Smooth transitions between pages
   - All navigation links

## Quick Start

### Prerequisites
- Node.js 16+ installed
- FFmpeg installed (for video encoding)
- Your app running:
  - Backend: `http://localhost:8000`
  - Frontend: `http://localhost:3000`

### Run the Script

**Windows:**
```bash
scripts\create-video-complete.bat
```

**Mac/Linux:**
```bash
cd scripts
npm install
node create-demo-video-complete.js
```

## Video Quality Settings

The script uses optimized settings for high-quality output:
- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 FPS
- **Codec**: H.264 (libx264)
- **Quality**: CRF 23 (good balance)
- **Bitrate**: 2000 kbps

## Output

The video will be saved to:
```
public/videos/demo-video.mp4
```

## After Recording

1. **Review the video** - Check that all features are shown clearly
2. **The video is automatically integrated** - It will appear on the homepage
3. **Optional: Upload to YouTube** - For better performance and analytics

## Troubleshooting

### Video not recording?
- Make sure your app is running on `http://localhost:3000`
- Check that Puppeteer can access the browser
- Verify FFmpeg is installed

### Video quality issues?
- Adjust `videoCrf` in the script (lower = better quality, 18-28 range)
- Increase `videoBitrate` for better quality
- Change `videoPreset` from 'medium' to 'slow' for better compression

### Missing features in video?
- Check browser console for errors
- Verify all pages are accessible
- Ensure backend API is responding

## Script Features

- ✅ Visible cursor movements
- ✅ Smooth scrolling
- ✅ Element highlights on hover
- ✅ Click animations
- ✅ Natural typing speed
- ✅ Proper waiting for content to load
- ✅ Error handling and fallbacks

## Duration

Expected video length: **3-5 minutes**

---

**Ready to create your MVP demo video!** 🚀





