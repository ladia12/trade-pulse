#!/usr/bin/env node

/**
 * Comprehensive Stealth Test Script
 * Tests anti-detection measures against known bot detection websites
 */

const { chromium } = require('playwright');
const { addExtra } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

console.log('🕵️ Comprehensive Stealth Detection Test');
console.log('========================================');

/**
 * Enhanced stealth configuration
 */
const STEALTH_CONFIG = {
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ],
  launchArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-extensions-except',
    '--disable-plugins-discovery',
    '--no-default-browser-check',
    '--no-pings',
    '--no-service-autorun',
    '--password-store=basic',
    '--use-mock-keychain',
    '--disable-component-extensions-with-background-pages',
    '--disable-default-apps',
    '--mute-audio',
    '--disable-background-networking',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-domain-reliability',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--use-gl=swiftshader'
  ]
};

/**
 * Initialize stealth browser
 */
async function createStealthBrowser(headless = true) {
  const chromiumWithStealth = addExtra(chromium);
  chromiumWithStealth.use(StealthPlugin());

  const userAgent = STEALTH_CONFIG.userAgents[Math.floor(Math.random() * STEALTH_CONFIG.userAgents.length)];

  const browser = await chromiumWithStealth.launch({
    headless,
    args: STEALTH_CONFIG.launchArgs,
    ignoreDefaultArgs: ['--enable-automation'],
    ignoreHTTPSErrors: true,
    devtools: false
  });

  const context = await browser.newContext({
    userAgent,
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'Asia/Kolkata',
    geolocation: { latitude: 28.6139, longitude: 77.2090 },
    permissions: ['geolocation'],
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Google Chrome";v="120", "Not A(Brand";v="99", "Chromium";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    },
    colorScheme: 'light',
    reducedMotion: 'no-preference',
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false
  });

  // Add comprehensive stealth properties
  await context.addInitScript(() => {
    // Remove webdriver
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

    // Mock plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => ({
        length: 4,
        0: { name: "Chrome PDF Plugin", description: "Portable Document Format", filename: "internal-pdf-viewer" },
        1: { name: "Chrome PDF Viewer", description: "", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai" },
        2: { name: "Native Client", description: "", filename: "internal-nacl-plugin" },
        3: { name: "WebKit built-in PDF", description: "Portable Document Format", filename: "webkit-pdf-plugin" }
      })
    });

    // Mock other properties
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'deviceMemory', { value: 8 });
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 4 });
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '4g', rtt: 150, downlink: 2.0 }
    });

    // Mock Chrome runtime
    Object.defineProperty(window, 'chrome', {
      value: {
        runtime: {
          onConnect: undefined,
          onMessage: undefined,
          connect: () => {},
          sendMessage: () => {}
        }
      }
    });

    // Remove automation traces
    delete window.__nightmare;
    delete window._phantom;
    delete window.callPhantom;
    delete window.__webdriver_unwrapped;
    delete window.__webdriver_script_fn;
    delete window.__selenium_unwrapped;

    // Mock screen properties
    Object.defineProperty(screen, 'width', { value: 1920 });
    Object.defineProperty(screen, 'height', { value: 1080 });
    Object.defineProperty(screen, 'availWidth', { value: 1920 });
    Object.defineProperty(screen, 'availHeight', { value: 1040 });
  });

    // Additional page-level stealth
  await context.addInitScript(() => {
    // Override console.debug
    console.debug = () => {};

    // Mock additional navigator properties
    Object.defineProperty(navigator, 'platform', { value: 'Win32' });
    Object.defineProperty(navigator, 'product', { value: 'Gecko' });
    Object.defineProperty(navigator, 'vendor', { value: 'Google Inc.' });

    // Mock iframe detection bypass
    Object.defineProperty(window, 'outerHeight', { value: window.innerHeight });
    Object.defineProperty(window, 'outerWidth', { value: window.innerWidth });
  });

  const page = await context.newPage();

  return { browser, context, page };
}

/**
 * Test bot detection
 */
async function testBotDetection(page, testName) {
  console.log(`\n🧪 Testing: ${testName}`);

  try {
    // Test against bot detection website
    await page.goto('https://bot.sannysoft.com/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for page to load completely
    await page.waitForTimeout(3000);

    // Extract detection results
    const results = await page.evaluate(() => {
      const getResult = (text) => {
        const rows = Array.from(document.querySelectorAll('tr'));
        const row = rows.find(r => r.textContent.includes(text));
        if (row) {
          const cells = row.querySelectorAll('td');
          return cells[cells.length - 1]?.textContent?.trim() || 'Not found';
        }
        return 'Not found';
      };

      return {
        webdriver: getResult('navigator.webdriver'),
        plugins: getResult('navigator.plugins'),
        languages: getResult('navigator.languages'),
        chrome: getResult('window.chrome'),
        permissions: getResult('navigator.permissions'),
        webgl: getResult('WebGL Vendor'),
        screen: getResult('screen.width'),
        overall: document.title
      };
    });

    console.log('📊 Detection Results:');
    console.log(`   navigator.webdriver: ${results.webdriver}`);
    console.log(`   navigator.plugins: ${results.plugins}`);
    console.log(`   navigator.languages: ${results.languages}`);
    console.log(`   window.chrome: ${results.chrome}`);
    console.log(`   screen properties: ${results.screen}`);
    console.log(`   Page title: ${results.overall}`);

        // Check for success indicators
    const isStealthy = results.webdriver === 'Not found' || results.webdriver === 'undefined' || results.webdriver.includes('undefined');
    const hasPlugins = results.plugins.includes('4') || results.plugins.includes('Plugin') || results.plugins.includes('Chrome PDF');
    const hasValidScreen = results.screen.includes('1920') || results.screen.includes('1366');

    console.log(`🔍 Analysis:`);
    console.log(`   Webdriver hidden: ${isStealthy ? '✅' : '❌'}`);
    console.log(`   Plugins mocked: ${hasPlugins ? '✅' : '❌'}`);
    console.log(`   Screen valid: ${hasValidScreen ? '✅' : '❌'}`);

    // Consider it successful if webdriver is hidden and plugins are mocked
    if (isStealthy && hasPlugins) {
      console.log('✅ Stealth test PASSED - Bot detection bypassed');
      return true;
    } else {
      console.log('❌ Stealth test FAILED - Bot detected');
      return false;
    }

  } catch (error) {
    console.log(`❌ Test failed with error: ${error.message}`);
    return false;
  }
}

/**
 * Test WebRTC leak protection
 */
async function testWebRTC(page) {
  console.log('\n🔒 Testing WebRTC leak protection...');

  try {
    const webrtcResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.createDataChannel('test');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            resolve('WebRTC working');
          }
        };

        setTimeout(() => resolve('WebRTC blocked/timeout'), 5000);
      });
    });

    console.log(`📡 WebRTC result: ${webrtcResult}`);
    return webrtcResult.includes('working');

  } catch (error) {
    console.log(`❌ WebRTC test failed: ${error.message}`);
    return false;
  }
}

/**
 * Main test function
 */
async function runStealthTests() {
  const modes = [
    { name: 'Headless Mode', headless: true },
    { name: 'Non-Headless Mode', headless: false }
  ];

  const results = {};

  for (const mode of modes) {
    console.log(`\n🎭 Testing ${mode.name}`);
    console.log('='.repeat(40));

    let browser, context, page;

    try {
      ({ browser, context, page } = await createStealthBrowser(mode.headless));

      // Run bot detection test
      const botTestResult = await testBotDetection(page, `${mode.name} - Bot Detection`);

      // Run WebRTC test
      const webrtcResult = await testWebRTC(page);

      results[mode.name] = {
        botDetection: botTestResult,
        webrtc: webrtcResult,
        overall: botTestResult
      };

    } catch (error) {
      console.log(`❌ ${mode.name} failed: ${error.message}`);
      results[mode.name] = {
        botDetection: false,
        webrtc: false,
        overall: false,
        error: error.message
      };
    } finally {
      try {
        if (page) await page.close();
        if (context) await context.close();
        if (browser) await browser.close();
      } catch (cleanupError) {
        console.log(`⚠️ Cleanup error: ${cleanupError.message}`);
      }
    }
  }

  // Print summary
  console.log('\n📋 STEALTH TEST SUMMARY');
  console.log('========================');

  for (const [modeName, result] of Object.entries(results)) {
    const status = result.overall ? '✅ PASS' : '❌ FAIL';
    console.log(`${modeName}: ${status}`);

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else {
      console.log(`   Bot Detection: ${result.botDetection ? '✅' : '❌'}`);
      console.log(`   WebRTC: ${result.webrtc ? '✅' : '❌'}`);
    }
  }

  const allPassed = Object.values(results).every(r => r.overall);

  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  if (allPassed) {
    console.log('🎉 Stealth configuration is working correctly!');
    console.log('💡 The scraper should work in headless mode without detection.');
  } else {
    console.log('⚠️ Stealth configuration needs improvement.');
    console.log('💡 Review the failed tests and enhance anti-detection measures.');
  }

  return allPassed;
}

// Run the tests
runStealthTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
