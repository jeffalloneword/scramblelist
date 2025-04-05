const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to create directories
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Function to copy files
function copyFile(source, target) {
  try {
    fs.copyFileSync(source, target);
    console.log(`Copied: ${source} -> ${target}`);
  } catch (error) {
    console.error(`Error copying ${source} to ${target}: ${error.message}`);
    throw error;
  }
}

// Function to deploy the app
function deployApp() {
  console.log('Starting deployment process...');
  
  try {
    // Create necessary directories
    const deployDir = path.join(__dirname, 'deploy');
    const publicDeployDir = path.join(deployDir, 'public');
    
    ensureDirExists(deployDir);
    ensureDirExists(publicDeployDir);
    
    // Copy server files
    copyFile(
      path.join(__dirname, 'app.js'),
      path.join(deployDir, 'app.js')
    );
    
    copyFile(
      path.join(__dirname, 'package.json'),
      path.join(deployDir, 'package.json')
    );
    
    // Copy all public files
    const publicFiles = fs.readdirSync(path.join(__dirname, 'public'));
    for (const file of publicFiles) {
      copyFile(
        path.join(__dirname, 'public', file),
        path.join(publicDeployDir, file)
      );
    }
    
    // Create a deployment README
    const readmeContent = `# Scramblelist Deployment

## About
This is a deployed version of the Scramblelist gift exchange organizer app.

## Running the app
1. Navigate to this directory
2. Run \`npm install\` to install dependencies
3. Run \`node app.js\` to start the server
4. Access the app at http://localhost:5000

## Features
- Add gift exchange participants
- Generate random gift exchange assignments
- View assignments on a clean results page
- Persistent storage using browser localStorage
`;
    
    fs.writeFileSync(path.join(deployDir, 'README.md'), readmeContent);
    console.log('Created deployment README');
    
    // Create a simple start script
    const startScript = `#!/bin/bash
echo "Starting Scramblelist app..."
cd "$(dirname "$0")"
npm install
node app.js
`;
    
    fs.writeFileSync(path.join(deployDir, 'start.sh'), startScript);
    fs.chmodSync(path.join(deployDir, 'start.sh'), '755');
    console.log('Created start script');
    
    console.log('Deployment completed successfully!');
    console.log(`Deployed to: ${deployDir}`);
    console.log('To run the deployed app:');
    console.log('1. Navigate to the deploy directory');
    console.log('2. Run ./start.sh');
    
  } catch (error) {
    console.error(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute deployment
deployApp();