#!/bin/bash

# ==========================================
# BUILD SCRIPT FOR WEBASSEMBLY
# Auto-adapts to different environments
# ==========================================

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$WORKSPACE_DIR/dist"

echo "========================================="
echo "Building WebAssembly Module"
echo "========================================="
echo "Workspace: $WORKSPACE_DIR"
echo "Dist: $DIST_DIR"
echo ""

# Create dist directory
mkdir -p "$DIST_DIR"

# Detect Emscripten
detect_emcc() {
    # Check if emcc is in PATH
    if command -v emcc &> /dev/null; then
        echo "$(which emcc)"
        return 0
    fi

    # Common installation paths
    COMMON_PATHS=(
        "$HOME/emsdk/upstream/emscripten/emcc"
        "$HOME/emsdk/emcc"
        "/opt/emsdk/upstream/emscripten/emcc"
        "/usr/local/emsdk/upstream/emscripten/emcc"
        "$WORKSPACE_DIR/emsdk/upstream/emscripten/emcc"
    )

    for path in "${COMMON_PATHS[@]}"; do
        if [ -f "$path" ]; then
            echo "$path"
            return 0
        fi
    done

    echo ""
    return 1
}

EMCC_PATH=$(detect_emcc)

if [ -z "$EMCC_PATH" ]; then
    echo "❌ Emscripten not found!"
    echo ""
    echo "Please install Emscripten:"
    echo "  git clone https://github.com/emscripten-core/emsdk.git"
    echo "  cd emsdk"
    echo "  ./emsdk install latest"
    echo "  ./emsdk activate latest"
    echo "  source ./emsdk_env.sh"
    exit 1
fi

echo "✅ Using Emscripten: $EMCC_PATH"
echo ""

# Build WASM
echo "Compiling C++ to WebAssembly..."

"$EMCC_PATH" \
    -std=c++17 \
    -O3 \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS='["_malloc", "_free"]' \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "getValue", "setValue"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME='createVerifikasiModule' \
    -s ENVIRONMENT='web' \
    -lembind \
    "$SCRIPT_DIR/verifikasi.cpp" \
    -o "$DIST_DIR/verifikasi_magang.js"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "Generated files:"
    echo "  📄 $DIST_DIR/verifikasi_magang.js"
    echo "  📄 $DIST_DIR/verifikasi_magang.wasm"
    echo ""
    echo "To run the application:"
    echo "  cd $DIST_DIR"
    echo "  python3 -m http.server 8080"
    echo "  # Then open http://localhost:8080"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi