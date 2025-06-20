const app = require('./app');
const dotenv = require('dotenv');
const { ensureBrowsersAvailable } = require('./utils/browserCheck');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;

// Async startup function
async function startServer() {
  try {
    // Ensure browsers are available before starting
    await ensureBrowsersAvailable();

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Trade Pulse Backend Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
      console.log(`💡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🎭 Playwright browsers ready for NSE scraping`);
    });

    return server;
  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
const serverPromise = startServer();
let server;

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  const resolvedServer = await serverPromise;
  resolvedServer.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  const resolvedServer = await serverPromise;
  resolvedServer.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Export the server promise for testing
module.exports = serverPromise;
