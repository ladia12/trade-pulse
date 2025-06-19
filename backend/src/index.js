const app = require('./app');

const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Express server running on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] API available at http://localhost:${PORT}/api/v1/analyze`);
  console.log(`[${new Date().toISOString()}] Health check at http://localhost:${PORT}/api/health`);
});