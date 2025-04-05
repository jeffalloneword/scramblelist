// Deployment script for Replit
// This standalone script is designed to work with Replit deployments

console.log('=== Scramblelist Deployment Script ===');

// Import required modules
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check environment
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV || 'development');

// Make sure required files exist
const requiredFiles = ['app.js', 'public/index.html', 'public/styles.css'];
let allFilesExist = true;

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    console.error(`ERROR: Required file '${file}' not found!`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('Missing required files. Deployment cannot proceed.');
  process.exit(1);
}

// Install dependencies if needed
if (!fs.existsSync(path.join(process.cwd(), 'node_modules/express'))) {
  console.log('Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Check database configuration
if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  console.warn('WARNING: No database configuration found. Using in-memory storage.');
  console.warn('Data will not be persisted between restarts.');
} else {
  console.log('Database configuration detected.');
}

// Start the application
console.log('Starting server...');
try {
  // We use require() here to start the app in the same process
  require('./app.js');
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}