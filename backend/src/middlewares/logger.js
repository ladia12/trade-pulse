/**
 * HTTP Request Logger Middleware
 * Logs all incoming HTTP requests with detailed information
 */

const logger = (req, res, next) => {
  const startTime = Date.now();
  
  // Generate unique request ID
  req.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Get client IP address
  const clientIP = req.ip || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                   req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                   'unknown';

  // Get user agent
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // Log request details
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(`🔗 [REQUEST] ID: ${req.id}`);
  console.log(`🌐 [REQUEST] IP: ${clientIP}`);
  console.log(`📱 [REQUEST] User-Agent: ${userAgent}`);
  
  // Log request headers (excluding sensitive information)
  const safeHeaders = { ...req.headers };
  delete safeHeaders.authorization;
  delete safeHeaders.cookie;
  delete safeHeaders['x-api-key'];
  
  if (Object.keys(safeHeaders).length > 0) {
    console.log(`📋 [REQUEST] Headers:`, JSON.stringify(safeHeaders, null, 2));
  }
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const safeBody = { ...req.body };
    // Remove sensitive fields if they exist
    delete safeBody.password;
    delete safeBody.token;
    delete safeBody.apiKey;
    
    console.log(`📦 [REQUEST] Body:`, JSON.stringify(safeBody, null, 2));
  }
  
  // Log query parameters
  if (Object.keys(req.query).length > 0) {
    console.log(`🔍 [REQUEST] Query:`, JSON.stringify(req.query, null, 2));
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Log response details
    console.log(`📤 [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode}`);
    console.log(`⏱️  [RESPONSE] Time: ${responseTime}ms`);
    console.log(`📊 [RESPONSE] Status: ${res.statusCode}`);
    
    // Log response body for non-2xx status codes or if it's small enough
    if (res.statusCode >= 400 || JSON.stringify(data).length < 1000) {
      console.log(`📋 [RESPONSE] Body:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`📋 [RESPONSE] Body: [Large response body - ${JSON.stringify(data).length} characters]`);
    }
    
    console.log(`${'='.repeat(80)}`);
    
    // Call original json method
    return originalJson.call(this, data);
  };

  // Override res.send to log response for non-JSON responses
  const originalSend = res.send;
  res.send = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Only log if json wasn't already called
    if (!res.headersSent || res.getHeader('content-type')?.includes('application/json')) {
      return originalSend.call(this, data);
    }
    
    console.log(`📤 [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode}`);
    console.log(`⏱️  [RESPONSE] Time: ${responseTime}ms`);
    console.log(`📊 [RESPONSE] Status: ${res.statusCode}`);
    console.log(`📋 [RESPONSE] Body: [Non-JSON response]`);
    console.log(`${'='.repeat(80)}`);
    
    return originalSend.call(this, data);
  };

  // Continue to next middleware
  next();
};

/**
 * Error Logger - logs errors with request context
 */
const logError = (error, req) => {
  console.error(`❌ [ERROR] ${new Date().toISOString()}`);
  console.error(`🔗 [ERROR] Request ID: ${req.id || 'unknown'}`);
  console.error(`📍 [ERROR] Route: ${req.method} ${req.originalUrl}`);
  console.error(`💥 [ERROR] Message: ${error.message}`);
  console.error(`📚 [ERROR] Stack:`, error.stack);
  
  if (error.code) {
    console.error(`🔢 [ERROR] Code: ${error.code}`);
  }
  
  if (error.statusCode) {
    console.error(`📊 [ERROR] Status Code: ${error.statusCode}`);
  }
  
  console.error(`${'='.repeat(80)}`);
};

module.exports = logger;
module.exports.logError = logError;