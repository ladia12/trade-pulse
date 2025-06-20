const { scrapeNSEFilings } = require('../utils/nseScraper');

/**
 * Test configuration
 */
const TEST_COMPANIES = [
  'RELIANCE',
  'TCS',
  'INFY',
  'HDFC',
  'WIPRO',
  'ICICIBANK',
  'SBIN'
];

/**
 * Test individual company scraping
 */
async function testSingleCompany(companyName) {
  console.log(`\n🧪 [TEST] Testing scraping for: ${companyName}`);
  console.log('─'.repeat(60));

  try {
    const startTime = Date.now();
    const result = await scrapeNSEFilings(companyName, { maxRetries: 2 });
    const endTime = Date.now();

    console.log(`✅ [SUCCESS] ${companyName}:`);
    console.log(`   📊 Filings found: ${result.count}`);
    console.log(`   ⏱️  Processing time: ${endTime - startTime}ms`);
    console.log(`   💾 Cached: ${result.cached ? 'Yes' : 'No'}`);

    if (result.filings.length > 0) {
      console.log(`   📄 Sample filing:`);
      const sample = result.filings[0];
      console.log(`      Date: ${sample.date}`);
      console.log(`      Subject: ${sample.subject.substring(0, 50)}...`);
      console.log(`      PDF Link: ${sample.pdfLink ? 'Available' : 'None'}`);
    }

    return { success: true, company: companyName, result };

  } catch (error) {
    console.log(`❌ [FAILED] ${companyName}: ${error.message}`);
    return { success: false, company: companyName, error: error.message };
  }
}

/**
 * Test error scenarios
 */
async function testErrorScenarios() {
  console.log(`\n🧪 [ERROR TESTS] Testing error handling scenarios`);
  console.log('─'.repeat(60));

  const errorTests = [
    { name: 'Invalid Company', input: 'INVALIDCOMPANY12345' },
    { name: 'Empty String', input: '' },
    { name: 'Special Characters', input: '!@#$%^&*()' },
    { name: 'Very Long Name', input: 'A'.repeat(300) }
  ];

  for (const test of errorTests) {
    try {
      console.log(`\n   Testing: ${test.name} (${test.input})`);
      const result = await scrapeNSEFilings(test.input, { maxRetries: 1 });
      console.log(`   ✅ Result: ${result.count} filings found`);
    } catch (error) {
      console.log(`   ❌ Expected error: ${error.message}`);
    }
  }
}

/**
 * Test caching functionality
 */
async function testCaching() {
  console.log(`\n🧪 [CACHE TESTS] Testing caching functionality`);
  console.log('─'.repeat(60));

  const testCompany = 'TCS';

  // First request - should not be cached
  console.log('   First request (should not be cached):');
  const firstResult = await scrapeNSEFilings(testCompany);
  console.log(`   📊 Cached: ${firstResult.cached}`);

  // Second request - should be cached
  console.log('   Second request (should be cached):');
  const secondResult = await scrapeNSEFilings(testCompany);
  console.log(`   📊 Cached: ${secondResult.cached}`);

  if (firstResult.cached === false && secondResult.cached === true) {
    console.log('   ✅ Caching working correctly');
  } else {
    console.log('   ❌ Caching not working as expected');
  }
}

/**
 * Test rate limiting (simulated)
 */
async function testRateLimiting() {
  console.log(`\n🧪 [RATE LIMIT TESTS] Testing rate limiting behavior`);
  console.log('─'.repeat(60));

  const testCompany = 'RELIANCE';
  const requests = [];

  // Simulate multiple concurrent requests
  for (let i = 0; i < 3; i++) {
    requests.push(
      scrapeNSEFilings(testCompany, { maxRetries: 1 })
        .then(result => ({ success: true, result }))
        .catch(error => ({ success: false, error: error.message }))
    );
  }

  const results = await Promise.allSettled(requests);
  console.log(`   📊 Total requests: ${results.length}`);

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`   Request ${index + 1}: ${result.value.success ? 'Success' : 'Failed'}`);
    } else {
      console.log(`   Request ${index + 1}: Error - ${result.reason}`);
    }
  });
}

/**
 * Performance benchmark test
 */
async function performanceBenchmark() {
  console.log(`\n🧪 [PERFORMANCE TESTS] Running performance benchmark`);
  console.log('─'.repeat(60));

  const testCompanies = ['TCS', 'RELIANCE', 'INFY'];
  const startTime = Date.now();

  const results = await Promise.allSettled(
    testCompanies.map(company =>
      scrapeNSEFilings(company, { maxRetries: 1 })
        .then(result => ({ company, success: true, count: result.count }))
        .catch(error => ({ company, success: false, error: error.message }))
    )
  );

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  console.log(`   ⏱️  Total time for ${testCompanies.length} companies: ${totalTime}ms`);
  console.log(`   📊 Average time per company: ${Math.round(totalTime / testCompanies.length)}ms`);

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const data = result.value;
      console.log(`   ${data.company}: ${data.success ? `${data.count} filings` : `Error - ${data.error}`}`);
    }
  });
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🧪 NSE SCRAPER COMPREHENSIVE TEST SUITE');
  console.log('═'.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);

  const overallStartTime = Date.now();

  try {
    // Test single companies
    console.log(`\n📋 [PHASE 1] Testing individual companies`);
    const companyResults = [];

    for (const company of TEST_COMPANIES.slice(0, 3)) { // Test first 3 companies
      const result = await testSingleCompany(company);
      companyResults.push(result);

      // Add delay between requests to respect rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Test error scenarios
    await testErrorScenarios();

    // Test caching
    await testCaching();

    // Test rate limiting
    await testRateLimiting();

    // Performance benchmark
    await performanceBenchmark();

    // Summary
    console.log(`\n📊 [TEST SUMMARY]`);
    console.log('═'.repeat(60));

    const successfulTests = companyResults.filter(r => r.success).length;
    const failedTests = companyResults.filter(r => !r.success).length;

    console.log(`✅ Successful company tests: ${successfulTests}`);
    console.log(`❌ Failed company tests: ${failedTests}`);
    console.log(`⏱️  Total test duration: ${Date.now() - overallStartTime}ms`);

    if (successfulTests > 0) {
      console.log(`\n🎉 NSE Scraper is working! At least ${successfulTests} companies were successfully scraped.`);
    } else {
      console.log(`\n⚠️  All tests failed. Please check NSE website availability and scraper configuration.`);
    }

  } catch (error) {
    console.error(`💥 [CRITICAL ERROR] Test suite failed:`, error);
  }

  console.log(`\nCompleted at: ${new Date().toISOString()}`);
  console.log('═'.repeat(60));
}

/**
 * Run specific test
 */
async function runSingleTest(companyName) {
  if (!companyName) {
    console.log('Usage: node testNSEScraper.js [COMPANY_NAME]');
    console.log('Example: node testNSEScraper.js RELIANCE');
    return;
  }

  console.log(`🧪 [SINGLE TEST] Testing: ${companyName}`);
  await testSingleCompany(companyName);
}

// Export functions for external use
module.exports = {
  runAllTests,
  runSingleTest,
  testSingleCompany,
  testErrorScenarios,
  testCaching
};

// Run tests if this file is executed directly
if (require.main === module) {
  const companyArg = process.argv[2];

  if (companyArg) {
    runSingleTest(companyArg);
  } else {
    runAllTests();
  }
}
