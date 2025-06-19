# Trade Pulse Backend API

A robust Express.js backend API for Trade Pulse - NSE Corporate Insights platform.

## 🚀 Features

- **RESTful API** with versioning support
- **Asynchronous processing** for company analysis requests
- **Comprehensive logging** with request/response tracking
- **Input validation** and sanitization
- **Error handling** with structured responses
- **Rate limiting** to prevent abuse
- **Security middleware** with Helmet.js
- **CORS support** for frontend integration
- **Health check endpoints** for monitoring

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.js                  # Server entry point
│   ├── app.js                    # Express app configuration
│   ├── routes/
│   │   ├── analyze.js            # Analysis endpoints
│   │   └── health.js             # Health check endpoints
│   ├── controllers/
│   │   └── analyze.controller.js # Analysis business logic
│   ├── middlewares/
│   │   ├── logger.js             # Request logging
│   │   └── errorHandler.js       # Global error handling
│   └── utils/
│       └── validateCompany.js    # Input validation utilities
├── package.json
├── .env
└── README.md
```

## 🛠️ Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# API Configuration
API_VERSION=v1
REQUEST_TIMEOUT=30000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Endpoints

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "v1"
}
```

### Company Analysis
```http
POST /api/v1/analyze
Content-Type: application/json

{
  "companyName": "Tata Consultancy Services"
}
```

**Success Response (202 Accepted):**
```json
{
  "status": "accepted",
  "message": "Analysis request received for Tata Consultancy Services",
  "companyName": "Tata Consultancy Services",
  "requestId": "req_1706349000000_abc123",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "estimatedProcessingTime": "2-5 minutes"
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Company name is required",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "requestId": "req_1706349000000_abc123"
}
```

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration for cross-origin requests
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **Error handling** without sensitive data exposure

## 📊 Logging

The API includes comprehensive logging:

- **Request logging** with unique IDs
- **Response time tracking**
- **Error logging** with stack traces
- **Security event logging**

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

## 📈 Monitoring

- Health check endpoint: `/api/health`
- Detailed health check: `/api/health/detailed`
- Request logging with unique IDs
- Error tracking and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.