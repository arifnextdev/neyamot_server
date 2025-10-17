#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running Vercel build script...');

// Step 1: Generate Prisma Client
console.log('Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Prisma generation failed:', error.message);
  process.exit(1);
}

// Step 2: Build NestJS application
console.log('Building NestJS application...');
try {
  execSync('nest build', { stdio: 'inherit' });
} catch (error) {
  console.error('NestJS build failed:', error.message);
  process.exit(1);
}

// Step 3: Bundle with ncc (includes all dependencies)
console.log('Bundling application with dependencies using @vercel/ncc...');
const distRoot = path.join(__dirname, 'dist');
const apiDir = path.join(__dirname, 'api');

// Find the main.js file
let mainJsPath;
if (fs.existsSync(path.join(distRoot, 'main.js'))) {
  mainJsPath = path.join(distRoot, 'main.js');
  console.log('✓ Found main.js in dist/');
} else if (fs.existsSync(path.join(distRoot, 'src', 'main.js'))) {
  mainJsPath = path.join(distRoot, 'src', 'main.js');
  console.log('✓ Found main.js in dist/src/');
} else {
  console.error('❌ Could not find main.js');
  process.exit(1);
}

// Step 4: Copy the compiled dist to api/dist (simpler than bundling)
console.log('Copying compiled application to api/dist...');
const apiDistPath = path.join(apiDir, 'dist');

// Remove old dist if exists
if (fs.existsSync(apiDistPath)) {
  fs.rmSync(apiDistPath, { recursive: true, force: true });
}

// Copy entire dist folder
fs.cpSync(distRoot, apiDistPath, { recursive: true });
console.log('✓ Copied dist to api/dist');

// Step 5: Create symlink or copy node_modules
console.log('Setting up node_modules for api...');
const apiNodeModules = path.join(apiDir, 'node_modules');
const rootNodeModules = path.join(__dirname, 'node_modules');

// Remove existing if present
if (fs.existsSync(apiNodeModules)) {
  fs.rmSync(apiNodeModules, { recursive: true, force: true });
}

// Create a relative symlink to parent node_modules
try {
  const relativeNodeModules = path.join('..', 'node_modules');
  fs.symlinkSync(relativeNodeModules, apiNodeModules);
  console.log('✓ Created node_modules symlink');
} catch (err) {
  console.log('⚠ Symlink creation failed:', err.message);
  console.log('⚠ Will rely on parent node_modules resolution');
}

console.log('✓ Build complete!');
console.log('✓ Application is ready for deployment');
