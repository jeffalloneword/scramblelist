#!/bin/bash

# Scramblelist Application Startup Script for Replit Deployment
# A simple script to start the application without any external dependencies

echo "=== Starting Scramblelist Gift Exchange Organizer ==="

# Configure PostgreSQL fallback variables if needed
if [ -z "$DATABASE_URL" ] && [ -z "$PGHOST" ]; then
  echo "WARNING: No database configuration found. Running with in-memory storage."
  echo "Data will not be persisted between restarts."
  # The application will use in-memory storage automatically
else
  echo "Database configuration detected."
fi

# Make sure we're using the correct port for Replit
export PORT=5000

# Start the application with proper error handling
echo "Starting application server..."
exec node app.js