const { logError } = require('./logger');

/**
 * Global Error Handler Middleware
 * Catches and handles all unhandled errors in the application
 */
const errorHandler = (error, req, res, next) => {
  // Log the error with request context
  logError(error, req);

  // Default error response
  let statusCode = 500;
  let message = 'An unexpected error occurred. Please try again later.';
  let errorCode = 'INTERNAL_SERVER_ERROR';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Invalid input data provided';
    errorCode = 'VALIDATION_ERROR';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format provided';
    errorCode = 'CAST_ERROR';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry detected';
    errorCode = 'DUPLICATE_ERROR';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    errorCode = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
    errorCode = 'EXPIRED_TOKEN';
  } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    statusCode = 400;
    message = 'Invalid JSON format in request body';
    errorCode = 'INVALID_JSON';
  } else if (error.statusCode) {
    // Use error's status code if available
    statusCode = error.statusCode;
    message = error.message || message;
    errorCode = error.code || errorCode;
  }

  // Prepare error response
  const errorResponse = {
    status: 'error',
    message,
    errorCode,
    timestamp: new Date().toISOString(),
    requestId: req.id || `req_${Date.now()}`,
    path: req.originalUrl,
    method: req.method
  };

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = {
      name: error.name,
      originalMessage: error.message
    };
  }

  // Add additional context for specific errors
  if (error.name === 'ValidationError' && error.errors) {
    errorResponse.validationErrors = Object.keys(error.errors).map(key => ({
      field: key,
      message: error.errors[key].message
    }));
  }

  // Handle timeout errors
  if (error.code === 'ETIMEDOUT' || error.timeout) {
    statusCode = 408;
    errorResponse.message = 'Request timeout. Please try again.';
    errorResponse.errorCode = 'REQUEST_TIMEOUT';
  }

  // Handle rate limiting errors
  if (error.statusCode === 429) {
    errorResponse.message = 'Too many requests. Please try again later.';
    errorResponse.errorCode = 'RATE_LIMIT_EXCEEDED';
    errorResponse.retryAfter = error.retryAfter || '15 minutes';
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not Found Handler
 * Handles 404 errors for undefined routes
 */
const notFoundHandler = (req, res) => {
  const error = {
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
    errorCode: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    requestId: req.id || `req_${Date.now()}`,
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      health: '/api/health',
      analyze: `/api/${process.env.API_VERSION || 'v1'}/analyze`
    }
  };

  console.log(`🔍 [404] Route not found: ${req.method} ${req.originalUrl}`);
  console.log(`🔗 [404] Request ID: ${req.id || 'unknown'}`);
  
  res.status(404).json(error);
};

/**
 * Create Application Error
 * Helper function to create standardized application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'APPLICATION_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  AppError
};