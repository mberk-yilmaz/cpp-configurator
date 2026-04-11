/*
 * Copyright 2026 mby
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const getCppProperties = (standard: string, compilerPath: string) => `{
    "version": 4,
    "configurations": [
        {
            "name": "General-C++",
            "compilerPath": "${compilerPath}",
            "compilerArgs": [
                "-x",
                "c++",
                "-std=${standard}"
            ],
            "intelliSenseMode": "linux-gcc-x64",
            "cStandard": "c17",
            "cppStandard": "${standard}",
            "includePath": [
                "\${workspaceFolder}/include",
                "\${workspaceFolder}/**"
            ],
            "browse": {
                "path": [
                    "\${workspaceFolder}/include",
                    "\${workspaceFolder}/src"
                ],
                "limitSymbolsToIncludedHeaders": true
            },
            "compileCommands": "\${workspaceFolder}/build/compile_commands.json"
        }
    ]
}`;

export const getSettingsJson = (standard: string, compilerPath: string) => `{
    "editor.tabSize": 4,
    "editor.rulers": [120],
    "editor.renderWhitespace": "trailing",
    "editor.suggestSelection": "first",
    "editor.cursorSmoothCaretAnimation": "on",
    "files.autoSave": "onFocusChange",
    "files.insertFinalNewline": true,
    "files.trimFinalNewlines": true,
    "files.trimTrailingWhitespace": true,
    "Workspace_Formatter.excludePattern": [
        "**/build",
        "**/.*",
        "**/.vscode"
    ],
    "Workspace_Formatter.includePattern": [
        "*.c", "*.h", "*.cc", "*.hh", "*.cpp", "*.hpp", "*.tpp"
    ],
    "errorLens.enabled": true,
    "errorLens.delay": 300,
    "errorLens.enabledDiagnosticLevels": ["error", "warning"],
    "C_Cpp.default.cppStandard": "${standard}",
    "C_Cpp.default.cStandard": "c17",
    "C_Cpp.formatting": "clangFormat",
    "[c]": {
        "editor.formatOnSave": false,
        "editor.defaultFormatter": "xaver.clang-format"
    },
    "[cpp]": {
        "editor.formatOnSave": false,
        "editor.defaultFormatter": "xaver.clang-format"
    },
    "cmake.configureOnOpen": false,
    "cmake.autoSelectActiveFolder": false,
    "cmake.configureOnEdit": false,
    "C_Cpp.codeAnalysis.clangTidy.enabled": true,
    "clangd.enabled": true,
    "clangd.detectExtensionConflicts": false,
    "clangd.arguments": [
        "--background-index",
        "--clang-tidy",
        "--header-insertion=iwyu",
        "--completion-style=detailed",
        "--function-arg-placeholders",
        "--fallback-style=llvm",
        "--header-insertion=never",
        "--query-driver=${compilerPath}",
        "--compile-commands-dir=\${workspaceFolder}/build",
        "-j=4"
    ],
    "clangd.fallbackFlags": [
        "-xc++",
        "-std=${standard}",
        "-I\${workspaceFolder}/include",
        "-I\${workspaceFolder}/src"
    ],
    "C_Cpp.configurationWarnings": "disabled",
    "C_Cpp.intelliSenseEngine": "default",
    "C_Cpp.errorSquiggles": "enabled",
    "C_Cpp.codeAnalysis.systemHeaders": false,
    "C_Cpp_Runner.cppStandard": "${standard}",
    "C_Cpp_Runner.cStandard": "c11",
    "C_Cpp_Runner.enableWarnings": true,
    "C_Cpp_Runner.warningsAsError": false,
    "C_Cpp_Runner.cCompilerPath": "gcc",
    "C_Cpp_Runner.cppCompilerPath": "g++",
    "C_Cpp_Runner.debuggerPath": "gdb",
    "editor.inlayHints.enabled": "on",
    "editor.inlayHints.fontFamily": "Fira Code",
    "editor.inlayHints.fontSize": 15,
    "editor.codeActionsOnSave": {
        "source.fixAll.clangd": "explicit"
    },
    "editor.inlayHints.padding": true
}`;

export const getTasksJson = () => `{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Build: CMake Generate",
            "type": "shell",
            "command": "cmake -B build -S .",
            "group": "build",
            "presentation": {
                "reveal": "always",
                "panel": "shared"
            },
            "problemMatcher": []
        },
        {
            "label": "Build: CMake Build",
            "type": "shell",
            "command": "cmake --build build -j4",
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "presentation": {
                "reveal": "always",
                "panel": "shared"
            },
            "problemMatcher": []
        },
        {
            "label": "Run Tests",
            "type": "shell",
            "command": "ctest",
            "args": [
                "-C",
                "Debug",
                "--output-on-failure"
            ],
            "options": {
                "cwd": "\${workspaceFolder}/build"
            },
            "group": {
                "kind": "test",
                "isDefault": true
            },
            "presentation": {
                "reveal": "always",
                "panel": "shared"
            },
            "dependsOn": [
                "Build: CMake Build"
            ],
            "problemMatcher": []
        },
        {
            "label": "Run: clang-format",
            "type": "shell",
            "command": "python3 tools/run-clang-format.py",
            "group": "test",
            "presentation": {
                "reveal": "always",
                "panel": "shared"
            },
            "problemMatcher": []
        },
        {
            "label": "Run: clang-tidy",
            "type": "shell",
            "command": "python3 tools/run-clang-tidy.py",
            "group": "test",
            "presentation": {
                "reveal": "always",
                "panel": "shared"
            },
            "problemMatcher": []
        }
    ]
}`;

export const getLaunchJson = (projectName: string) => `{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "(gdb) Launch",
            "type": "cppdbg",
            "request": "launch",
            "program": "\${workspaceFolder}/build/${projectName}",
            "args": [],
            "stopAtEntry": false,
            "cwd": "\${workspaceFolder}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ]
        }
    ]
}`;

export const getCMakeLists = (projectName: string, standardRaw: string, packageManager: string, testFramework: string) => {
    const rawNum = standardRaw.replace('c++', '');
    let cmake = `cmake_minimum_required(VERSION 3.14)

project(${projectName} VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD ${rawNum})
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Modular Configs
include(cmake/Warnings.cmake)
include(cmake/Sanitizers.cmake)

include_directories(include)

file(GLOB_RECURSE SRC_FILES src/*.cpp)

add_executable(${projectName} main.cpp \${SRC_FILES})
`;

    if (testFramework !== 'None') {
        cmake += `\ninclude(cmake/FetchTests.cmake)\n`;
    }

    return cmake;
};

export const getGitIgnore = () => `# Prerequisites
*.d

# Compiled Object files
*.slo
*.lo
*.o
*.obj

# Precompiled Headers
*.gch
*.pch

# Compiled Dynamic libraries
*.so
*.dylib
*.dll

# Compiled Static libraries
*.lai
*.la
*.a
*.lib

# Executables
*.exe
*.out
*.app

# Build folder
build/
.cache/
compile_commands.json

# VS Code specific (optional, usually repo commits these or ignores them)
# .vscode/

# MacOS
.DS_Store
`;

export const getGitAttributes = () => `# Set the default behavior for all files.
* text=auto eol=lf

# Normalized and converts to native line endings on checkout.
*.c text
*.cc text
*.cxx
*.cpp text
*.h text
*.hxx text
*.hpp text
`;

export const getEditorConfig = () => `# EditorConfig is awesome: http://EditorConfig.org

root = true

[*]
indent_style = space
indent_size = 4
trim_trailing_whitespace = true
insert_final_newline = true
end_of_line = lf

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
trim_trailing_whitespace = false
`;

export const getClangFormat = () => `BasedOnStyle: LLVM
IndentWidth: 4
TabWidth: 4
UseTab: Never
ColumnLimit: 120
SortIncludes: true
AlignConsecutiveAssignments: true
AlignConsecutiveDeclarations: true
PointerAlignment: Right
SpacesBeforeTrailingComments: 1
SpaceBeforeParens: ControlStatements
`;

export const getClangTidy = () => `Checks: 'modernize-*,readability-*,bugprone-*,performance-*,cppcoreguidelines-*'
WarningsAsErrors: ''
HeaderFilterRegex: '.*'
FormatStyle: none
`;

export const getClangd = (standard: string) => `CompileFlags:
  CompilationDatabase: build
  Remove:
    - -std=*
  Add:
    - -std=${standard}
    - -Wall
    - -Wextra
    - -Iinclude
    - -Isrc

Diagnostics:
  ClangTidy:
    Add: [modernize-*, readability-*, bugprone-*, performance-*, cppcoreguidelines-*]
  SystemHeaders: false
`;

export const getRunClangFormatPy = () => `#!/usr/bin/env python3
import os
import subprocess
import glob

def main():
    workspace = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(workspace)
    
    extensions = ('*.cpp', '*.hpp', '*.c', '*.h', '*.cc', '*.hh')
    files = []
    
    # We will search in src and include directories
    for search_dir in ['src', 'include']:
        if os.path.exists(search_dir):
            for ext in extensions:
                files.extend(glob.glob(f'{search_dir}/**/{ext}', recursive=True))
    
    files.extend(glob.glob('main.cpp'))
    
    if not files:
        print("No source files found to format.")
        return

    print(f"Formatting {len(files)} files...")
    
    # Run clang-format
    try:
        subprocess.run(['clang-format', '-i', '-style=file'] + files, check=True)
        print("Formatting complete.")
    except Exception as e:
        print(f"Error running clang-format: {e}")

if __name__ == '__main__':
    main()
`;

export const getRunClangTidyPy = () => `#!/usr/bin/env python3
import os
import subprocess
import glob

def main():
    workspace = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(workspace)
    
    extensions = ('*.cpp', '*.cc', '*.c')
    files = []
    
    for search_dir in ['src']:
        if os.path.exists(search_dir):
            for ext in extensions:
                files.extend(glob.glob(f'{search_dir}/**/{ext}', recursive=True))
    
    files.extend(glob.glob('main.cpp'))
    
    if not files:
        print("No source files found to tidy.")
        return

    print(f"Linting {len(files)} files with clang-tidy...")
    
    # Check if compile_commands.json exists
    if not os.path.exists('build/compile_commands.json'):
        print("compile_commands.json not found! Please run 'cmake -B build' first.")
        # Alternatively, run fallback if not using compile_commands
        # But for accurate C++ analysis it's needed.
    
    try:
        subprocess.run(['clang-tidy', '-p', 'build'] + files, check=True)
        print("Clang-tidy complete.")
    except Exception as e:
        print(f"Error running clang-tidy: {e}")

if __name__ == '__main__':
    main()
`;

// ================= NEW TEMPLATES =================

export const getVcpkgJson = (projectName: string) => `{
  "name": "${projectName.toLowerCase()}",
  "version": "0.1.0",
  "dependencies": [
    "fmt"
  ]
}
`;

export const getConanFile = () => `[requires]
fmt/10.1.1

[generators]
CMakeDeps
CMakeToolchain
`;

export const getGithubActions = (projectName: string) => `name: C/C++ CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        build_type: [Release]

    steps:
    - uses: actions/checkout@v3

    - name: Configure CMake
      run: cmake -B \${{github.workspace}}/build -DCMAKE_BUILD_TYPE=\${{matrix.build_type}}

    - name: Build
      run: cmake --build \${{github.workspace}}/build --config \${{matrix.build_type}} -j4
      
    - name: Test
      working-directory: \${{github.workspace}}/build
      run: ctest -C \${{matrix.build_type}} --output-on-failure
`;

export const getDoxyfile = (projectName: string) => `PROJECT_NAME           = "${projectName}"
PROJECT_BRIEF          = "A Modern C++ Project generated by VS Code Extension"
OUTPUT_DIRECTORY       = docs
INPUT                  = src include main.cpp
RECURSIVE              = YES
GENERATE_HTML          = YES
GENERATE_LATEX         = NO
EXTRACT_ALL           = YES
EXTRACT_PRIVATE       = YES
`;

export const getGTestMain = () => `#include <gtest/gtest.h>

TEST(ExampleTest, BasicAssertion) {
    EXPECT_EQ(1 + 1, 2);
}
`;

export const getCatch2Main = () => `#include <catch2/catch_test_macros.hpp>

TEST_CASE("Example Test", "[basic]") {
    REQUIRE(1 + 1 == 2);
}
`;

export const getWarningsCmake = () => `option(WARNINGS_AS_ERRORS "Treat warnings as errors" OFF)

set(MSVC_WARNINGS
    /W4 # Baseline reasonable warnings
    /w14242 /w14254 /w14263 /w14265 /w14287 /w14296 /w14311 /w14545
    /w14546 /w14547 /w14549 /w14555 /w14619 /w14640 /w14826 /w14905
    /w14906 /w14928
)

set(CLANG_WARNINGS
    -Wall
    -Wextra
    -Wshadow
    -Wnon-virtual-dtor
    -Wold-style-cast
    -Wcast-align
    -Wunused
    -Woverloaded-virtual
    -Wpedantic
    -Wconversion
    -Wsign-conversion
    -Wnull-dereference
    -Wdouble-promotion
    -Wformat=2
)

set(GCC_WARNINGS
    \${CLANG_WARNINGS}
    -Wmisleading-indentation
    -Wduplicated-cond
    -Wduplicated-branches
    -Wlogical-op
    -Wuseless-cast
)

if(MSVC)
    set(PROJECT_WARNINGS \${MSVC_WARNINGS})
elseif(CMAKE_CXX_COMPILER_ID MATCHES ".*Clang")
    set(PROJECT_WARNINGS \${CLANG_WARNINGS})
elseif(CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
    set(PROJECT_WARNINGS \${GCC_WARNINGS})
else()
    message(AUTHOR_WARNING "No compiler warnings set for '\${CMAKE_CXX_COMPILER_ID}' compiler.")
endif()

if(WARNINGS_AS_ERRORS)
    if(MSVC)
        list(APPEND PROJECT_WARNINGS /WX)
    else()
        list(APPEND PROJECT_WARNINGS -Werror)
    endif()
endif()

add_compile_options(\${PROJECT_WARNINGS})
`;

export const getSanitizersCmake = () => `option(ENABLE_ASAN "Enable Address Sanitizer" OFF)
option(ENABLE_TSAN "Enable Thread Sanitizer" OFF)
option(ENABLE_UBSAN "Enable Undefined Behavior Sanitizer" OFF)

if(ENABLE_ASAN OR ENABLE_TSAN OR ENABLE_UBSAN)
    if(MSVC)
        if(ENABLE_ASAN)
            add_compile_options(/fsanitize=address)
        endif()
    else()
        set(SANITIZERS "")
        if(ENABLE_ASAN)
            list(APPEND SANITIZERS "address")
        endif()
        if(ENABLE_TSAN)
            list(APPEND SANITIZERS "thread")
        endif()
        if(ENABLE_UBSAN)
            list(APPEND SANITIZERS "undefined")
        endif()

        list(JOIN SANITIZERS "," LIST_OF_SANITIZERS)
        add_compile_options("-fsanitize=\${LIST_OF_SANITIZERS}" -fno-omit-frame-pointer)
        add_link_options("-fsanitize=\${LIST_OF_SANITIZERS}")
    endif()
endif()

# Auto-enable sanitizers on Debug if CMakePresets passes it implicitly
if(CMAKE_BUILD_TYPE STREQUAL "Debug" AND NOT MSVC)
    # add_compile_options(-fsanitize=address -fsanitize=undefined -fno-omit-frame-pointer)
    # add_link_options(-fsanitize=address -fsanitize=undefined)
endif()
`;

export const getFetchTestsCmake = (testFramework: string, projectName: string) => {
    let cmake = `if(POLICY CMP0135)
    cmake_policy(SET CMP0135 NEW)
endif()

`;
    if (testFramework === 'GTest') {
        cmake += `# Google Test Framework
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

enable_testing()
add_executable(${projectName}_tests tests/main_test.cpp \${SRC_FILES})
target_link_libraries(${projectName}_tests gtest_main)

include(GoogleTest)
gtest_discover_tests(${projectName}_tests)
`;
    } else if (testFramework === 'Catch2') {
        cmake += `# Catch2 Framework
include(FetchContent)
FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG        v3.4.0
)
FetchContent_MakeAvailable(Catch2)

enable_testing()
list(APPEND CMAKE_MODULE_PATH \${catch2_SOURCE_DIR}/extras)
include(CTest)
include(Catch)

add_executable(${projectName}_tests tests/main_test.cpp \${SRC_FILES})
target_link_libraries(${projectName}_tests PRIVATE Catch2::Catch2WithMain)
catch_discover_tests(${projectName}_tests)
`;
    }
    return cmake;
};

export const getCMakePresetsJson = (cxxCmd: string, cCmd: string) => `{
  "version": 3,
  "cmakeMinimumRequired": {
    "major": 3,
    "minor": 14,
    "patch": 0
  },
  "configurePresets": [
    {
      "name": "base",
      "hidden": true,
      "generator": "Ninja",
      "binaryDir": "\${sourceDir}/build"${cxxCmd ? `,\n      "cacheVariables": {\n        "CMAKE_CXX_COMPILER": "${cxxCmd}",\n        "CMAKE_C_COMPILER": "${cCmd}"\n      }` : ""}
    },
    {
       "name": "linux-release",
       "displayName": "Linux Release",
       "inherits": "base",
       "cacheVariables": {
         "CMAKE_BUILD_TYPE": "Release"
       }
    },
    {
       "name": "linux-debug",
       "displayName": "Linux Debug",
       "inherits": "base",
       "cacheVariables": {
         "CMAKE_BUILD_TYPE": "Debug"
       }
    },
    {
       "name": "linux-asan",
       "displayName": "Linux Debug + Address Sanitizer",
       "inherits": "base",
       "cacheVariables": {
         "CMAKE_BUILD_TYPE": "Debug",
         "ENABLE_ASAN": "ON",
         "ENABLE_UBSAN": "ON"
       }
    },
    {
       "name": "linux-tsan",
       "displayName": "Linux Debug + Thread Sanitizer",
       "inherits": "base",
       "cacheVariables": {
         "CMAKE_BUILD_TYPE": "Debug",
         "ENABLE_TSAN": "ON"
       }
    }
  ]
}
`;
