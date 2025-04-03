#!/bin/bash

# start.sh - Universal starter script for Scramblelist application
# Works for both local development and deployments

echo "=== Scramblelist Application Starter ==="

# Set port for Replit compatibility
export PORT=5000

# Check if we're in deployment or development mode
if [ "$REPL_SLUG" != "" ] && [ "$REPL_OWNER" != "" ]; then
  echo "Running in Replit environment: $REPL_SLUG by $REPL_OWNER"
  DEPLOYMENT_MODE=true
else
  echo "Running in local/development environment"
  DEPLOYMENT_MODE=false
fi

# Verify key files exist
if [ ! -f "app.js" ]; then
  echo "ERROR: app.js not found!"
  exit 1
fi

if [ ! -d "public" ]; then
  echo "ERROR: public directory not found!"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/express" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Database configuration check
if [ -z "$DATABASE_URL" ] && [ -z "$PGHOST" ]; then
  echo "WARNING: No database configuration found. Running with in-memory storage."
  echo "Data will not be persisted between restarts."
else
  echo "Database configuration detected."
fi

# Start the application
echo "Starting Scramblelist application..."
if [ "$DEPLOYMENT_MODE" = true ]; then
  # Use deploy.js for deployment environments
  if [ -f "deploy.js" ]; then
    echo "Using deployment script..."
    exec node deploy.js
  else
    echo "Deployment script not found, using standard startup..."
    exec node app.js
  fi
else
  # Standard startup for development
  exec node app.js
fi