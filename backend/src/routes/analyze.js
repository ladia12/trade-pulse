const express = require('express');
const analyzeController = require('../controllers/analyze.controller');
const { nseRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * POST /api/v1/analyze
 * Accepts a company analysis request with NSE corporate filings scraping
 * Query params:
 * - download=true: Optional, to enable PDF downloads
 */
router.post('/', nseRateLimiter, analyzeController.analyzeCompany);

/**
 * GET /api/v1/analyze/status
 * Returns the status of the analyze endpoint
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'operational',
    endpoint: 'analyze',
    version: process.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString(),
    supportedMethods: ['POST'],
    description: 'Company analysis endpoint for NSE-listed companies'
  });
});

module.exports = router;
