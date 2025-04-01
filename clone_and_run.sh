#!/bin/bash

# Script to run the Scramblelist application
# Author: AI Assistant
# Date: 2025

echo "=== Scramblelist Application Runner ==="
echo "This script will run the custom Scramblelist application."

# Check if the required packages are installed
echo "Checking for required packages..."
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if PostgreSQL environment variables are set
echo "Checking database connection..."
if [ -z "$DATABASE_URL" ]; then
    # If DATABASE_URL is not set, but we have individual components, construct it
    if [ ! -z "$PGHOST" ] && [ ! -z "$PGUSER" ] && [ ! -z "$PGPASSWORD" ] && [ ! -z "$PGDATABASE" ] && [ ! -z "$PGPORT" ]; then
        export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
        echo "DATABASE_URL constructed from individual PostgreSQL environment variables."
    else
        echo "WARNING: Database environment variables are not properly set."
        echo "Please make sure either DATABASE_URL or all PostgreSQL variables (PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT) are set."
        echo "Continuing with limited functionality..."
    fi
else
    echo "Database connection is configured via DATABASE_URL."
fi

# Run the application
echo "Starting the Scramblelist application..."
node app.js

echo ""
echo "=== Application Started ==="
echo "The Scramblelist application is now running."
echo "Access it at: http://0.0.0.0:5000"
echo "Press Ctrl+C to stop the server."
