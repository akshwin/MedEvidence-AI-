/**
 * Enhanced Automated Demo Video Creation Script
 * 
 * Creates a polished, user-like demo video with visible cursor, highlights, and smooth animations
 */

const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  frontendUrl: 'http://localhost:3000',
  videoPath: path.join(__dirname, '../public/videos/demo-video.mp4'),
  videoOptions: {
    followNewTab: true,
    fps: 30,
    videoFrame: {
      width: 1920,
      height: 1080,
    },
    videoCrf: 18,
    videoCodec: 'libx264',
    videoPreset: 'ultrafast',
    videoBitrate: 1000,
  },
  // Enhanced timing for natural user behavior
  timings: {
    waitForPageLoad: 4000,
    waitAfterAction: 3000,
    typeDelay: 80, // Slower typing for visibility
    scrollDelay: 1000,
    hoverDelay: 500,
    clickDelay: 300,
    highlightDuration: 2000,
  }
};

// Ensure videos directory exists
const videosDir = path.dirname(CONFIG.videoPath);
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Helper function to inject CSS for better cursor visibility and highlights
async function injectDemoStyles(page) {
  await page.addStyleTag({
    content: `
      /* Make cursor more visible */
      * {
        cursor: crosshair !important;
      }
      
      /* Highlight on hover */
      button:hover, a:hover, input:hover, textarea:hover {
        outline: 3px solid rgba(16, 185, 129, 0.5) !important;
        outline-offset: 2px !important;
        transform: scale(1.02) !important;
        transition: all 0.2s ease !important;
      }
      
      /* Click animation */
      .demo-click-highlight {
        position: relative !important;
        animation: demoPulse 0.5s ease !important;
      }
      
      @keyframes demoPulse {
        0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
        100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
      }
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth !important;
      }
    `
  });
}

// Helper function to smoothly move mouse and click
async function smoothClick(page, selector, options = {}) {
  const element = await page.$(selector);
  if (!element) {
    console.log(`⚠️  Element not found: ${selector}`);
    return false;
  }
  
  // Get element position
  const box = await element.boundingBox();
  if (!box) {
    console.log(`⚠️  Element not visible: ${selector}`);
    return false;
  }
  
  // Move mouse to element center with smooth movement
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  
  // Add highlight class
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      el.classList.add('demo-click-highlight');
      setTimeout(() => el.classList.remove('demo-click-highlight'), 500);
    }
  }, selector);
  
  await page.waitForTimeout(CONFIG.timings.hoverDelay);
  
  // Move mouse smoothly
  await page.mouse.move(x, y, { steps: 10 });
  await page.waitForTimeout(CONFIG.timings.clickDelay);
  
  // Click (don't wait after click if navigation is expected)
  await element.click();
  
  // Only wait if no navigation is expected
  if (!options.expectNavigation) {
    await page.waitForTimeout(CONFIG.timings.waitAfterAction);
  }
  
  return true;
}

// Helper function to type with visible cursor
async function typeWithCursor(page, selector, text, options = {}) {
  const element = await page.$(selector);
  if (!element) {
    console.log(`⚠️  Input not found: ${selector}`);
    return false;
  }
  
  // Focus and clear
  await element.focus();
  await page.waitForTimeout(300);
  
  // Highlight the input
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      el.style.border = '3px solid rgba(16, 185, 129, 0.6)';
      el.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.3)';
    }
  }, selector);
  
  await page.waitForTimeout(200);
  
  // Type character by character for visibility
  for (const char of text) {
    await element.type(char, { delay: CONFIG.timings.typeDelay });
  }
  
  // Remove highlight
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      el.style.border = '';
      el.style.boxShadow = '';
    }
  }, selector);
  
  await page.waitForTimeout(CONFIG.timings.waitAfterAction);
  return true;
}

async function createDemoVideo() {
  console.log('🎬 Starting enhanced demo video creation...\n');
  
  let browser;
  let page;
  let recorder;

  try {
    // Launch browser with visible cursor
    console.log('📱 Launching browser...');
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      args: [
        '--start-maximized',
        '--disable-infobars',
        '--disable-dev-shm-usage',
        '--window-size=1920,1080',
      ],
    });

    page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    // Inject demo styles for better visibility
    await injectDemoStyles(page);

    // Start screen recording
    console.log('🎥 Starting screen recording...');
    recorder = new PuppeteerScreenRecorder(page, CONFIG.videoOptions);
    await recorder.start(CONFIG.videoPath);

    // ============================================
    // INTRO: Homepage
    // ============================================
    console.log('🏠 [1/8] Showing homepage...');
    await page.goto(CONFIG.frontendUrl, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(CONFIG.timings.waitForPageLoad);
    
    // Smooth scroll down to show features
    await page.evaluate(() => {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    });
    await page.waitForTimeout(2000);
    
    // Scroll back up
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    await page.waitForTimeout(1500);

    // ============================================
    // NAVIGATE TO RESEARCH PAGE
    // ============================================
    console.log('🔬 [2/8] Navigating to research page...');
    const startButton = await page.$('a[href="/research"]');
    if (startButton) {
      // Set up navigation promise BEFORE clicking
      const navigationPromise = page.waitForNavigation({ 
        waitUntil: 'domcontentloaded', // Use domcontentloaded instead of networkidle0 for faster response
        timeout: 60000 // Increase timeout to 60 seconds
      }).catch(err => {
        console.log('⚠️  Navigation timeout or error, trying direct navigation...');
        return null;
      });
      
      // Click and wait for navigation
      await smoothClick(page, 'a[href="/research"]', { expectNavigation: true });
      
      try {
        await navigationPromise;
        await page.waitForTimeout(2000); // Wait for page to fully load
      } catch (error) {
        console.log('⚠️  Navigation failed, using direct navigation...');
        // Fallback: navigate directly
        await page.goto(`${CONFIG.frontendUrl}/research`, { 
          waitUntil: 'domcontentloaded',
          timeout: 60000 
        });
        await page.waitForTimeout(2000);
      }
    } else {
      // Fallback: navigate directly
      await page.goto(`${CONFIG.frontendUrl}/research`, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      await page.waitForTimeout(CONFIG.timings.waitForPageLoad);
    }

    // ============================================
    // FEATURE 1: ASK CLINICAL QUESTIONS
    // ============================================
    console.log('💬 [3/8] Demonstrating Ask Clinical Questions...');
    
    // Wait for chat interface
    await page.waitForSelector('input[type="text"], textarea', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Type question with visible cursor
    const question = "What are the latest treatment options for type 2 diabetes?";
    const inputSelector = 'input[type="text"], textarea';
    await typeWithCursor(page, inputSelector, question);
    
    // Click send button
    console.log('📤 Clicking send button...');
    const sendButton = await page.$('form button[type="submit"]');
    if (sendButton) {
      await smoothClick(page, 'form button[type="submit"]');
    } else {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(CONFIG.timings.waitAfterAction);
    }

    // Wait for response
    console.log('⏳ Waiting for AI response...');
    try {
      await page.waitForSelector('[class*="message"], [class*="Message"]', { timeout: 60000 });
      await page.waitForTimeout(4000); // Wait for answer to fully render
    } catch (error) {
      console.log('⚠️  Response timeout, continuing...');
    }

    // Scroll through answer smoothly
    console.log('📜 Scrolling through answer...');
    await page.evaluate(() => {
      const messages = document.querySelector('[class*="message"], [class*="Message"]');
      if (messages) {
        messages.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    await page.waitForTimeout(2000);
    
    // Scroll down to show more content
    await page.evaluate(() => {
      window.scrollBy({ top: 300, behavior: 'smooth' });
    });
    await page.waitForTimeout(2000);

    // Show citations
    console.log('📚 Highlighting citations...');
    const citations = await page.$$('[class*="citation"], [class*="Citation"]');
    if (citations.length > 0) {
      await page.evaluate((el) => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, citations[0]);
      await page.waitForTimeout(CONFIG.timings.highlightDuration);
      
      // Hover over citation to show it's interactive
      const citationBox = await citations[0].boundingBox();
      if (citationBox) {
        await page.mouse.move(citationBox.x + citationBox.width / 2, citationBox.y + citationBox.height / 2, { steps: 5 });
        await page.waitForTimeout(1000);
      }
    }

    // Show PDF download button
    console.log('📥 Showing PDF download for answers...');
    // Use XPath to find button containing "Download PDF" text
    const pdfButtonXPath = '//button[contains(., "Download PDF")]';
    const pdfButtonElements = await page.$x(pdfButtonXPath);
    if (pdfButtonElements.length > 0) {
      const pdfButton = pdfButtonElements[0];
      await page.evaluate((el) => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, pdfButton);
      await page.waitForTimeout(1500);
      
      // Hover over PDF button
      const pdfBox = await pdfButton.boundingBox();
      if (pdfBox) {
        await page.mouse.move(pdfBox.x + pdfBox.width / 2, pdfBox.y + pdfBox.height / 2, { steps: 5 });
        await page.waitForTimeout(1500);
      }
      
      // Note: Don't actually click to avoid downloading during demo
      console.log('ℹ️  PDF button found (not clicking to avoid download)');
    } else {
      // Try alternative selector - button with Download icon (using XPath)
      const pdfButtonAltXPath = '//button[.//svg[contains(@class, "Download")]]';
      const pdfButtonAltElements = await page.$x(pdfButtonAltXPath);
      if (pdfButtonAltElements.length > 0) {
        await page.evaluate((el) => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, pdfButtonAltElements[0]);
        await page.waitForTimeout(1500);
      }
    }
    
    await page.waitForTimeout(2000);

    // ============================================
    // FEATURE 2: SEARCH MEDICAL PAPERS
    // ============================================
    console.log('🔍 [4/8] Switching to Search Medical Papers...');
    
    // Switch to Search tab
    const searchTabXPath = '//button[contains(., "Search Medical Papers")]';
    const searchTabElements = await page.$x(searchTabXPath);
    if (searchTabElements.length > 0) {
      const tabBox = await searchTabElements[0].boundingBox();
      if (tabBox) {
        await page.mouse.move(tabBox.x + tabBox.width / 2, tabBox.y + tabBox.height / 2, { steps: 5 });
        await page.waitForTimeout(500);
      }
      await searchTabElements[0].click();
      await page.waitForTimeout(CONFIG.timings.waitForPageLoad);
    }

    // Type search query
    console.log('⌨️  Typing search query...');
    const searchQuery = "cancer immunotherapy";
    const searchInputSelector = 'input[placeholder*="Search"], input[type="text"]';
    await typeWithCursor(page, searchInputSelector, searchQuery);

    // Click search button
    console.log('🔎 Clicking search button...');
    const searchButton = await page.$('form button[type="submit"]');
    if (searchButton) {
      await smoothClick(page, 'form button[type="submit"]');
    } else {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(CONFIG.timings.waitAfterAction);
    }

    // Wait for search results
    console.log('⏳ Waiting for search results...');
    try {
      await page.waitForSelector('[class*="paper"], [class*="result"], [class*="card"]', { timeout: 30000 });
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log('⚠️  Search results timeout, continuing...');
    }

    // Scroll through results smoothly
    console.log('📜 Scrolling through search results...');
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    
    // Scroll down to show multiple papers
    await page.evaluate(() => {
      window.scrollBy({ top: 400, behavior: 'smooth' });
    });
    await page.waitForTimeout(2000);
    
    // Scroll down more
    await page.evaluate(() => {
      window.scrollBy({ top: 400, behavior: 'smooth' });
    });
    await page.waitForTimeout(2000);

    // Show PDF download for search results
    console.log('📥 Showing PDF download for search results...');
    // Use XPath to find button containing "Download PDF" text
    const searchPdfButtonXPath = '//button[contains(., "Download PDF")]';
    const searchPdfButtonElements = await page.$x(searchPdfButtonXPath);
    if (searchPdfButtonElements.length > 0) {
      const searchPdfButton = searchPdfButtonElements[0];
      await page.evaluate((el) => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, searchPdfButton);
      await page.waitForTimeout(1500);
      
      // Hover over PDF button
      const searchPdfBox = await searchPdfButton.boundingBox();
      if (searchPdfBox) {
        await page.mouse.move(searchPdfBox.x + searchPdfBox.width / 2, searchPdfBox.y + searchPdfBox.height / 2, { steps: 5 });
        await page.waitForTimeout(1500);
      }
      
      console.log('ℹ️  PDF button found (not clicking to avoid download)');
    } else {
      // Try alternative selector - button with Download icon (using XPath)
      const searchPdfAltXPath = '//button[.//svg[contains(@class, "Download")]]';
      const searchPdfAltElements = await page.$x(searchPdfAltXPath);
      if (searchPdfAltElements.length > 0) {
        await page.evaluate((el) => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, searchPdfAltElements[0]);
        await page.waitForTimeout(1500);
      }
    }
    
    await page.waitForTimeout(2000);

    // ============================================
    // FEATURE 3: THEME TOGGLE
    // ============================================
    console.log('🎨 [5/8] Demonstrating theme toggle...');
    const themeToggle = await page.$('button[aria-label*="theme"], button[aria-label*="Theme"]');
    if (themeToggle) {
      const themeBox = await themeToggle.boundingBox();
      if (themeBox) {
        await page.mouse.move(themeBox.x + themeBox.width / 2, themeBox.y + themeBox.height / 2, { steps: 5 });
        await page.waitForTimeout(500);
      }
      await themeToggle.click();
      await page.waitForTimeout(2500);
      await themeToggle.click(); // Toggle back
      await page.waitForTimeout(1500);
    }

    // ============================================
    // FINAL: Show overview
    // ============================================
    console.log('✨ [6/8] Final overview...');
    
    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    await page.waitForTimeout(2000);
    
    // Show both tabs
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('button');
      if (tabs.length > 0) {
        tabs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(2000);

    // Final pause
    console.log('🎬 [7/8] Finalizing recording...');
    await page.waitForTimeout(3000);

    // Stop recording
    console.log('🛑 [8/8] Stopping recording...');
    await recorder.stop();

    console.log(`\n✅ Video created successfully!`);
    console.log(`📁 Location: ${CONFIG.videoPath}`);
    if (fs.existsSync(CONFIG.videoPath)) {
      console.log(`📊 File size: ${(fs.statSync(CONFIG.videoPath).size / 1024 / 1024).toFixed(2)} MB`);
    }

  } catch (error) {
    console.error('❌ Error creating video:', error);
    if (recorder) {
      try {
        await recorder.stop();
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the script
if (require.main === module) {
  createDemoVideo()
    .then(() => {
      console.log('\n🎉 Enhanced demo video creation complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to create demo video:', error);
      process.exit(1);
    });
}

module.exports = { createDemoVideo };
