const { chromium } = require('playwright');
const { addExtra } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

/**
 * Cookie Extractor Configuration
 */
const COOKIE_CONFIG = {
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ],
  viewports: [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 }
  ],
  launchArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    '--disable-web-security',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ],
  timeouts: {
    pageLoad: 30000,
    navigation: 15000
  }
};

/**
 * Get random element from array
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Random delay between min and max milliseconds
 */
function randomDelay(min = 1000, max = 3000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Generate realistic browser headers
 */
function generateHeaders(userAgent) {
  return {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1'
  };
}

/**
 * Extract cookies from NSE website using Playwright
 * @param {string} targetUrl - The NSE URL to extract cookies from
 * @returns {Promise<{cookies: string, userAgent: string}>} - Formatted cookie string and user agent
 */
async function extractNSECookies(targetUrl = 'https://www.nseindia.com/companies-listing/corporate-filings-announcements') {
  console.log('🍪 Starting cookie extraction from NSE website...');

  let browser, context, page;

  try {
    // Initialize browser with stealth configuration
    const userAgent = getRandomElement(COOKIE_CONFIG.userAgents);
    const viewport = getRandomElement(COOKIE_CONFIG.viewports);

    console.log(`🚀 Launching headless browser (${viewport.width}x${viewport.height})`);

    // Create enhanced Chromium instance with stealth plugin
    const chromiumWithStealth = addExtra(chromium);
    chromiumWithStealth.use(StealthPlugin());

    browser = await chromiumWithStealth.launch({
      headless: true,
      args: COOKIE_CONFIG.launchArgs,
      ignoreDefaultArgs: ['--enable-automation'],
      ignoreHTTPSErrors: true,
      devtools: false
    });

    // Create context with realistic fingerprint
    context = await browser.newContext({
      userAgent,
      viewport,
      locale: 'en-US',
      timezoneId: 'Asia/Kolkata',
      extraHTTPHeaders: generateHeaders(userAgent),
      permissions: ['geolocation']
    });

    // Add stealth properties
    await context.addInitScript(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => ({
          length: 4,
          0: { name: "Chrome PDF Plugin" },
          1: { name: "Chrome PDF Viewer" },
          2: { name: "Native Client" },
          3: { name: "WebKit built-in PDF" }
        }),
      });

      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });

    // Create page
    page = await context.newPage();
    await page.setDefaultTimeout(COOKIE_CONFIG.timeouts.pageLoad);

    console.log(`🌐 Navigating to: ${targetUrl}`);

    // Navigate to NSE corporate filings page
    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: COOKIE_CONFIG.timeouts.pageLoad
    });

    console.log('✅ Page loaded successfully');

    // Wait for page to stabilize
    await randomDelay(2000, 4000);

    // Check for cookie consent banner and accept if present
    try {
      const cookieAcceptSelectors = [
        'button[id*="accept"]',
        'button[class*="accept"]',
        'button:has-text("Accept")',
        'button:has-text("I Agree")',
        'button:has-text("OK")',
        '.cookie-accept',
        '.accept-cookies',
        '#cookie-accept'
      ];

      for (const selector of cookieAcceptSelectors) {
        try {
          const acceptButton = await page.waitForSelector(selector, { timeout: 3000 });
          if (acceptButton) {
            console.log('🍪 Found cookie consent banner, accepting...');
            await acceptButton.click();
            await randomDelay(1000, 2000);
            break;
          }
        } catch (error) {
          // Continue to next selector
          continue;
        }
      }
    } catch (error) {
      console.log('ℹ️ No cookie consent banner found or already accepted');
    }

    // Wait for any dynamic content to load
    await randomDelay(3000, 5000);

    // Extract all cookies from the context
    const cookies = await context.cookies();
    console.log(`✅ Extracted ${cookies.length} cookies from NSE`);

    // Format cookies as a string suitable for HTTP requests
    const cookieString = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    console.log('🍪 Cookie extraction completed successfully');

    return {
      cookies: cookieString,
      userAgent,
      cookieCount: cookies.length,
      extractedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Cookie extraction failed:', error.message);
    throw new Error(`Failed to extract cookies from NSE: ${error.message}`);

  } finally {
    // Cleanup browser resources
    try {
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
    } catch (cleanupError) {
      console.error('⚠️ Browser cleanup failed:', cleanupError.message);
    }
  }
}

module.exports = {
  extractNSECookies
};
