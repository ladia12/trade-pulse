const { chromium } = require('playwright');
const { execSync } = require('child_process');

/**
 * Check if Playwright browsers are installed
 */
async function checkBrowserInstallation() {
  try {
    const executablePath = chromium.executablePath();
    console.log(`✅ Chromium browser found at: ${executablePath}`);
    return true;
  } catch (error) {
    console.log('❌ Chromium browser not found');
    return false;
  }
}

/**
 * Install Playwright browsers with fallback strategies
 */
async function installBrowsers() {
  console.log('📦 Installing Playwright browsers...');
  console.log('⏳ This may take a few minutes...');

  // Strategy 1: Try with system dependencies
  try {
    console.log('🔧 Attempting installation with system dependencies...');
    execSync('npx playwright install chromium --with-deps', {
      stdio: 'inherit',
      timeout: 300000 // 5 minutes timeout
    });
    console.log('✅ Browsers installed successfully with dependencies');
    return true;
  } catch (error) {
    console.log('⚠️ Installation with deps failed, trying fallback...');
  }

  // Strategy 2: Try without system dependencies
  try {
    console.log('🔧 Attempting installation without system dependencies...');
    execSync('npx playwright install chromium', {
      stdio: 'inherit',
      timeout: 300000 // 5 minutes timeout
    });
    console.log('✅ Browsers installed successfully (without system deps)');
    console.log('⚠️  Note: Some system dependencies might be missing');
    return true;
  } catch (error) {
    console.log('⚠️ Standard installation failed, trying force download...');
  }

  // Strategy 3: Force download
  try {
    console.log('🔧 Attempting forced browser download...');
    execSync('PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false npx playwright install chromium', {
      stdio: 'inherit',
      timeout: 300000,
      env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: 'false' }
    });
    console.log('✅ Browsers force-installed successfully');
    return true;
  } catch (error) {
    console.error('❌ All installation strategies failed');
    console.error('🔍 Error details:', error.message);
    console.error('');
    console.error('🛠️  Manual installation options:');
    console.error('   1. npx playwright install chromium');
    console.error('   2. npx playwright install chromium --with-deps');
    console.error('   3. PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false npx playwright install chromium');
    console.error('');
    console.error('🐳 For Docker/CI environments:');
    console.error('   - Use a base image with browsers pre-installed');
    console.error('   - Install system dependencies manually first');
    return false;
  }
}

/**
 * Ensure browsers are available before starting the application
 */
async function ensureBrowsersAvailable() {
  console.log('🔍 Checking browser installation...');

  // Check if we're in an environment where browser download should be skipped
  if (process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === 'true') {
    console.log('🐳 Browser download is disabled, using system browser...');
    
    // Only verify that the system browser is available
    try {
      const executablePath = chromium.executablePath();
      console.log(`✅ System Chromium browser found at: ${executablePath}`);
      console.log('🎉 Browser validation complete');
      return true;
    } catch (error) {
      console.error('❌ System Chromium browser not found');
      console.error('🔍 Error details:', error.message);
      console.error('');
      console.error('🛠️  For Docker/Alpine environments:');
      console.error('   - Ensure chromium is installed via apk');
      console.error('   - Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to /usr/bin/chromium-browser');
      process.exit(1);
    }
  }

  const isInstalled = await checkBrowserInstallation();

  if (!isInstalled) {
    console.log('📥 Browsers not found, attempting to install...');
    const installSuccess = await installBrowsers();

    if (!installSuccess) {
      console.error('💥 Browser installation failed');
      console.error('🛠️  Manual installation steps:');
      console.error('   1. Run: npx playwright install chromium --with-deps');
      console.error('   2. Or run: npm run install-browsers');
      console.error('   3. Then restart the application');
      process.exit(1);
    }

    // Verify installation
    const finalCheck = await checkBrowserInstallation();
    if (!finalCheck) {
      console.error('💥 Browser installation verification failed');
      process.exit(1);
    }
  }

  console.log('🎉 Browser validation complete');
  return true;
}

module.exports = {
  checkBrowserInstallation,
  installBrowsers,
  ensureBrowsersAvailable
};