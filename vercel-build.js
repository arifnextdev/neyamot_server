#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running Vercel build script...');

// Run the normal build
console.log('Building NestJS application...');
try {
  execSync('npx prisma generate && nest build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

// Determine the correct source path for compiled files
console.log('Checking dist folder structure...');
const distRoot = path.join(__dirname, 'dist');
let distPath;

// Check if NestJS compiled to dist/src or directly to dist
if (fs.existsSync(path.join(distRoot, 'src', 'main.js'))) {
  console.log('Found main.js in dist/src/');
  distPath = path.join(distRoot, 'src');
} else if (fs.existsSync(path.join(distRoot, 'main.js'))) {
  console.log('Found main.js in dist/');
  distPath = distRoot;
} else {
  console.error('Could not find main.js in dist/ or dist/src/');
  console.error('dist/ contents:', fs.readdirSync(distRoot));
  process.exit(1);
}

console.log(`Copying from ${distPath} to api/dist...`);
const apiDistPath = path.join(__dirname, 'api', 'dist');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory ${src} does not exist`);
    process.exit(1);
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(distPath, apiDistPath);
console.log('✓ Build complete!');
console.log('✓ Copied dist to api/dist');
