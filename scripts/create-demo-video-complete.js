/**
 * Complete MVP Demo Video Creation Script
 * 
 * Creates a comprehensive demo video showing ALL pages and ALL features:
 * - Homepage (hero, about, stats, features)
 * - Pricing page (all 3 plans)
 * - Research page (Ask Clinical Questions + Search Medical Papers)
 * - Docs page
 * - Navigation between pages
 * - PDF downloads
 * - Theme toggle
 */

const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  frontendUrl: 'http://localhost:3000',
  videoPath: path.join(__dirname, '../frontend/public/videos/demo-video.mp4'),
  videoOptions: {
    followNewTab: true,
    fps: 30,
    videoFrame: {
      width: 1920,
      height: 1080,
    },
    videoCrf: 23, // Better quality (lower = better quality, 18-28 range)
    videoCodec: 'libx264',
    videoPreset: 'medium', // Better quality than ultrafast
    videoBitrate: 2000, // Higher bitrate for better quality
  },
  timings: {
    waitForPageLoad: 3000,
    waitAfterAction: 2000,
    typeDelay: 60,
    scrollDelay: 800,
    hoverDelay: 500,
    clickDelay: 300,
    highlightDuration: 2000,
  },
  logging: {
    enabled: true,
    verbose: true, // Set to false for less detailed logs
  }
};

// ============================================
// LOGGING UTILITIES
// ============================================
const LOG_LEVELS = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
  STEP: 'STEP'
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 23);
}

function formatLog(level, message, data = null) {
  if (!CONFIG.logging.enabled) return;
  
  const timestamp = getTimestamp();
  let prefix = '';
  let color = colors.reset;
  
  switch (level) {
    case LOG_LEVELS.SUCCESS:
      prefix = '✓';
      color = colors.green;
      break;
    case LOG_LEVELS.ERROR:
      prefix = '✗';
      color = colors.red;
      break;
    case LOG_LEVELS.WARNING:
      prefix = '⚠';
      color = colors.yellow;
      break;
    case LOG_LEVELS.STEP:
      prefix = '→';
      color = colors.cyan;
      break;
    case LOG_LEVELS.DEBUG:
      prefix = '🔍';
      color = colors.gray;
      break;
    default:
      prefix = 'ℹ';
      color = colors.blue;
  }
  
  const logMessage = `${colors.dim}[${timestamp}]${colors.reset} ${color}${prefix}${colors.reset} ${message}`;
  
  if (data && CONFIG.logging.verbose) {
    console.log(logMessage);
    console.log(colors.gray + JSON.stringify(data, null, 2) + colors.reset);
  } else {
    console.log(logMessage);
  }
}

const logger = {
  info: (msg, data) => formatLog(LOG_LEVELS.INFO, msg, data),
  success: (msg, data) => formatLog(LOG_LEVELS.SUCCESS, msg, data),
  warn: (msg, data) => formatLog(LOG_LEVELS.WARNING, msg, data),
  error: (msg, data) => formatLog(LOG_LEVELS.ERROR, msg, data),
  debug: (msg, data) => formatLog(LOG_LEVELS.DEBUG, msg, data),
  step: (msg, data) => formatLog(LOG_LEVELS.STEP, msg, data),
  
  section: (title) => {
    console.log('\n' + colors.bright + colors.cyan + '═'.repeat(60) + colors.reset);
    console.log(colors.bright + colors.cyan + `  ${title}` + colors.reset);
    console.log(colors.bright + colors.cyan + '═'.repeat(60) + colors.reset + '\n');
  },
  
  progress: (current, total, action) => {
    const percentage = Math.round((current / total) * 100);
    const barLength = 30;
    const filled = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    console.log(`${colors.cyan}[${current}/${total}]${colors.reset} ${bar} ${percentage}% - ${action}`);
  }
};

// Track timing for operations
const timers = new Map();

function startTimer(name) {
  timers.set(name, Date.now());
  logger.debug(`Timer started: ${name}`);
}

function endTimer(name) {
  const startTime = timers.get(name);
  if (startTime) {
    const duration = Date.now() - startTime;
    timers.delete(name);
    logger.debug(`Timer ended: ${name}`, { duration: `${duration}ms` });
    return duration;
  }
  return 0;
}

// Ensure videos directory exists
const videosDir = path.dirname(CONFIG.videoPath);
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Helper function to inject CSS for better cursor visibility
async function injectDemoStyles(page) {
  startTimer('injectDemoStyles');
  logger.step('Injecting demo styles for better visibility');
  
  try {
    await page.addStyleTag({
      content: `
        /* Make cursor more visible */
        * {
          cursor: crosshair !important;
        }
        
        /* Highlight on hover */
        button:hover, a:hover, input:hover, textarea:hover {
          outline: 3px solid rgba(16, 185, 129, 0.6) !important;
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
        
        html {
          scroll-behavior: smooth !important;
        }
      `
    });
    logger.success('Demo styles injected successfully');
  } catch (error) {
    logger.error('Failed to inject demo styles', { error: error.message });
    throw error;
  } finally {
    endTimer('injectDemoStyles');
  }
}

// Helper function to smoothly move mouse and click
async function smoothClick(page, selector, options = {}) {
  startTimer(`click_${selector}`);
  logger.debug(`Attempting to click element: ${selector}`, { expectNavigation: options.expectNavigation });
  
  try {
    const element = await page.$(selector);
    if (!element) {
      logger.warn(`Element not found: ${selector}`);
      logger.debug('Available elements on page', {
        buttons: await page.$$eval('button', els => els.map(e => e.textContent?.trim()).slice(0, 5)),
        links: await page.$$eval('a', els => els.map(e => e.href).slice(0, 5))
      });
      return false;
    }
    
    const box = await element.boundingBox();
    if (!box) {
      logger.warn(`Element not visible: ${selector}`);
      return false;
    }
    
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    
    logger.debug('Element found and visible', {
      selector,
      position: { x, y },
      size: { width: box.width, height: box.height }
    });
    
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.classList.add('demo-click-highlight');
        setTimeout(() => el.classList.remove('demo-click-highlight'), 500);
      }
    }, selector);
    
    await page.waitForTimeout(CONFIG.timings.hoverDelay);
    logger.debug('Moving mouse to element');
    await page.mouse.move(x, y, { steps: 10 });
    await page.waitForTimeout(CONFIG.timings.clickDelay);
    
    const currentUrl = page.url();
    logger.step(`Clicking element: ${selector}`);
    
    if (options.expectNavigation) {
      await element.click();
      logger.debug('Waiting for navigation after click');
    } else {
      await element.click();
      await page.waitForTimeout(CONFIG.timings.waitAfterAction);
    }
    
    if (options.expectNavigation) {
      const newUrl = page.url();
      if (newUrl !== currentUrl) {
        logger.success(`Navigation successful: ${currentUrl} → ${newUrl}`);
      }
    }
    
    const duration = endTimer(`click_${selector}`);
    logger.success(`Click completed: ${selector}`, { duration: `${duration}ms` });
    return true;
  } catch (error) {
    endTimer(`click_${selector}`);
    logger.error(`Error clicking ${selector}`, { 
      error: error.message,
      stack: CONFIG.logging.verbose ? error.stack : undefined
    });
    return false;
  }
}

// Helper function to type with visible cursor
async function typeWithCursor(page, selector, text) {
  startTimer(`type_${selector}`);
  logger.debug(`Typing into element: ${selector}`, { textLength: text.length, preview: text.substring(0, 50) + '...' });
  
  try {
    const element = await page.$(selector);
    if (!element) {
      logger.warn(`Input not found: ${selector}`);
      logger.debug('Searching for available input elements', {
        inputs: await page.$$eval('input, textarea', els => els.map(e => ({
          type: e.tagName.toLowerCase(),
          placeholder: e.placeholder || 'no placeholder',
          id: e.id || 'no id'
        })).slice(0, 5))
      });
      return false;
    }
    
    logger.step(`Focusing input: ${selector}`);
    await element.focus();
    await page.waitForTimeout(300);
    
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.border = '3px solid rgba(16, 185, 129, 0.6)';
        el.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.3)';
      }
    }, selector);
    
    await page.waitForTimeout(200);
    
    logger.step(`Typing text (${text.length} characters)...`);
    let typedChars = 0;
    for (const char of text) {
      await element.type(char, { delay: CONFIG.timings.typeDelay });
      typedChars++;
      if (typedChars % 20 === 0) {
        logger.debug(`Typed ${typedChars}/${text.length} characters`);
      }
    }
    
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.border = '';
        el.style.boxShadow = '';
      }
    }, selector);
    
    await page.waitForTimeout(CONFIG.timings.waitAfterAction);
    
    const duration = endTimer(`type_${selector}`);
    logger.success(`Typing completed: ${selector}`, { 
      characters: text.length,
      duration: `${duration}ms`
    });
    return true;
  } catch (error) {
    endTimer(`type_${selector}`);
    logger.error(`Error typing into ${selector}`, { 
      error: error.message,
      stack: CONFIG.logging.verbose ? error.stack : undefined
    });
    return false;
  }
}

// Helper function to smooth scroll
async function smoothScroll(page, pixels) {
  logger.debug(`Scrolling ${pixels}px`);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  
  await page.evaluate((px) => {
    window.scrollBy({ top: px, behavior: 'smooth' });
  }, pixels);
  
  await page.waitForTimeout(CONFIG.timings.scrollDelay);
  
  const scrollAfter = await page.evaluate(() => window.scrollY);
  logger.debug(`Scroll completed`, { 
    before: scrollBefore, 
    after: scrollAfter, 
    actualScroll: scrollAfter - scrollBefore 
  });
}

async function createDemoVideo() {
  const scriptStartTime = Date.now();
  
  logger.section('🎬 MVP DEMO VIDEO CREATION');
  logger.info('Configuration', {
    frontendUrl: CONFIG.frontendUrl,
    videoPath: CONFIG.videoPath,
    videoOptions: CONFIG.videoOptions,
    timings: CONFIG.timings
  });
  
  // Check if video directory exists
  const videosDir = path.dirname(CONFIG.videoPath);
  logger.step(`Checking videos directory: ${videosDir}`);
  if (!fs.existsSync(videosDir)) {
    logger.info('Creating videos directory');
    fs.mkdirSync(videosDir, { recursive: true });
    logger.success('Videos directory created');
  } else {
    logger.success('Videos directory exists');
  }
  
  // Check if video file already exists
  if (fs.existsSync(CONFIG.videoPath)) {
    const existingSize = fs.statSync(CONFIG.videoPath).size;
    logger.warn('Video file already exists', { 
      path: CONFIG.videoPath,
      size: `${(existingSize / 1024 / 1024).toFixed(2)} MB`
    });
  }
  
  let browser;
  let page;
  let recorder;

  try {
    // Launch browser
    logger.section('🌐 BROWSER SETUP');
    startTimer('browser_launch');
    logger.step('Launching Puppeteer browser...');
    
    browser = await puppeteer.launch({
      headless: false,
      args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
      defaultViewport: null,
    });
    
    const launchDuration = endTimer('browser_launch');
    logger.success('Browser launched successfully', { duration: `${launchDuration}ms` });

    page = await browser.newPage();
    logger.step('Creating new page');
    
    await page.setViewport({ width: 1920, height: 1080 });
    logger.success('Viewport set', { width: 1920, height: 1080 });
    
    // Log page events for debugging
    page.on('console', msg => {
      if (CONFIG.logging.verbose) {
        logger.debug(`Browser console: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', error => {
      logger.error('Page error', { error: error.message });
    });
    
    page.on('requestfailed', request => {
      logger.warn('Request failed', { 
        url: request.url(),
        failure: request.failure()?.errorText 
      });
    });

    // Inject demo styles
    await injectDemoStyles(page);

    // Start screen recording
    logger.section('🎥 VIDEO RECORDING');
    startTimer('recording_start');
    logger.step('Initializing screen recorder...');
    
    recorder = new PuppeteerScreenRecorder(page, CONFIG.videoOptions);
    logger.info('Recorder configuration', CONFIG.videoOptions);
    
    logger.step(`Starting recording to: ${CONFIG.videoPath}`);
    await recorder.start(CONFIG.videoPath);
    
    const recordingStartDuration = endTimer('recording_start');
    logger.success('Recording started', { duration: `${recordingStartDuration}ms` });

    // ============================================
    // SECTION 1: NAVIGATE TO RESEARCH PAGE
    // ============================================
    logger.section('🔬 SECTION 1: RESEARCH PAGE');
    logger.progress(1, 2, 'Navigating to Research Page');
    startTimer('research_navigation');
    
    logger.step(`Navigating directly to research page: ${CONFIG.frontendUrl}/research`);
    await page.goto(`${CONFIG.frontendUrl}/research`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000); // Wait for page to fully load
    
    const researchUrl = page.url();
    const researchTitle = await page.title();
    const researchNavDuration = endTimer('research_navigation');
    logger.success('Research page loaded', { 
      url: researchUrl,
      title: researchTitle,
      duration: `${researchNavDuration}ms`
    });
    
    // Brief pause to show the page
    await page.waitForTimeout(2000);

    // ============================================
    // SECTION 2: FEATURE 1 - ASK CLINICAL QUESTIONS
    // ============================================
    logger.section('💬 SECTION 2: FEATURE 1 - ASK CLINICAL QUESTIONS');
    logger.progress(1, 2, 'Feature 1: Ask Clinical Questions');
    startTimer('chat_demo');
    
    // Wait for chat interface
    logger.step('Waiting for chat interface to load...');
    try {
      await page.waitForSelector('input[type="text"], textarea', { timeout: 10000 });
      logger.success('Chat input found');
      await page.waitForTimeout(1500);
    } catch (error) {
      logger.error('Chat input not found', { error: error.message });
      throw error;
    }
    
    // Type question
    const question = "What are the latest treatment options for type 2 diabetes?";
    const inputSelector = 'input[type="text"], textarea';
    logger.info('Preparing to type question', { question });
    await typeWithCursor(page, inputSelector, question);
    
    // Click send button
    logger.step('Looking for send button...');
    const sendButton = await page.$('form button[type="submit"]');
    if (sendButton) {
      logger.success('Send button found via form selector');
      await smoothClick(page, 'form button[type="submit"]');
    } else {
      logger.debug('Trying alternative method to find send button');
      // Try to find send button by text
      const sendButtons = await page.$$('button');
      logger.debug(`Found ${sendButtons.length} buttons, searching for "Send"...`);
      
      let found = false;
      for (const btn of sendButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.toLowerCase().includes('send')) {
          logger.success(`Found send button with text: "${text.trim()}"`);
          const btnXPath = `//button[contains(., "${text.trim()}")]`;
          const btnElements = await page.$x(btnXPath);
          if (btnElements.length > 0) {
            await btnElements[0].click();
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        logger.warn('Send button not found, trying Enter key');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(CONFIG.timings.waitAfterAction);
      }
    }

    // Wait for response
    logger.step('Waiting for AI response...');
    startTimer('ai_response');
    try {
      await page.waitForSelector('[class*="message"], [class*="Message"], [class*="answer"]', { timeout: 60000 });
      const responseDuration = endTimer('ai_response');
      logger.success('AI response received', { duration: `${responseDuration}ms` });
      
      await page.waitForTimeout(5000); // Wait for answer to fully render
      
      const messages = await page.$$('[class*="message"], [class*="Message"], [class*="answer"]');
      logger.debug(`Found ${messages.length} message elements`);
    } catch (error) {
      endTimer('ai_response');
      logger.warn('Response timeout, continuing...', { error: error.message });
      await page.waitForTimeout(3000);
    }

    // Scroll through answer thoroughly to show complete response
    logger.step('Scrolling through complete answer to show all content');
    await page.evaluate(() => {
      const messages = document.querySelector('[class*="message"], [class*="Message"], [class*="answer"]');
      if (messages) {
        messages.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    await page.waitForTimeout(3000);
    
    // Scroll multiple times to show all content clearly
    await smoothScroll(page, 500);
    await page.waitForTimeout(2500);
    await smoothScroll(page, 500);
    await page.waitForTimeout(2500);
    await smoothScroll(page, 500);
    await page.waitForTimeout(2500);

    // Show citations clearly
    logger.step('Highlighting citations in the answer...');
    const citations = await page.$$('[class*="citation"], [class*="Citation"], a[href*="pubmed"]');
    if (citations.length > 0) {
      logger.success(`Found ${citations.length} citations`);
      // Scroll to show citations
      await page.evaluate((el) => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, citations[0]);
      await page.waitForTimeout(3000); // Longer pause to show citations
    } else {
      logger.warn('No citations found');
    }

    // Show PDF download button clearly
    logger.step('Showing PDF download option...');
    const pdfButtonXPath = '//button[contains(., "Download PDF") or contains(., "PDF")]';
    const pdfButtonElements = await page.$x(pdfButtonXPath);
    if (pdfButtonElements.length > 0) {
      logger.success(`Found ${pdfButtonElements.length} PDF download button(s)`);
      const pdfButton = pdfButtonElements[0];
      await page.evaluate((el) => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, pdfButton);
      await page.waitForTimeout(3000); // Longer pause to show PDF option
      
      const pdfBox = await pdfButton.boundingBox();
      if (pdfBox) {
        logger.debug('Hovering over PDF button to highlight');
        await page.mouse.move(pdfBox.x + pdfBox.width / 2, pdfBox.y + pdfBox.height / 2, { steps: 5 });
        await page.waitForTimeout(2000); // Show hover effect
      }
    } else {
      logger.warn('PDF download button not found');
    }
    
    // Brief pause before switching to next feature
    await page.waitForTimeout(2000);
    
    const chatDemoDuration = endTimer('chat_demo');
    logger.success('Chat demo completed', { duration: `${chatDemoDuration}ms` });

    // ============================================
    // SECTION 2 (CONTINUED): FEATURE 2 - SEARCH MEDICAL PAPERS
    // ============================================
    logger.section('🔍 SECTION 2 (CONTINUED): FEATURE 2 - SEARCH MEDICAL PAPERS');
    logger.progress(2, 2, 'Feature 2: Search Medical Papers');
    startTimer('search_demo');
    
    // Switch to search tab
    logger.step('Switching to search tab...');
    const searchTabXPath = '//button[contains(., "Search")] | //*[@role="tab"][contains(., "Search")]';
    const searchTabElements = await page.$x(searchTabXPath);
    
    if (searchTabElements.length > 0) {
      logger.success(`Found ${searchTabElements.length} search tab(s)`);
      await searchTabElements[0].click();
      await page.waitForTimeout(2000);
    } else {
      logger.debug('Trying alternative method to find search tab');
      // Try clicking on search-related elements
      const searchTabs = await page.$$('[role="tab"], button');
      logger.debug(`Found ${searchTabs.length} potential tab elements`);
      
      let found = false;
      for (const tab of searchTabs) {
        const text = await page.evaluate(el => el.textContent, tab);
        if (text && text.toLowerCase().includes('search')) {
          logger.success(`Found search tab with text: "${text.trim()}"`);
          await tab.click();
          await page.waitForTimeout(2000);
          found = true;
          break;
        }
      }
      
      if (!found) {
        logger.warn('Search tab not found, continuing...');
      }
    }
    
    // Wait for search input
    logger.step('Waiting for search input...');
    try {
      await page.waitForSelector('input[type="text"], input[type="search"], textarea', { timeout: 10000 });
      logger.success('Search input found');
      await page.waitForTimeout(1500);
    } catch (error) {
      logger.error('Search input not found', { error: error.message });
    }
    
    // Type search query
    const searchQuery = "diabetes treatment guidelines 2024";
    logger.info('Preparing to type search query', { query: searchQuery });
    const searchInput = await page.$('input[type="text"], input[type="search"], textarea');
    if (searchInput) {
      await typeWithCursor(page, 'input[type="text"], input[type="search"], textarea', searchQuery);
    } else {
      logger.error('Search input element not available');
    }

    // Click search button
    logger.step('Looking for search button...');
    const searchButton = await page.$('button[type="submit"]');
    if (searchButton) {
      logger.success('Search button found');
      await smoothClick(page, 'button[type="submit"]');
    } else {
      logger.debug('Search button not found, using Enter key');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(CONFIG.timings.waitAfterAction);
    }

    // Wait for search results
    logger.step('Waiting for search results...');
    startTimer('search_results');
    try {
      await page.waitForSelector('[class*="result"], [class*="paper"], [class*="card"]', { timeout: 60000 });
      const resultsDuration = endTimer('search_results');
      logger.success('Search results received', { duration: `${resultsDuration}ms` });
      
      await page.waitForTimeout(4000);
      
      const results = await page.$$('[class*="result"], [class*="paper"], [class*="card"]');
      logger.debug(`Found ${results.length} result elements`);
    } catch (error) {
      endTimer('search_results');
      logger.warn('Search results timeout, continuing...', { error: error.message });
      await page.waitForTimeout(3000);
    }

    // Scroll through results thoroughly to show all papers clearly
    logger.step('Scrolling through search results to show all papers');
    await smoothScroll(page, 600);
    await page.waitForTimeout(3000); // Longer pause to read results
    
    await smoothScroll(page, 600);
    await page.waitForTimeout(3000);
    
    await smoothScroll(page, 600);
    await page.waitForTimeout(3000);
    
    // Scroll to bottom to show all results
    await page.evaluate(() => {
      const container = document.querySelector('[class*="result"], [class*="paper"], [class*="card"]');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(3000);

    // Show PDF download for search results clearly
    logger.step('Highlighting PDF download option for search results...');
    const searchPdfButtons = await page.$x('//button[contains(., "Download PDF") or contains(., "PDF")]');
    if (searchPdfButtons.length > 0) {
      logger.success(`Found ${searchPdfButtons.length} PDF download button(s) in results`);
      const searchPdfButton = searchPdfButtons[0];
      await page.evaluate((el) => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, searchPdfButton);
      await page.waitForTimeout(3000); // Longer pause to show PDF option
      
      // Hover to highlight
      const pdfBox = await searchPdfButton.boundingBox();
      if (pdfBox) {
        await page.mouse.move(pdfBox.x + pdfBox.width / 2, pdfBox.y + pdfBox.height / 2, { steps: 5 });
        await page.waitForTimeout(2000);
      }
    } else {
      logger.warn('PDF download button not found in search results');
    }
    
    const searchDemoDuration = endTimer('search_demo');
    logger.success('Search demo completed', { duration: `${searchDemoDuration}ms` });
    
    // Final pause to show the complete search results
    logger.step('Final pause to show complete search results');
    await page.waitForTimeout(3000);

    // Stop recording
    logger.section('✅ STOPPING RECORDING');
    startTimer('recording_stop');
    logger.step('Stopping screen recorder...');
    
    try {
      await recorder.stop();
      logger.success('Recorder stopped');
    } catch (error) {
      logger.error('Error stopping recorder', { error: error.message });
      throw error;
    }
    
    const recordingStopDuration = endTimer('recording_stop');
    const totalDuration = Date.now() - scriptStartTime;
    
    // Wait longer for file to be fully written and encoded by FFmpeg
    logger.step('Waiting for video file to be finalized and encoded...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Increased to 10 seconds
    
    // Verify video file was created and is valid
    if (fs.existsSync(CONFIG.videoPath)) {
      const stats = fs.statSync(CONFIG.videoPath);
      const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
      const fileSizeBytes = stats.size;
      
      logger.success('Recording stopped successfully', { 
        duration: `${recordingStopDuration}ms` 
      });
      
      // Validate file size (should be at least 1MB for a proper video)
      if (fileSizeBytes < 1024 * 1024) {
        logger.error('Video file is too small - likely corrupted or incomplete!', {
          size: `${fileSizeMB} MB`,
          expected: 'At least 1 MB'
        });
        throw new Error('Video file is too small - recording may have failed');
      }
      
      // Check if file is growing (indicates it's still being written)
      const initialSize = fileSizeBytes;
      await new Promise(resolve => setTimeout(resolve, 2000));
      const finalSize = fs.statSync(CONFIG.videoPath).size;
      
      if (finalSize !== initialSize) {
        logger.warn('Video file is still being written, waiting...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      logger.section('🎉 VIDEO CREATION COMPLETE');
      logger.success('Demo video created successfully!', {
        path: CONFIG.videoPath,
        size: `${fileSizeMB} MB`,
        totalTime: `${Math.round(totalDuration / 1000)}s`
      });
      
      logger.info('Video Statistics', {
        fileSize: `${fileSizeMB} MB`,
        totalDuration: `${Math.round(totalDuration / 1000)}s`,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString()
      });
      
      // Verify file is readable
      try {
        const fileHandle = fs.openSync(CONFIG.videoPath, 'r');
        fs.closeSync(fileHandle);
        logger.success('Video file is readable');
      } catch (error) {
        logger.error('Video file is not readable!', { error: error.message });
        throw error;
      }
    } else {
      logger.error('Video file was not created!', { expectedPath: CONFIG.videoPath });
      throw new Error('Video file was not created');
    }

  } catch (error) {
    logger.section('❌ ERROR OCCURRED');
    logger.error('Error creating video', { 
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Log current page state for debugging
    if (page) {
      try {
        const currentUrl = page.url();
        const currentTitle = await page.title();
        logger.debug('Page state at error', {
          url: currentUrl,
          title: currentTitle
        });
      } catch (e) {
        logger.debug('Could not get page state', { error: e.message });
      }
    }
    
    if (recorder) {
      try {
        logger.step('Attempting to stop recorder...');
        await recorder.stop();
        logger.success('Recorder stopped');
      } catch (e) {
        logger.error('Error stopping recorder', { error: e.message });
      }
    }
    throw error;
  } finally {
    logger.section('🧹 CLEANUP');
    if (browser) {
      logger.step('Closing browser...');
      await browser.close();
      logger.success('Browser closed');
    }
    
    // Log remaining timers
    if (timers.size > 0 && CONFIG.logging.verbose) {
      logger.debug('Remaining active timers', Array.from(timers.keys()));
    }
  }
}

// Run the script
createDemoVideo()
  .then(() => {
    logger.section('✨ SUCCESS');
    logger.success('Video creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    logger.section('💥 FAILURE');
    logger.error('Video creation failed', { 
      error: error.message,
      stack: CONFIG.logging.verbose ? error.stack : undefined
    });
    process.exit(1);
  });

