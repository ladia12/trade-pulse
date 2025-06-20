const express = require('express');
const analyzeController = require('../controllers/analyze.controller');

const router = express.Router();

/**
 * POST /api/v1/analyze
 * Accepts a company analysis request and performs real-time NSE scraping
 * 
 * Body: { "companyName": "Reliance Industries" }
 * Query: ?download=true (optional, for PDF download indication)
 */
router.post('/', analyzeController.analyzeCompany);

/**
 * GET /api/v1/analyze/status
 * Returns the status of the analyze endpoint and scraping capabilities
 */
router.get('/status', analyzeController.getAnalysisStatus);

/**
 * GET /api/v1/analyze/health
 * Health check specifically for the analysis service
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'NSE Corporate Filings Analyzer',
    endpoint: 'analyze',
    version: process.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString(),
    capabilities: {
      realTimeScrapingEnabled: true,
      stealthModeEnabled: true,
      rateLimitingEnabled: true,
      cachingEnabled: true
    },
    supportedMethods: ['POST'],
    description: 'Real-time NSE corporate filings scraper with advanced stealth techniques'
  });
});

module.exports = router;