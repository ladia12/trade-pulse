const { chromium } = require('playwright');
const UserAgent = require('user-agents');
const NodeCache = require('node-cache');

// Cache with 1-hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

class NSEScraper {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    ];
    this.viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 }
    ];
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  getRandomViewport() {
    return this.viewports[Math.floor(Math.random() * this.viewports.length)];
  }

  async initBrowser() {
    console.log('🚀 [NSE SCRAPER] Initializing browser with stealth configuration...');
    
    const viewport = this.getRandomViewport();
    const userAgent = this.getRandomUserAgent();
    
    console.log(`📱 [NSE SCRAPER] Using viewport: ${viewport.width}x${viewport.height}`);
    console.log(`🕵️ [NSE SCRAPER] Using User-Agent: ${userAgent}`);

    this.browser = await chromium.launch({
      headless: process.env.NODE_ENV === 'production',
      args: [
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
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps'
      ]
    });

    this.context = await this.browser.newContext({
      viewport,
      userAgent,
      locale: 'en-IN',
      timezoneId: 'Asia/Kolkata',
      geolocation: { latitude: 12.9716, longitude: 77.5946 },
      permissions: ['geolocation'],
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1'
      }
    });

    this.page = await this.context.newPage();

    // Override navigator properties for stealth
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      Object.defineProperty(screen, 'colorDepth', {
        get: () => 24,
      });

      Object.defineProperty(screen, 'pixelDepth', {
        get: () => 24,
      });
    });

    // Set timeouts
    this.page.setDefaultTimeout(30000);
    this.page.setDefaultNavigationTimeout(30000);

    console.log('✅ [NSE SCRAPER] Browser initialized successfully');
  }

  async simulateHumanBehavior() {
    console.log('🤖 [NSE SCRAPER] Simulating human behavior...');
    
    // Random mouse movements
    await this.page.mouse.move(
      Math.random() * 800 + 100,
      Math.random() * 600 + 100,
      { steps: 10 }
    );

    // Random scroll
    await this.page.evaluate(() => {
      window.scrollBy(0, Math.random() * 200 + 50);
    });

    // Random delay
    await this.randomDelay(1000, 3000);
  }

  async randomDelay(min = 1000, max = 3000) {
    const delay = Math.random() * (max - min) + min;
    console.log(`⏳ [NSE SCRAPER] Waiting ${Math.round(delay)}ms...`);
    await this.page.waitForTimeout(delay);
  }

  async typeWithHumanDelay(selector, text) {
    console.log(`⌨️ [NSE SCRAPER] Typing "${text}" with human-like delays...`);
    
    await this.page.click(selector);
    await this.randomDelay(500, 1000);
    
    for (const char of text) {
      await this.page.keyboard.type(char);
      await this.page.waitForTimeout(Math.random() * 100 + 100); // 100-200ms per character
    }
  }

  async establishSession() {
    console.log('🔐 [NSE SCRAPER] Establishing session with NSE homepage...');
    
    try {
      await this.page.goto('https://www.nseindia.com/', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      console.log('📄 [NSE SCRAPER] NSE homepage loaded');
      
      // Wait for page to fully load and simulate human behavior
      await this.randomDelay(5000, 8000);
      await this.simulateHumanBehavior();
      
      // Check for any blocking elements
      const blockingElements = [
        '[data-testid="cloudflare-challenge"]',
        '.cf-browser-verification',
        '#challenge-form',
        '.captcha-container'
      ];

      for (const selector of blockingElements) {
        const element = await this.page.$(selector);
        if (element) {
          console.log(`🚫 [NSE SCRAPER] Detected blocking element: ${selector}`);
          await this.randomDelay(10000, 15000); // Wait for challenge to complete
        }
      }

      console.log('✅ [NSE SCRAPER] Session established successfully');
      return true;
    } catch (error) {
      console.error('❌ [NSE SCRAPER] Failed to establish session:', error.message);
      throw error;
    }
  }

  async navigateToFilings() {
    console.log('🔗 [NSE SCRAPER] Navigating to corporate filings page...');
    
    try {
      await this.page.goto('https://www.nseindia.com/companies-listing/corporate-filings-announcements', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      console.log('📋 [NSE SCRAPER] Corporate filings page loaded');
      
      // Wait for page to fully load
      await this.randomDelay(3000, 5000);
      await this.simulateHumanBehavior();

      // Wait for the search input to be available
      const searchSelectors = [
        'input[placeholder*="company"]',
        'input[placeholder*="search"]',
        'input[type="search"]',
        '.search-input',
        '#company-search',
        '[data-testid="company-search"]'
      ];

      let searchInput = null;
      for (const selector of searchSelectors) {
        try {
          searchInput = await this.page.waitForSelector(selector, { timeout: 5000 });
          if (searchInput) {
            console.log(`🔍 [NSE SCRAPER] Found search input with selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!searchInput) {
        throw new Error('Could not find company search input field');
      }

      console.log('✅ [NSE SCRAPER] Corporate filings page ready');
      return true;
    } catch (error) {
      console.error('❌ [NSE SCRAPER] Failed to navigate to filings page:', error.message);
      throw error;
    }
  }

  async searchCompany(companyName) {
    console.log(`🔍 [NSE SCRAPER] Searching for company: ${companyName}`);
    
    try {
      // Multiple selector strategies for the search input
      const searchSelectors = [
        'input[placeholder*="company"]',
        'input[placeholder*="search"]',
        'input[type="search"]',
        '.search-input',
        '#company-search',
        '[data-testid="company-search"]',
        'input[name*="company"]',
        'input[id*="search"]'
      ];

      let searchInput = null;
      for (const selector of searchSelectors) {
        try {
          searchInput = await this.page.$(selector);
          if (searchInput) {
            console.log(`✅ [NSE SCRAPER] Using search selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!searchInput) {
        throw new Error('Could not locate company search input field');
      }

      // Clear existing text and type company name
      await searchInput.click();
      await this.page.keyboard.selectAll();
      await this.typeWithHumanDelay(searchSelectors[0], companyName);
      
      // Wait for search suggestions/results
      await this.randomDelay(2000, 4000);

      // Look for search suggestions or results
      const suggestionSelectors = [
        '.search-suggestions',
        '.autocomplete-results',
        '.dropdown-menu',
        '.search-results',
        '[role="listbox"]',
        '.suggestion-list'
      ];

      let suggestions = null;
      for (const selector of suggestionSelectors) {
        try {
          suggestions = await this.page.waitForSelector(selector, { timeout: 3000 });
          if (suggestions) {
            console.log(`📋 [NSE SCRAPER] Found suggestions with selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // If suggestions are available, select the first matching one
      if (suggestions) {
        const suggestionItems = await this.page.$$(`${suggestionSelectors[0]} li, ${suggestionSelectors[0]} .suggestion-item`);
        if (suggestionItems.length > 0) {
          console.log(`🎯 [NSE SCRAPER] Selecting first suggestion`);
          await suggestionItems[0].click();
          await this.randomDelay(2000, 3000);
        }
      } else {
        // Press Enter to search
        console.log('⏎ [NSE SCRAPER] Pressing Enter to search');
        await this.page.keyboard.press('Enter');
        await this.randomDelay(3000, 5000);
      }

      console.log('✅ [NSE SCRAPER] Company search completed');
      return true;
    } catch (error) {
      console.error('❌ [NSE SCRAPER] Failed to search company:', error.message);
      throw error;
    }
  }

  async extractFilings(companyName) {
    console.log('📊 [NSE SCRAPER] Extracting filing data...');
    
    try {
      // Wait for results to load
      await this.randomDelay(3000, 5000);

      // Multiple selectors for the results table
      const tableSelectors = [
        'table',
        '.results-table',
        '.filings-table',
        '.data-table',
        '[role="table"]',
        '.table-responsive table'
      ];

      let table = null;
      for (const selector of tableSelectors) {
        try {
          table = await this.page.waitForSelector(selector, { timeout: 5000 });
          if (table) {
            console.log(`📋 [NSE SCRAPER] Found results table with selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!table) {
        console.log('⚠️ [NSE SCRAPER] No results table found, checking for no results message');
        
        const noResultsSelectors = [
          '.no-results',
          '.empty-state',
          '.no-data',
          '[data-testid="no-results"]'
        ];

        for (const selector of noResultsSelectors) {
          const noResults = await this.page.$(selector);
          if (noResults) {
            console.log('📭 [NSE SCRAPER] No results found for company');
            return [];
          }
        }

        throw new Error('Could not find results table or no results indicator');
      }

      // Extract data from table rows
      const filings = await this.page.evaluate(() => {
        const rows = document.querySelectorAll('table tbody tr, .results-table tr, .filings-table tr');
        const results = [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        for (const row of rows) {
          try {
            const cells = row.querySelectorAll('td, .cell');
            if (cells.length < 3) continue;

            // Extract date (usually first column)
            const dateText = cells[0]?.textContent?.trim() || '';
            const date = this.parseDate(dateText);
            
            // Skip if older than 7 days
            if (date && date < sevenDaysAgo) continue;

            // Extract subject/title (usually second or third column)
            const subject = cells[1]?.textContent?.trim() || cells[2]?.textContent?.trim() || '';
            
            // Extract description (look for longer text content)
            let description = '';
            for (let i = 2; i < cells.length; i++) {
              const cellText = cells[i]?.textContent?.trim() || '';
              if (cellText.length > description.length) {
                description = cellText;
              }
            }

            // Extract PDF links
            const pdfLinks = [];
            const attachments = [];
            
            row.querySelectorAll('a').forEach(link => {
              const href = link.href;
              const text = link.textContent?.trim() || '';
              
              if (href && (href.includes('.pdf') || text.toLowerCase().includes('pdf'))) {
                pdfLinks.push(href);
              } else if (href && href.includes('attachment')) {
                attachments.push(href);
              }
            });

            if (subject || description) {
              results.push({
                date: date ? date.toISOString().split('T')[0] : dateText,
                subject: subject || 'No subject',
                description: description || 'No description',
                pdfLink: pdfLinks[0] || null,
                attachments: attachments
              });
            }
          } catch (error) {
            console.error('Error processing row:', error);
            continue;
          }
        }

        return results;
      });

      console.log(`📊 [NSE SCRAPER] Extracted ${filings.length} filings`);
      return filings;
    } catch (error) {
      console.error('❌ [NSE SCRAPER] Failed to extract filings:', error.message);
      throw error;
    }
  }

  parseDate(dateString) {
    if (!dateString) return null;
    
    // Handle various date formats
    const formats = [
      /(\d{1,2})-(\d{1,2})-(\d{4})/,  // DD-MM-YYYY
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{1,2})-([A-Za-z]{3})-(\d{4})/ // DD-MMM-YYYY
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        const [, day, month, year] = match;
        
        // Handle month names
        const monthNames = {
          'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
          'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
          'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
        };
        
        const monthNum = monthNames[month.toLowerCase()] || month.padStart(2, '0');
        return new Date(`${year}-${monthNum}-${day.padStart(2, '0')}`);
      }
    }

    // Try parsing as-is
    try {
      return new Date(dateString);
    } catch {
      return null;
    }
  }

  async scrapeCompanyFilings(companyName, retryCount = 0) {
    const maxRetries = 3;
    const cacheKey = `filings_${companyName.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log(`💾 [NSE SCRAPER] Returning cached result for ${companyName}`);
      return cachedResult;
    }

    try {
      console.log(`🎯 [NSE SCRAPER] Starting scraping process for: ${companyName} (Attempt ${retryCount + 1}/${maxRetries})`);
      
      await this.initBrowser();
      await this.establishSession();
      await this.navigateToFilings();
      await this.searchCompany(companyName);
      const filings = await this.extractFilings(companyName);

      const result = {
        success: true,
        company: companyName,
        filings: filings,
        count: filings.length,
        timestamp: new Date().toISOString()
      };

      // Cache the result
      cache.set(cacheKey, result);
      
      console.log(`✅ [NSE SCRAPER] Successfully scraped ${filings.length} filings for ${companyName}`);
      return result;

    } catch (error) {
      console.error(`❌ [NSE SCRAPER] Error scraping ${companyName}:`, error.message);
      
      if (retryCount < maxRetries - 1) {
        console.log(`🔄 [NSE SCRAPER] Retrying in ${(retryCount + 1) * 2} seconds...`);
        await this.cleanup();
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return this.scrapeCompanyFilings(companyName, retryCount + 1);
      }

      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async cleanup() {
    console.log('🧹 [NSE SCRAPER] Cleaning up browser resources...');
    
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      console.log('✅ [NSE SCRAPER] Cleanup completed');
    } catch (error) {
      console.error('⚠️ [NSE SCRAPER] Error during cleanup:', error.message);
    }
  }
}

module.exports = NSEScraper;