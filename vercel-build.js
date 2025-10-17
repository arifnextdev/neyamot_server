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

// Copy dist folder to api directory
console.log('Copying dist folder to api directory...');
const distPath = path.join(__dirname, 'dist');
const apiDistPath = path.join(__dirname, 'api', 'dist');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory ${src} does not exist`);
    console.error(`Looking for: ${src}`);
    console.error(`Current directory: ${__dirname}`);
    console.error(`Directory contents:`, fs.readdirSync(__dirname));
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
