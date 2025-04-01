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
    echo "DATABASE_URL is not set. Database functionality may not work properly."
else
    echo "Database connection is configured."
fi

# Run the application
echo "Starting the Scramblelist application..."
node app.js

echo ""
echo "=== Application Started ==="
echo "The Scramblelist application is now running."
echo "Access it at: http://0.0.0.0:5000"
echo "Press Ctrl+C to stop the server."
