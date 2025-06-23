const { scrapeNSEAnnouncementsHybrid, validateSymbol } = require('../utils/hybridNSEScraper');

/**
 * Analyze Company Controller - Hybrid Implementation
 * Handles POST requests to analyze NSE-listed companies and fetch corporate announcements
 * Uses hybrid approach: Playwright for cookie extraction + Axios for API calls
 */
const analyzeCompany = async (req, res, next) => {
  try {
    const startTime = Date.now();

    // Extract symbol and issuer from request body or query params
    let { symbol, issuer, companyName } = req.body;

    // Support legacy companyName parameter for backward compatibility
    if (!symbol && companyName) {
      symbol = companyName;
    }

    // Also check query parameters
    if (!symbol) {
      symbol = req.query.symbol || req.query.companyName;
    }
    if (!issuer) {
      issuer = req.query.issuer;
    }

    // Validate the symbol
    const validation = validateSymbol(symbol);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: validation.message,
        timestamp: new Date().toISOString(),
        requestId: req.id || `req_${Date.now()}`
      });
    }

    const validatedSymbol = validation.symbol;

    // Log the analysis request
    console.log(`📊 [HYBRID ANALYSIS] Received analysis request for: "${validatedSymbol}"`);
    console.log(`🔍 [HYBRID ANALYSIS] Request ID: ${req.id || `req_${Date.now()}`}`);
    console.log(`⏰ [HYBRID ANALYSIS] Timestamp: ${new Date().toISOString()}`);
    console.log(`🏢 [HYBRID ANALYSIS] Issuer: ${issuer || 'Auto-detect'}`);

    try {
      // Use hybrid scraping approach
      const scrapingOptions = {
        issuer: issuer || null,
        forceRefresh: req.query.forceRefresh === 'true'
      };

      console.log(`🚀 [HYBRID SCRAPER] Starting hybrid NSE analysis for: "${validatedSymbol}"`);
      const scrapingResult = await scrapeNSEAnnouncementsHybrid(validatedSymbol, scrapingOptions);

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Return successful response with announcements data
      return res.status(200).json({
        success: true,
        symbol: validatedSymbol,
        issuer: issuer || 'Auto-detected',
        announcements: scrapingResult.announcements,
        count: scrapingResult.count,
        timestamp: scrapingResult.timestamp,
        responseTime: `${responseTime}ms`,
        requestId: req.id || `req_${Date.now()}`,
        method: 'hybrid',
        sessionInfo: scrapingResult.sessionInfo,
        metadata: {
          searchTerm: validatedSymbol,
          announcementsFrom: 'last 7 days',
          source: 'NSE India Corporate Announcements API',
          extractionMethod: 'Hybrid (Playwright + Axios)',
          requiredFields: [
            'symbol',
            'desc',
            'attchmntFile',
            'smIndustry',
            'attchmntText',
            'fileSize',
            'exchdisstime'
          ]
        }
      });

    } catch (scrapingError) {
      console.error(`❌ [HYBRID SCRAPER] Scraping failed for "${validatedSymbol}":`, scrapingError.message);

      // Check if we have a structured error result from the hybrid scraper
      if (scrapingError.hybridResult) {
        const errorResult = scrapingError.hybridResult;
        const statusCode = getStatusCodeForErrorType(errorResult.errorType);

        return res.status(statusCode).json({
          ...errorResult,
          requestId: req.id || `req_${Date.now()}`
        });
      }

      // Handle specific error types for better user experience
      if (scrapingError.message.includes('Symbol is required')) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'Company symbol is required. Please provide a valid NSE symbol (e.g., RELIANCE, TCS).',
          symbol: validatedSymbol,
          errorType: 'MISSING_SYMBOL',
          timestamp: new Date().toISOString(),
          requestId: req.id || `req_${Date.now()}`
        });
      }

      if (scrapingError.message.includes('Failed to extract cookies')) {
        return res.status(503).json({
          success: false,
          status: 'error',
          message: 'Unable to establish connection with NSE website. Please try again later.',
          symbol: validatedSymbol,
          errorType: 'SESSION_FAILED',
          timestamp: new Date().toISOString(),
          requestId: req.id || `req_${Date.now()}`
        });
      }

      if (scrapingError.message.includes('Access forbidden')) {
        return res.status(403).json({
          success: false,
          status: 'error',
          message: 'Access to NSE services was denied. Please try again in a few minutes.',
          symbol: validatedSymbol,
          errorType: 'ACCESS_DENIED',
          timestamp: new Date().toISOString(),
          requestId: req.id || `req_${Date.now()}`
        });
      }

      if (scrapingError.message.includes('timeout')) {
        return res.status(504).json({
          success: false,
          status: 'error',
          message: 'Request timed out. NSE services may be experiencing high load. Please try again.',
          symbol: validatedSymbol,
          errorType: 'TIMEOUT',
          timestamp: new Date().toISOString(),
          requestId: req.id || `req_${Date.now()}`
        });
      }

      // Generic hybrid scraping error
      return res.status(500).json({
        success: false,
        status: 'error',
        message: 'An error occurred while fetching corporate announcements. Please try again.',
        symbol: validatedSymbol,
        errorType: 'HYBRID_SCRAPING_ERROR',
        timestamp: new Date().toISOString(),
        requestId: req.id || `req_${Date.now()}`
      });
    }

  } catch (error) {
    console.error(`❌ [ANALYSIS ERROR] Unexpected error in analyzeCompany controller:`, error);

    // Pass error to global error handler
    next(error);
  }
};

/**
 * Get appropriate HTTP status code for error type
 * @param {string} errorType - Error type from hybrid scraper
 * @returns {number} - HTTP status code
 */
function getStatusCodeForErrorType(errorType) {
  const statusMap = {
    'COOKIE_EXTRACTION_FAILED': 503,
    'ACCESS_FORBIDDEN': 403,
    'TIMEOUT_ERROR': 504,
    'NETWORK_ERROR': 503,
    'SYMBOL_NOT_FOUND': 404,
    'UNKNOWN_ERROR': 500
  };

  return statusMap[errorType] || 500;
}

module.exports = {
  analyzeCompany
};
