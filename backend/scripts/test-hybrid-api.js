const axios = require('axios');
const { scrapeNSEAnnouncementsHybrid } = require('../src/utils/hybridNSEScraper');

/**
 * Test script for hybrid NSE API implementation
 */

const TEST_CONFIG = {
  // Update this to match your local server
  baseURL: process.env.API_BASE_URL || 'http://localhost:4000',
  apiVersion: process.env.API_VERSION || 'v1',
  testSymbols: ['RELIANCE', 'TCS'],
  timeout: 60000 // 60 seconds timeout for tests
};

/**
 * Test cases for the hybrid implementation
 */
const testCases = [
  {
    name: 'Test Case 1: RELIANCE Symbol',
    symbol: 'RELIANCE',
    issuer: 'Reliance Industries Limited',
    expectedFields: ['symbol', 'desc', 'attchmntFile', 'smIndustry', 'attchmntText', 'fileSize', 'exchdisstime'],
    expectedMinCount: 0 // Could be 0 if no announcements in last 7 days
  },
  {
    name: 'Test Case 2: TCS Symbol',
    symbol: 'TCS',
    issuer: 'Tata Consultancy Services Limited',
    expectedFields: ['symbol', 'desc', 'attchmntFile', 'smIndustry', 'attchmntText', 'fileSize', 'exchdisstime'],
    expectedMinCount: 0
  }
];

/**
 * Test the hybrid scraper directly (without Express server)
 */
async function testHybridScraperDirect() {
  console.log('\n🧪 Testing Hybrid Scraper Directly...\n');

  for (const testCase of testCases) {
    console.log(`\n📋 Running: ${testCase.name}`);
    console.log(`🎯 Symbol: ${testCase.symbol}`);
    console.log(`🏢 Issuer: ${testCase.issuer}`);

    try {
      const startTime = Date.now();
      const result = await scrapeNSEAnnouncementsHybrid(testCase.symbol, {
        issuer: testCase.issuer
      });

      const responseTime = Date.now() - startTime;

      console.log(`✅ Success! Response time: ${responseTime}ms`);
      console.log(`📊 Found ${result.count} announcements`);

      if (result.count > 0) {
        console.log(`📝 Sample announcement:`, result.announcements[0]);

        // Verify required fields
        const firstAnnouncement = result.announcements[0];
        const missingFields = testCase.expectedFields.filter(field =>
          !firstAnnouncement.hasOwnProperty(field)
        );

        if (missingFields.length > 0) {
          console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
        } else {
          console.log(`✅ All required fields present`);
        }
      } else {
        console.log(`ℹ️ No announcements found in the last 7 days`);
      }

      console.log(`🔐 Session info:`, result.sessionInfo);

    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      if (error.hybridResult) {
        console.error(`📋 Error details:`, error.hybridResult);
      }
    }
  }
}

/**
 * Test the Express API endpoints
 */
async function testExpressAPI() {
  console.log('\n🌐 Testing Express API Endpoints...\n');

  // Test server availability
  try {
    console.log(`🔍 Checking server availability at ${TEST_CONFIG.baseURL}...`);
    const healthResponse = await axios.get(`${TEST_CONFIG.baseURL}/api/health`, {
      timeout: 5000
    });
    console.log(`✅ Server is running: ${healthResponse.data.status}`);
  } catch (error) {
    console.error(`❌ Server not available at ${TEST_CONFIG.baseURL}`);
    console.error(`💡 Make sure to start the server with: npm run dev`);
    return;
  }

  // Test status endpoint
  try {
    console.log(`\n📊 Testing status endpoint...`);
    const statusResponse = await axios.get(
      `${TEST_CONFIG.baseURL}/api/${TEST_CONFIG.apiVersion}/analyze/status`
    );
    console.log(`✅ Status endpoint working:`, statusResponse.data);
  } catch (error) {
    console.error(`❌ Status endpoint failed:`, error.message);
  }

  // Test each case via API
  for (const testCase of testCases) {
    console.log(`\n📋 API Test: ${testCase.name}`);

    // Test POST method
    try {
      console.log(`🔄 Testing POST method...`);
      const postResponse = await axios.post(
        `${TEST_CONFIG.baseURL}/api/${TEST_CONFIG.apiVersion}/analyze`,
        {
          symbol: testCase.symbol,
          issuer: testCase.issuer
        },
        {
          timeout: TEST_CONFIG.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ POST Success! Status: ${postResponse.status}`);
      console.log(`📊 Found ${postResponse.data.count} announcements`);
      console.log(`⏱️ Response time: ${postResponse.data.responseTime}`);
      console.log(`🔧 Method: ${postResponse.data.method}`);

      if (postResponse.data.count > 0) {
        const firstAnnouncement = postResponse.data.announcements[0];
        console.log(`📝 Sample announcement fields:`, Object.keys(firstAnnouncement));

        // Verify required fields
        const missingFields = testCase.expectedFields.filter(field =>
          !firstAnnouncement.hasOwnProperty(field)
        );

        if (missingFields.length > 0) {
          console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
        } else {
          console.log(`✅ All required fields present in API response`);
        }
      }

    } catch (error) {
      console.error(`❌ POST method failed:`, error.response?.data || error.message);
    }

    // Test GET method
    try {
      console.log(`🔄 Testing GET method...`);
      const getResponse = await axios.get(
        `${TEST_CONFIG.baseURL}/api/${TEST_CONFIG.apiVersion}/analyze`,
        {
          params: {
            symbol: testCase.symbol,
            issuer: testCase.issuer
          },
          timeout: TEST_CONFIG.timeout
        }
      );

      console.log(`✅ GET Success! Status: ${getResponse.status}`);
      console.log(`📊 Found ${getResponse.data.count} announcements`);

    } catch (error) {
      console.error(`❌ GET method failed:`, error.response?.data || error.message);
    }
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...\n');

  // Test invalid symbol
  try {
    console.log(`🔍 Testing invalid symbol...`);
    await axios.post(`${TEST_CONFIG.baseURL}/api/${TEST_CONFIG.apiVersion}/analyze`, {
      symbol: 'INVALID_SYMBOL_123'
    });
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`✅ Correctly handled invalid symbol with 404 status`);
    } else {
      console.log(`📋 Error response:`, error.response?.data);
    }
  }

  // Test missing symbol
  try {
    console.log(`🔍 Testing missing symbol...`);
    await axios.post(`${TEST_CONFIG.baseURL}/api/${TEST_CONFIG.apiVersion}/analyze`, {});
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(`✅ Correctly handled missing symbol with 400 status`);
    } else {
      console.log(`📋 Error response:`, error.response?.data);
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting Hybrid NSE API Tests');
  console.log('=====================================');

  try {
    // Test 1: Direct hybrid scraper
    await testHybridScraperDirect();

    // Test 2: Express API endpoints
    await testExpressAPI();

    // Test 3: Error handling
    await testErrorHandling();

    console.log('\n✅ All tests completed!');
    console.log('=====================================');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testHybridScraperDirect,
  testExpressAPI,
  testErrorHandling
};
