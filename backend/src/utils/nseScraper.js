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
    await randomDelay(4000, 6000);

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
 * Search for company filings with NSE-specific dropdown handling
 */
async function searchCompanyFilings(page, companyName) {
  console.log(`🔍 [SEARCH] Searching for company: ${companyName}`);
  console.log(`🎯 [SEARCH] Target: NSE Corporate Filings with dropdown selection`);

  try {
    // NSE-specific search selector for "Company Name or Symbol" placeholder
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

    let searchInput = null;
    let workingSelector = null;

    console.log(`🔍 [SEARCH] Looking for search input field...`);
    for (const selector of searchSelectors) {
      try {
        searchInput = await page.waitForSelector(selector, { timeout: 3000 });
        if (searchInput) {
          // Verify this is the right field by checking placeholder
          const placeholder = await searchInput.getAttribute('placeholder');
          console.log(`✅ [SEARCH] Found input with placeholder: "${placeholder}"`);
          workingSelector = selector;
          break;
        }
      } catch (error) {
        console.log(`⚠️ [SEARCH] Selector "${selector}" not found`);
        continue;
      }
    }

    if (!searchInput || !workingSelector) {
      throw new Error('Could not find company search input field with "Company Name or Symbol" placeholder');
    }

    // Focus and clear the search input
    console.log(`🎯 [SEARCH] Focusing on search input...`);
    await searchInput.focus();
    await randomDelay(500, 1000);

    // Clear any existing text
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Delete');
    await randomDelay(200, 500);

    // Type company name with realistic delays
    console.log(`⌨️ [SEARCH] Typing "${companyName}" into search field...`);
    for (let i = 0; i < companyName.length; i++) {
      await page.keyboard.type(companyName[i]);
      await randomDelay(100, 200); // Human typing speed
    }

    // Wait for dropdown to appear
    console.log(`⏳ [DROPDOWN] Waiting for dropdown suggestions...`);
    await randomDelay(1000, 2000);

    // NSE-specific dropdown selectors based on actual structure
    const dropdownSelectors = [
      '.autocompleteList',
      '.tt-suggestion',
      '.tt-menu',
      '[role="listbox"]',
      '.dropdown-menu',
      '.autocomplete-suggestions',
      '.search-suggestions',
      '.dropdown-content',
      '.typeahead-dropdown',
      '.suggestion-list',
      '.search-dropdown',
      '.autocomplete-dropdown'
    ];

    let dropdown = null;
    let dropdownSelector = null;

    for (const selector of dropdownSelectors) {
      try {
        dropdown = await page.waitForSelector(selector, {
          timeout: 8000,
          state: 'visible'
        });
        if (dropdown) {
          console.log(`✅ [DROPDOWN] Found dropdown with selector: ${selector}`);
          dropdownSelector = selector;
          break;
        }
      } catch (error) {
        console.log(`⚠️ [DROPDOWN] Selector "${selector}" not found`);
        continue;
      }
    }

    if (!dropdown) {
      console.log(`⚠️ [DROPDOWN] No dropdown appeared, trying direct search...`);
      await page.keyboard.press('Enter');
      await randomDelay(3000, 5000);
      return true;
    }

    // Look for NSE dropdown options with specific structure
    console.log(`🔍 [DROPDOWN] Searching for dropdown options...`);
    await randomDelay(1000, 2000);

    const optionSelectors = [
      '.autocompleteList.tt-suggestion',
      '.tt-suggestion',
      '.autocompleteList',
      `${dropdownSelector} [role="option"]`,
      `${dropdownSelector} li`,
      `${dropdownSelector} .dropdown-item`,
      `${dropdownSelector} .suggestion`,
      `${dropdownSelector} .option`,
      `${dropdownSelector} div[data-value]`,
      `${dropdownSelector} a`,
      `${dropdownSelector} span`
    ];

    let options = [];
    let optionSelector = null;

    for (const selector of optionSelectors) {
      try {
        options = await page.$$(selector);
        if (options.length > 0) {
          console.log(`✅ [DROPDOWN] Found ${options.length} options with selector: ${selector}`);
          optionSelector = selector;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (options.length === 0) {
      console.log(`⚠️ [DROPDOWN] No options found, trying Enter key...`);
      await page.keyboard.press('Enter');
      await randomDelay(3000, 5000);
      return true;
    }

        // Extract option texts and find best match for NSE format
    console.log(`🔍 [MATCHING] Analyzing dropdown options for "${companyName}"...`);
    let selectedOption = null;
    const searchTerm = companyName.toLowerCase();

    for (let i = 0; i < Math.min(options.length, 10); i++) { // Check first 10 options
      try {
        // Get both full text and individual span elements for NSE structure
        const fullText = await options[i].textContent();
        const cleanText = fullText?.trim() || '';

        // Try to extract company name and symbol from NSE structure
        let companyNameSpan = '';
        let symbolSpan = '';

        try {
          // Look for .lt span (company name) and regular span (symbol)
          const ltSpan = await options[i].$('.lt');
          const symbolSpanEl = await options[i].$('span:not(.lt)');

          if (ltSpan) {
            companyNameSpan = await ltSpan.textContent();
          }
          if (symbolSpanEl) {
            symbolSpan = await symbolSpanEl.textContent();
          }
        } catch (spanError) {
          // If span extraction fails, use full text
        }

        console.log(`   Option ${i + 1}: "${cleanText}"`);
        if (companyNameSpan && symbolSpan) {
          console.log(`     Company: "${companyNameSpan}" | Symbol: "${symbolSpan}"`);
        }

        if (cleanText.length > 0) {
          const lowerText = cleanText.toLowerCase();
          const lowerCompanyName = companyNameSpan.toLowerCase();
          const lowerSymbol = symbolSpan.toLowerCase();

          // Priority 1: Exact symbol match (e.g., search "RELIANCE" matches symbol "RELIANCE")
          if (lowerSymbol === searchTerm) {
            selectedOption = options[i];
            console.log(`🎯 [EXACT SYMBOL] Found exact symbol match: "${symbolSpan}" for search "${companyName}"`);
            break;
          }

          // Priority 2: Symbol contains search term (e.g., "RIL" in "RELIANCE")
          if (lowerSymbol.includes(searchTerm) || searchTerm.includes(lowerSymbol)) {
            selectedOption = options[i];
            console.log(`🎯 [SYMBOL MATCH] Found symbol match: "${symbolSpan}" for search "${companyName}"`);
            break;
          }

          // Priority 3: Company name starts with search term
          if (lowerCompanyName.startsWith(searchTerm) || lowerText.startsWith(searchTerm)) {
            selectedOption = options[i];
            console.log(`🎯 [NAME STARTS] Found name match: "${companyNameSpan || cleanText}" for search "${companyName}"`);
            break;
          }

          // Priority 4: Contains search term anywhere (fallback)
          if (lowerText.includes(searchTerm) || lowerCompanyName.includes(searchTerm)) {
            if (!selectedOption) { // Only take first match of this type
              selectedOption = options[i];
              console.log(`🎯 [CONTAINS] Found partial match: "${cleanText}" for search "${companyName}"`);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ [OPTION] Could not read option ${i + 1}: ${error.message}`);
      }
    }

    // Fallback to first option if no good match found
    if (!selectedOption && options.length > 0) {
      selectedOption = options[0];
      const firstText = await selectedOption.textContent();
      console.log(`🎯 [FALLBACK] Using first option: "${firstText?.trim()}"`);
    }

    if (!selectedOption) {
      throw new Error(`No suitable company option found in dropdown for: ${companyName}`);
    }

    // Click the selected option
    const selectedText = await selectedOption.textContent();
    console.log(`🖱️ [SELECTION] Clicking on: "${selectedText?.trim()}"`);

    // Scroll option into view if needed
    try {
      await selectedOption.scrollIntoViewIfNeeded();
      await randomDelay(500, 1000);
    } catch (error) {
      console.log(`⚠️ [SCROLL] Could not scroll option into view: ${error.message}`);
    }

    // Click the option
    await selectedOption.click();
    await randomDelay(2000, 3000);

    // Wait for dropdown to close and filings to load
    console.log(`⏳ [LOADING] Waiting for corporate filings to load...`);
    try {
      await page.waitForSelector(dropdownSelector, {
        state: 'hidden',
        timeout: 5000
      });
      console.log(`✅ [DROPDOWN] Dropdown closed successfully`);
    } catch (error) {
      console.log(`⚠️ [DROPDOWN] Dropdown still visible: ${error.message}`);
    }

    // Wait for filings table to appear
    await randomDelay(3000, 5000);

    // Check if filings data loaded
    const filingsIndicators = [
      'table tbody tr',
      '.filing-row',
      '.data-table',
      '.results-table',
      '.filings-table'
    ];

    let filingsLoaded = false;
    for (const indicator of filingsIndicators) {
      try {
        const elements = await page.$$(indicator);
        if (elements.length > 0) {
          console.log(`✅ [FILINGS] Found ${elements.length} filing elements with selector: ${indicator}`);
          filingsLoaded = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!filingsLoaded) {
      console.log(`⚠️ [FILINGS] No filing elements found, but selection completed`);
    }

    console.log(`✅ [SEARCH] Company search and dropdown selection completed`);
    console.log(`📋 [SUMMARY] Selected: "${selectedText?.trim()}" for search: "${companyName}"`);
    return true;

  } catch (error) {
    console.error('❌ [SEARCH] Company search failed:', error.message);
    console.error('🔍 [DEBUG] Current page URL:', await page.url());

    // Try fallback: direct Enter press
    try {
      console.log(`🔄 [FALLBACK] Attempting direct search with Enter key...`);
      await page.keyboard.press('Enter');
      await randomDelay(3000, 5000);
      console.log(`✅ [FALLBACK] Direct search completed`);
      return true;
    } catch (fallbackError) {
      console.error('❌ [FALLBACK] Direct search also failed:', fallbackError.message);
      throw new Error(`Failed to search for company: ${companyName}. Original error: ${error.message}`);
    }
  }
}

/**
 * Extract filing data from NSE corporate filings table
 */
async function extractFilingData(page, companyName) {
  console.log(`📊 [EXTRACTION] Extracting filing data for: ${companyName}`);
  console.log(`📋 [EXTRACTION] Target: Recent NSE corporate filings (last 7 days)`);

  try {
    // Wait for results to load after dropdown selection
    console.log(`⏳ [EXTRACTION] Waiting for filings table to load...`);
    await randomDelay(3000, 5000);

    // Check for loading indicators first
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '.loader',
      '[data-loading]',
      '.data-loading'
    ];

    for (const loadingSelector of loadingSelectors) {
      try {
        const loading = await page.$(loadingSelector);
        if (loading) {
          console.log(`⏳ [LOADING] Found loading indicator, waiting...`);
          await page.waitForSelector(loadingSelector, {
            state: 'hidden',
            timeout: 15000
          });
          console.log(`✅ [LOADING] Loading completed`);
          break;
        }
      } catch (error) {
        // Loading selector not found or didn't disappear, continue
      }
    }

    // Additional wait for content to stabilize
    await randomDelay(2000, 3000);

    // NSE-specific table selectors for corporate filings
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

    let resultsTable = null;
    let tableSelector = null;

    console.log(`🔍 [TABLE] Looking for filings table...`);
    for (const selector of tableSelectors) {
      try {
        const tables = await page.$$(selector);
        if (tables.length > 0) {
          // Check if table has data rows
          for (const table of tables) {
            const rows = await table.$$('tbody tr, tr');
            if (rows.length > 0) {
              resultsTable = table;
              tableSelector = selector;
              console.log(`✅ [TABLE] Found table with ${rows.length} rows using selector: ${selector}`);
              break;
            }
          }
          if (resultsTable) break;
        }
      } catch (error) {
        console.log(`⚠️ [TABLE] Selector "${selector}" failed: ${error.message}`);
        continue;
      }
    }

    if (!resultsTable) {
      console.log(`⚠️ [EXTRACTION] No filings table found`);

      // Check for "no results" or empty state messages
      const noResultsSelectors = [
        '.no-results',
        '.empty-state',
        '.no-data',
        '[data-empty]',
        'p:contains("No")',
        'div:contains("No results")',
        'span:contains("No filings")'
      ];

      let emptyMessage = false;
      for (const selector of noResultsSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const text = await element.textContent();
            console.log(`ℹ️ [EMPTY] Found empty state: "${text?.trim()}"`);
            emptyMessage = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (emptyMessage) {
        console.log(`📝 [RESULT] No filings found for ${companyName} in the last 7 days`);
        return [];
      }

      // Try to extract any tabular data visible on page
      console.log(`🔄 [FALLBACK] Attempting to extract any tabular data...`);
      const allRows = await page.$$('tr');
      console.log(`🔍 [FALLBACK] Found ${allRows.length} table rows on page`);
      if (allRows.length === 0) {
        return [];
      }
    }

        // Extract NSE corporate filing data with proper structure parsing
    console.log(`📊 [EXTRACTION] Extracting NSE corporate filing data from table...`);
    const filings = await page.evaluate(() => {
      // Find NSE corporate filings table rows specifically
      const tableRows = Array.from(document.querySelectorAll('table tbody tr'));

      // Filter out header rows and empty rows - NSE structure has 7 columns
      const dataRows = tableRows.filter(row => {
        const cells = row.querySelectorAll('td');
        return cells.length >= 7; // NSE has 7 columns: SYMBOL, COMPANY NAME, SUBJECT, DETAILS, ATTACHMENT, FILE SIZE, BROADCAST DATE/TIME
      });

      return dataRows.map((row, index) => {
        try {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length < 7) {
            return null;
          }

          // NSE Table Structure:
          // 0: SYMBOL
          // 1: COMPANY NAME
          // 2: SUBJECT
          // 3: DETAILS
          // 4: ATTACHMENT
          // 5: FILE SIZE
          // 6: BROADCAST DATE/TIME

          // Extract broadcast date/time from 7th column (index 6)
          const broadcastCell = cells[6];
          const broadcastDateText = broadcastCell?.textContent?.trim() || '';

          // NSE date format: "18-Jun-2025 19:08:25"
          const nseDate = broadcastDateText.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);

          let filingDate = null;
          if (nseDate) {
            const [, day, monthStr, year, hour, minute, second] = nseDate;
            const months = {
              'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
              'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
            };
            const month = months[monthStr.toLowerCase()];
            if (month !== undefined) {
              filingDate = new Date(parseInt(year), month, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
            }
          }

          // Fallback to current date if parsing fails
          if (!filingDate || isNaN(filingDate.getTime())) {
            filingDate = new Date();
          }

          // Extract structured data from NSE table
          const symbol = cells[0]?.textContent?.trim() || '';
          const companyName = cells[1]?.textContent?.trim() || '';
          const subject = cells[2]?.textContent?.trim() || '';
          const details = cells[3]?.textContent?.trim() || '';
          const fileSize = cells[5]?.textContent?.trim() || '';

          // Extract PDF attachment from ATTACHMENT column
          const attachmentCell = cells[4];
          const pdfLink = attachmentCell?.querySelector('a[href*=".pdf"]')?.href || null;

          // Extract additional attachments
          const attachments = Array.from(row.querySelectorAll('a[href]'))
            .map(link => ({
              url: link.href,
              text: link.textContent?.trim() || '',
              type: link.href.includes('.pdf') ? 'PDF' :
                    link.href.includes('.doc') ? 'DOC' :
                    link.href.includes('.xls') ? 'XLS' : 'LINK'
            }))
            .filter(att => att.url && att.text && !att.url.includes('get-quotes')); // Exclude symbol links

          return {
            date: filingDate.toISOString().split('T')[0],
            time: filingDate.toISOString().split('T')[1].split('.')[0],
            symbol: symbol,
            companyName: companyName,
            subject: subject || 'No subject',
            details: details || 'No details',
            pdfLink: pdfLink,
            fileSize: fileSize,
            attachments: attachments,
            broadcastDateTime: broadcastDateText,
            rawDateText: broadcastDateText,
            cellCount: cells.length,
            rowIndex: index
          };

        } catch (error) {
          return null;
        }
      }).filter(filing => filing !== null);
    });

        // Filter for last 7 days based on NSE broadcast date/time
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));

    console.log(`📅 [FILTER] Current date: ${currentDate.toISOString().split('T')[0]}`);
    console.log(`📅 [FILTER] Seven days ago: ${sevenDaysAgo.toISOString().split('T')[0]}`);

    const recentFilings = filings.filter(filing => {
      const filingDate = new Date(filing.date);
      const isRecent = filingDate >= sevenDaysAgo;

      if (!isRecent && filing.broadcastDateTime) {
        console.log(`📅 [OLD] Excluding filing from ${filing.broadcastDateTime}: "${filing.subject}"`);
      }

      return isRecent;
    });

    console.log(`✅ [EXTRACTION] Extracted ${filings.length} total NSE filings`);
    console.log(`📅 [FILTER] ${recentFilings.length} filings from last 7 days (based on BROADCAST DATE/TIME)`);

    if (recentFilings.length > 0) {
      const uniqueDates = [...new Set(recentFilings.map(f => f.date))].sort();
      console.log(`📊 [SUMMARY] Recent filing dates: ${uniqueDates.join(', ')}`);
      console.log(`📊 [SAMPLE] Latest filing: "${recentFilings[0]?.subject}" (${recentFilings[0]?.broadcastDateTime})`);
    }

    // Return recent filings, but if none found, return limited set for debugging
    if (recentFilings.length === 0 && filings.length > 0) {
      console.log(`⚠️ [DEBUG] No recent filings found, showing sample of oldest filings for analysis:`);
      filings.slice(0, 3).forEach((filing, i) => {
        console.log(`   ${i+1}. ${filing.broadcastDateTime}: "${filing.subject}"`);
      });
      return filings.slice(0, 5); // Return only first 5 for debugging
    }

    return recentFilings;

  } catch (error) {
    console.error('❌ [EXTRACTION] Failed to extract filing data:', error.message);
    throw new Error(`Failed to extract filing data: ${error.message}`);
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
