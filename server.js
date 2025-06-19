const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.post('/api/v1/analyze', (req, res) => {
  try {
    const { companyName } = req.body;

    // Validate input
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid company name. Please provide a valid company name.'
      });
    }

    // Trim and validate company name length
    const trimmedCompanyName = companyName.trim();
    if (trimmedCompanyName.length > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Company name too long. Please limit to 100 characters.'
      });
    }

    // Generate a simple job ID
    const jobId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Log the analysis request (simulating async processing)
    console.log(`[${new Date().toISOString()}] Analysis request received for company: "${trimmedCompanyName}" | Job ID: ${jobId}`);
    console.log(`[${new Date().toISOString()}] Simulating async analysis processing for job: ${jobId}`);

    // Return 202 Accepted response
    return res.status(202).json({
      status: 'accepted',
      message: 'Analysis request received. Processing will begin shortly.',
      jobId: jobId
    });

  } catch (error) {
    console.error('Error processing analysis request:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Trade Pulse API'
  });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Express server running on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] API available at http://localhost:${PORT}/api/v1/analyze`);
  console.log(`[${new Date().toISOString()}] Health check at http://localhost:${PORT}/api/health`);
});

module.exports = app;