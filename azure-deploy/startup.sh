#!/bin/bash

# Azure App Service startup script for Next.js standalone app
echo "=== Azure App Service Startup Script ==="
echo "Starting Next.js application on Azure App Service..."
echo "Working directory: $(pwd)"
echo "User: $(whoami)"
echo "Files in current directory:"
ls -la

# Set the port from Azure's PORT environment variable
export PORT=${PORT:-8080}
echo "Application will listen on port: $PORT"

# Set NODE_ENV to production for Azure
export NODE_ENV=production
echo "NODE_ENV: $NODE_ENV"

# Debug: Check what files we have
echo "=== Directory Structure ==="
find . -name "*.js" -o -name "*.json" -o -name "package.json" | head -20

echo "=== Checking for Next.js files ==="
if [ -f "package.json" ]; then
    echo "✓ Found package.json"
    cat package.json | head -10
else
    echo "✗ No package.json found"
fi

if [ -f "server.js" ]; then
    echo "✓ Found server.js"
else
    echo "✗ No server.js found"
fi

if [ -d ".next" ]; then
    echo "✓ Found .next directory"
    ls -la .next/
else
    echo "✗ No .next directory found"
fi

if [ -d ".next/standalone" ]; then
    echo "✓ Found standalone build"
    ls -la .next/standalone/
else
    echo "✗ No standalone build found"
fi

echo "=== Starting Application ==="

# Try different startup methods in order of preference
if [ -f "server.js" ] && [ -f "package.json" ]; then
    echo "Starting with custom server.js..."
    node server.js
elif [ -f ".next/standalone/server.js" ]; then
    echo "Starting with Next.js standalone build..."
    cd .next/standalone
    node server.js
elif [ -f "package.json" ]; then
    echo "Starting with npm start..."
    npm start
else
    echo "ERROR: No valid startup method found!"
    echo "Available files:"
    ls -la
    exit 1
fi
