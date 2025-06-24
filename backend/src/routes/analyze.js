const express = require('express');
const analyzeController = require('../controllers/analyze.controller');
const { nseRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * POST /api/v1/analyze
 * Accepts a company analysis request with hybrid NSE corporate announcements fetching
 * Body params:
 * - symbol: Required, company symbol (e.g., 'RELIANCE', 'TCS')
 * - issuer: Optional, company issuer name (e.g., 'Reliance Industries Limited')
 * - companyName: Legacy support for symbol
 * Query params:
 * - forceRefresh=true: Optional, to force refresh cookies
 */
router.post('/', nseRateLimiter, analyzeController.analyzeCompany);

/**
 * GET /api/v1/analyze
 * Accepts a company analysis request via query parameters for easier testing
 * Query params:
 * - symbol: Required, company symbol (e.g., 'RELIANCE', 'TCS')
 * - issuer: Optional, company issuer name (e.g., 'Reliance Industries Limited')
 * - companyName: Legacy support for symbol
 * - forceRefresh=true: Optional, to force refresh cookies
 */
router.get('/', nseRateLimiter, analyzeController.analyzeCompany);

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
    supportedMethods: ['GET', 'POST'],
    description: 'Hybrid corporate announcements endpoint for NSE-listed companies',
    implementation: 'Playwright + Axios Hybrid',
    parameters: {
      required: ['symbol'],
      optional: ['issuer', 'forceRefresh'],
      legacy: ['companyName']
    },
    examples: {
      post: {
        url: '/api/v1/analyze',
        method: 'POST',
        body: {
          symbol: 'RELIANCE',
          issuer: 'Reliance Industries Limited'
        }
      },
      get: {
        url: '/api/v1/analyze?symbol=TCS&issuer=Tata%20Consultancy%20Services%20Limited',
        method: 'GET'
      }
    }
  });
});

/**
 * GET /api/v1/analyze/test
 * Test endpoint for quick verification
 */
router.get('/test', nseRateLimiter, (req, res) => {
  const testSymbol = req.query.symbol || 'RELIANCE';

  // Redirect to main analyze endpoint with test symbol
  return analyzeController.analyzeCompany(
    {
      ...req,
      body: { symbol: testSymbol },
      query: { ...req.query, symbol: testSymbol }
    },
    res,
    (error) => {
      res.status(500).json({
        success: false,
        message: 'Test endpoint failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  );
});

module.exports = router;
