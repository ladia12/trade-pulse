const { chromium } = require('playwright');
const NodeCache = require('node-cache');

// Cache with 1-hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * NSE Scraper Configuration
 */
const SCRAPER_CONFIG = {
  // User agents from real browsers
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  ],

  // Realistic viewport sizes
  viewports: [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 }
  ],

  // Browser launch arguments
  launchArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-features=TranslateUI',
    '--disable-ipc-flooding-protection'
  ],

  // Timeouts
  timeouts: {
    pageLoad: 30000,
    elementWait: 10000,
    navigation: 15000
  }
};

/**
 * Get random user agent
 */
function getRandomUserAgent() {
  return SCRAPER_CONFIG.userAgents[Math.floor(Math.random() * SCRAPER_CONFIG.userAgents.length)];
}

/**
 * Get random viewport
 */
function getRandomViewport() {
  return SCRAPER_CONFIG.viewports[Math.floor(Math.random() * SCRAPER_CONFIG.viewports.length)];
}

/**
 * Generate realistic headers
 */
function generateHeaders(userAgent) {
  return {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.nseindia.com/',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1'
  };
}

/**
 * Add random delay
 */
function randomDelay(min = 2000, max = 5000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Simulate human-like mouse movement
 */
async function simulateHumanMovement(page) {
  try {
    // Get random coordinates within viewport
    const viewport = page.viewportSize();
    const x = Math.floor(Math.random() * viewport.width);
    const y = Math.floor(Math.random() * viewport.height);

    // Move mouse in realistic trajectory
    await page.mouse.move(x, y, { steps: 10 });
    await randomDelay(500, 1500);
  } catch (error) {
    console.log('🔄 [MOVEMENT] Mouse movement failed, continuing...');
  }
}

/**
 * Simulate random scrolling
 */
async function simulateScrolling(page) {
  try {
    // Random scroll amount
    const scrollAmount = Math.floor(Math.random() * 500) + 100;
    await page.evaluate((amount) => {
      window.scrollBy(0, amount);
    }, scrollAmount);
    await randomDelay(1000, 2000);
  } catch (error) {
    console.log('🔄 [SCROLL] Scrolling failed, continuing...');
  }
}

/**
 * Type with human-like delays
 */
async function humanTypeText(page, selector, text) {
  const element = await page.waitForSelector(selector, { timeout: SCRAPER_CONFIG.timeouts.elementWait });

  // Clear existing text using triple-click and type
  await element.click({ clickCount: 3 });
  await randomDelay(200, 400);

  // Type new text character by character
  for (let i = 0; i < text.length; i++) {
    await element.type(text[i]);
    await randomDelay(100, 200); // Human typing speed
  }
}

/**
 * Initialize browser with stealth configuration
 */
async function initializeBrowser() {
  const userAgent = getRandomUserAgent();
  const viewport = getRandomViewport();

  console.log(`🚀 [BROWSER] Initializing browser with UA: ${userAgent.substring(0, 50)}...`);
  console.log(`📐 [BROWSER] Viewport: ${viewport.width}x${viewport.height}`);

  const browser = await chromium.launch({
    headless: process.env.NODE_ENV === 'production',
    args: SCRAPER_CONFIG.launchArgs,
    ignoreDefaultArgs: ['--enable-automation']
  });

  const context = await browser.newContext({
    userAgent,
    viewport,
    locale: 'en-US',
    timezoneId: 'Asia/Kolkata',
    geolocation: { latitude: 12.9716, longitude: 77.5946 }, // Bangalore
    permissions: ['geolocation'],
    extraHTTPHeaders: generateHeaders(userAgent)
  });

  // Override navigator properties for stealth
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });

    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });

    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });

    // Mock Chrome runtime
    Object.defineProperty(window, 'chrome', {
      value: {
        runtime: {},
      },
    });
  });

  const page = await context.newPage();

  // Set additional page configurations
  await page.setDefaultTimeout(SCRAPER_CONFIG.timeouts.pageLoad);
  await page.setDefaultNavigationTimeout(SCRAPER_CONFIG.timeouts.navigation);

  return { browser, context, page };
}

/**
 * Establish NSE session by visiting homepage
 */
async function establishNSESession(page) {
  console.log('🏠 [SESSION] Visiting NSE homepage to establish session...');

  try {
    await page.goto('https://www.nseindia.com/', {
      waitUntil: 'networkidle',
      timeout: SCRAPER_CONFIG.timeouts.pageLoad
    });

    // Wait for page to fully load
    await randomDelay(5000, 8000);

    // Simulate human behavior
    await simulateHumanMovement(page);
    await simulateScrolling(page);

    console.log('✅ [SESSION] NSE session established successfully');
    return true;
  } catch (error) {
    console.error('❌ [SESSION] Failed to establish NSE session:', error.message);
    throw new Error('Failed to establish NSE session');
  }
}

/**
 * Navigate to corporate filings page
 */
async function navigateToFilingsPage(page) {
  console.log('📄 [NAVIGATION] Navigating to corporate filings page...');

  try {
    // Try multiple URLs for corporate filings
    const filingUrls = [
      'https://www.nseindia.com/companies-listing/corporate-filings-announcements',
      'https://www.nseindia.com/corporates/content/corporate_announcements.htm',
      'https://www.nseindia.com/corporates/content/corp_filing.html'
    ];

    let success = false;
    for (const url of filingUrls) {
      try {
        console.log(`🔍 [NAVIGATION] Trying URL: ${url}`);

        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        });

        // Wait for basic page structure
        await randomDelay(2000, 4000);

        // Check if page loaded successfully
        const title = await page.title();
        console.log(`📖 [NAVIGATION] Page title: ${title}`);

        if (title.includes('Just a moment') || title.includes('Checking your browser')) {
          console.log('🛡️ [PROTECTION] Detected protection screen, waiting...');
          await page.waitForSelector('body', { timeout: 30000 });
          await randomDelay(10000, 15000);
        }

        // Check if we can find filing-related elements
        const hasFilingElements = await page.evaluate(() => {
          const searchInput = document.querySelector('input[placeholder*="Company"], input[placeholder*="company"], input[name*="company"], input[type="text"]');
          const table = document.querySelector('table, .data-table, .filings-table');
          return !!(searchInput || table);
        });

        if (hasFilingElements) {
          console.log('✅ [NAVIGATION] Successfully reached corporate filings page');
          success = true;
          break;
        } else {
          console.log('⚠️ [NAVIGATION] Page loaded but no filing elements found, trying next URL...');
        }

      } catch (urlError) {
        console.log(`❌ [NAVIGATION] Failed to load ${url}: ${urlError.message}`);
        continue;
      }
    }

    if (!success) {
      throw new Error('Could not access any corporate filings page');
    }

    return true;
  } catch (error) {
    console.error('❌ [NAVIGATION] Failed to navigate to filings page:', error.message);
    throw new Error('Failed to navigate to corporate filings page');
  }
}

/**
 * Search for company filings
 */
async function searchCompanyFilings(page, companyName) {
  console.log(`🔍 [SEARCH] Searching for company: ${companyName}`);

  try {
    // Multiple selector strategies for company search
    const searchSelectors = [
      'input[placeholder*="Company"]',
      'input[placeholder*="company"]',
      'input[name*="company"]',
      'input[id*="company"]',
      '.search-input',
      '#company-search',
      'input[type="text"]'
    ];

        let searchInput = null;
    let workingSelector = null;

    for (const selector of searchSelectors) {
      try {
        searchInput = await page.waitForSelector(selector, { timeout: 5000 });
        if (searchInput) {
          console.log(`✅ [SEARCH] Found search input with selector: ${selector}`);
          workingSelector = selector;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!searchInput || !workingSelector) {
      throw new Error('Could not find company search input field');
    }

    // Clear and type company name using the working selector
    await humanTypeText(page, workingSelector, companyName);
    await randomDelay(2000, 3000);

    // Wait for search suggestions or results
    const suggestionSelectors = [
      '.suggestion-list',
      '.dropdown-menu',
      '.search-results',
      '.company-list'
    ];

    let suggestionFound = false;
    for (const selector of suggestionSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        suggestionFound = true;
        break;
      } catch (error) {
        continue;
      }
    }

    if (suggestionFound) {
      // Click on first suggestion or exact match
      const suggestions = await page.$$('.suggestion-item, .dropdown-item, .search-result-item');
      if (suggestions.length > 0) {
        await suggestions[0].click();
        await randomDelay(2000, 4000);
      }
    } else {
      // Press Enter to search
      await page.keyboard.press('Enter');
      await randomDelay(3000, 5000);
    }

    console.log('✅ [SEARCH] Company search completed');
    return true;
  } catch (error) {
    console.error('❌ [SEARCH] Company search failed:', error.message);
    throw new Error(`Failed to search for company: ${companyName}`);
  }
}

/**
 * Extract filing data from results
 */
async function extractFilingData(page, companyName) {
  console.log(`📊 [EXTRACTION] Extracting filing data for: ${companyName}`);

  try {
    // Wait for results to load
    await randomDelay(3000, 5000);

    // Multiple selectors for results table
    const tableSelectors = [
      'table.filings-table',
      'table.results-table',
      '.filings-container table',
      '.results-container table',
      'table tbody',
      '.data-table'
    ];

    let resultsTable = null;
    for (const selector of tableSelectors) {
      try {
        resultsTable = await page.waitForSelector(selector, { timeout: 5000 });
        if (resultsTable) break;
      } catch (error) {
        continue;
      }
    }

    if (!resultsTable) {
      console.log('⚠️ [EXTRACTION] No results table found, checking for "no results" message');
      return [];
    }

    // Extract filing data
    const filings = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr, .filing-row, .result-row'));
      const currentDate = new Date();
      const sevenDaysAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));

      return rows.map(row => {
        try {
          const cells = Array.from(row.querySelectorAll('td, .filing-cell'));
          if (cells.length < 3) return null;

          // Extract date (first column usually)
          const dateText = cells[0]?.textContent?.trim() || '';
          const dateFormats = [
            /(\d{1,2})-(\d{1,2})-(\d{4})/,  // DD-MM-YYYY
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
            /(\d{1,2})-([A-Za-z]{3})-(\d{4})/ // DD-MMM-YYYY
          ];

          let filingDate = null;
          for (const format of dateFormats) {
            const match = dateText.match(format);
            if (match) {
              const [, day, month, year] = match;
              filingDate = new Date(year, month - 1, day);
              break;
            }
          }

          if (!filingDate || filingDate < sevenDaysAgo) {
            return null; // Skip if older than 7 days
          }

          // Extract subject/title (second column usually)
          const subject = cells[1]?.textContent?.trim() || '';

          // Extract description (third column usually)
          const description = cells[2]?.textContent?.trim() || '';

          // Extract PDF links
          const pdfLinks = Array.from(row.querySelectorAll('a[href*=".pdf"]'))
            .map(link => link.href);

          // Extract other attachment links
          const attachments = Array.from(row.querySelectorAll('a[href]'))
            .map(link => ({
              url: link.href,
              text: link.textContent?.trim() || ''
            }))
            .filter(att => att.url && !att.url.includes('.pdf'));

          return {
            date: filingDate.toISOString().split('T')[0],
            subject,
            description,
            pdfLink: pdfLinks[0] || null,
            attachments
          };
        } catch (error) {
          console.error('Error processing row:', error);
          return null;
        }
      }).filter(filing => filing !== null);
    });

    console.log(`✅ [EXTRACTION] Extracted ${filings.length} filings from last 7 days`);
    return filings;

  } catch (error) {
    console.error('❌ [EXTRACTION] Failed to extract filing data:', error.message);
    throw new Error('Failed to extract filing data');
  }
}

/**
 * Main scraping function with retry logic
 */
async function scrapeNSEFilings(companyName, options = {}) {
  const { maxRetries = 3, downloadPdfs = false } = options;
  const cacheKey = `nse_filings_${companyName.toLowerCase().replace(/\s+/g, '_')}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`📋 [CACHE] Returning cached results for: ${companyName}`);
    return cached;
  }

  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt++;
    console.log(`🔄 [ATTEMPT ${attempt}/${maxRetries}] Starting scraping for: ${companyName}`);

    let browser, context, page;

    try {
      // Initialize browser
      ({ browser, context, page } = await initializeBrowser());

      // Establish NSE session
      await establishNSESession(page);

      // Navigate to filings page
      await navigateToFilingsPage(page);

      // Search for company
      await searchCompanyFilings(page, companyName);

      // Extract filing data
      const filings = await extractFilingData(page, companyName);

      const result = {
        success: true,
        company: companyName,
        filings,
        count: filings.length,
        timestamp: new Date().toISOString(),
        cached: false
      };

      // Cache the result
      cache.set(cacheKey, result);

      console.log(`✅ [SUCCESS] Scraping completed for: ${companyName} (${filings.length} filings)`);
      return result;

    } catch (error) {
      lastError = error;
      console.error(`❌ [ATTEMPT ${attempt}] Scraping failed:`, error.message);

      if (attempt < maxRetries) {
        const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏳ [BACKOFF] Waiting ${backoffDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }

    } finally {
      // Cleanup browser resources
      try {
        if (page) await page.close();
        if (context) await context.close();
        if (browser) await browser.close();
      } catch (cleanupError) {
        console.error('⚠️ [CLEANUP] Browser cleanup failed:', cleanupError.message);
      }
    }
  }

  // All attempts failed
  console.error(`💥 [FAILED] All ${maxRetries} attempts failed for: ${companyName}`);
  throw lastError || new Error('Scraping failed after all retry attempts');
}

module.exports = {
  scrapeNSEFilings,
  SCRAPER_CONFIG
};
