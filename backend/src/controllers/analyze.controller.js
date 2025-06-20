const { validateCompany } = require('../utils/validateCompany');
const { scrapeNSEFilings } = require('../utils/nseScraper');

/**
 * Analyze Company Controller
 * Handles POST requests to analyze NSE-listed companies and fetch corporate filings
 */
const analyzeCompany = async (req, res, next) => {
  try {
    const startTime = Date.now();

    // Extract company name and options from request body
    const { companyName } = req.body;
    const { download } = req.query; // Optional query param for PDF downloads

    // Validate the company name
    const validation = validateCompany(companyName);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 'error',
        message: validation.message,
        timestamp: new Date().toISOString(),
        requestId: req.id || `req_${Date.now()}`
      });
    }

    // Normalize company name for processing
    const normalizedCompanyName = companyName.trim();

    // Log the analysis request
    console.log(`📊 [ANALYSIS REQUEST] Received analysis request for: "${normalizedCompanyName}"`);
    console.log(`🔍 [ANALYSIS REQUEST] Request ID: ${req.id || `req_${Date.now()}`}`);
    console.log(`⏰ [ANALYSIS REQUEST] Timestamp: ${new Date().toISOString()}`);
    console.log(`📥 [ANALYSIS REQUEST] Download PDFs: ${download === 'true' ? 'Yes' : 'No'}`);

    try {
      // Scrape NSE filings for the company
      const scrapingOptions = {
        maxRetries: 3,
        downloadPdfs: download === 'true'
      };

      console.log(`🔍 [NSE SCRAPER] Starting NSE filings extraction for: "${normalizedCompanyName}"`);
      const scrapingResult = await scrapeNSEFilings(normalizedCompanyName, scrapingOptions);

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Return successful response with filings data
      return res.status(200).json({
        success: true,
        company: normalizedCompanyName,
        filings: scrapingResult.filings,
        count: scrapingResult.count,
        timestamp: scrapingResult.timestamp,
        cached: scrapingResult.cached,
        responseTime: `${responseTime}ms`,
        requestId: req.id || `req_${Date.now()}`,
        metadata: {
          searchTerm: normalizedCompanyName,
          filingsFrom: 'last 7 days',
          source: 'NSE India Corporate Filings',
          extractionMethod: 'Playwright web scraping'
        }
      });

    } catch (scrapingError) {
      console.error(`❌ [NSE SCRAPER] Scraping failed for "${normalizedCompanyName}":`, scrapingError.message);

      // Check if it's a specific error we can handle gracefully
      if (scrapingError.message.includes('Could not find company search input')) {
        return res.status(503).json({
          success: false,
          status: 'error',
          message: 'NSE website structure has changed. Please try again later or contact support.',
          company: normalizedCompanyName,
          errorType: 'WEBSITE_STRUCTURE_CHANGED',
          timestamp: new Date().toISOString(),
          requestId: req.id || `req_${Date.now()}`
        });
      }

      if (scrapingError.message.includes('Failed to establish NSE session')) {
        return res.status(503).json({
          success: false,
          status: 'error',
          message: 'Unable to connect to NSE website. Please check your internet connection and try again.',
          company: normalizedCompanyName,
          errorType: 'CONNECTION_FAILED',
          timestamp: new Date().toISOString(),
          requestId: req.id || `req_${Date.now()}`
        });
      }

      if (scrapingError.message.includes('Scraping failed after all retry attempts')) {
        return res.status(503).json({
          success: false,
          status: 'error',
          message: 'NSE website is currently unavailable or experiencing issues. Please try again later.',
          company: normalizedCompanyName,
          errorType: 'SERVICE_UNAVAILABLE',
          timestamp: new Date().toISOString(),
          requestId: req.id || `req_${Date.now()}`
        });
      }

      // Generic scraping error
      return res.status(500).json({
        success: false,
        status: 'error',
        message: 'An error occurred while extracting corporate filings. Please try again.',
        company: normalizedCompanyName,
        errorType: 'SCRAPING_ERROR',
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

module.exports = {
  analyzeCompany
};
