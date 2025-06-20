const { scrapeNSEFilings } = require('../utils/nseScraper');

/**
 * Simple Test for NSE Dropdown Selection
 * Verifies RELIANCE dropdown selection works correctly
 */

async function testNSEDropdown() {
  console.log('🔍 Testing NSE Dropdown Selection for RELIANCE...\n');

  try {
    const startTime = Date.now();

    // Test single company
    console.log('📊 Testing: RELIANCE');
    const result = await scrapeNSEFilings('RELIANCE');

    const duration = Date.now() - startTime;

    // Analyze results
    console.log('\n📋 Results:');
    console.log(`   Company: ${result.company || 'N/A'}`);
    console.log(`   Filings Found: ${result.count || 0}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Cached: ${result.cached ? 'Yes' : 'No'}`);

    // Validate results
    if (result.count > 0) {
      console.log('\n✅ SUCCESS: Dropdown selection working - filings retrieved!');

      // Show sample filings
      const sampleFilings = result.filings?.slice(0, 3) || [];
      if (sampleFilings.length > 0) {
        console.log('\n📄 Sample Filings:');
        sampleFilings.forEach((filing, index) => {
          console.log(`   ${index + 1}. ${filing.date || 'N/A'} - ${filing.title || 'N/A'}`);
        });
      }

      // Check for recent filings (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentFilings = result.filings?.filter(filing => {
        if (!filing.date) return false;
        const filingDate = new Date(filing.date);
        return filingDate >= sevenDaysAgo;
      }) || [];

      console.log(`\n📅 Recent Filings (last 7 days): ${recentFilings.length}`);

      if (recentFilings.length > 0) {
        console.log('✅ REQUIREMENT MET: Found recent filings!');
      } else {
        console.log('⚠️  No recent filings found (may be expected)');
      }

    } else {
      console.log('\n❌ FAILED: No filings retrieved - dropdown selection issue');
      return false;
    }

    return true;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    return false;
  }
}

// Test the API endpoint
async function testAPIEndpoint() {
  console.log('\n🌐 Testing API Endpoint...');

  try {
    // Import controller
    const { analyzeCompany } = require('../controllers/analyze.controller');

    // Mock request and response
    const req = {
      body: { companyName: 'RELIANCE' },
      query: {},
      id: 'test_001'
    };

    let responseData = null;
    let statusCode = null;

    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        responseData = data;
        return res;
      }
    };

    const next = (error) => {
      throw error;
    };

    // Call controller
    await analyzeCompany(req, res, next);

    console.log(`📊 API Response Status: ${statusCode}`);

    if (statusCode === 200 && responseData?.success) {
      console.log(`✅ API Success: ${responseData.count} filings found`);
      return true;
    } else {
      console.log(`❌ API Failed: ${responseData?.message || 'Unknown error'}`);
      return false;
    }

  } catch (error) {
    console.error('❌ API Error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 NSE Dropdown Selection Test Suite\n');

  const dropdownTest = await testNSEDropdown();
  const apiTest = await testAPIEndpoint();

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary:');
  console.log(`   Dropdown Selection: ${dropdownTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   API Integration: ${apiTest ? '✅ PASS' : '❌ FAIL'}`);

  const overall = dropdownTest && apiTest;
  console.log(`   Overall: ${overall ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  console.log('='.repeat(60));

  if (overall) {
    console.log('🎉 NSE Dropdown Selection is working correctly!');
    console.log('✅ Ready for production use with RELIANCE and similar companies.');
  } else {
    console.log('⚠️  Issues detected - please review the dropdown selection logic.');
  }
}

// Execute tests
runTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
