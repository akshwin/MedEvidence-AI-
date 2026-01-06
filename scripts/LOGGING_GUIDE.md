# Video Creation Script - Logging Guide

## Overview

The video creation script (`create-demo-video-complete.js`) now includes comprehensive logging to help you debug and understand what's happening behind the scenes.

## Log Levels

The script uses different log levels with color coding:

- **INFO** (ℹ) - Blue: General information
- **SUCCESS** (✓) - Green: Successful operations
- **WARNING** (⚠) - Yellow: Warnings (non-critical issues)
- **ERROR** (✗) - Red: Errors that may affect functionality
- **DEBUG** (🔍) - Gray: Detailed debugging information
- **STEP** (→) - Cyan: Step-by-step progress

## Log Format

Each log entry includes:
- **Timestamp**: `[YYYY-MM-DD HH:mm:ss.mmm]`
- **Icon**: Visual indicator for log level
- **Message**: Human-readable description
- **Data** (optional): Additional context (when verbose mode is enabled)

Example:
```
[2026-01-01 15:30:45.123] ✓ Browser launched successfully {"duration":"1250ms"}
```

## Configuration

You can control logging behavior in the `CONFIG` object:

```javascript
logging: {
  enabled: true,    // Enable/disable all logging
  verbose: true,    // Show detailed data objects (set to false for cleaner output)
}
```

## What Gets Logged

### 1. **Initialization**
- Configuration details
- Directory checks
- File existence checks

### 2. **Browser Operations**
- Browser launch timing
- Page creation
- Viewport settings
- Page errors and failed requests

### 3. **Navigation**
- Page loads with URLs and titles
- Navigation timing
- Link discovery

### 4. **Element Interactions**
- Element searches
- Click operations with timing
- Typing operations with character counts
- Scroll operations with positions

### 5. **Feature Demonstrations**
- Chat interface loading
- AI response waiting
- Search results loading
- PDF button discovery
- Theme toggle operations

### 6. **Timing Information**
- Operation durations
- Total script execution time
- Individual step timings

### 7. **Error Handling**
- Error messages with context
- Page state at error time
- Stack traces (in verbose mode)

### 8. **File Operations**
- Video file creation
- File size information
- Creation timestamps

## Progress Tracking

The script shows progress bars for major sections:

```
[6/10] █████████████████░░░░░░░░░░░░ 60% - Navigating to Pricing Page
```

## Sections

Major sections are clearly marked:

```
════════════════════════════════════════════════════════════
  🏠 SECTION 1: HOMEPAGE OVERVIEW
════════════════════════════════════════════════════════════
```

## Debugging Tips

### 1. **Enable Verbose Mode**
Set `verbose: true` to see detailed data objects for each operation.

### 2. **Check Timing**
Look for operations that take unusually long - they might indicate:
- Network issues
- Element not found
- Page loading problems

### 3. **Watch for Warnings**
Warnings indicate non-critical issues but may affect video quality:
- Elements not found (script continues with fallbacks)
- Timeouts (script continues after waiting)

### 4. **Error Context**
When errors occur, the script logs:
- Current page URL
- Page title
- Error message and stack trace

### 5. **Element Discovery**
When elements aren't found, the script logs:
- Available alternatives
- Search results
- Fallback methods attempted

## Example Output

```
════════════════════════════════════════════════════════════
  🎬 MVP DEMO VIDEO CREATION
════════════════════════════════════════════════════════════

[2026-01-01 15:30:00.000] ℹ Configuration {"frontendUrl":"http://localhost:3000",...}
[2026-01-01 15:30:00.010] → Checking videos directory: C:\...\public\videos
[2026-01-01 15:30:00.015] ✓ Videos directory exists

════════════════════════════════════════════════════════════
  🌐 BROWSER SETUP
════════════════════════════════════════════════════════════

[2026-01-01 15:30:00.020] → Launching Puppeteer browser...
[2026-01-01 15:30:01.250] ✓ Browser launched successfully {"duration":"1230ms"}
[2026-01-01 15:30:01.251] → Creating new page
[2026-01-01 15:30:01.255] ✓ Viewport set {"width":1920,"height":1080}
```

## Reducing Log Verbosity

To see less detailed output, set `verbose: false`:

```javascript
logging: {
  enabled: true,
  verbose: false,  // Less detailed output
}
```

This will:
- Hide detailed data objects
- Hide stack traces
- Hide browser console messages
- Show only essential information

## Troubleshooting Common Issues

### Video Not Created
- Check for errors in the log
- Verify servers are running (frontend/backend)
- Check file permissions for video directory

### Elements Not Found
- Logs show what elements were searched
- Logs show available alternatives
- Check if selectors need updating

### Slow Performance
- Check timing logs for bottlenecks
- Look for operations taking > 5 seconds
- Verify network connectivity

### Navigation Failures
- Check navigation timing logs
- Verify URLs are correct
- Check for timeout errors

## Next Steps

1. Run the script and review the logs
2. Identify any warnings or errors
3. Use timing information to optimize performance
4. Adjust selectors based on element discovery logs





