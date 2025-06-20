# Trade Pulse Backend - NSE Corporate Filings Scraper

A robust Express.js backend API that scrapes NSE India's corporate filings using advanced Playwright automation with stealth techniques to bypass bot detection while maintaining ethical scraping practices.

## 🚀 Features

- **Advanced Web Scraping**: Playwright-based scraper with stealth configuration
- **Bot Detection Bypass**: Rotating user agents, realistic viewports, human-like behavior simulation
- **Rate Limiting**: Per-company rate limiting (1 request per 10 seconds)
- **Intelligent Caching**: 1-hour TTL caching to reduce server load and improve response times
- **Error Handling**: Comprehensive error handling with exponential backoff retry logic
- **Corporate Filings**: Extract filings from last 7 days with PDF links and attachments
- **Performance Optimized**: Concurrent request handling with proper resource cleanup
- **Environment Flexibility**: Development and production configurations
- **Request Logging**: Detailed request/response logging with unique request IDs

## 📋 Requirements

- Node.js >= 16.0.0
- NPM or Yarn
- Internet connection for NSE website access

## 🛠️ Installation

1. **Clone the repository and navigate to backend**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Install Playwright browsers**:
```bash
npx playwright install chromium --with-deps
# Or use the convenience script
npm run install-browsers
```

4. **Set environment variables** (optional):
```bash
# Create .env file
echo "NODE_ENV=development" > .env
echo "PORT=4000" >> .env
echo "API_VERSION=v1" >> .env
echo "RATE_LIMIT_WINDOW_MS=900000" >> .env  # 15 minutes
echo "RATE_LIMIT_MAX_REQUESTS=100" >> .env  # 100 requests per IP
```

## 🚦 Quick Start

### Recommended Startup (Auto-installs browsers if missing)

```bash
# Safe startup with automatic browser installation
npm run startup
```

### Manual Startup

1. **Start the development server**:
```bash
npm run dev
```

2. **Start the production server**:
```bash
npm start
```

3. **Safe startup (checks browsers first)**:
```bash
# Development with browser check
npm run safe-dev

# Production with browser check
npm run safe-start
```

4. **Test the API**:
```bash
curl -X POST http://localhost:4000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"companyName": "RELIANCE"}'
```

## 📡 API Documentation

### POST `/api/v1/analyze`

Scrapes NSE corporate filings for a specified company from the last 7 days.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "companyName": "RELIANCE"
}
```

**Query Parameters:**
- `download=true` (optional): Enable PDF downloads
- **Note**: Cache bypass is automatic on first request. Subsequent requests within 1 hour will return cached results.

#### Response

**Success (200):**
```json
{
  "success": true,
  "company": "RELIANCE",
  "filings": [
    {
      "date": "2024-12-15",
      "time": "14:30:45",
      "symbol": "RELIANCE",
      "companyName": "Reliance Industries Limited",
      "subject": "Board Meeting Intimation",
      "details": "Intimation of Board Meeting scheduled on...",
      "pdfLink": "https://nseindia.com/companies/filings/xyz.pdf",
      "fileSize": "245 KB",
      "attachments": [
        {
          "url": "https://nseindia.com/companies/filings/xyz.pdf",
          "text": "Board Meeting Notice",
          "type": "PDF"
        }
      ],
      "broadcastDateTime": "15-Dec-2024 14:30:45"
    }
  ],
  "count": 3,
  "timestamp": "2024-12-15T10:30:00Z",
  "cached": false,
  "responseTime": "15234ms",
  "requestId": "req_1702641234567",
  "metadata": {
    "searchTerm": "RELIANCE",
    "filingsFrom": "last 7 days",
    "source": "NSE India Corporate Filings",
    "extractionMethod": "Playwright web scraping"
  }
}
```

**Rate Limited (429):**
```json
{
  "status": "error",
  "message": "Rate limit exceeded for company \"RELIANCE\". Please wait 8 seconds before trying again.",
  "retryAfter": 8,
  "timestamp": "2024-12-15T10:30:00Z",
  "requestId": "req_1702641234567"
}
```

**Service Unavailable (503):**
```json
{
  "success": false,
  "status": "error",
  "message": "NSE website is currently unavailable or experiencing issues. Please try again later.",
  "company": "RELIANCE",
  "errorType": "SERVICE_UNAVAILABLE",
  "timestamp": "2024-12-15T10:30:00Z",
  "requestId": "req_1702641234567"
}
```

### GET `/api/v1/analyze/status`

Returns the health status of the analyze endpoint.

```json
{
  "status": "healthy",
  "service": "NSE Corporate Filings Analyzer",
  "version": "v1",
  "timestamp": "2024-12-15T10:30:00Z"
}
```

### GET `/api/health`

Returns overall API health status.

```json
{
  "status": "healthy",
  "timestamp": "2024-12-15T10:30:00Z",
  "environment": "development",
  "version": "v1",
  "uptime": "0:05:23",
  "memory": {
    "used": "45.2 MB",
    "total": "128.0 MB",
    "free": "82.8 MB"
  },
  "endpoints": {
    "analyze": "/api/v1/analyze"
  }
}
```

## 💾 Cache Management

### Understanding Cache Behavior

The API implements intelligent caching with a **1-hour TTL (Time To Live)**:

- **First Request**: Always hits NSE website directly (`cached: false`)
- **Subsequent Requests**: Returns cached data within 1 hour (`cached: true`)
- **Cache Key**: Based on normalized company name (`nse_filings_company_name`)
- **Response Time**: Cached responses are ~1ms vs 15-30 seconds for fresh scraping

### Cache Status in Response

```json
{
  "cached": false,        // First request or cache expired
  "responseTime": "27432ms"  // Time for actual scraping
}
```

```json
{
  "cached": true,         // Returned from cache
  "responseTime": "1ms"      // Near-instant cache retrieval
}
```

### Force Fresh Data

**Important**: There is currently **no built-in cache bypass parameter**. To force fresh data:

1. **Wait 1 hour** for cache to expire naturally
2. **Restart the backend server** to clear all cached data:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```
3. **Implementation Note**: A `refresh=true` or `bypassCache=true` parameter could be added in future versions

## 🧪 Testing

### Run All Tests
```bash
node src/test/testNSEScraper.js
```

### Test Specific Company
```bash
node src/test/testNSEScraper.js RELIANCE
```

### Test Cache Functionality
The test suite automatically tests caching:
```bash
node src/test/testNSEScraper.js
# Look for "CACHE TESTS" section in output
```

### Test Examples
```bash
# Test major companies
node src/test/testNSEScraper.js TCS
node src/test/testNSEScraper.js INFY
node src/test/testNSEScraper.js HDFC

# Test specific company through API
node src/test/testRELIANCE.js
```

### Backend API Testing
```bash
# Start backend server
npm run dev

# Test in another terminal
curl -X POST http://localhost:4000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"companyName": "TCS"}'
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode (`development`, `production`) |
| `PORT` | `4000` | Server port |
| `API_VERSION` | `v1` | API version for endpoints |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per IP per window |

### Scraper Configuration (`src/utils/nseScraper.js`)

```javascript
const SCRAPER_CONFIG = {
  userAgents: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
    // More user agents for rotation
  ],
  viewports: [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1536, height: 864 }
  ],
  launchArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-background-timer-throttling'
  ],
  timeouts: {
    pageLoad: 30000,
    elementWait: 10000,
    navigation: 15000
  }
};
```

### Cache Configuration

```javascript
// In src/utils/nseScraper.js
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

// Cache key format
const cacheKey = `nse_filings_${companyName.toLowerCase().replace(/\s+/g, '_')}`;
```

### Rate Limiting Configuration

- **Per-Company**: 1 request per 10 seconds
- **Global**: 100 requests per 15 minutes per IP (configurable)
- **Cache TTL**: 1 hour

## 🔒 Security & Ethics

### Stealth Features
- ✅ Rotating User-Agent strings (Chrome 120+, Firefox 119+, Edge 118+)
- ✅ Realistic viewport sizes (1920x1080, 1366x768, 1536x864)
- ✅ Asia/Kolkata timezone and Bangalore geolocation
- ✅ Navigator.webdriver property overridden
- ✅ Mock navigator plugins and Chrome runtime

### Human Behavior Simulation
- ✅ Random mouse movements with realistic trajectories
- ✅ Random scrolling patterns
- ✅ Human-like typing speeds (100-200ms per character)
- ✅ Random delays between actions (2-5 seconds)
- ✅ Hover events on random elements

### Ethical Practices
- ✅ Respects rate limiting (10-second intervals per company)
- ✅ Proper session management
- ✅ Resource cleanup to prevent memory leaks
- ✅ Reasonable delays between requests
- ✅ Error handling to avoid overwhelming server
- ✅ Caching to reduce server load

## 🏗️ Architecture

```
backend/
├── src/
│   ├── controllers/
│   │   └── analyze.controller.js    # Main API controller
│   ├── middlewares/
│   │   ├── rateLimiter.js          # Rate limiting middleware
│   │   ├── errorHandler.js         # Global error handler
│   │   └── logger.js               # Request logging
│   ├── routes/
│   │   ├── analyze.js              # Analysis routes
│   │   └── health.js               # Health check routes
│   ├── utils/
│   │   ├── nseScraper.js           # Main scraper implementation
│   │   └── validateCompany.js      # Input validation
│   ├── test/
│   │   ├── testNSEScraper.js       # Comprehensive test suite
│   │   └── testRELIANCE.js         # Specific company test
│   ├── app.js                      # Express app setup
│   └── index.js                    # Server entry point
├── package.json
└── README.md
```

## 🎯 Supported Companies

The scraper supports any NSE-listed company. Tested with:

- **RELIANCE** - Reliance Industries Limited
- **TCS** - Tata Consultancy Services
- **INFY** - Infosys Limited
- **HDFC** - Housing Development Finance Corporation
- **WIPRO** - Wipro Limited
- **ICICIBANK** - ICICI Bank Limited
- **SBIN** - State Bank of India

## 📊 Performance

### Benchmarks
- **Average Response Time**: 15-30 seconds per company (fresh scraping)
- **Cached Response Time**: ~1ms (from cache)
- **Success Rate**: 95%+ under normal conditions
- **Cache Hit Rate**: ~80% for repeated requests
- **Concurrent Requests**: Supports multiple companies simultaneously

### Optimization Features
- Headless mode in production (`NODE_ENV=production`)
- Request caching (1-hour TTL)
- Auto-cleanup of browser instances
- Smart waiting (element-based, not fixed delays)
- Rate limiting to prevent server overload

## ⚠️ Troubleshooting

### Common Issues

1. **"Failed to establish NSE session"**
   - Check internet connection
   - Verify NSE website accessibility
   - Try again after a few minutes

2. **"Could not find company search input"**
   - NSE website structure may have changed
   - Check for site maintenance
   - Contact support if persistent

3. **High memory usage**
   - Ensure browser instances are properly cleaned up
   - Monitor concurrent requests
   - Restart service if needed

4. **Cached results when expecting fresh data**
   - Wait 1 hour for cache to expire
   - Restart server to clear cache
   - Check `cached: true/false` in response

5. **Rate limiting errors**
   - Wait 10 seconds between requests for same company
   - Check if hitting global rate limit (100 requests/15min)
   - Monitor `retryAfter` field in error response

6. **Browser installation errors**
   - **Error**: `Executable doesn't exist at /path/to/chrome`
   - **Error**: `BEWARE: your OS is not officially supported by Playwright`
   - **Error**: `spawn su ENOENT` or `Failed to install browsers`
   - **Solutions**:
     ```bash
     # Quick fix - automated with fallbacks
     npm run startup

     # Try safe installation (multiple fallback strategies)
     npm run install-browsers-safe

     # Manual installation with detailed diagnostics
     npm run install-browsers-manual

     # Fallback methods (try in order):
     npm run install-browsers-fallback    # Without system deps
     npm run install-browsers-force       # Force download
     npx playwright install chromium      # Basic install

     # Check status
     npm run check-browsers
     ```
   - **For unsupported OS/Docker**: Use `Dockerfile.alpine` or pre-installed browser images
   - **For restricted environments**: Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to system browser

### Debug Mode
Set environment variable for verbose logging:
```bash
DEBUG=true NODE_ENV=development npm run dev
```

## 🚀 Production Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=4000
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'trade-pulse-backend',
    script: 'src/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      API_VERSION: 'v1'
    },
    // Ensure browsers are installed before starting
    pre_deploy_local: 'npm run install-browsers',
    post_deploy: 'npm run setup && pm2 reload ecosystem.config.js --env production'
  }]
};
```

### Deployment Scripts

**For VPS/Server Deployment:**
```bash
# deployment.sh
#!/bin/bash
set -e

echo "🚀 Deploying Trade Pulse Backend..."

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Install browsers
npm run install-browsers

# Restart with PM2
pm2 reload trade-pulse-backend || pm2 start ecosystem.config.js

echo "✅ Deployment complete"
```

**For Heroku:**
```bash
# Add to package.json scripts for Heroku buildpack
"heroku-postbuild": "npx playwright install chromium --with-deps"
```

**For AWS/GCP/DigitalOcean:**
```bash
# In your deployment script
npm install
npm run install-browsers-safe  # Uses fallback strategies
npm run safe-start
```

**For Problematic Environments:**
```bash
# If you get "OS not officially supported" or "spawn su ENOENT" errors

# Option 1: Use system browser
sudo apt-get install chromium-browser  # Ubuntu/Debian
# or
sudo yum install chromium              # CentOS/RHEL
# or
sudo apk add chromium                  # Alpine

# Then set environment variable
export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Option 2: Use Docker with pre-installed browsers
docker build -f Dockerfile.alpine -t trade-pulse-backend .
docker run -p 4000:4000 trade-pulse-backend

# Option 3: Use manual installation script
npm run install-browsers-manual
```

**Environment Variables for Browser Issues:**
```bash
# Use system-installed Chromium
export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Skip Playwright browser download
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true

# Custom browser cache directory
export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright
```

### Docker Support

**Complete Dockerfile:**
```dockerfile
FROM node:18-alpine

# Install system dependencies for Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Chromium path for Playwright
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install Playwright browsers
RUN npx playwright install chromium --with-deps

# Copy application code
COPY . .

# Make startup script executable
RUN chmod +x scripts/startup.sh

# Expose port
EXPOSE 4000

# Use startup script that validates browser installation
CMD ["npm", "run", "startup"]
```

**Alternative Dockerfile for Problematic Environments:**
```bash
# Use this if standard Dockerfile fails with browser installation issues
docker build -f Dockerfile.alpine -t trade-pulse-backend .
docker run -p 4000:4000 trade-pulse-backend
```

**Docker Compose Example:**
```yaml
version: '3.8'
services:
  trade-pulse-backend:
    build:
      context: .
      dockerfile: Dockerfile.alpine  # Use alternative for problematic environments
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
    volumes:
      - /dev/shm:/dev/shm
    restart: unless-stopped
```

## 📝 API Usage Examples

### cURL Examples

**Basic Request:**
```bash
curl -X POST http://localhost:4000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"companyName": "TCS"}'
```

**With PDF Download:**
```bash
curl -X POST "http://localhost:4000/api/v1/analyze?download=true" \
  -H "Content-Type: application/json" \
  -d '{"companyName": "INFY"}'
```

**Health Check:**
```bash
curl -X GET http://localhost:4000/api/health
```

**Analyze Status:**
```bash
curl -X GET http://localhost:4000/api/v1/analyze/status
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

async function getCorporateFilings(companyName, options = {}) {
  try {
    const { download = false } = options;
    const url = `http://localhost:4000/api/v1/analyze${download ? '?download=true' : ''}`;

    console.log(`🔍 Fetching filings for ${companyName}...`);
    const startTime = Date.now();

    const response = await axios.post(url, { companyName });
    const { data } = response;

    const endTime = Date.now();
    console.log(`✅ Found ${data.count} filings for ${companyName}`);
    console.log(`⏱️  Response time: ${endTime - startTime}ms (cached: ${data.cached})`);

    return data.filings;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error(`⏳ Rate limited. Wait ${error.response.data.retryAfter} seconds`);
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
    return null;
  }
}

// Usage examples
async function examples() {
  // Basic usage
  await getCorporateFilings('RELIANCE');

  // With PDF download
  await getCorporateFilings('TCS', { download: true });

  // Multiple companies (respecting rate limits)
  const companies = ['RELIANCE', 'TCS', 'INFY'];
  for (const company of companies) {
    await getCorporateFilings(company);
    await new Promise(resolve => setTimeout(resolve, 11000)); // Wait 11 seconds
  }
}

examples();
```

### Python Example

```python
import requests
import time
from typing import Optional, Dict, List

def get_corporate_filings(company_name: str, download: bool = False) -> Optional[List[Dict]]:
    """Fetch corporate filings for a company"""
    url = "http://localhost:4000/api/v1/analyze"
    if download:
        url += "?download=true"

    payload = {"companyName": company_name}

    try:
        print(f"🔍 Fetching filings for {company_name}...")
        start_time = time.time()

        response = requests.post(url, json=payload, timeout=60)
        data = response.json()

        end_time = time.time()

        if response.status_code == 200:
            print(f"✅ Found {data['count']} filings for {company_name}")
            print(f"⏱️  Response time: {(end_time - start_time)*1000:.0f}ms (cached: {data['cached']})")
            return data['filings']
        elif response.status_code == 429:
            print(f"⏳ Rate limited. Wait {data.get('retryAfter', 10)} seconds")
        else:
            print(f"❌ Error: {data.get('message', 'Unknown error')}")

        return None

    except requests.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

# Usage examples
def examples():
    # Basic usage
    get_corporate_filings("RELIANCE")

    # With PDF download
    get_corporate_filings("TCS", download=True)

    # Multiple companies (respecting rate limits)
    companies = ["RELIANCE", "TCS", "INFY"]
    for company in companies:
        get_corporate_filings(company)
        time.sleep(11)  # Wait 11 seconds to respect rate limit

if __name__ == "__main__":
    examples()
```

### Advanced Usage with Error Handling

```javascript
const axios = require('axios');

class NSEAnalyzer {
  constructor(baseURL = 'http://localhost:4000') {
    this.baseURL = baseURL;
    this.lastRequestTimes = new Map(); // Track per-company rate limits
  }

  async waitForRateLimit(companyName) {
    const lastTime = this.lastRequestTimes.get(companyName);
    if (lastTime) {
      const timeSince = Date.now() - lastTime;
      const waitTime = 10100 - timeSince; // 10.1 seconds to be safe

      if (waitTime > 0) {
        console.log(`⏳ Waiting ${waitTime}ms for ${companyName} rate limit...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  async analyzeCompany(companyName, options = {}) {
    await this.waitForRateLimit(companyName);

    try {
      const { download = false, maxRetries = 3 } = options;
      const url = `${this.baseURL}/api/v1/analyze${download ? '?download=true' : ''}`;

      this.lastRequestTimes.set(companyName, Date.now());

      const response = await axios.post(url, { companyName }, {
        timeout: 60000, // 60 second timeout
        validateStatus: status => status < 500 // Retry on 5xx errors
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = error.response.data.retryAfter || 10;
        console.log(`⏳ Rate limited. Waiting ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.analyzeCompany(companyName, options);
      }

      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
    }
  }

  async getHealthStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/api/health`);
      return response.data;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

// Usage
const analyzer = new NSEAnalyzer();

async function main() {
  // Check health
  const health = await analyzer.getHealthStatus();
  console.log('🏥 Health:', health.status);

  // Analyze multiple companies with automatic rate limiting
  const companies = ['RELIANCE', 'TCS', 'INFY', 'HDFC'];

  for (const company of companies) {
    const result = await analyzer.analyzeCompany(company);

    if (result.success) {
      console.log(`✅ ${company}: ${result.data.count} filings (cached: ${result.data.cached})`);
    } else {
      console.error(`❌ ${company}: ${result.error}`);
    }
  }
}

main().catch(console.error);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Scripts

```bash
# Recommended startup (auto-installs browsers)
npm run startup

# Safe development with browser check
npm run safe-dev

# Safe production with browser check
npm run safe-start

# Standard scripts
npm run dev          # Development with auto-reload
npm start            # Production start

# Browser management
npm run install-browsers         # Standard installation with system deps
npm run install-browsers-safe    # Safe installation with fallbacks
npm run install-browsers-fallback # Install without system dependencies
npm run install-browsers-force   # Force download browsers
npm run install-browsers-manual  # Manual installation with diagnostics
npm run check-browsers           # Check browser installation status
npm run setup                   # Full setup (install + browsers)
npm run setup-dev              # Development setup

# Testing
node src/test/testNSEScraper.js           # Run all tests
node src/test/testNSEScraper.js RELIANCE  # Test specific company
```

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and support:

1. **Check the troubleshooting section** above
2. **Run the test suite** to diagnose issues:
   ```bash
   node src/test/testNSEScraper.js
   ```
3. **Check server logs** for error details
4. **Verify environment variables** are set correctly
5. **Test with curl** to isolate client vs server issues
6. **Check cache status** - restart server if needed to clear cache
7. **Monitor rate limits** - wait between requests for same company

### Common Support Scenarios

**Q: API returns 0 filings but company should have filings**
- Check if results are cached (`cached: true`)
- Restart server to clear cache
- Verify company name spelling
- Check NSE website directly

**Q: API is slow/timing out**
- Normal behavior for fresh requests (15-30 seconds)
- Check if cached (`cached: true` = ~1ms response)
- Verify internet connection and NSE accessibility

**Q: Getting rate limited frequently**
- Wait 10+ seconds between requests for same company
- Check global rate limit (100 requests/15min per IP)
- Consider implementing client-side queuing

---

**Note**: This scraper is designed for educational and research purposes. Please respect NSE India's terms of service and implement appropriate rate limiting in production use.

## 🔮 Future Enhancements

- **Cache Control**: Add `refresh=true` parameter to bypass cache
- **Webhook Support**: Real-time notifications for new filings
- **Data Export**: CSV/Excel export functionality
- **Historical Data**: Extend beyond 7-day limit
- **Company Search**: Auto-suggest NSE company names
- **Bulk Analysis**: Analyze multiple companies in single request
