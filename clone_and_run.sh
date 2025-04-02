#!/bin/bash

# Scramblelist Application Runner for Deployments
# A standalone gift exchange organizer
# No external dependencies, databases, or source control required

echo "=== Scramblelist Deployment Runner ==="
echo "Starting Scramblelist Gift Exchange application for deployment"

# Ensure packages are installed - this is important for fresh deploys
if [ ! -d "node_modules" ] || [ ! -d "node_modules/express" ]; then
  echo "Installing required packages..."
  npm install
fi

# Make sure we're using the correct port for Replit
export PORT=5000

# Run the application with proper error handling
echo "Starting the server..."
exec node app.js
