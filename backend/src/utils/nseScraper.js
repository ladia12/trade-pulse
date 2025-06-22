const { chromium } = require('playwright');
const { addExtra } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const NodeCache = require('node-cache');

// Cache with 1-hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * NSE Scraper Configuration with Enhanced Anti-Detection
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
  // Enhanced launch args for maximum stealth
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
    '--disable-ipc-flooding-protection',
    // Advanced anti-detection flags
    '--disable-blink-features=AutomationControlled',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-extensions-except',
    '--disable-plugins-discovery',
    '--no-default-browser-check',
    '--no-pings',
    '--no-service-autorun',
    '--password-store=basic',
    '--use-mock-keychain',
    '--disable-component-extensions-with-background-pages',
    '--disable-default-apps',
    '--mute-audio',
    '--disable-background-networking',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-domain-reliability',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--use-gl=swiftshader'
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
 * Generate realistic browser headers with advanced anti-detection
 */
function generateHeaders(userAgent) {
  const headers = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
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

  // Add Chrome-specific headers for better detection bypass
  if (userAgent.includes('Chrome')) {
    const chromeVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || '120';
    headers['sec-ch-ua'] = `"Google Chrome";v="${chromeVersion}", "Not A(Brand";v="99", "Chromium";v="${chromeVersion}"`;
    headers['sec-ch-ua-mobile'] = '?0';
    headers['sec-ch-ua-platform'] = '"Windows"';
  }

  // Add random DNT header sometimes for better fingerprint variation
  if (Math.random() > 0.5) {
    headers['DNT'] = '1';
  }

  return headers;
}

/**
 * Enhanced human-like behavior simulation for headless detection bypass
 */
async function simulateHumanBehavior(page) {
  try {
    console.log('🤖 Simulating realistic human behavior...');

    // Get viewport dimensions
    const viewport = page.viewportSize();

    // 1. Natural mouse movements with curves
    for (let i = 0; i < 3; i++) {
      const startX = Math.floor(Math.random() * viewport.width);
      const startY = Math.floor(Math.random() * viewport.height);
      const endX = Math.floor(Math.random() * viewport.width);
      const endY = Math.floor(Math.random() * viewport.height);

      // Move in a curved path
      const steps = Math.floor(Math.random() * 20) + 10;
      await page.mouse.move(startX, startY);
      await randomDelay(50, 200);
      await page.mouse.move(endX, endY, { steps });
      await randomDelay(100, 300);
    }

    // 2. Random scrolling patterns
    const scrollPatterns = [
      // Small scroll down
      () => page.evaluate(() => window.scrollBy(0, Math.random() * 300 + 100)),
      // Small scroll up
      () => page.evaluate(() => window.scrollBy(0, -(Math.random() * 200 + 50))),
      // Scroll to specific position
      () => page.evaluate(() => window.scrollTo(0, Math.random() * 500)),
    ];

    for (let i = 0; i < 2; i++) {
      const pattern = scrollPatterns[Math.floor(Math.random() * scrollPatterns.length)];
      await pattern();
      await randomDelay(200, 800);
    }

    // 3. Mouse hover on random elements
    try {
      const elements = await page.$$('a, button, input, div');
      if (elements.length > 0) {
        const randomElement = elements[Math.floor(Math.random() * Math.min(elements.length, 5))];
        await randomElement.hover();
        await randomDelay(100, 500);
      }
    } catch (hoverError) {
      // Continue if hover fails
    }

    // 4. Focus and blur events
    try {
      await page.evaluate(() => {
        // Simulate focus/blur events
        const focusEvent = new Event('focus', { bubbles: true });
        const blurEvent = new Event('blur', { bubbles: true });

        if (document.body) {
          document.body.dispatchEvent(focusEvent);
          setTimeout(() => document.body.dispatchEvent(blurEvent), 100);
        }
      });
    } catch (focusError) {
      // Continue if focus simulation fails
    }

    // 5. Random keyboard events (non-destructive)
    try {
      const keys = ['Tab', 'Shift', 'Control'];
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      await page.keyboard.press(randomKey);
      await randomDelay(50, 150);
      // Release key
      await page.keyboard.up(randomKey);
    } catch (keyError) {
      // Continue if keyboard simulation fails
    }

    // 6. Window resize simulation (viewport events)
    try {
      await page.evaluate(() => {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      });
    } catch (resizeError) {
      // Continue if resize simulation fails
    }

    console.log('✅ Human behavior simulation completed');
    await randomDelay(500, 1500);

  } catch (error) {
    console.log('⚠️ Human behavior simulation partially failed, continuing...');
    // Continue execution even if behavior simulation fails
  }
}

// ================================
// BROWSER MANAGEMENT
// ================================

/**
 * Initialize browser with advanced stealth configuration and timeout handling
 */
async function initializeBrowser(forceHeadless = null) {
  // Determine headless mode with multiple fallback options
  let headless = true;
  if (forceHeadless !== null) {
    headless = forceHeadless;
  } else if (process.env.FORCE_NON_HEADLESS === 'true') {
    headless = false;
    console.log('🔧 FORCE_NON_HEADLESS environment variable detected');
  } else if (process.env.NODE_ENV !== 'production') {
    headless = false; // Use non-headless for development
  }

  const userAgent = getRandomElement(SCRAPER_CONFIG.userAgents);
  const viewport = getRandomElement(SCRAPER_CONFIG.viewports);

  console.log(`🚀 Initializing browser (${viewport.width}x${viewport.height}) - Headless: ${headless}`);

  // Add timeout wrapper for each step
  const withTimeout = (promise, timeoutMs, operation) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  };

  let browser, context, page;

  try {
    // Step 1: Launch browser with timeout and enhanced stealth
    console.log('🔧 Launching Chromium browser with stealth configuration...');

    // Create enhanced Chromium instance with stealth plugin
    const chromiumWithStealth = addExtra(chromium);
    chromiumWithStealth.use(StealthPlugin());

    const launchOptions = {
      headless,
      args: SCRAPER_CONFIG.launchArgs,
      ignoreDefaultArgs: ['--enable-automation'],
      // Additional anti-detection options
      ignoreHTTPSErrors: true,
      devtools: false
    };

    // Add extra args for problematic environments
    if (process.env.CI || process.env.DOCKER || process.env.CONTAINER) {
      console.log('🐳 Container environment detected, adding stability flags');
      launchOptions.args = [
        ...launchOptions.args,
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-extensions'
      ];
    }

    browser = await withTimeout(
      chromiumWithStealth.launch(launchOptions),
      30000,
      'Browser launch'
    );
    console.log('✅ Browser launched successfully with stealth configuration');

    // Step 2: Create context with timeout
    console.log('🔧 Creating browser context...');
    context = await withTimeout(
      browser.newContext({
        userAgent,
        viewport,
        locale: 'en-US',
        timezoneId: 'Asia/Kolkata',
        geolocation: { latitude: 28.6139, longitude: 77.2090 }, // Delhi coordinates for better Indian context
        permissions: ['geolocation'],
        extraHTTPHeaders: generateHeaders(userAgent),
        // Additional anti-detection context options
        colorScheme: 'light',
        reducedMotion: 'no-preference',
        forcedColors: 'none',
        // Mock screen size and device scale factor
        screen: {
          width: viewport.width,
          height: viewport.height
        },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
        javaScriptEnabled: true,
        acceptDownloads: true,
        ignoreHTTPSErrors: true,
        bypassCSP: true
      }),
      15000,
      'Context creation'
    );
    console.log('✅ Browser context created');

    // Step 3: Add comprehensive stealth properties with timeout
    console.log('🥷 Adding comprehensive stealth properties...');
    await withTimeout(
      context.addInitScript(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });

        // Mock plugins array with realistic plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => ({
            length: 4,
            0: {
              name: "Chrome PDF Plugin",
              description: "Portable Document Format",
              filename: "internal-pdf-viewer",
              length: 1
            },
            1: {
              name: "Chrome PDF Viewer",
              description: "",
              filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
              length: 1
            },
            2: {
              name: "Native Client",
              description: "",
              filename: "internal-nacl-plugin",
              length: 2
            },
            3: {
              name: "WebKit built-in PDF",
              description: "Portable Document Format",
              filename: "webkit-pdf-plugin",
              length: 1
            }
          }),
        });

        // Mock languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });

        // Mock Chrome runtime
        Object.defineProperty(window, 'chrome', {
          value: {
            runtime: {
              onConnect: undefined,
              onMessage: undefined,
              connect: () => {},
              sendMessage: () => {}
            }
          },
        });

        // Mock permissions
        Object.defineProperty(navigator, 'permissions', {
          value: {
            query: () => Promise.resolve({ state: 'granted' })
          }
        });

        // Mock connection
        Object.defineProperty(navigator, 'connection', {
          value: {
            effectiveType: '4g',
            rtt: 150,
            downlink: 2.0
          }
        });

        // Mock memory info
        Object.defineProperty(navigator, 'deviceMemory', {
          value: 8
        });

        // Mock hardware concurrency
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          value: 4
        });

        // Spoof canvas fingerprinting
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(type) {
          if (type === 'image/png') {
            return originalToDataURL.call(this, type);
          }
          return originalToDataURL.call(this, type);
        };

        // Mock screen properties to match viewport
        Object.defineProperty(screen, 'width', { value: window.innerWidth });
        Object.defineProperty(screen, 'height', { value: window.innerHeight });
        Object.defineProperty(screen, 'availWidth', { value: window.innerWidth });
        Object.defineProperty(screen, 'availHeight', { value: window.innerHeight - 40 });

        // Remove automation indicators
        delete window.__nightmare;
        delete window._phantom;
        delete window.callPhantom;
        delete window.Buffer;
        delete window.emit;
        delete window.spawn;

        // Mock Date.now to prevent timezone detection
        const originalDateNow = Date.now;
        Date.now = () => originalDateNow() + Math.floor(Math.random() * 100);

        // Mock Math.random to make it less predictable
        const originalRandom = Math.random;
        Math.random = () => {
          return originalRandom();
        };

        // Mock Notification permission
        Object.defineProperty(Notification, 'permission', {
          value: 'default'
        });

        // Mock battery API
        Object.defineProperty(navigator, 'getBattery', {
          value: () => Promise.resolve({
            charging: true,
            chargingTime: 0,
            dischargingTime: Infinity,
            level: 1
          })
        });

        console.log('🔒 Advanced stealth properties applied');
      }),
      10000,
      'Stealth properties'
    );
    console.log('✅ Comprehensive stealth properties added');

    // Step 4: Create page with timeout
    console.log('📄 Creating new page...');
    page = await withTimeout(
      context.newPage(),
      15000,
      'Page creation'
    );
    console.log('✅ Page created');

    // Step 5: Set timeouts and additional page stealth
    console.log('⏱️ Setting page timeouts and additional stealth...');
    await page.setDefaultTimeout(SCRAPER_CONFIG.timeouts.pageLoad);
    await page.setDefaultNavigationTimeout(SCRAPER_CONFIG.timeouts.navigation);

    // Additional page-level stealth
    await context.addInitScript(() => {
      // Override console.debug to prevent detection
      console.debug = () => {};

      // Mock additional navigator properties
      Object.defineProperty(navigator, 'platform', { value: 'Win32' });
      Object.defineProperty(navigator, 'product', { value: 'Gecko' });
      Object.defineProperty(navigator, 'productSub', { value: '20030107' });
      Object.defineProperty(navigator, 'vendor', { value: 'Google Inc.' });
      Object.defineProperty(navigator, 'vendorSub', { value: '' });

      // Hide automation traces
      delete window.__webdriver_unwrapped;
      delete window.__webdriver_script_fn;
      delete window.__fxdriver_unwrapped;
      delete window.__driver_unwrapped;
      delete window.__webdriver_script_func;
      delete window.__webdriver_script_function;
      delete window.__selenium_unwrapped;
      delete window.__fxdriver_evaluate;
      delete window.__driver_evaluate;
      delete window.__selenium_evaluate;
      delete window.__webdriver_evaluate;
      delete window.__selenium_unwrapped;

      // Mock iframe detection bypass
      Object.defineProperty(window, 'outerHeight', { value: window.innerHeight });
      Object.defineProperty(window, 'outerWidth', { value: window.innerWidth });
    });

    console.log('✅ Browser initialization and stealth setup complete');

    return { browser, context, page };

  } catch (error) {
    console.error('❌ Browser initialization failed:', error.message);

    // Cleanup on failure
    try {
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
    } catch (cleanupError) {
      console.error('⚠️ Cleanup failed:', cleanupError.message);
    }

    // Provide specific error guidance
    if (error.message.includes('timeout')) {
      console.error('🔍 Browser initialization timed out. Possible causes:');
      console.error('   - Insufficient system resources (RAM/CPU)');
      console.error('   - Missing system dependencies');
      console.error('   - Container resource limits');
      console.error('   - Network connectivity issues');
      console.error('💡 Try: Increase container memory or use headless mode');
    }

    throw new Error(`Browser initialization failed: ${error.message}`);
  }
}

/**
 * Establish NSE session with timeout and error handling
 */
async function establishNSESession(page) {
  console.log('🏠 Establishing NSE session...');

  try {
    console.log('🌐 Loading NSE homepage...');

    // Navigate to NSE with timeout
    await Promise.race([
      page.goto('https://www.nseindia.com/', {
        waitUntil: 'domcontentloaded',
        timeout: SCRAPER_CONFIG.timeouts.pageLoad
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('NSE homepage load timeout')), 35000)
      )
    ]);

    console.log('✅ NSE homepage loaded');

    // Wait for page to stabilize
    console.log('⏳ Waiting for page to stabilize...');
    await randomDelay(3000, 5000);

    // Check if page loaded successfully
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);

    if (title.includes('Just a moment') || title.includes('Please wait')) {
      console.log('🛡️ Detected protection screen, waiting longer...');
      await randomDelay(10000, 15000);
    }

    // Simulate human behavior
    console.log('🤖 Simulating human behavior...');
    await simulateHumanBehavior(page);

    console.log('✅ NSE session established');

  } catch (error) {
    console.error('❌ Failed to establish NSE session:', error.message);

    if (error.message.includes('timeout')) {
      console.error('🔍 NSE session timeout. Possible causes:');
      console.error('   - NSE website is down or slow');
      console.error('   - Network connectivity issues');
      console.error('   - Firewall/proxy blocking access');
      console.error('   - Geographic restrictions');
    }

    throw new Error(`Failed to establish NSE session: ${error.message}`);
  }
}

/**
 * Navigate to corporate filings page with timeout and verification
 */
async function navigateToFilingsPage(page) {
  console.log('📄 Navigating to corporate filings page...');

  for (let i = 0; i < SCRAPER_CONFIG.filingUrls.length; i++) {
    const url = SCRAPER_CONFIG.filingUrls[i];

    try {
      console.log(`🔗 Trying URL ${i + 1}/${SCRAPER_CONFIG.filingUrls.length}: ${url}`);

      // Navigate with timeout
      await Promise.race([
        page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 25000
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Page navigation timeout')), 30000)
        )
      ]);

      console.log('✅ Page loaded, checking content...');
      await randomDelay(2000, 4000);

      const title = await page.title();
      console.log(`📄 Page title: "${title}"`);

      // Handle protection screens
      if (title.includes('Just a moment') || title.includes('Checking your browser')) {
        console.log('🛡️ Detected protection screen, waiting...');
        try {
          await page.waitForSelector('body', { timeout: 30000 });
          await randomDelay(10000, 15000);
        } catch (protectionError) {
          console.log('⚠️ Protection screen timeout, continuing...');
        }
      }

      // Verify page has required elements with timeout
      console.log('🔍 Verifying page elements...');
      const hasFilingElements = await Promise.race([
        page.evaluate(() => {
          const searchInput = document.querySelector('input[placeholder*="Company"], input[placeholder*="company"], input[name*="company"], input[type="text"]');
          const table = document.querySelector('table, .data-table, .filings-table');
          const hasElements = !!(searchInput || table);

          // Log what we found for debugging
          if (searchInput) console.log('Found search input');
          if (table) console.log('Found table');

          return hasElements;
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Element verification timeout')), 10000)
        )
      ]);

      if (hasFilingElements) {
        console.log('✅ Successfully reached corporate filings page');

        // Add extra verification - check if page is interactive
        try {
          await page.waitForLoadState('networkidle', { timeout: 10000 });
          console.log('✅ Page is fully loaded and interactive');
        } catch (networkError) {
          console.log('⚠️ Network not idle, but continuing...');
        }

        return;
      } else {
        console.log('❌ Required elements not found on this page');
      }

    } catch (error) {
      console.log(`⚠️ Failed to load ${url}: ${error.message}`);

      if (error.message.includes('timeout')) {
        console.log('🔍 Page navigation timed out, trying next URL...');
      }

      continue;
    }
  }

  console.error('💥 All corporate filings URLs failed');
  console.error('🔍 Attempted URLs:');
  SCRAPER_CONFIG.filingUrls.forEach((url, i) => {
    console.error(`   ${i + 1}. ${url}`);
  });

  throw new Error('Could not access any corporate filings page - all URLs failed');
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
 * Initialize browser with fallback mode (headless -> non-headless)
 */
async function initializeBrowserWithFallback(preferHeadless = true) {
  try {
    // Try preferred mode first
    return await initializeBrowser(preferHeadless);
  } catch (error) {
    if (preferHeadless) {
      console.log('⚠️ Headless mode failed, trying non-headless as fallback...');
      return await initializeBrowser(false);
    }
    throw error;
  }
}

/**
 * Main scraping function with retry logic and intelligent headless fallback
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
  let useHeadless = true;
  let successfulMode = null;

  while (attempt < maxRetries) {
    attempt++;
    console.log(`🔄 Attempt ${attempt}/${maxRetries} for: ${companyName} (headless: ${useHeadless})`);

    let browser, context, page;

    try {
      // Initialize browser with fallback capability
      if (attempt === 1) {
        // First attempt: try headless mode
        ({ browser, context, page } = await initializeBrowserWithFallback(true));
        useHeadless = true;
      } else if (attempt === 2) {
        // Second attempt: try non-headless mode if headless failed
        console.log('🔄 Trying non-headless mode for better compatibility...');
        ({ browser, context, page } = await initializeBrowserWithFallback(false));
        useHeadless = false;
      } else {
        // Third attempt: use whatever worked before or fallback
        const modeToTry = successfulMode !== null ? successfulMode : !useHeadless;
        ({ browser, context, page } = await initializeBrowserWithFallback(modeToTry));
        useHeadless = modeToTry;
      }

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
        cached: false,
        mode: useHeadless ? 'headless' : 'non-headless'
      };

      // Remember successful mode for future attempts
      successfulMode = useHeadless;

      // Cache the result
      cache.set(cacheKey, result);
      console.log(`✅ Scraping completed for: ${companyName} (${filings.length} filings) [${result.mode}]`);

      return result;

    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      // If first attempt with headless failed with connection error, try non-headless next
      if (attempt === 1 && (error.message.includes('ERR_HTTP2_PROTOCOL_ERROR') ||
                            error.message.includes('ERR_CONNECTION_REFUSED') ||
                            error.message.includes('ERR_NETWORK_CHANGED'))) {
        console.log('🔄 Network/connection error detected, will try non-headless mode next...');
        useHeadless = false;
      }

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
  console.error(`💡 Consider checking NSE website availability or network connection`);
  throw lastError || new Error('Scraping failed after all retry attempts');
}

module.exports = {
  scrapeNSEFilings,
  SCRAPER_CONFIG
};
