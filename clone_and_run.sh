#!/bin/bash

# Script to clone and run the Scramblelist repository
# Author: AI Assistant
# Date: 2025

echo "=== Scramblelist Repository Cloner and Runner ==="
echo "This script will clone the Scramblelist repository and help you run it."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git and try again."
    exit 1
fi

# Create a directory for the repository if it doesn't exist
REPO_DIR="scramblelist"
if [ -d "$REPO_DIR" ]; then
    echo "Directory '$REPO_DIR' already exists. Removing it and cloning again..."
    rm -rf "$REPO_DIR"
fi

# Clone the repository
echo "Cloning the Scramblelist repository..."
git clone https://github.com/jeffalloneword/scramblelist.git
if [ $? -ne 0 ]; then
    echo "Failed to clone the repository. Please check your internet connection and try again."
    exit 1
fi

# Navigate to the repository directory
cd "$REPO_DIR"
echo "Repository cloned successfully. Now in $(pwd)."

# Check for the gift-exchange-app directory
if [ -d "gift-exchange-app" ]; then
    echo "Found 'gift-exchange-app' directory. Setting up the Node.js application..."
    cd gift-exchange-app
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        echo "Found package.json. Installing minimal Node.js dependencies..."
        npm install --no-fund --no-audit --no-progress --loglevel=error
        if [ $? -ne 0 ]; then
            echo "Failed to install Node.js dependencies. Please check the error messages above."
            exit 1
        fi
        echo "Node.js dependencies installed successfully."
        
        # Create a webpack config file if it doesn't exist
        if [ ! -f "webpack.config.js" ]; then
            echo "Creating a webpack.config.js file..."
            cat > webpack.config.js << 'EOL'
const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 5000,
    host: '0.0.0.0',
    hot: true
  }
};
EOL
            echo "webpack.config.js created successfully."
        fi
        
        # Check if files exist in the src directory
        if [ -d "src" ]; then
            echo "Source directory found. Let's create a simple server to serve existing files."
            
            # Create a simple Node.js server to serve the static files
            cat > server.js << 'EOL'
const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// For any request that doesn't match a static file, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}`);
});
EOL
            
            # Install Express
            echo "Installing Express for the server..."
            npm install express --no-fund --no-audit --no-progress --loglevel=error
            
            # Run the server
            echo "Starting the server on port 5000..."
            node server.js
        else
            echo "No src directory found. Cannot run the application."
            exit 1
        fi
    else
        echo "package.json not found in the gift-exchange-app directory."
        echo "Please check the repository structure and try again."
        exit 1
    fi
else
    echo "gift-exchange-app directory not found."
    echo "Listing contents of the repository to help identify the application location:"
    ls -la
    echo "Please check the repository structure and try again."
    exit 1
fi

echo ""
echo "=== Repository Setup Complete ==="
echo "You have successfully cloned the Scramblelist repository and set up the environment."
echo "For more details, refer to the README.md file in the repository or check the project documentation."

# Final notes
echo "Thank you for using the Scramblelist Repository Cloner and Runner!"
