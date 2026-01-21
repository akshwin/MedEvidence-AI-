# 🎥 Demo Video Setup Instructions

## Quick Start

Once you have your demo video ready, follow these steps to add it to your website:

---

## Option 1: YouTube (Recommended) ⭐

### Steps:
1. **Upload your video to YouTube**
   - Go to [YouTube Studio](https://studio.youtube.com)
   - Upload your video
   - Set visibility to "Unlisted" (or "Public" if you want)
   - Wait for processing to complete

2. **Get your Video ID**
   - From YouTube URL: `https://www.youtube.com/watch?v=VIDEO_ID_HERE`
   - Copy the `VIDEO_ID_HERE` part

3. **Update the code**
   - Open `frontend/app/page.tsx`
   - Find the `<DemoVideo />` component (around line 181)
   - Uncomment and update:
   ```tsx
   <DemoVideo 
     videoType="youtube"
     videoId="YOUR_YOUTUBE_VIDEO_ID"
   />
   ```

4. **Example**:
   ```tsx
   <DemoVideo 
     videoType="youtube"
     videoId="dQw4w9WgXcQ"
   />
   ```

---

## Option 2: Vimeo

### Steps:
1. **Upload your video to Vimeo**
   - Go to [Vimeo](https://vimeo.com)
   - Upload your video
   - Get the video ID from the URL

2. **Update the code**
   ```tsx
   <DemoVideo 
     videoType="vimeo"
     videoId="YOUR_VIMEO_VIDEO_ID"
   />
   ```

---

## Option 3: Self-Hosted Video

### Steps:
1. **Prepare your video file**
   - Format: MP4 (H.264 codec recommended)
   - Resolution: 1920x1080 (Full HD) or higher
   - Keep file size reasonable (< 100MB for web)

2. **Upload to your project**
   - Create folder: `frontend/public/videos/`
   - Upload your video: `frontend/public/videos/demo-video.mp4`

3. **Update the code**
   ```tsx
   <DemoVideo 
     videoType="direct"
     videoUrl="/videos/demo-video.mp4"
   />
   ```

4. **Optional: Add thumbnail**
   - Upload thumbnail: `frontend/public/images/video-thumbnail.jpg`
   - Update code:
   ```tsx
   <DemoVideo 
     videoType="direct"
     videoUrl="/videos/demo-video.mp4"
     thumbnailUrl="/images/video-thumbnail.jpg"
   />
   ```

---

## Creating Your Demo Video

### Tools You Can Use:

1. **Screen Recording**:
   - **Windows**: OBS Studio (free), Windows Game Bar (Win+G)
   - **Mac**: QuickTime Player (built-in), ScreenFlow (paid)
   - **Linux**: OBS Studio, SimpleScreenRecorder

2. **Video Editing**:
   - **Free**: DaVinci Resolve, OpenShot, Shotcut
   - **Paid**: Adobe Premiere Pro, Final Cut Pro
   - **Online**: Canva, Kapwing

3. **Voiceover Recording**:
   - **Free**: Audacity (for audio editing)
   - **Online**: Loom, Riverside.fm
   - **AI Voice**: ElevenLabs, Murf.ai (if you prefer AI narration)

### Recommended Workflow:

1. **Record screen** using OBS Studio or similar
2. **Record voiceover** separately (better quality)
3. **Edit video** in DaVinci Resolve or similar
4. **Sync audio** with video
5. **Add captions/subtitles** (optional but recommended)
6. **Export** as MP4 (H.264, 1920x1080, 30fps)
7. **Upload** to YouTube or Vimeo

---

## Video Script

A complete script is available in `DEMO_VIDEO_SCRIPT.md` with:
- Detailed timing
- Voiceover text
- Screen actions
- Visual guidelines

---

## Video Specifications

### Recommended Settings:
- **Resolution**: 1920x1080 (Full HD) minimum
- **Aspect Ratio**: 16:9
- **Frame Rate**: 30fps
- **Format**: MP4 (H.264 codec)
- **Bitrate**: 8-10 Mbps (for Full HD)
- **Duration**: 2-3 minutes (optimal)

### Audio:
- **Sample Rate**: 48kHz
- **Bitrate**: 192 kbps or higher
- **Format**: AAC or MP3
- **Volume**: Normalized, clear voice

---

## Testing

After adding your video:

1. **Test on desktop** - Check video plays correctly
2. **Test on mobile** - Ensure responsive design works
3. **Test in dark mode** - Verify styling looks good
4. **Test thumbnail** - Check thumbnail displays before play
5. **Test playback** - Ensure video plays smoothly
6. **Test close button** - Verify you can close and reopen

---

## Troubleshooting

### Video not showing?
- Check video ID is correct (YouTube/Vimeo)
- Check file path is correct (self-hosted)
- Check video file exists in public folder
- Check browser console for errors

### Video not playing?
- Check video format (MP4 recommended)
- Check video codec (H.264 recommended)
- Check file size (may be too large)
- Check CORS settings (for self-hosted)

### Thumbnail not showing?
- Check thumbnail URL is correct
- Check thumbnail file exists
- Check image format (JPG/PNG)

### YouTube embed issues?
- Check video is not set to "Private"
- Check video is processed and available
- Check video ID is correct

---

## Current Status

The demo video component is ready and waiting for your video. Currently shows a placeholder with "Demo Video Coming Soon" message.

Once you add your video URL/ID, it will automatically:
- ✅ Show thumbnail with play button
- ✅ Play video when clicked
- ✅ Support YouTube, Vimeo, or self-hosted videos
- ✅ Work on all devices (responsive)
- ✅ Support dark/light themes
- ✅ Include close button to return to thumbnail

---

## Need Help?

Refer to:
- `DEMO_VIDEO_SCRIPT.md` - Complete video script
- `RESEARCH_PAGE_DOCUMENTATION.md` - Feature documentation
- Component code: `frontend/components/DemoVideo.tsx`

---

**Last Updated**: Current  
**Status**: Ready for Video Upload








