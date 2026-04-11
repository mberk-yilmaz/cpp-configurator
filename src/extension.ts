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

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import { 
    getCppProperties, 
    getSettingsJson, 
    getTasksJson, 
    getLaunchJson, 
    getCMakeLists,
    getGitIgnore,
    getGitAttributes,
    getEditorConfig,
    getClangFormat,
    getClangTidy,
    getClangd,
    getRunClangFormatPy,
    getRunClangTidyPy,
    getVcpkgJson,
    getConanFile,
    getGithubActions,
    getDoxyfile,
    getGTestMain,
    getCatch2Main,
    getWarningsCmake,
    getSanitizersCmake,
    getFetchTestsCmake,
    getCMakePresetsJson
} from './templates';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('cpp-configurator.initialize', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage("Please open a workspace or folder first.");
            return;
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;

        // Ask for Project Name
        const projectName = await vscode.window.showInputBox({
            prompt: "Enter your C++ project name:",
            placeHolder: "MyCppProject",
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value || value.trim() === '') {
                    return "Project name cannot be empty.";
                }
                if (value.toLowerCase() === 'test') {
                    return "The name 'test' is reserved by CMake (CTest). Please choose another name.";
                }
                return null;
            }
        });

        if (!projectName) {
            return; // Cancelled
        }

        // Ask for Standard
        const cppStandards = ['c++11', 'c++14', 'c++17', 'c++20', 'c++23', 'c++26'];
        const cppStandard = await vscode.window.showQuickPick(cppStandards, {
            title: "Select C++ Standard",
            placeHolder: "c++23",
            canPickMany: false,
            ignoreFocusOut: true
        });

        if (!cppStandard) {
            return;
        }

        // Ask for Tools Generation
        const generateToolsChoice = await vscode.window.showQuickPick(['Yes', 'No'], {
            title: "Generate formatters and linters (clang-format, clang-tidy, etc.)?",
            placeHolder: "Yes",
            canPickMany: false,
            ignoreFocusOut: true
        });

        if (!generateToolsChoice) {
            return;
        }

        const generateTools = generateToolsChoice === 'Yes';

        // Detect Compilers
        const findCompilers = () => {
            const compilers: { label: string, path: string, cmd: string, cCmd: string, description: string }[] = [];
            try {
                const gccVer = cp.execSync('g++ --version', { stdio: 'pipe' }).toString().split('\\n')[0];
                const gccPath = cp.execSync('which g++', { stdio: 'pipe' }).toString().trim();
                compilers.push({ label: 'GCC (g++)', path: gccPath, cmd: 'g++', cCmd: 'gcc', description: gccVer });
            } catch (e) {}

            try {
                const clangVer = cp.execSync('clang++ --version', { stdio: 'pipe' }).toString().split('\\n')[0];
                const clangPath = cp.execSync('which clang++', { stdio: 'pipe' }).toString().trim();
                compilers.push({ label: 'Clang (clang++)', path: clangPath, cmd: 'clang++', cCmd: 'clang', description: clangVer });
            } catch (e) {}

            if (process.platform === 'win32') {
                try {
                    const msvcVer = cp.execSync('cl', { stdio: 'pipe' }).toString().split('\\n')[0];
                    compilers.push({ label: 'MSVC (cl.exe)', path: 'cl.exe', cmd: 'cl', cCmd: 'cl', description: msvcVer });
                } catch(e) {}
            }
            return compilers;
        };

        const activeCompilers = findCompilers();
        let selectedCompiler = { label: 'System Default', path: '/usr/bin/c++', cmd: '', cCmd: '' };

        if (activeCompilers.length > 0) {
            const compilerOptions = [
                ...activeCompilers.map(c => ({ label: c.label, description: c.description, data: c })),
                { label: 'System Default', description: "Let CMake decide (fallback)", data: selectedCompiler }
            ];

            const compilerChoice = await vscode.window.showQuickPick(compilerOptions, {
                title: "Select preferred C++ Compiler for the project:",
                placeHolder: "System Default",
                ignoreFocusOut: true
            });

            if (!compilerChoice) return;
            selectedCompiler = compilerChoice.data;
        } else {
            vscode.window.showWarningMessage("No compilers (GCC/Clang/MSVC) found! Falling back to system default.");
        }

        // Ask for Package Manager
        const pkgManagerChoice = await vscode.window.showQuickPick(['None', 'vcpkg', 'Conan'], {
            title: "Do you want to use a Package Manager?",
            placeHolder: "None",
            canPickMany: false,
            ignoreFocusOut: true
        });

        if (!pkgManagerChoice) return;

        // Ask for Unit Testing
        const testChoice = await vscode.window.showQuickPick(['None', 'GTest', 'Catch2'], {
            title: "Do you want to include a Unit Testing framework?",
            placeHolder: "None",
            canPickMany: false,
            ignoreFocusOut: true
        });

        if (!testChoice) return;

        // Ask for CI/CD
        const ciChoice = await vscode.window.showQuickPick(['Yes', 'No'], {
            title: "Generate GitHub Actions workflow for CI/CD?",
            placeHolder: "No",
            canPickMany: false,
            ignoreFocusOut: true
        });

        if (!ciChoice) return;
        const generateCI = ciChoice === 'Yes';

        // Ask for Doxygen
        const docChoice = await vscode.window.showQuickPick(['Yes', 'No'], {
            title: "Generate Doxyfile for Documentation?",
            placeHolder: "No",
            canPickMany: false,
            ignoreFocusOut: true
        });

        if (!docChoice) return;
        const generateDoc = docChoice === 'Yes';

        // Ask for Keymap
        const keymapOptions = [
            { label: "None (VS Code Default)", id: "" },
            { label: "CLion / IntelliJ IDEA", id: "k--kato.intellij-idea-keybindings" },
            { label: "Notepad++", id: "Zinggi.npp-keybindings" },
            { label: "Visual Studio", id: "ms-vscode.vs-keybindings" },
            { label: "Vim", id: "vscodevim.vim" }
        ];

        const keymapChoice = await vscode.window.showQuickPick(keymapOptions.map(k => k.label), {
            title: "Do you want to install a familiar Keymap (Shortcuts)?",
            placeHolder: "None (VS Code Default)",
            canPickMany: false,
            ignoreFocusOut: true
        });

        if (!keymapChoice) {
            return; // Cancelled
        }

        const selectedKeymap = keymapOptions.find(k => k.label === keymapChoice)?.id;

        // File generation
        try {
            const vscodeDir = path.join(workspacePath, '.vscode');
            const srcDir = path.join(workspacePath, 'src');
            const includeDir = path.join(workspacePath, 'include');
            const toolsDir = path.join(workspacePath, 'tools');

            [vscodeDir, srcDir, includeDir].forEach(dir => {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
            });

            // Write standard files
            fs.writeFileSync(path.join(vscodeDir, 'c_cpp_properties.json'), getCppProperties(cppStandard, selectedCompiler.path));
            fs.writeFileSync(path.join(vscodeDir, 'settings.json'), getSettingsJson(cppStandard, selectedCompiler.path));
            fs.writeFileSync(path.join(vscodeDir, 'tasks.json'), getTasksJson());
            fs.writeFileSync(path.join(vscodeDir, 'launch.json'), getLaunchJson(projectName));
            
            fs.writeFileSync(path.join(workspacePath, 'CMakeLists.txt'), getCMakeLists(projectName, cppStandard, pkgManagerChoice, testChoice));
            fs.writeFileSync(path.join(workspacePath, '.gitignore'), getGitIgnore());
            fs.writeFileSync(path.join(workspacePath, '.gitattributes'), getGitAttributes());
            fs.writeFileSync(path.join(workspacePath, '.editorconfig'), getEditorConfig());

            // Write main.cpp
            const mainPath = path.join(workspacePath, 'main.cpp');
            if (!fs.existsSync(mainPath)) {
                fs.writeFileSync(mainPath, `#include <iostream>

int main() {
    std::cout << "Hello, " << "${projectName}!" << "\\n";
    return 0;
}
`);
            }

            // Write Package Manager Files
            if (pkgManagerChoice === 'vcpkg') {
                fs.writeFileSync(path.join(workspacePath, 'vcpkg.json'), getVcpkgJson(projectName));
            } else if (pkgManagerChoice === 'Conan') {
                fs.writeFileSync(path.join(workspacePath, 'conanfile.txt'), getConanFile());
            }

            // Write CMake Modular Files
            const cmakeDir = path.join(workspacePath, 'cmake');
            if (!fs.existsSync(cmakeDir)) {
                fs.mkdirSync(cmakeDir, { recursive: true });
            }
            fs.writeFileSync(path.join(cmakeDir, 'Warnings.cmake'), getWarningsCmake());
            fs.writeFileSync(path.join(cmakeDir, 'Sanitizers.cmake'), getSanitizersCmake());

            // Write Testing Framework Files & Module
            if (testChoice !== 'None') {
                fs.writeFileSync(path.join(cmakeDir, 'FetchTests.cmake'), getFetchTestsCmake(testChoice, projectName));

                const testsDir = path.join(workspacePath, 'tests');
                if (!fs.existsSync(testsDir)) {
                    fs.mkdirSync(testsDir, { recursive: true });
                }
                const testMainPath = path.join(testsDir, 'main_test.cpp');
                if (!fs.existsSync(testMainPath)) {
                    if (testChoice === 'GTest') {
                        fs.writeFileSync(testMainPath, getGTestMain());
                    } else if (testChoice === 'Catch2') {
                        fs.writeFileSync(testMainPath, getCatch2Main());
                    }
                }
            }

            // Write CMakePresets.json
            fs.writeFileSync(path.join(workspacePath, 'CMakePresets.json'), getCMakePresetsJson(selectedCompiler.cmd, selectedCompiler.cCmd));

            // Write CI/CD File
            if (generateCI) {
                const workflowsDir = path.join(workspacePath, '.github', 'workflows');
                if (!fs.existsSync(workflowsDir)) {
                    fs.mkdirSync(workflowsDir, { recursive: true });
                }
                fs.writeFileSync(path.join(workflowsDir, 'build.yml'), getGithubActions(projectName));
            }

            // Write Doxygen File
            if (generateDoc) {
                const docsDir = path.join(workspacePath, 'docs');
                if (!fs.existsSync(docsDir)) {
                    fs.mkdirSync(docsDir, { recursive: true });
                }
                fs.writeFileSync(path.join(workspacePath, 'Doxyfile'), getDoxyfile(projectName));
            }

            if (generateTools) {
                if (!fs.existsSync(toolsDir)) {
                    fs.mkdirSync(toolsDir, { recursive: true });
                }
                fs.writeFileSync(path.join(workspacePath, '.clang-format'), getClangFormat());
                fs.writeFileSync(path.join(workspacePath, '.clang-tidy'), getClangTidy());
                fs.writeFileSync(path.join(workspacePath, '.clangd'), getClangd(cppStandard));
                
                const pyFormatPath = path.join(toolsDir, 'run-clang-format.py');
                const pyTidyPath = path.join(toolsDir, 'run-clang-tidy.py');
                fs.writeFileSync(pyFormatPath, getRunClangFormatPy());
                fs.writeFileSync(pyTidyPath, getRunClangTidyPy());

                // Make scripts executable
                fs.chmodSync(pyFormatPath, 0o755);
                fs.chmodSync(pyTidyPath, 0o755);
            }

            vscode.window.showInformationMessage("C++ Workspace successfully initialized!");

            // Install keymap if selected
            if (selectedKeymap) {
                const extensionInstalled = vscode.extensions.getExtension(selectedKeymap);
                if (!extensionInstalled) {
                    vscode.window.showInformationMessage(`Installing ${keymapChoice} keymap in the background...`);
                    vscode.commands.executeCommand('workbench.extensions.installExtension', selectedKeymap).then(() => {
                        vscode.window.showInformationMessage(`${keymapChoice} keymap extension successfully installed.`);
                    }, (err: any) => {
                        vscode.window.showErrorMessage(`Failed to install keymap extension: ${err.message}`);
                    });
                } else {
                    vscode.window.showInformationMessage(`${keymapChoice} keymap is already installed!`);
                }
            }

        } catch (err: any) {
            vscode.window.showErrorMessage("Failed to initialize workspace: " + err.message);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
