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

# Function to install browsers
install_browsers() {
    echo "📦 Installing Playwright browsers..."

    if is_ci_environment; then
        echo "🔧 CI/Docker environment detected"
        npx playwright install chromium --with-deps
    else
        echo "💻 Local environment detected"
        npm run install-browsers
    fi

    echo "✅ Browser installation completed"
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
