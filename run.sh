#!/bin/bash

# ==========================================
# ONE-CLICK RUN SCRIPT
# Auto-adapts to any environment
# ==========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

echo "========================================="
echo "Verifikasi Magang - WebAssembly"
echo "========================================="

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ dist directory not found!"
    echo "Please run build-wasm.sh first"
    exit 1
fi

# Check if WASM files exist
if [ ! -f "$DIST_DIR/verifikasi_magang.wasm" ]; then
    echo "❌ WASM files not found!"
    echo "Please run: cd backend && ./build-wasm.sh"
    exit 1
fi

echo "✅ Files found in $DIST_DIR"
echo ""

# Detect available server
start_server() {
    # Try Python 3
    if command -v python3 &> /dev/null; then
        echo "Starting server with Python 3..."
        cd "$DIST_DIR"
        python3 -m http.server 8080
        return 0
    fi

    # Try Python 2
    if command -v python &> /dev/null; then
        echo "Starting server with Python 2..."
        cd "$DIST_DIR"
        python -m SimpleHTTPServer 8080
        return 0
    fi

    # Try PHP
    if command -v php &> /dev/null; then
        echo "Starting server with PHP..."
        cd "$DIST_DIR"
        php -S localhost:8080
        return 0
    fi

    # Try Node.js serve
    if command -v npx &> /dev/null; then
        echo "Starting server with Node.js serve..."
        cd "$DIST_DIR"
        npx serve -p 8080
        return 0
    fi

    echo "❌ No suitable server found!"
    echo "Please install Python, PHP, or Node.js"
    exit 1
}

echo "🌐 Starting HTTP server..."
echo "📱 Open browser at: http://localhost:8080"
echo "⏹️  Press Ctrl+C to stop"
echo ""

start_server