/**
 * Quick script to verify video file integrity
 */

const fs = require('fs');
const path = require('path');

const videoPath = path.join(__dirname, '../public/videos/demo-video.mp4');

console.log('🔍 Verifying video file...\n');

if (!fs.existsSync(videoPath)) {
  console.error('❌ Video file not found:', videoPath);
  process.exit(1);
}

const stats = fs.statSync(videoPath);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

console.log('📊 File Information:');
console.log(`   Path: ${videoPath}`);
console.log(`   Size: ${sizeMB} MB`);
console.log(`   Created: ${stats.birthtime.toISOString()}`);
console.log(`   Modified: ${stats.mtime.toISOString()}\n`);

// Check file size
if (stats.size < 1024 * 1024) {
  console.error('❌ ERROR: File is too small (< 1 MB) - likely corrupted or incomplete!');
  process.exit(1);
}

// Try to read file
try {
  const fileHandle = fs.openSync(videoPath, 'r');
  const buffer = Buffer.alloc(12);
  fs.readSync(fileHandle, buffer, 0, 12, 0);
  fs.closeSync(fileHandle);
  
  // Check MP4 file signature (should start with ftyp box)
  const signature = buffer.toString('hex', 4, 8);
  if (signature === '66747970' || signature === '71742020') {
    console.log('✓ File signature looks valid (MP4 format)');
  } else {
    console.warn('⚠️  Warning: File signature may not be valid MP4');
    console.log(`   Signature: ${signature}`);
  }
  
  console.log('\n✅ Video file appears to be valid!');
  console.log('   You can test it by opening it in a media player.');
  
} catch (error) {
  console.error('❌ ERROR: Cannot read file:', error.message);
  process.exit(1);
}







