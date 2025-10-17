#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running Vercel build script...');

// Run the normal build
console.log('Building NestJS application...');
execSync('pnpm run vercel-build', { stdio: 'inherit' });

// Copy dist folder to api directory
console.log('Copying dist folder to api directory...');
const distPath = path.join(__dirname, 'dist');
const apiDistPath = path.join(__dirname, 'api', 'dist');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory ${src} does not exist`);
    return;
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
console.log('Build complete!');
