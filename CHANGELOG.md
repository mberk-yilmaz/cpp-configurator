# Change Log

All notable changes to the "C++ Configurator" extension will be documented in this file.

## [1.1.0] - 2026-04-19

### Added
- **Premium Debugging Support:** Added comprehensive `launch.json` auto-generation. It now embeds multiple debugger configurations natively out of the box.
- **CodeLLDB Integration:** The extension suggests installing the highly advanced `vadimcn.vscode-lldb` instead of just fallback Microsoft GDB, providing significantly better performance for resolving C++ variables. Automatically writes integrated `(lldb)` launch profiles.
- **Dedicated Test Debugging:** When a testing library (GTest or Catch2) is chosen during configuration, the extension now inserts independent "Launch Tests" scenarios linked to `${projectName}_tests`. Press F5 and select the appropriate dropdown parameter to fully debug tests.
- **Dedicated Options modules**: Generated CMake structure now includes `Options.cmake`. This now features expert configurations:
  - **Auto Fallback Build Type:** Sets fallback default to `Debug` to prevent unoptimized bare builds.
  - **CCache Support:** Auto-detects CCache for lightning-fast compilation caching.
  - **LTO/IPO Config:** Contains an option to natively enable Link-Time Optimization (LTO) for high-performance release builds.
- **Dedicated Compiler Options module**: Introduced `CompilerOptions.cmake` to specifically handle default CMake compilation arguments (`-O3`, `/O2`, `-g`, `/Zi`, etc.) independently for MSVC, GCC, and Clang in both Debug and Release configurations.
- **Output Directories definitions**: Global output directory defaults (`CMAKE_RUNTIME_OUTPUT_DIRECTORY`, `CMAKE_LIBRARY_OUTPUT_DIRECTORY`, `CMAKE_ARCHIVE_OUTPUT_DIRECTORY`) are now clearly defined at the top of the root `CMakeLists.txt` for easier bin and lib management.

### Changed
- **CMake inclusion system optimized**: Instead of absolute path imports, `CMAKE_MODULE_PATH` is appended with the `cmake` directory. Modules are now loaded cleanly via `include(Options)`, `include(Warnings)`, etc.
- **`main.cpp` location**: The generation of `main.cpp` has been moved from the project root to the `src` directory for better structural consistency in real-world C++ environments.
- **`src/CMakeLists.txt` generation**: Code building definitions have been localized. The main `CMakeLists.txt` relies on `add_subdirectory(src)`, while the newly generated `src/CMakeLists.txt` is strictly responsible for pulling `.cpp` sources and defining the executables.
