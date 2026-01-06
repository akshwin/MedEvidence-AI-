# 🎬 Automated Demo Video Creation

This folder contains scripts to automatically create a demo video of MedEvidence AI.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `puppeteer` - Browser automation
- `puppeteer-screen-recorder` - Screen recording

### 2. Make Sure Your App is Running

**Terminal 1 - Backend:**
```bash
cd ../backend
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd ../frontend
npm run dev
```

### 3. Run the Script

```bash
node create-demo-video.js
```

The script will:
- ✅ Launch a browser
- ✅ Navigate to your app
- ✅ Perform demo actions
- ✅ Record everything
- ✅ Save to `../public/videos/demo-video.mp4`

## 📋 Requirements

- **Node.js** 16+ installed
- **FFmpeg** installed (for video encoding)
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - Mac: `brew install ffmpeg`
  - Linux: `sudo apt-get install ffmpeg`
- Your app running on `http://localhost:3000`

## 🎥 What Gets Recorded

1. Homepage showcase
2. Navigation to research page
3. Asking a clinical question
4. Viewing AI response with citations
5. Searching medical papers
6. Theme toggle demonstration

**Duration**: ~2-3 minutes

## ⚙️ Configuration

Edit `create-demo-video.js` to customize:
- Video quality/resolution
- Timing delays
- Questions to ask
- Actions to perform

## 📤 After Recording

Once the video is created:

1. **Review** the video at `public/videos/demo-video.mp4`
2. **Edit** if needed (optional)
3. **Upload** to YouTube:
   - Go to [YouTube Studio](https://studio.youtube.com)
   - Upload the video
   - Get the video ID
4. **Update** `frontend/app/page.tsx`:
   ```tsx
   <DemoVideo 
     videoType="youtube"
     videoId="YOUR_VIDEO_ID"
   />
   ```

## 🐛 Troubleshooting

See `AUTOMATED_VIDEO_GUIDE.md` for detailed troubleshooting.

## 📚 More Info

- `AUTOMATED_VIDEO_GUIDE.md` - Complete guide
- `DEMO_VIDEO_SCRIPT.md` - Video script (in root)
- `VIDEO_SETUP_INSTRUCTIONS.md` - Manual setup guide (in root)






