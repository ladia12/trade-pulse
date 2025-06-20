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
 * Install Playwright browsers
 */
async function installBrowsers() {
  console.log('📦 Installing Playwright browsers...');
  console.log('⏳ This may take a few minutes...');

  try {
    execSync('npx playwright install chromium --with-deps', {
      stdio: 'inherit',
      timeout: 300000 // 5 minutes timeout
    });
    console.log('✅ Browsers installed successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to install browsers:', error.message);
    console.error('💡 Please run manually: npx playwright install chromium --with-deps');
    return false;
  }
}

/**
 * Ensure browsers are available before starting the application
 */
async function ensureBrowsersAvailable() {
  console.log('🔍 Checking browser installation...');

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
