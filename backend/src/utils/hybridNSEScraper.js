const { extractNSECookies } = require('./cookieExtractor');
const { getCompanyAnnouncements } = require('./nseApiClient');
const NodeCache = require('node-cache');

// Cache with 1-hour TTL for cookie sessions
const cookieCache = new NodeCache({ stdTTL: 3600 });

/**
 * Hybrid NSE Scraper Configuration
 */
const HYBRID_CONFIG = {
  cookieCacheKey: 'nse_session_cookies',
  maxCookieRetries: 2,
  cookieExpiryBuffer: 300000, // 5 minutes buffer before cookie expiry
};

/**
 * Get valid NSE session cookies (from cache or fresh extraction)
 * @returns {Promise<{cookies: string, userAgent: string}>} - Valid session cookies and user agent
 */
async function getValidNSESession() {
  console.log('🔐 Getting valid NSE session...');

  // Check cache for existing valid session
  const cachedSession = cookieCache.get(HYBRID_CONFIG.cookieCacheKey);
  if (cachedSession) {
    console.log('✅ Using cached NSE session');
    return cachedSession;
  }

  console.log('🍪 No valid cached session, extracting fresh cookies...');

  let attempt = 0;
  let lastError = null;

  while (attempt < HYBRID_CONFIG.maxCookieRetries) {
    attempt++;
    console.log(`🔄 Cookie extraction attempt ${attempt}/${HYBRID_CONFIG.maxCookieRetries}`);

    try {
      const sessionData = await extractNSECookies();

      if (sessionData.cookies && sessionData.userAgent) {
        console.log(`✅ Fresh cookies extracted successfully (${sessionData.cookieCount} cookies)`);

        // Cache the session with buffer time
        const cacheTime = HYBRID_CONFIG.cookieExpiryBuffer / 1000; // Convert to seconds
        cookieCache.set(HYBRID_CONFIG.cookieCacheKey, sessionData, cacheTime);

        return sessionData;
      } else {
        throw new Error('Invalid session data returned from cookie extraction');
      }

    } catch (error) {
      lastError = error;
      console.error(`❌ Cookie extraction attempt ${attempt} failed:`, error.message);

      if (attempt < HYBRID_CONFIG.maxCookieRetries) {
        const backoffDelay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }

  console.error(`💥 All ${HYBRID_CONFIG.maxCookieRetries} cookie extraction attempts failed`);
  throw lastError || new Error('Failed to obtain valid NSE session after all retry attempts');
}

/**
 * Scrape NSE corporate announcements using hybrid approach
 * @param {string} symbol - Company symbol (e.g., 'RELIANCE', 'TCS')
 * @param {object} options - Scraping options
 * @param {string} options.issuer - Optional issuer name
 * @param {boolean} options.forceRefresh - Force refresh cookies
 * @returns {Promise<object>} - Scraping result with announcements
 */
async function scrapeNSEAnnouncementsHybrid(symbol, options = {}) {
  const { issuer = null, forceRefresh = false } = options;

  console.log(`🚀 Starting hybrid NSE scraping for: ${symbol}`);
  console.log(`📋 Options:`, { issuer, forceRefresh });

  const startTime = Date.now();

  try {
    // Step 1: Clear cache if force refresh is requested
    if (forceRefresh) {
      console.log('🔄 Force refresh requested, clearing cookie cache...');
      cookieCache.del(HYBRID_CONFIG.cookieCacheKey);
    }

    // Step 2: Get valid NSE session (cookies + user agent)
    const sessionData = await getValidNSESession();
    console.log('🔐 Valid NSE session obtained');

    // Step 3: Fetch corporate announcements using API
    console.log('📡 Fetching corporate announcements via API...');
    const announcements = await getCompanyAnnouncements(
      symbol,
      sessionData.userAgent,
      sessionData.cookies,
      issuer
    );

    // Step 4: Format response
    const responseTime = Date.now() - startTime;

    const result = {
      success: true,
      company: symbol.toUpperCase(),
      announcements,
      count: announcements.length,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      method: 'hybrid',
      sessionInfo: {
        cookieCount: sessionData.cookieCount,
        extractedAt: sessionData.extractedAt,
        cached: sessionData.cached || false
      }
    };

    console.log(`✅ Hybrid scraping completed for: ${symbol}`);
    console.log(`📊 Found ${announcements.length} recent announcements`);
    console.log(`⏱️ Total response time: ${responseTime}ms`);

    return result;

  } catch (error) {
    const responseTime = Date.now() - startTime;

    console.error(`❌ Hybrid scraping failed for: ${symbol}`, error.message);

    // Enhanced error classification
    let errorType = 'UNKNOWN_ERROR';
    let errorMessage = 'An unexpected error occurred while fetching corporate announcements.';

    if (error.message.includes('Failed to extract cookies')) {
      errorType = 'COOKIE_EXTRACTION_FAILED';
      errorMessage = 'Unable to establish session with NSE website. Please try again later.';
    } else if (error.message.includes('Access forbidden')) {
      errorType = 'ACCESS_FORBIDDEN';
      errorMessage = 'Access to NSE API was denied. Session may have expired.';
    } else if (error.message.includes('timeout')) {
      errorType = 'TIMEOUT_ERROR';
      errorMessage = 'Request timed out. NSE services may be experiencing high load.';
    } else if (error.message.includes('Network Error') || error.code === 'ECONNREFUSED') {
      errorType = 'NETWORK_ERROR';
      errorMessage = 'Unable to connect to NSE services. Please check your internet connection.';
    } else if (error.response && error.response.status === 404) {
      errorType = 'SYMBOL_NOT_FOUND';
      errorMessage = `No announcements found for symbol: ${symbol}. Please verify the symbol is correct.`;
    }

    const errorResult = {
      success: false,
      company: symbol.toUpperCase(),
      error: errorMessage,
      errorType,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      method: 'hybrid'
    };

    throw { ...error, hybridResult: errorResult };
  }
}

/**
 * Validate symbol format
 * @param {string} symbol - Company symbol to validate
 * @returns {object} - Validation result
 */
function validateSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') {
    return {
      isValid: false,
      message: 'Symbol is required and must be a string'
    };
  }

  const cleanSymbol = symbol.trim().toUpperCase();

  if (cleanSymbol.length === 0) {
    return {
      isValid: false,
      message: 'Symbol cannot be empty'
    };
  }

  if (cleanSymbol.length > 20) {
    return {
      isValid: false,
      message: 'Symbol is too long (maximum 20 characters)'
    };
  }

  // Basic symbol validation (alphanumeric + common characters)
  if (!/^[A-Z0-9&.-]+$/.test(cleanSymbol)) {
    return {
      isValid: false,
      message: 'Symbol contains invalid characters. Use only letters, numbers, &, ., and -'
    };
  }

  return {
    isValid: true,
    symbol: cleanSymbol
  };
}

/**
 * Clear cached session data (for testing or troubleshooting)
 */
function clearCachedSession() {
  console.log('🧹 Clearing cached NSE session data...');
  cookieCache.del(HYBRID_CONFIG.cookieCacheKey);
  console.log('✅ Cached session data cleared');
}

/**
 * Get cache statistics
 * @returns {object} - Cache statistics
 */
function getCacheStats() {
  const keys = cookieCache.keys();
  const stats = cookieCache.getStats();

  return {
    cachedSessions: keys.length,
    cacheHits: stats.hits,
    cacheMisses: stats.misses,
    cacheKeys: keys
  };
}

module.exports = {
  scrapeNSEAnnouncementsHybrid,
  validateSymbol
};
