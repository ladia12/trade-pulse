const { validateCompany } = require('../utils/validateCompany');
const NSEScraper = require('../services/nseScraper');

// Rate limiting map to track requests per company
const requestTracker = new Map();
const RATE_LIMIT_WINDOW = 10000; // 10 seconds

/**
 * Check if company request is rate limited
 */
const isRateLimited = (companyName) => {
  const normalizedName = companyName.toLowerCase().trim();
  const lastRequest = requestTracker.get(normalizedName);
  
  if (lastRequest && Date.now() - lastRequest < RATE_LIMIT_WINDOW) {
    return true;
  }
  
  requestTracker.set(normalizedName, Date.now());
  return false;
};

/**
 * Analyze Company Controller
 * Handles POST requests to analyze NSE-listed companies
 */
const analyzeCompany = async (req, res, next) => {
  let scraper = null;
  
  try {
    const startTime = Date.now();
    
    // Extract company name from request body
    const { companyName } = req.body;
    const downloadPDFs = req.query.download === 'true';

    // Validate the company name
    const validation = validateCompany(companyName);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: validation.message,
        timestamp: new Date().toISOString(),
        requestId: req.id || `req_${Date.now()}`
      });
    }

    // Normalize company name for processing
    const normalizedCompanyName = companyName.trim();

    // Check rate limiting
    if (isRateLimited(normalizedCompanyName)) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMITED',
        message: `Rate limit exceeded for ${normalizedCompanyName}. Please wait 10 seconds between requests.`,
        timestamp: new Date().toISOString(),
        requestId: req.id || `req_${Date.now()}`,
        retryAfter: 10
      });
    }

    // Log the analysis request
    console.log(`📊 [ANALYSIS REQUEST] Starting real-time scraping for: "${normalizedCompanyName}"`);
    console.log(`🔍 [ANALYSIS REQUEST] Request ID: ${req.id || `req_${Date.now()}`}`);
    console.log(`⏰ [ANALYSIS REQUEST] Timestamp: ${new Date().toISOString()}`);
    console.log(`📥 [ANALYSIS REQUEST] Download PDFs: ${downloadPDFs}`);

    // Initialize scraper and perform real-time scraping
    scraper = new NSEScraper();
    
    console.log(`🚀 [ANALYSIS] Starting NSE scraping process...`);
    const scrapingResult = await scraper.scrapeCompanyFilings(normalizedCompanyName);

    // Calculate response time
    const responseTime = Date.now() - startTime;

    console.log(`✅ [ANALYSIS] Scraping completed successfully`);
    console.log(`📊 [ANALYSIS] Found ${scrapingResult.count} filings`);
    console.log(`⏱️ [ANALYSIS] Total processing time: ${responseTime}ms`);

    // Prepare response
    const response = {
      success: true,
      company: normalizedCompanyName,
      filings: scrapingResult.filings,
      count: scrapingResult.count,
      timestamp: new Date().toISOString(),
      requestId: req.id || `req_${Date.now()}`,
      processingTime: `${responseTime}ms`,
      source: 'NSE India Corporate Filings',
      dataFreshness: 'Real-time',
      filterCriteria: 'Last 7 days'
    };

    // Add PDF download information if requested
    if (downloadPDFs && scrapingResult.filings.length > 0) {
      response.downloadInfo = {
        totalPDFs: scrapingResult.filings.filter(f => f.pdfLink).length,
        note: 'PDF download functionality can be implemented based on requirements'
      };
    }

    // Return successful response
    return res.status(200).json(response);

  } catch (error) {
    console.error(`❌ [ANALYSIS ERROR] Scraping failed:`, error);
    
    // Determine error type and appropriate response
    let statusCode = 500;
    let errorCode = 'SCRAPING_ERROR';
    let message = 'Failed to retrieve corporate filings. Please try again later.';

    if (error.message.includes('timeout') || error.message.includes('navigation')) {
      statusCode = 504;
      errorCode = 'TIMEOUT_ERROR';
      message = 'Request timed out while accessing NSE website. Please try again.';
    } else if (error.message.includes('blocked') || error.message.includes('captcha')) {
      statusCode = 503;
      errorCode = 'ACCESS_BLOCKED';
      message = 'Temporary access restriction detected. Please try again in a few minutes.';
    } else if (error.message.includes('not found') || error.message.includes('no results')) {
      statusCode = 404;
      errorCode = 'COMPANY_NOT_FOUND';
      message = 'Company not found in NSE listings or no recent filings available.';
    }

    const errorResponse = {
      success: false,
      error: errorCode,
      message,
      timestamp: new Date().toISOString(),
      requestId: req.id || `req_${Date.now()}`,
      company: req.body.companyName || 'unknown'
    };

    // Add debug information in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.debug = {
        originalError: error.message,
        stack: error.stack
      };
    }

    return res.status(statusCode).json(errorResponse);
  } finally {
    // Ensure cleanup happens
    if (scraper) {
      try {
        await scraper.cleanup();
      } catch (cleanupError) {
        console.error('⚠️ [CLEANUP ERROR]:', cleanupError.message);
      }
    }
  }
};

/**
 * Get Analysis Status
 * Returns the current status of the analysis service
 */
const getAnalysisStatus = async (req, res) => {
  try {
    const status = {
      service: 'NSE Corporate Filings Analyzer',
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      capabilities: {
        realTimeScrapingEnabled: true,
        cachingEnabled: true,
        rateLimitingEnabled: true,
        stealthModeEnabled: true,
        supportedSources: ['NSE India Corporate Filings'],
        maxRetries: 3,
        cacheTimeout: '1 hour',
        rateLimit: '1 request per 10 seconds per company'
      },
      lastUpdated: new Date().toISOString(),
      healthCheck: {
        browserSupport: 'Chromium with Playwright',
        stealthFeatures: [
          'User-Agent rotation',
          'Viewport randomization',
          'Human behavior simulation',
          'Session management',
          'Anti-detection measures'
        ]
      }
    };

    res.status(200).json(status);
  } catch (error) {
    console.error('❌ [STATUS ERROR]:', error);
    res.status(500).json({
      service: 'NSE Corporate Filings Analyzer',
      status: 'error',
      message: 'Failed to retrieve service status',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  analyzeCompany,
  getAnalysisStatus
};