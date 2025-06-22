const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import middlewares
const logger = require('./middlewares/logger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Import routes
const analyzeRoutes = require('./routes/analyze');
const healthRoutes = require('./routes/health');
const diagnoseRoutes = require('./routes/diagnose');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(logger);

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/diagnose', diagnoseRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/analyze`, analyzeRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Trade Pulse Backend API',
    version: process.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      diagnose: '/api/diagnose',
      analyze: `/api/${process.env.API_VERSION || 'v1'}/analyze`
    }
  });
});

// Handle 404 for undefined routes
app.use('*', notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
