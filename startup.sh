#!/bin/bash

# Simple Azure startup script
echo "🚀 Starting Phish Stats on Azure App Service"
echo "Working directory: $(pwd)"
echo "NODE_ENV: ${NODE_ENV:-production}"
echo "PORT: ${PORT:-8080}"

# Ensure we're in the right directory
cd /home/site/wwwroot

# List files for debugging
echo "Files available:"
ls -la

# Check if we have dependencies
if [ -d "node_modules" ]; then
    echo "✅ node_modules found"
else
    echo "❌ node_modules not found"
fi

# Check for our server file
if [ -f "server.js" ]; then
    echo "✅ server.js found"
    echo "Starting with Node.js server..."
    node server.js
else
    echo "❌ server.js not found"
    echo "Available files:"
    ls -la
    exit 1
fi
