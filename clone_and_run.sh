#!/bin/bash

# Scramblelist Application Runner for Deployments
# A standalone gift exchange organizer
# Enhanced for Replit Deployments

echo "=== Scramblelist Deployment Runner ==="
echo "Starting Scramblelist Gift Exchange application for deployment"

# Ensure we're in the right directory
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Make the start.sh script executable if it exists
if [ -f "start.sh" ]; then
  echo "Making start.sh executable..."
  chmod +x start.sh
  
  echo "Using universal starter script..."
  exec ./start.sh
else
  echo "start.sh not found, using fallback method..."
  
  # Ensure packages are installed
  if [ ! -d "node_modules" ] || [ ! -d "node_modules/express" ]; then
    echo "Installing required packages..."
    npm install
  fi
  
  # Set port for Replit compatibility
  export PORT=5000
  
  # Check if deploy.js exists
  if [ -f "deploy.js" ]; then
    echo "Using deployment script..."
    exec node deploy.js
  elif [ -f "app.js" ]; then
    echo "Using standard startup..."
    exec node app.js
  else
    echo "ERROR: Neither deploy.js nor app.js found!"
    exit 1
  fi
fi
