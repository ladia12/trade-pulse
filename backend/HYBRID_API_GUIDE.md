# Hybrid NSE API Implementation Guide

## Overview

The Trade Pulse backend now uses a **Hybrid approach** that combines the power of Playwright (for cookie extraction) with the efficiency of Axios (for API calls) to fetch NSE corporate announcements.

### Why Hybrid?

1. **🍪 Cookie Extraction**: Uses Playwright in headless mode to bypass NSE's anti-bot measures and extract valid session cookies
2. **🚀 Fast API Calls**: Uses extracted cookies with Axios to make direct API calls to NSE's corporate announcements endpoint
3. **📊 Structured Data**: Returns only the required fields filtered for the last 7 days
4. **⚡ Performance**: Faster than full browser automation while maintaining reliability

## Implementation Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client        │    │   Express API    │    │   Hybrid        │
│   Request       │───▶│   /v1/analyze    │───▶│   Scraper       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                            ┌─────────────────────────────────────────┐
                            │           Hybrid Process                 │
                            │                                         │
                            │  1. Cookie Extraction (Playwright)     │
                            │     ┌─────────────────────────────────┐ │
                            │     │ • Launch headless Chromium     │ │
                            │     │ • Navigate to NSE filings page │ │
                            │     │ • Accept cookies if prompted   │ │
                            │     │ • Extract session cookies      │ │
                            │     └─────────────────────────────────┘ │
                            │                  │                      │
                            │                  ▼                      │
                            │  2. API Calls (Axios)                  │
                            │     ┌─────────────────────────────────┐ │
                            │     │ • Use extracted cookies         │ │
                            │     │ • Call NSE announcements API   │ │
                            │     │ • Filter last 7 days           │ │
                            │     │ • Return required fields only  │ │
                            │     └─────────────────────────────────┘ │
                            └─────────────────────────────────────────┘
```

## API Endpoints

### POST /api/v1/analyze

Fetch corporate announcements for a company symbol.

**Request Body:**
```json
{
  "symbol": "RELIANCE",
  "issuer": "Reliance Industries Limited"  // Optional
}
```

**Request Example:**
```bash
curl -X POST http://localhost:4000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "issuer": "Reliance Industries Limited"
  }'
```

### GET /api/v1/analyze

Alternative GET method for easier testing.

**Query Parameters:**
- `symbol` (required): Company symbol (e.g., "RELIANCE", "TCS")
- `issuer` (optional): Company issuer name
- `forceRefresh` (optional): Set to "true" to force refresh cookies

**Request Example:**
```bash
curl "http://localhost:4000/api/v1/analyze?symbol=TCS&issuer=Tata%20Consultancy%20Services%20Limited"
```

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "symbol": "RELIANCE",
  "issuer": "Reliance Industries Limited",
  "announcements": [
    {
      "symbol": "RELIANCE",
      "desc": "Board Meeting",
      "attchmntFile": "https://nseindia.com/...",
      "smIndustry": "Oil & Gas",
      "attchmntText": "Board Meeting Notice",
      "fileSize": "245 KB",
      "exchdisstime": "18-Jan-2025 15:30:25"
    }
  ],
  "count": 1,
  "timestamp": "2025-01-18T10:15:30.123Z",
  "responseTime": "3500ms",
  "method": "hybrid",
  "sessionInfo": {
    "cookieCount": 12,
    "extractedAt": "2025-01-18T10:15:26.123Z",
    "cached": false
  },
  "metadata": {
    "searchTerm": "RELIANCE",
    "announcementsFrom": "last 7 days",
    "source": "NSE India Corporate Announcements API",
    "extractionMethod": "Hybrid (Playwright + Axios)",
    "requiredFields": [
      "symbol", "desc", "attchmntFile",
      "smIndustry", "attchmntText",
      "fileSize", "exchdisstime"
    ]
  }
}
```

### Error Response

```json
{
  "success": false,
  "status": "error",
  "message": "Unable to establish connection with NSE website. Please try again later.",
  "symbol": "RELIANCE",
  "errorType": "SESSION_FAILED",
  "timestamp": "2025-01-18T10:15:30.123Z",
  "requestId": "req_1737285330123"
}
```

## Required Fields

Each announcement object contains exactly these fields:

| Field | Description | Example |
|-------|-------------|---------|
| `symbol` | Company symbol | "RELIANCE" |
| `desc` | Announcement description | "Board Meeting" |
| `attchmntFile` | PDF/file attachment URL | "https://nseindia.com/..." |
| `smIndustry` | Industry category | "Oil & Gas" |
| `attchmntText` | Attachment description | "Board Meeting Notice" |
| `fileSize` | File size if available | "245 KB" |
| `exchdisstime` | Exchange dissemination time | "18-Jan-2025 15:30:25" |

## Test Cases

### Test Case 1: RELIANCE Symbol

**Input:**
```json
{
  "symbol": "RELIANCE",
  "issuer": "Reliance Industries Limited"
}
```

**Expected:**
- ✅ At least 0 announcements (could be empty if no announcements in last 7 days)
- ✅ All required fields present in each announcement object
- ✅ Response time < 30 seconds
- ✅ Status code 200

### Test Case 2: TCS Symbol

**Input:**
```json
{
  "symbol": "TCS",
  "issuer": "Tata Consultancy Services Limited"
}
```

**Expected:**
- ✅ At least 0 announcements
- ✅ All required fields present in each announcement object
- ✅ Response time < 30 seconds
- ✅ Status code 200

## Testing

### 1. Run Test Suite

```bash
# Run comprehensive test suite
npm run test-hybrid

# Or run specific tests
node scripts/test-hybrid-api.js
```

### 2. Manual Testing

```bash
# Start the server
npm run dev

# Test RELIANCE (POST)
curl -X POST http://localhost:4000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"symbol": "RELIANCE"}'

# Test TCS (GET)
curl "http://localhost:4000/api/v1/analyze?symbol=TCS"

# Check status
curl http://localhost:4000/api/v1/analyze/status
```

## Error Types

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| `MISSING_SYMBOL` | 400 | Symbol parameter is required |
| `SESSION_FAILED` | 503 | Failed to extract cookies from NSE |
| `ACCESS_DENIED` | 403 | NSE denied access (rate limited) |
| `TIMEOUT` | 504 | Request timed out |
| `SYMBOL_NOT_FOUND` | 404 | No announcements found for symbol |
| `NETWORK_ERROR` | 503 | Network connectivity issues |

## Configuration

### Environment Variables

```bash
# Optional: Override default server port
PORT=4000

# Optional: Set API version
API_VERSION=v1

# Optional: Force non-headless mode for debugging
FORCE_NON_HEADLESS=true

# Optional: Override test base URL
API_BASE_URL=http://localhost:4000
```

### Caching

The hybrid implementation uses intelligent caching:

- **Cookie Cache**: 1 hour TTL for NSE session cookies
- **API Cache**: 30 minutes TTL for announcement data
- **Force Refresh**: Use `forceRefresh=true` to bypass caches

## Architecture Benefits

### 🚀 Performance
- Cookie extraction: ~5-15 seconds (cached for 1 hour)
- API calls: ~1-3 seconds
- Total: Much faster than full browser automation

### 🛡️ Reliability
- Stealth configuration bypasses anti-bot measures
- Retry logic for both cookie extraction and API calls
- Graceful error handling

### 📊 Data Quality
- Direct API access provides structured JSON
- Filtering ensures only last 7 days data
- Required fields validation

### 🔧 Maintainability
- Modular design (cookie extraction + API client + hybrid orchestrator)
- Comprehensive error classification
- Extensive logging and monitoring

## Troubleshooting

### Common Issues

1. **"Failed to extract cookies"**
   - Check if NSE website is accessible
   - Verify Playwright dependencies are installed
   - Try non-headless mode: `FORCE_NON_HEADLESS=true`

2. **"Access forbidden"**
   - NSE may be rate limiting
   - Wait a few minutes and retry
   - Cookies may have expired (try `forceRefresh=true`)

3. **"No announcements found"**
   - Verify symbol is correct and active
   - Check if there are recent announcements on NSE website
   - Try different date range if needed

### Debug Mode

```bash
# Enable detailed logging
DEBUG=* npm run dev

# Or start server and check logs
npm run dev

# Test with force refresh
curl "http://localhost:4000/api/v1/analyze?symbol=RELIANCE&forceRefresh=true"
```

## Migration from Old Implementation

The hybrid API is **backward compatible** with the old implementation:

- `companyName` parameter still works (mapped to `symbol`)
- Response structure includes both old and new fields
- Error handling maintains similar status codes

### Migration Steps

1. ✅ Update client code to use `symbol` instead of `companyName`
2. ✅ Handle new response structure with `announcements` array
3. ✅ Update error handling for new error types
4. ✅ Test with both RELIANCE and TCS symbols

---

**🎉 The hybrid NSE API implementation is now ready for production use!**
