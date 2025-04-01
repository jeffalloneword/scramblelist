#!/bin/bash

# Scramblelist Application Runner
# A standalone gift exchange organizer with PostgreSQL database
# No external dependencies required

echo "=== Scramblelist Application Runner ==="
echo "Starting the Scramblelist Gift Exchange Organizer..."

# Check if Node.js is installed
echo "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
echo "Checking for npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed. Please install npm and try again."
    exit 1
fi

# Check if the required packages are installed
echo "Checking for required npm packages..."
if [ ! -d "node_modules" ] || [ ! -d "node_modules/express" ] || [ ! -d "node_modules/pg" ]; then
    echo "Installing required npm packages..."
    npm install express pg cookie-parser
fi

# Configure PostgreSQL environment variables
echo "Setting up database connection..."
if [ -z "$DATABASE_URL" ]; then
    # If DATABASE_URL is not set, but we have individual components, construct it
    if [ ! -z "$PGHOST" ] && [ ! -z "$PGUSER" ] && [ ! -z "$PGPASSWORD" ] && [ ! -z "$PGDATABASE" ] && [ ! -z "$PGPORT" ]; then
        export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
        echo "DATABASE_URL constructed from individual PostgreSQL environment variables."
    else
        echo "WARNING: Database environment variables are not properly set."
        echo "The application will run but database features will not work properly."
        echo "Please make sure either DATABASE_URL or all PostgreSQL variables (PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT) are set."
    fi
else
    echo "Database connection is configured via DATABASE_URL."
fi

# Run the application
echo "Starting the application server..."
node app.js

echo ""
echo "=== Application Started ==="
echo "The Scramblelist application is now running."
echo "Access it at: http://0.0.0.0:5000"
echo "Default login password: two-pretzels!1"
echo "Press Ctrl+C to stop the server."
