#!/bin/bash

# Trade Pulse Backend Startup Script
# Ensures Playwright browsers are installed before starting the application

set -e  # Exit on any error

echo "🚀 Trade Pulse Backend Startup"
echo "================================"

# Function to check if running in CI/Docker environment
is_ci_environment() {
    [[ -n "$CI" || -n "$DOCKER" || -n "$GITHUB_ACTIONS" || -n "$GITLAB_CI" ]]
}

# Function to install browsers with fallback strategies
install_browsers() {
    echo "📦 Installing Playwright browsers..."

    if is_ci_environment; then
        echo "🔧 CI/Docker environment detected"

        # Try multiple strategies for CI/Docker
        echo "🔧 Strategy 1: Installing with dependencies..."
        if npx playwright install chromium --with-deps 2>/dev/null; then
            echo "✅ Installed with system dependencies"
            return 0
        fi

        echo "⚠️ With-deps failed, trying without dependencies..."
        if npx playwright install chromium 2>/dev/null; then
            echo "✅ Installed without system dependencies"
            echo "⚠️  Note: Some system dependencies might be missing"
            return 0
        fi

        echo "⚠️ Standard install failed, trying force download..."
        if PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false npx playwright install chromium 2>/dev/null; then
            echo "✅ Force download successful"
            return 0
        fi

        echo "❌ All CI installation strategies failed"
        return 1
    else
        echo "💻 Local environment detected"
        npm run install-browsers-safe
    fi
}

# Function to check browser installation
check_browsers() {
    echo "🔍 Checking browser installation..."

    if npx playwright install --dry-run chromium 2>/dev/null | grep -q "is already installed"; then
        echo "✅ Browsers are already installed"
        return 0
    else
        echo "❌ Browsers not found"
        return 1
    fi
}

# Main startup logic
main() {
    # Check if browsers are installed
    if ! check_browsers; then
        echo "📥 Installing required browsers..."
        install_browsers

        # Verify installation
        if ! check_browsers; then
            echo "💥 Browser installation failed!"
            echo "🛠️  Manual steps:"
            echo "   1. Run: npx playwright install chromium --with-deps"
            echo "   2. Or run: npm run install-browsers"
            exit 1
        fi
    fi

    echo "🎭 Playwright browsers ready"
    echo "🚀 Starting Trade Pulse Backend..."

    # Start the application
    if [[ "$NODE_ENV" == "production" ]]; then
        echo "🏭 Production mode"
        npm start
    else
        echo "🔧 Development mode"
        npm run dev
    fi
}

# Run main function
main "$@"
