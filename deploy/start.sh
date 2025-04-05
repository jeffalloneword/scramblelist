#!/bin/bash
echo "Starting Scramblelist app..."
cd "$(dirname "$0")"
npm install
node app.js
