const express = require('express');
const router = express.Router();
const { chromium } = require('playwright');
const os = require('os');

/**
 * Diagnostic endpoint to test browser functionality
 */
router.get('/browser', async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('🧪 [DIAGNOSTIC] Browser test requested');

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
        freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
        cpuCores: os.cpus().length,
        isContainer: process.env.container !== undefined || process.env.DOCKER !== undefined
      },
      tests: [],
      success: false,
      totalTime: 0,
      error: null
    };

    let browser = null;
    let context = null;
    let page = null;

    try {
      // Test 1: Browser Launch
      console.log('🔧 [DIAGNOSTIC] Testing browser launch...');
      const launchStart = Date.now();

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

      const launchTime = Date.now() - launchStart;
      diagnostics.tests.push({
        name: 'Browser Launch',
        success: true,
        duration: `${launchTime}ms`,
        details: 'Chromium launched successfully'
      });

      // Test 2: Context Creation
      console.log('🔧 [DIAGNOSTIC] Testing context creation...');
      const contextStart = Date.now();

      context = await Promise.race([
        browser.newContext({
          viewport: { width: 1280, height: 720 },
          userAgent: 'Mozilla/5.0 (compatible; DiagnosticBot/1.0)'
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Context creation timeout')), 10000)
        )
      ]);

      const contextTime = Date.now() - contextStart;
      diagnostics.tests.push({
        name: 'Context Creation',
        success: true,
        duration: `${contextTime}ms`,
        details: 'Browser context created successfully'
      });

      // Test 3: Page Creation
      console.log('🔧 [DIAGNOSTIC] Testing page creation...');
      const pageStart = Date.now();

      page = await Promise.race([
        context.newPage(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Page creation timeout')), 10000)
        )
      ]);

      const pageTime = Date.now() - pageStart;
      diagnostics.tests.push({
        name: 'Page Creation',
        success: true,
        duration: `${pageTime}ms`,
        details: 'Browser page created successfully'
      });

      // Test 4: Navigation
      console.log('🔧 [DIAGNOSTIC] Testing navigation...');
      const navStart = Date.now();

      await Promise.race([
        page.goto('https://example.com', { waitUntil: 'domcontentloaded' }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Navigation timeout')), 15000)
        )
      ]);

      const navTime = Date.now() - navStart;
      const title = await page.title();

      diagnostics.tests.push({
        name: 'Navigation',
        success: true,
        duration: `${navTime}ms`,
        details: `Successfully navigated to example.com, title: "${title}"`
      });

      diagnostics.success = true;
      console.log('✅ [DIAGNOSTIC] All browser tests passed');

    } catch (error) {
      console.error('❌ [DIAGNOSTIC] Browser test failed:', error.message);

      diagnostics.tests.push({
        name: 'Browser Test',
        success: false,
        duration: `${Date.now() - startTime}ms`,
        details: error.message,
        error: error.message
      });

      diagnostics.error = error.message;
    } finally {
      // Cleanup
      try {
        if (page) await page.close();
        if (context) await context.close();
        if (browser) await browser.close();
        console.log('🧹 [DIAGNOSTIC] Cleanup completed');
      } catch (cleanupError) {
        console.error('⚠️ [DIAGNOSTIC] Cleanup failed:', cleanupError.message);
      }
    }

    diagnostics.totalTime = `${Date.now() - startTime}ms`;

    res.status(200).json({
      status: diagnostics.success ? 'healthy' : 'unhealthy',
      message: diagnostics.success ? 'Browser functionality verified' : 'Browser test failed',
      diagnostics
    });

  } catch (error) {
    console.error('💥 [DIAGNOSTIC] Unexpected error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Diagnostic test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Quick browser status check
 */
router.get('/browser/quick', async (req, res) => {
  try {
    console.log('⚡ [DIAGNOSTIC] Quick browser check requested');

    // Quick executable check
    let executablePath = null;
    let executableExists = false;

    try {
      executablePath = chromium.executablePath();
      executableExists = true;
    } catch (error) {
      executableExists = false;
    }

    res.status(200).json({
      status: executableExists ? 'available' : 'unavailable',
      message: executableExists ? 'Browser executable found' : 'Browser executable not found',
      executablePath,
      timestamp: new Date().toISOString(),
      environment: {
        platform: os.platform(),
        nodeVersion: process.version,
        memoryMB: Math.round(os.freemem() / 1024 / 1024)
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Quick diagnostic failed',
      error: error.message
    });
  }
});

module.exports = router;
