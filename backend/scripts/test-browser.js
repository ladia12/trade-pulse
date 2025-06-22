#!/usr/bin/env node

/**
 * Simple Browser Test Script
 * Quick test to identify where browser initialization fails
 */

const { chromium } = require('playwright');

console.log('🧪 Quick Browser Test');
console.log('====================');

async function testBrowser() {
  let browser = null;
  let context = null;
  let page = null;

  try {
    console.log('1️⃣ Testing browser launch...');
    const startTime = Date.now();

    browser = await Promise.race([
      chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Browser launch timeout')), 15000)
      )
    ]);

    const launchTime = Date.now() - startTime;
    console.log(`✅ Browser launched in ${launchTime}ms`);

    console.log('2️⃣ Testing context creation...');
    const contextStart = Date.now();

    context = await Promise.race([
      browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Context creation timeout')), 10000)
      )
    ]);

    const contextTime = Date.now() - contextStart;
    console.log(`✅ Context created in ${contextTime}ms`);

    console.log('3️⃣ Testing page creation...');
    const pageStart = Date.now();

    page = await Promise.race([
      context.newPage(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Page creation timeout')), 10000)
      )
    ]);

    const pageTime = Date.now() - pageStart;
    console.log(`✅ Page created in ${pageTime}ms`);

    console.log('4️⃣ Testing navigation...');
    const navStart = Date.now();

    await Promise.race([
      page.goto('https://example.com', { waitUntil: 'domcontentloaded' }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Navigation timeout')), 15000)
      )
    ]);

    const navTime = Date.now() - navStart;
    console.log(`✅ Navigation completed in ${navTime}ms`);

    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);

    const totalTime = Date.now() - startTime;
    console.log(`\n🎉 All tests passed! Total time: ${totalTime}ms`);

  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);

    if (error.message.includes('timeout')) {
      console.error('\n🔍 Timeout detected. Possible issues:');
      console.error('   - Insufficient system resources');
      console.error('   - Missing browser dependencies');
      console.error('   - Container resource limits');
      console.error('   - Network connectivity issues');
    }

    return false;

  } finally {
    // Cleanup
    try {
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
      console.log('\n🧹 Cleanup completed');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup failed:', cleanupError.message);
    }
  }

  return true;
}

// Run the test
testBrowser().then(success => {
  if (success) {
    console.log('\n✅ Browser test passed - scraping should work');
    process.exit(0);
  } else {
    console.log('\n❌ Browser test failed - fix issues before running scraper');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
