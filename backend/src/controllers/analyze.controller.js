const { validateCompany } = require('../utils/validateCompany');

/**
 * Analyze Company Controller
 * Handles POST requests to analyze NSE-listed companies
 */
const analyzeCompany = async (req, res, next) => {
  try {
    const startTime = Date.now();
    
    // Extract company name from request body
    const { companyName } = req.body;

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

    // Simulate asynchronous processing initiation
    // In a real implementation, this would trigger background processing
    setTimeout(() => {
      console.log(`🚀 [ASYNC PROCESSING] Starting background analysis for: "${normalizedCompanyName}"`);
      console.log(`📋 [ASYNC PROCESSING] Processing steps:`);
      console.log(`   1. Fetching NSE filings for ${normalizedCompanyName}`);
      console.log(`   2. Extracting PDF documents from last 7 days`);
      console.log(`   3. Running LLM analysis on corporate filings`);
      console.log(`   4. Generating insights and key findings`);
      console.log(`   5. Preparing analysis report`);
      
      // Simulate processing completion after some time
      setTimeout(() => {
        console.log(`✅ [ASYNC PROCESSING] Analysis completed for: "${normalizedCompanyName}"`);
        console.log(`📊 [ASYNC PROCESSING] Results would be stored and made available via separate endpoint`);
      }, 3000); // Simulate 3 seconds of processing
      
    }, 100); // Start processing after 100ms

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Return immediate 202 Accepted response
    return res.status(202).json({
      status: 'accepted',
      message: `Analysis request received for ${normalizedCompanyName}`,
      companyName: normalizedCompanyName,
      requestId: req.id || `req_${Date.now()}`,
      timestamp: new Date().toISOString(),
      estimatedProcessingTime: '2-5 minutes',
      responseTime: `${responseTime}ms`,
      nextSteps: [
        'Corporate filings will be fetched from NSE',
        'PDF documents will be analyzed using AI',
        'Key insights will be extracted and summarized',
        'Results will be available via status endpoint'
      ]
    });

  } catch (error) {
    console.error(`❌ [ANALYSIS ERROR] Unexpected error in analyzeCompany controller:`, error);
    
    // Pass error to global error handler
    next(error);
  }
};

module.exports = {
  analyzeCompany
};