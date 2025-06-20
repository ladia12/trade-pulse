#!/bin/bash

# Manual Browser Installation Script for Problematic Environments
# Use this when automatic installation fails due to OS/permission issues

set -e

echo "🔧 Manual Playwright Browser Installation"
echo "========================================"

# Detect environment
echo "🔍 Detecting environment..."
echo "OS: $(uname -a)"
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"

# Check if we're in a restricted environment
if [ ! -w "/usr" ] && [ ! -w "/usr/local" ]; then
    echo "⚠️  Restricted environment detected (no write access to system directories)"
    RESTRICTED=true
else
    RESTRICTED=false
fi

# Function to try different installation methods
try_installation() {
    local method="$1"
    local command="$2"

    echo ""
    echo "🔧 Trying method: $method"
    echo "Command: $command"

    if eval "$command"; then
        echo "✅ Success with method: $method"
        return 0
    else
        echo "❌ Failed with method: $method"
        return 1
    fi
}

# Installation strategies
echo ""
echo "📦 Starting browser installation..."

# Method 1: Standard with deps
if try_installation "Standard with dependencies" "npx playwright install chromium --with-deps"; then
    exit 0
fi

# Method 2: Without deps
if try_installation "Without system dependencies" "npx playwright install chromium"; then
    echo "⚠️  Note: System dependencies were not installed"
    echo "   The browser might not work properly without required libraries"
    exit 0
fi

# Method 3: Force download
if try_installation "Force download" "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false npx playwright install chromium"; then
    exit 0
fi

# Method 4: Skip browser validation (for Docker pre-installed browsers)
if try_installation "Skip download (use system browser)" "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true npx playwright install chromium"; then
    echo "⚠️  Note: Using system-installed browser (if available)"
    exit 0
fi

# Method 5: Download to specific directory
if $RESTRICTED; then
    BROWSER_DIR="$HOME/.cache/ms-playwright"
    mkdir -p "$BROWSER_DIR"
    if try_installation "Download to user directory" "PLAYWRIGHT_BROWSERS_PATH=$BROWSER_DIR npx playwright install chromium"; then
        echo "✅ Browsers installed to user directory: $BROWSER_DIR"
        echo "💡 Set environment variable: export PLAYWRIGHT_BROWSERS_PATH=$BROWSER_DIR"
        exit 0
    fi
fi

# All methods failed
echo ""
echo "💥 All automatic installation methods failed!"
echo ""
echo "🛠️  Manual Solutions:"
echo ""
echo "1. 📋 Copy browser from another machine:"
echo "   - Install Playwright on a compatible machine"
echo "   - Copy ~/.cache/ms-playwright/ to this machine"
echo "   - Set PLAYWRIGHT_BROWSERS_PATH environment variable"
echo ""
echo "2. 🐳 Use Docker with pre-installed browsers:"
echo "   - mcr.microsoft.com/playwright:v1.40.0-focal"
echo "   - mcr.microsoft.com/playwright/python:v1.40.0-focal"
echo ""
echo "3. 📦 Install system dependencies manually:"
if command -v apt-get >/dev/null; then
    echo "   sudo apt-get update"
    echo "   sudo apt-get install -y chromium-browser"
elif command -v yum >/dev/null; then
    echo "   sudo yum install -y chromium"
elif command -v apk >/dev/null; then
    echo "   sudo apk add chromium"
fi
echo ""
echo "4. 🔧 Alternative: Use system Chrome/Chromium:"
echo "   - Install Chrome/Chromium through system package manager"
echo "   - Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to browser location"
echo ""
echo "5. ☁️  Use a different environment:"
echo "   - Try on a different OS/container"
echo "   - Use GitHub Codespaces or similar cloud environment"
echo ""

exit 1
