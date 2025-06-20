const { chromium } = require('playwright');
const NodeCache = require('node-cache');

// Cache with 1-hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * NSE Scraper Configuration
 */
const SCRAPER_CONFIG = {
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
  ],
  viewports: [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 }
  ],
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
  timeouts: {
    pageLoad: 30000,
    elementWait: 10000,
    navigation: 15000
  },
  filingUrls: [
    'https://www.nseindia.com/companies-listing/corporate-filings-announcements',
    'https://www.nseindia.com/corporates/content/corporate_announcements.htm',
    'https://www.nseindia.com/corporates/content/corp_filing.html'
  ]
};

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Get random element from array
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Random delay between min and max milliseconds
 */
function randomDelay(min = 2000, max = 5000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Generate realistic browser headers
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
 * Simulate human-like behavior
 */
async function simulateHumanBehavior(page) {
  try {
    // Random mouse movement
    const viewport = page.viewportSize();
    const x = Math.floor(Math.random() * viewport.width);
    const y = Math.floor(Math.random() * viewport.height);
    await page.mouse.move(x, y, { steps: 10 });

    // Random scrolling
    const scrollAmount = Math.floor(Math.random() * 500) + 100;
    await page.evaluate((amount) => window.scrollBy(0, amount), scrollAmount);

    await randomDelay(1000, 2000);
  } catch (error) {
    // Silently continue if human simulation fails
  }
}

// ================================
// BROWSER MANAGEMENT
// ================================

/**
 * Initialize browser with stealth configuration
 */
async function initializeBrowser() {
  const userAgent = getRandomElement(SCRAPER_CONFIG.userAgents);
  const viewport = getRandomElement(SCRAPER_CONFIG.viewports);

  console.log(`🚀 Initializing browser (${viewport.width}x${viewport.height})`);

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
    geolocation: { latitude: 12.9716, longitude: 77.5946 },
    permissions: ['geolocation'],
    extraHTTPHeaders: generateHeaders(userAgent)
  });

  // Add stealth properties
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(window, 'chrome', { value: { runtime: {} } });
  });

  const page = await context.newPage();
  await page.setDefaultTimeout(SCRAPER_CONFIG.timeouts.pageLoad);
  await page.setDefaultNavigationTimeout(SCRAPER_CONFIG.timeouts.navigation);

  return { browser, context, page };
}

/**
 * Establish NSE session
 */
async function establishNSESession(page) {
  console.log('🏠 Establishing NSE session...');

  await page.goto('https://www.nseindia.com/', {
    waitUntil: 'networkidle',
    timeout: SCRAPER_CONFIG.timeouts.pageLoad
  });

  await randomDelay(4000, 6000);
  await simulateHumanBehavior(page);

  console.log('✅ NSE session established');
}

/**
 * Navigate to corporate filings page
 */
async function navigateToFilingsPage(page) {
  console.log('📄 Navigating to corporate filings page...');

  for (const url of SCRAPER_CONFIG.filingUrls) {
    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });

      await randomDelay(2000, 4000);

      const title = await page.title();

      // Handle protection screens
      if (title.includes('Just a moment') || title.includes('Checking your browser')) {
        console.log('🛡️ Detected protection screen, waiting...');
        await page.waitForSelector('body', { timeout: 30000 });
        await randomDelay(10000, 15000);
      }

      // Verify page has required elements
      const hasFilingElements = await page.evaluate(() => {
        const searchInput = document.querySelector('input[placeholder*="Company"], input[placeholder*="company"], input[name*="company"], input[type="text"]');
        const table = document.querySelector('table, .data-table, .filings-table');
        return !!(searchInput || table);
      });

      if (hasFilingElements) {
        console.log('✅ Successfully reached corporate filings page');
        return;
      }

    } catch (error) {
      console.log(`⚠️ Failed to load ${url}, trying next...`);
      continue;
    }
  }

  throw new Error('Could not access any corporate filings page');
}

// ================================
// SEARCH AND DROPDOWN HANDLING
// ================================

/**
 * Find and focus search input
 */
async function findSearchInput(page) {
  const searchSelectors = [
    'input[placeholder="Company Name or Symbol"]',
    'input[placeholder*="Company Name or Symbol"]',
    'input[placeholder*="Company Name"]',
    'input[placeholder*="Symbol"]',
    'input[placeholder*="Company"]',
    'input[placeholder*="Search"]',
    'input[name*="company"]',
    'input[id*="company"]',
    '.search-input',
    'input[type="text"]'
  ];

  for (const selector of searchSelectors) {
    try {
      const input = await page.waitForSelector(selector, { timeout: 3000 });
      if (input) {
        const placeholder = await input.getAttribute('placeholder');
        console.log(`✅ Found search input: "${placeholder}"`);
        return input;
      }
    } catch (error) {
      continue;
    }
  }

  throw new Error('Could not find company search input field');
}

/**
 * Type company name with human-like delays
 */
async function typeCompanyName(page, searchInput, companyName) {
  await searchInput.focus();
  await randomDelay(500, 1000);

  // Clear existing text
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Delete');
  await randomDelay(200, 500);

  // Type character by character
  for (let i = 0; i < companyName.length; i++) {
    await page.keyboard.type(companyName[i]);
    await randomDelay(100, 200);
  }
}

/**
 * Find dropdown suggestions
 */
async function findDropdown(page) {
  const dropdownSelectors = [
    '.autocompleteList',
    '.tt-suggestion',
    '.tt-menu',
    '[role="listbox"]',
    '.dropdown-menu',
    '.autocomplete-suggestions',
    '.search-suggestions',
    '.dropdown-content'
  ];

  for (const selector of dropdownSelectors) {
    try {
      const dropdown = await page.waitForSelector(selector, {
        timeout: 8000,
        state: 'visible'
      });
      if (dropdown) {
        console.log(`✅ Found dropdown: ${selector}`);
        return { dropdown, selector };
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

/**
 * Find and select best matching option
 */
async function selectBestOption(page, dropdownSelector, companyName) {
  const optionSelectors = [
    '.autocompleteList.tt-suggestion',
    '.tt-suggestion',
    '.autocompleteList',
    `${dropdownSelector} [role="option"]`,
    `${dropdownSelector} li`,
    `${dropdownSelector} .dropdown-item`,
    `${dropdownSelector} .suggestion`,
    `${dropdownSelector} .option`
  ];

  let options = [];
  for (const selector of optionSelectors) {
    try {
      options = await page.$$(selector);
      if (options.length > 0) {
        console.log(`✅ Found ${options.length} options`);
        break;
      }
    } catch (error) {
      continue;
    }
  }

  if (options.length === 0) {
    throw new Error('No dropdown options found');
  }

  // Find best matching option
  const searchTerm = companyName.toLowerCase();
  let selectedOption = null;

  for (let i = 0; i < Math.min(options.length, 10); i++) {
    try {
      const fullText = await options[i].textContent();
      const cleanText = fullText?.trim() || '';

      // Extract company name and symbol from NSE structure
      let companyNameSpan = '';
      let symbolSpan = '';

      try {
        const ltSpan = await options[i].$('.lt');
        const symbolSpanEl = await options[i].$('span:not(.lt)');

        if (ltSpan) companyNameSpan = await ltSpan.textContent();
        if (symbolSpanEl) symbolSpan = await symbolSpanEl.textContent();
      } catch (spanError) {
        // Use full text if span extraction fails
      }

      if (cleanText.length === 0) continue;

      const lowerText = cleanText.toLowerCase();
      const lowerCompanyName = companyNameSpan.toLowerCase();
      const lowerSymbol = symbolSpan.toLowerCase();

      // Priority matching logic
      if (lowerSymbol === searchTerm) {
        selectedOption = options[i];
        console.log(`🎯 Exact symbol match: "${symbolSpan}"`);
        break;
      }

      if (lowerSymbol.includes(searchTerm) || searchTerm.includes(lowerSymbol)) {
        selectedOption = options[i];
        console.log(`🎯 Symbol match: "${symbolSpan}"`);
        break;
      }

      if (lowerCompanyName.startsWith(searchTerm) || lowerText.startsWith(searchTerm)) {
        selectedOption = options[i];
        console.log(`🎯 Name match: "${companyNameSpan || cleanText}"`);
        break;
      }

      if ((lowerText.includes(searchTerm) || lowerCompanyName.includes(searchTerm)) && !selectedOption) {
        selectedOption = options[i];
        console.log(`🎯 Partial match: "${cleanText}"`);
      }
    } catch (error) {
      continue;
    }
  }

  // Fallback to first option
  if (!selectedOption && options.length > 0) {
    selectedOption = options[0];
    const firstText = await selectedOption.textContent();
    console.log(`🎯 Using first option: "${firstText?.trim()}"`);
  }

  if (!selectedOption) {
    throw new Error(`No suitable company option found for: ${companyName}`);
  }

  return selectedOption;
}

/**
 * Search for company filings with dropdown handling
 */
async function searchCompanyFilings(page, companyName) {
  console.log(`🔍 Searching for company: ${companyName}`);

  try {
    // Find and focus search input
    const searchInput = await findSearchInput(page);

    // Type company name
    await typeCompanyName(page, searchInput, companyName);

    // Wait for dropdown
    await randomDelay(1000, 2000);

    // Find dropdown
    const dropdownInfo = await findDropdown(page);

    if (!dropdownInfo) {
      console.log('⚠️ No dropdown found, trying direct search...');
      await page.keyboard.press('Enter');
      await randomDelay(3000, 5000);
      return;
    }

    // Select best option
    const selectedOption = await selectBestOption(page, dropdownInfo.selector, companyName);

    // Click selected option
    const selectedText = await selectedOption.textContent();
    console.log(`🖱️ Selecting: "${selectedText?.trim()}"`);

    try {
      await selectedOption.scrollIntoViewIfNeeded();
      await randomDelay(500, 1000);
    } catch (error) {
      // Continue if scrolling fails
    }

    await selectedOption.click();
    await randomDelay(2000, 3000);

    // Wait for dropdown to close
    try {
      await page.waitForSelector(dropdownInfo.selector, {
        state: 'hidden',
        timeout: 5000
      });
    } catch (error) {
      // Continue if dropdown doesn't close
    }

    // Wait for filings to load
    await randomDelay(3000, 5000);
    console.log('✅ Company search completed');

  } catch (error) {
    console.error('❌ Company search failed:', error.message);

    // Fallback: try direct Enter
    try {
      console.log('🔄 Attempting fallback search...');
      await page.keyboard.press('Enter');
      await randomDelay(3000, 5000);
      console.log('✅ Fallback search completed');
    } catch (fallbackError) {
      throw new Error(`Failed to search for company: ${companyName}. Error: ${error.message}`);
    }
  }
}

// ================================
// DATA EXTRACTION
// ================================

/**
 * Wait for page loading to complete
 */
async function waitForPageLoad(page) {
  const loadingSelectors = [
    '.loading',
    '.spinner',
    '.loader',
    '[data-loading]',
    '.data-loading'
  ];

  for (const selector of loadingSelectors) {
    try {
      const loading = await page.$(selector);
      if (loading) {
        console.log('⏳ Waiting for page to load...');
        await page.waitForSelector(selector, {
          state: 'hidden',
          timeout: 15000
        });
        console.log('✅ Page loaded');
        break;
      }
    } catch (error) {
      // Continue if loading indicator not found
    }
  }

  await randomDelay(2000, 3000);
}

/**
 * Find filings table
 */
async function findFilingsTable(page) {
  const tableSelectors = [
    'table',
    '.table',
    '.data-table',
    '.filings-table',
    '.results-table',
    '.filing-container table',
    '.content-table',
    '[role="table"]',
    'table.table-striped',
    'table.table-bordered'
  ];

  for (const selector of tableSelectors) {
    try {
      const tables = await page.$$(selector);
      for (const table of tables) {
        const rows = await table.$$('tbody tr, tr');
        if (rows.length > 0) {
          console.log(`✅ Found table with ${rows.length} rows`);
          return table;
        }
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

/**
 * Check for empty state
 */
async function checkEmptyState(page, companyName) {
  const noResultsSelectors = [
    '.no-results',
    '.empty-state',
    '.no-data',
    '[data-empty]',
    'p:contains("No")',
    'div:contains("No results")',
    'span:contains("No filings")'
  ];

  for (const selector of noResultsSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        const text = await element.textContent();
        console.log(`ℹ️ Empty state found: "${text?.trim()}"`);
        return true;
      }
    } catch (error) {
      continue;
    }
  }

  return false;
}

/**
 * Parse NSE date format
 */
function parseNSEDate(dateText) {
  // Clean up date text and extract NSE format: "18-Jun-2025 19:08:25"
  const cleanText = dateText.split('Exchange Received Time')[0]
                           .split('today-graph')[0]
                           .trim();

  const nseDate = cleanText.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);

  if (nseDate) {
    const [, day, monthStr, year, hour, minute, second] = nseDate;
    const months = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };

    const month = months[monthStr.toLowerCase()];
    if (month !== undefined) {
      return new Date(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
    }
  }

  // Fallback for invalid dates
  const yearMatch = cleanText.match(/(\d{4})/);
  if (yearMatch && parseInt(yearMatch[1]) < 2020) {
    return new Date(2000, 0, 1); // Very old date for filtering
  }

  return new Date(); // Current date as fallback
}

/**
 * Extract attachments from row
 */
function extractAttachments(row) {
  return Array.from(row.querySelectorAll('a[href]'))
    .map(link => ({
      url: link.href,
      text: link.textContent?.trim() || '',
      type: link.href.includes('.pdf') ? 'PDF' :
            link.href.includes('.doc') ? 'DOC' :
            link.href.includes('.xls') ? 'XLS' : 'LINK'
    }))
    .filter(att => att.url && att.text && !att.url.includes('get-quotes'));
}

/**
 * Extract filing data from NSE table
 */
async function extractFilingData(page, companyName) {
  console.log(`📊 Extracting filing data for: ${companyName}`);

  try {
    await waitForPageLoad(page);

    const resultsTable = await findFilingsTable(page);

    if (!resultsTable) {
      const hasEmptyState = await checkEmptyState(page, companyName);
      if (hasEmptyState) {
        console.log(`📝 No filings found for ${companyName}`);
        return [];
      }

      // Check for any table rows as fallback
      const allRows = await page.$$('tr');
      if (allRows.length === 0) {
        return [];
      }
    }

    // Extract filing data using page evaluation
    const filings = await page.evaluate(() => {
      // Parse NSE date format (inline function)
      function parseNSEDate(dateText) {
        const cleanText = dateText.split('Exchange Received Time')[0]
                                 .split('today-graph')[0]
                                 .trim();

        const nseDate = cleanText.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);

        if (nseDate) {
          const [, day, monthStr, year, hour, minute, second] = nseDate;
          const months = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
          };

          const month = months[monthStr.toLowerCase()];
          if (month !== undefined) {
            return new Date(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
          }
        }

        // Fallback for invalid dates
        const yearMatch = cleanText.match(/(\d{4})/);
        if (yearMatch && parseInt(yearMatch[1]) < 2020) {
          return new Date(2000, 0, 1);
        }

        return new Date();
      }

      // Extract attachments from row (inline function)
      function extractAttachments(row) {
        return Array.from(row.querySelectorAll('a[href]'))
          .map(link => ({
            url: link.href,
            text: link.textContent?.trim() || '',
            type: link.href.includes('.pdf') ? 'PDF' :
                  link.href.includes('.doc') ? 'DOC' :
                  link.href.includes('.xls') ? 'XLS' : 'LINK'
          }))
          .filter(att => att.url && att.text && !att.url.includes('get-quotes'));
      }

      const tableRows = Array.from(document.querySelectorAll('table tbody tr'));

      // Filter for NSE structure (7 columns)
      const dataRows = tableRows.filter(row => {
        const cells = row.querySelectorAll('td');
        return cells.length >= 7;
      });

      return dataRows.map((row) => {
        try {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length < 7) return null;

          // NSE Table Structure:
          // 0: SYMBOL, 1: COMPANY NAME, 2: SUBJECT, 3: DETAILS,
          // 4: ATTACHMENT, 5: FILE SIZE, 6: BROADCAST DATE/TIME

          const broadcastCell = cells[6];
          const broadcastDateText = broadcastCell?.textContent?.trim() || '';

          // Parse date using inline function
          const filingDate = parseNSEDate(broadcastDateText);

          // Extract structured data
          const symbol = cells[0]?.textContent?.trim() || '';
          const companyName = cells[1]?.textContent?.trim() || '';
          const subject = cells[2]?.textContent?.trim() || 'No subject';
          const details = cells[3]?.textContent?.trim() || 'No details';
          const fileSize = cells[5]?.textContent?.trim() || '';

          // Extract PDF link
          const attachmentCell = cells[4];
          const pdfLink = attachmentCell?.querySelector('a[href*=".pdf"]')?.href || null;

          // Extract all attachments using inline function
          const attachments = extractAttachments(row);

          return {
            date: filingDate.toISOString().split('T')[0],
            time: filingDate.toISOString().split('T')[1].split('.')[0],
            symbol,
            companyName,
            subject,
            details,
            pdfLink,
            fileSize,
            attachments,
            broadcastDateTime: broadcastDateText
          };

        } catch (error) {
          return null;
        }
      }).filter(filing => filing !== null);
    });

    // Filter for last 7 days and correct company
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
    const cutoffDateString = sevenDaysAgo.toISOString().split('T')[0];

    const recentFilings = filings.filter(filing => {
      const isRecent = filing.date >= cutoffDateString;
      const isCorrectCompany = filing.symbol.toUpperCase() === companyName.toUpperCase();
      return isRecent && isCorrectCompany;
    });

    console.log(`✅ Extracted ${filings.length} total filings`);
    console.log(`📅 Found ${recentFilings.length} recent filings for ${companyName}`);

    if (recentFilings.length > 0) {
      const uniqueDates = [...new Set(recentFilings.map(f => f.date))].sort();
      console.log(`📊 Filing dates: ${uniqueDates.join(', ')}`);
    }

    // Return recent filings, or sample for debugging if none found
    return recentFilings.length > 0 ? recentFilings : filings.slice(0, 5);

  } catch (error) {
    console.error('❌ Failed to extract filing data:', error.message);
    throw new Error(`Failed to extract filing data: ${error.message}`);
  }
}

// ================================
// MAIN SCRAPING FUNCTION
// ================================

/**
 * Cleanup browser resources
 */
async function cleanupBrowser(browser, context, page) {
  try {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  } catch (error) {
    console.error('⚠️ Browser cleanup failed:', error.message);
  }
}

/**
 * Main scraping function with retry logic
 */
async function scrapeNSEFilings(companyName, options = {}) {
  const { maxRetries = 3 } = options;
  const cacheKey = `nse_filings_${companyName.toLowerCase().replace(/\s+/g, '_')}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`📋 Returning cached results for: ${companyName}`);
    return cached;
  }

  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt++;
    console.log(`🔄 Attempt ${attempt}/${maxRetries} for: ${companyName}`);

    let browser, context, page;

    try {
      // Initialize browser and scrape
      ({ browser, context, page } = await initializeBrowser());
      await establishNSESession(page);
      await navigateToFilingsPage(page);
      await searchCompanyFilings(page, companyName);
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
      console.log(`✅ Scraping completed for: ${companyName} (${filings.length} filings)`);

      return result;

    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        const backoffDelay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }

    } finally {
      await cleanupBrowser(browser, context, page);
    }
  }

  console.error(`💥 All ${maxRetries} attempts failed for: ${companyName}`);
  throw lastError || new Error('Scraping failed after all retry attempts');
}

module.exports = {
  scrapeNSEFilings,
  SCRAPER_CONFIG
};
