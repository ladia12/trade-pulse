const express = require('express');
const { testConnection } = require('../utils/supabaseClient');

const router = express.Router();

/**
 * Health Check Endpoint
 * GET /api/health
 * Returns the current status of the API server and database connection
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();

    // Test database connection
    const dbStatus = await testConnection();

    const responseTime = Date.now() - startTime;

    res.status(200).json({
      status: 'success',
      message: 'Trade Pulse Backend API is running',
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || 'v1',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: dbStatus,
        provider: 'Supabase PostgreSQL'
      },
      endpoints: {
        analyze: `/api/${process.env.API_VERSION || 'v1'}/analyze`,
        health: '/api/health',
        diagnose: '/api/diagnose'
      }
    });
  } catch (error) {
    console.error('❌ [HEALTH CHECK] Error during health check:', error);

    res.status(503).json({
      status: 'error',
      message: 'Service temporarily unavailable',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false,
        provider: 'Supabase PostgreSQL'
      }
    });
  }
});

/**
 * Database Health Check Endpoint
 * GET /api/health/database
 * Returns detailed database connection status
 */
router.get('/database', async (req, res) => {
  try {
    const startTime = Date.now();
    const dbStatus = await testConnection();
    const responseTime = Date.now() - startTime;

    if (dbStatus) {
      res.status(200).json({
        status: 'success',
        message: 'Database connection healthy',
        database: {
          connected: true,
          provider: 'Supabase PostgreSQL',
          url: process.env.SUPABASE_URL ? 'configured' : 'missing',
          responseTime: `${responseTime}ms`
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'error',
        message: 'Database connection failed',
        database: {
          connected: false,
          provider: 'Supabase PostgreSQL',
          url: process.env.SUPABASE_URL ? 'configured' : 'missing',
          responseTime: `${responseTime}ms`
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ [DB HEALTH CHECK] Error during database health check:', error);

    res.status(503).json({
      status: 'error',
      message: 'Database health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
