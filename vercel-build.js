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

// Verify the build output
console.log('Verifying build output...');
const distRoot = path.join(__dirname, 'dist');

if (fs.existsSync(path.join(distRoot, 'main.js'))) {
  console.log('✓ Found main.js in dist/');
} else if (fs.existsSync(path.join(distRoot, 'src', 'main.js'))) {
  console.log('✓ Found main.js in dist/src/');
} else {
  console.error('❌ Could not find main.js in dist/ or dist/src/');
  console.error('dist/ contents:', fs.readdirSync(distRoot));
  process.exit(1);
}

console.log('✓ Build complete!');
console.log('✓ Compiled files are in dist/ and will be used directly by api/index.js');
