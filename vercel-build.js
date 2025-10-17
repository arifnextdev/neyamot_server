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

// Bundle with ncc
try {
  execSync(`npx @vercel/ncc build ${mainJsPath} -o ${path.join(apiDir, 'dist')} --external @prisma/client`, { stdio: 'inherit' });
  console.log('✓ Bundled application to api/dist/');
} catch (error) {
  console.error('Bundling failed:', error.message);
  process.exit(1);
}

// Copy Prisma Client
console.log('Copying Prisma Client...');
const prismaClientSrc = path.join(__dirname, 'node_modules', '.prisma', 'client');
const prismaClientDest = path.join(apiDir, 'node_modules', '.prisma', 'client');
if (fs.existsSync(prismaClientSrc)) {
  fs.mkdirSync(path.dirname(prismaClientDest), { recursive: true });
  fs.cpSync(prismaClientSrc, prismaClientDest, { recursive: true });
  console.log('✓ Copied Prisma Client');
}

console.log('✓ Build complete!');
console.log('✓ Bundled application is ready in api/dist/');
