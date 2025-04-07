const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// Find all files in c2pa package dist
const c2paDistPath = path.resolve(__dirname, 'node_modules/c2pa/dist');
console.log(`Copying files from ${c2paDistPath}`);

// Check if the path exists
if (!fs.existsSync(c2paDistPath)) {
  console.error(`Error: ${c2paDistPath} does not exist`);
  process.exit(1);
}

// Copy worker file
const workerFilePath = path.resolve(c2paDistPath, 'c2pa.worker.js');
if (fs.existsSync(workerFilePath)) {
  const workerDestPath = path.resolve(__dirname, 'dist/c2pa.worker.js');
  ensureDirectoryExistence(workerDestPath);
  fs.copyFileSync(workerFilePath, workerDestPath);
  console.log(`Copied worker file to ${workerDestPath}`);
} else {
  console.error(`Error: Worker file ${workerFilePath} does not exist`);
}

// Copy WASM files (look for them in different possible locations)
const possibleWasmPaths = [
  path.resolve(c2paDistPath, 'assets/wasm/c2pa_wasm_bg.wasm'),
  path.resolve(c2paDistPath, 'wasm/c2pa_wasm_bg.wasm'),
  path.resolve(__dirname, 'node_modules/@cai/toolkit/dist/wasm/c2pa_wasm_bg.wasm')
];

let wasmFound = false;
for (const wasmFilePath of possibleWasmPaths) {
  if (fs.existsSync(wasmFilePath)) {
    const wasmDestDir = path.resolve(__dirname, 'dist/assets/wasm');
    const wasmDestPath = path.resolve(wasmDestDir, 'c2pa_wasm_bg.wasm');
    ensureDirectoryExistence(wasmDestPath);
    fs.copyFileSync(wasmFilePath, wasmDestPath);
    console.log(`Copied WASM file from ${wasmFilePath} to ${wasmDestPath}`);
    wasmFound = true;
    break;
  }
}

if (!wasmFound) {
  console.error(`Error: Could not find WASM file in any of the expected locations`);
  console.error(`Searched in: ${possibleWasmPaths.join(', ')}`);
}

// Also copy any other assets that might be needed
try {
  const assetsDir = path.resolve(c2paDistPath, 'assets');
  if (fs.existsSync(assetsDir) && fs.statSync(assetsDir).isDirectory()) {
    const targetAssetsDir = path.resolve(__dirname, 'dist/assets');
    
    // Function to copy directory recursively
    function copyDir(src, dest) {
      ensureDirectoryExistence(dest + '/');
      
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
          console.log(`Copied ${srcPath} to ${destPath}`);
        }
      }
    }
    
    copyDir(assetsDir, targetAssetsDir);
    console.log(`Copied assets directory from ${assetsDir} to ${targetAssetsDir}`);
  }
} catch (error) {
  console.error(`Error copying assets directory: ${error.message}`);
} 