const NodeCache = require('node-cache');

// Rate limiting cache - stores last request time per company
const requestCache = new NodeCache();

/**
 * Rate limiter for NSE scraping requests
 * Enforces maximum 1 request per company every 10 seconds
 */
const nseRateLimiter = (req, res, next) => {
  try {
    const { companyName } = req.body;

    if (!companyName) {
      return next(); // Let validation handle this
    }

    const normalizedCompanyName = companyName.trim().toLowerCase().replace(/\s+/g, '_');
    const cacheKey = `rate_limit_${normalizedCompanyName}`;
    const currentTime = Date.now();

    // Check last request time for this company
    const lastRequestTime = requestCache.get(cacheKey);

    if (lastRequestTime) {
      const timeSinceLastRequest = currentTime - lastRequestTime;
      const minimumInterval = 10000; // 10 seconds

      if (timeSinceLastRequest < minimumInterval) {
        const remainingTime = minimumInterval - timeSinceLastRequest;
        const retryAfter = Math.ceil(remainingTime / 1000);

        console.log(`⏰ [RATE LIMIT] Request for "${companyName}" blocked. Retry after ${retryAfter} seconds`);

        return res.status(429).json({
          status: 'error',
          message: `Rate limit exceeded for company "${companyName}". Please wait ${retryAfter} seconds before trying again.`,
          retryAfter,
          timestamp: new Date().toISOString(),
          requestId: req.id || `req_${Date.now()}`
        });
      }
    }

    // Update last request time
    requestCache.set(cacheKey, currentTime, 60); // Store for 1 minute

    console.log(`✅ [RATE LIMIT] Request approved for: "${companyName}"`);
    next();

  } catch (error) {
    console.error('❌ [RATE LIMIT] Error in rate limiter:', error);
    next(); // Continue on error to avoid blocking legitimate requests
  }
};

/**
 * Global rate limiter for all API requests
 */
const globalRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const currentTime = Date.now();

    // Clean old entries
    requests.forEach((timestamps, ip) => {
      const validTimestamps = timestamps.filter(ts => currentTime - ts < windowMs);
      if (validTimestamps.length === 0) {
        requests.delete(ip);
      } else {
        requests.set(ip, validTimestamps);
      }
    });

    // Check current client
    const clientRequests = requests.get(clientId) || [];

    if (clientRequests.length >= max) {
      const retryAfter = Math.ceil(windowMs / 1000);

      return res.status(429).json({
        status: 'error',
        message: 'Too many requests from this IP',
        retryAfter,
        timestamp: new Date().toISOString()
      });
    }

    // Add current request
    clientRequests.push(currentTime);
    requests.set(clientId, clientRequests);

    next();
  };
};

module.exports = {
  nseRateLimiter,
  globalRateLimiter
};
