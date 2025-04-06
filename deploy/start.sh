#!/bin/bash
echo "Starting Listerical! app..."
cd "$(dirname "$0")"
npm install
node app.js
