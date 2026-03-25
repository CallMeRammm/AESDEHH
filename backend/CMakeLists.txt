cmake_minimum_required(VERSION 3.10)
project(verifikasi_magang)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Deteksi apakah menggunakan Emscripten
if(EMSCRIPTEN)
    message(STATUS "Building for WebAssembly with Emscripten")
    
    # Konfigurasi untuk WebAssembly
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s WASM=1 -s USE_ES6_IMPORT_META=0")
    
    # Export fungsi untuk JavaScript
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} \
        -s EXPORTED_FUNCTIONS='[_main, _tambah, _kurang, _kali, _bagi, _verifikasi_data]' \
        -s EXPORTED_RUNTIME_METHODS='[ccall, cwrap, getValue, setValue, stringToUTF8, UTF8ToString]' \
        -s ALLOW_MEMORY_GROWTH=1 \
        -s MODULARIZE=1 \
        -s EXPORT_NAME='createWasmModule'")
    
    # Source files untuk WebAssembly
    set(SOURCES
        verifikasi.cpp
        main.cpp
    )
    
    # Buat target WebAssembly
    add_executable(verifikasi_magang ${SOURCES})
    
    # Set output properties
    set_target_properties(verifikasi_magang PROPERTIES
        OUTPUT_NAME "verifikasi_magang"
        SUFFIX ".js"
        RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}"
    )
    
else()
    # Untuk native build (testing tanpa Emscripten)
    message(STATUS "Building for native platform")
    
    # Untuk native, jangan include emscripten headers
    add_executable(verifikasi_magang_native 
        verifikasi.cpp
        main.cpp
    )
    
    # Optional: Buat stub untuk emscripten headers
    target_compile_definitions(verifikasi_magang_native PRIVATE NATIVE_BUILD)
endif()

# Include directories yang umum
# target_include_directories(verifikasi_magang PRIVATE
#     ${CMAKE_CURRENT_SOURCE_DIR}
# )

# Jika ada file header tambahan
# target_include_directories(verifikasi_magang PRIVATE
#     ${CMAKE_CURRENT_SOURCE_DIR}/include
# )