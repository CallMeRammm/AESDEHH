#!/bin/bash

# Auto-detect Emscripten installation
detect_emsdk() {
    # Common Emscripten installation paths
    COMMON_PATHS=(
        "$HOME/emsdk"
        "$HOME/emsdk/upstream/emscripten"
        "/opt/emsdk"
        "/usr/local/emsdk"
        "$HOME/.emscripten"
    )

    for path in "${COMMON_PATHS[@]}"; do
        if [ -f "$path/em++" ] || [ -f "$path/emcc" ]; then
            echo "$path"
            return 0
        fi
    done

    # Check if emcc is in PATH
    if command -v emcc &> /dev/null; then
        which emcc | sed 's/\/emcc$//'
        return 0
    fi

    echo ""
    return 1
}

# Export EMSDK path
EMSDK_PATH=$(detect_emsdk)
if [ -n "$EMSDK_PATH" ]; then
    export EMSDK="$EMSDK_PATH"
    echo "✅ Emscripten detected at: $EMSDK"
else
    echo "⚠️ Emscripten not found. Please install Emscripten first."
    echo "   Run: git clone https://github.com/emscripten-core/emsdk.git && cd emsdk && ./emsdk install latest && ./emsdk activate latest"
fi