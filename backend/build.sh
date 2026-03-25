#!/bin/bash

echo "========================================="
echo "Building WebAssembly Module"
echo "========================================="

# Check if emcc is available
if ! command -v emcc &> /dev/null; then
    echo "❌ Emscripten not found!"
    echo "Please install Emscripten first:"
    echo "  git clone https://github.com/emscripten-core/emsdk.git"
    echo "  cd emsdk"
    echo "  ./emsdk install latest"
    echo "  ./emsdk activate latest"
    echo "  source ./emsdk_env.sh"
    exit 1
fi

echo "✅ Emscripten found"

# Build WASM
echo "Compiling C++ to WebAssembly..."

em++ -std=c++17 \
     -O3 \
     -s WASM=1 \
     -s EXPORTED_FUNCTIONS='["_malloc", "_free"]' \
     -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "getValue", "setValue"]' \
     -s ALLOW_MEMORY_GROWTH=1 \
     -s MODULARIZE=1 \
     -s EXPORT_NAME='createVerifikasiModule' \
     -s ENVIRONMENT='web' \
     -lembind \
     verifikasi.cpp \
     -o ../frontend/verifikasi_magang.js

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "Generated files:"
    echo "  - ../frontend-web/verifikasi_magang.js"
    echo "  - ../frontend-web/verifikasi_magang.wasm"
else
    echo "❌ Build failed!"
    exit 1
fi

# Copy files to frontend-web
echo "Copying files to frontend-web..."
cp wasm_verifikasi.h ../frontend-web/ 2>/dev/null || true

echo "========================================="
echo "Done! Files are ready in frontend-web/"
echo "========================================="