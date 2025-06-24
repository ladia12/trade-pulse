const axios = require('axios');
const NodeCache = require('node-cache');

// Cache with 30-minute TTL for API responses
const apiCache = new NodeCache({ stdTTL: 1800 });

/**
 * NSE API Client Configuration
 */
const NSE_API_CONFIG = {
  baseURL: 'https://www.nseindia.com/api',
  timeout: 15000,
  maxRetries: 3,
  retryDelay: 2000
};

/**
 * Generate headers for NSE API requests
 * @param {string} userAgent - User agent from cookie extraction
 * @param {string} cookies - Cookie string from extraction
 * @returns {object} - Headers object for Axios request
 */
function generateAPIHeaders(userAgent, cookies) {
  return {
    'User-Agent': userAgent,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cookie': cookies,
    'Referer': 'https://www.nseindia.com/companies-listing/corporate-filings-announcements',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'X-Requested-With': 'XMLHttpRequest'
  };
}

/**
 * Filter announcements for the last 7 days
 * @param {Array} announcements - Array of announcement objects
 * @returns {Array} - Filtered announcements from last 7 days
 */
function filterLast7Days(announcements) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

  return announcements.filter(announcement => {
    try {
      // Parse NSE date format: "18-Jun-2025 19:08:25"
      const dateStr = announcement.exchdisstime;
      if (!dateStr) return false;

      // Extract date part and parse
      const datePart = dateStr.split(' ')[0]; // "18-Jun-2025"
      const [day, monthStr, year] = datePart.split('-');

      const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };

      const month = months[monthStr];
      if (month === undefined) return false;

      const announcementDate = new Date(parseInt(year), month, parseInt(day));
      return announcementDate >= sevenDaysAgo;

    } catch (error) {
      console.error('Error parsing date:', announcement.exchdisstime, error);
      return false;
    }
  });
}

/**
 * Extract and format required fields from announcement
 * @param {object} announcement - Raw announcement object from NSE API
 * @returns {object} - Formatted announcement with required fields only
 */
function formatAnnouncement(announcement) {
  return {
    symbol: announcement.symbol || '',
    desc: announcement.desc || '',
    attchmntFile: announcement.attchmntFile || '',
    smIndustry: announcement.smIndustry || '',
    attchmntText: announcement.attchmntText || '',
    fileSize: announcement.fileSize || '',
    exchdisstime: announcement.exchdisstime || ''
  };
}

/**
 * Fetch corporate announcements from NSE API
 * @param {string} symbol - Company symbol (e.g., 'RELIANCE')
 * @param {string} userAgent - User agent from cookie extraction
 * @param {string} cookies - Cookie string from extraction
 * @returns {Promise<Array>} - Array of filtered and formatted announcements
 */
async function fetchCorporateAnnouncements(symbol, userAgent, cookies) {
  console.log(`📡 Fetching corporate announcements for: ${symbol}`);

  // Check cache first
  const cacheKey = `announcements_${symbol.toLowerCase()}`;
  const cachedResult = apiCache.get(cacheKey);
  if (cachedResult) {
    console.log(`📋 Returning cached results for: ${symbol}`);
    return cachedResult;
  }

  // Prepare request parameters
  const params = {
    index: 'equities',
    symbol: symbol.toUpperCase()
  };

  const headers = generateAPIHeaders(userAgent, cookies);

  console.log(`🔗 Request URL: ${NSE_API_CONFIG.baseURL}/corporate-announcements`);
  console.log(`📋 Request params:`, params);

  let attempt = 0;
  let lastError = null;

  while (attempt < NSE_API_CONFIG.maxRetries) {
    attempt++;
    console.log(`🔄 Attempt ${attempt}/${NSE_API_CONFIG.maxRetries} for API request`);

    try {
      const response = await axios.get(`${NSE_API_CONFIG.baseURL}/corporate-announcements`, {
        params,
        headers,
        timeout: NSE_API_CONFIG.timeout,
        validateStatus: (status) => status < 500 // Accept 4xx as valid responses to handle gracefully
      });

      console.log(`✅ API response received - Status: ${response.status}`);

      if (response.status === 200 && response.data) {
        const announcements = response.data;
        console.log(`📊 Received ${announcements.length} total announcements`);

        // Filter for last 7 days
        const recentAnnouncements = filterLast7Days(announcements);
        console.log(`📅 Found ${recentAnnouncements.length} announcements from last 7 days`);

        // Format announcements with required fields only
        const formattedAnnouncements = recentAnnouncements.map(formatAnnouncement);

        // Cache the result
        apiCache.set(cacheKey, formattedAnnouncements);

        console.log(`✅ Corporate announcements fetched successfully for: ${symbol}`);
        return formattedAnnouncements;

      } else if (response.status === 404) {
        console.log(`ℹ️ No announcements found for symbol: ${symbol}`);
        return [];

      } else if (response.status === 403) {
        throw new Error('Access forbidden - cookies may be invalid or expired');

      } else {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      lastError = error;

      if (error.code === 'ECONNABORTED') {
        console.error(`⏰ Request timeout (attempt ${attempt})`);
      } else if (error.response) {
        console.error(`❌ API error (attempt ${attempt}): ${error.response.status} - ${error.response.statusText}`);

        // Don't retry for client errors (4xx) except 429 (rate limit)
        if (error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
          break;
        }
      } else {
        console.error(`❌ Network error (attempt ${attempt}): ${error.message}`);
      }

      // Wait before retry (exponential backoff)
      if (attempt < NSE_API_CONFIG.maxRetries) {
        const delay = NSE_API_CONFIG.retryDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`💥 All ${NSE_API_CONFIG.maxRetries} API attempts failed for: ${symbol}`);
  throw lastError || new Error('Failed to fetch corporate announcements after all retry attempts');
}

/**
 * Get company announcements
 * @param {string} symbol - Company symbol
 * @param {string} userAgent - User agent from cookie extraction
 * @param {string} cookies - Cookie string from extraction
 * @returns {Promise<Array>} - Array of filtered and formatted announcements
 */
async function getCompanyAnnouncements(symbol, userAgent, cookies) {
  return await fetchCorporateAnnouncements(symbol, userAgent, cookies);
}

module.exports = {
  getCompanyAnnouncements
};
