#!/bin/bash

# Azure Environment Configuration Script
# This script configures environment variables and app settings for the Phish Stats application

set -e  # Exit on any error

# Configuration variables
RESOURCE_GROUP="rg-phish-stats"
WEB_APP_NAME="phish-stats-app"

echo "⚙️  Configuring Azure App Service Environment..."
echo "=================================================="

# Check if Azure CLI is available
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed."
    exit 1
fi

if ! az account show &> /dev/null; then
    echo "❌ You are not logged in to Azure CLI. Please run 'az login' first."
    exit 1
fi

# Check if web app exists
if ! az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "❌ Web app '$WEB_APP_NAME' does not exist. Please run azure-setup.sh first."
    exit 1
fi

echo "✅ Web app '$WEB_APP_NAME' found."

echo ""
echo "🔧 Setting up application configuration..."
echo "=================================================="

# Prompt for API key (if needed)
echo "📝 Please provide your Phish.net API key (press Enter to skip):"
read -r PHISH_API_KEY

# Configure app settings
echo "🔧 Configuring environment variables..."

# Base app settings
SETTINGS=(
    "NODE_ENV=production"
    "WEBSITE_NODE_DEFAULT_VERSION=21-lts"
    "SCM_DO_BUILD_DURING_DEPLOYMENT=true"
    "WEBSITE_RUN_FROM_PACKAGE=1"
    "PORT=8080"
)

# Add API key if provided
if [ -n "$PHISH_API_KEY" ]; then
    SETTINGS+=("PHISH_NET_API_KEY=$PHISH_API_KEY")
    echo "✅ API key will be configured."
else
    echo "⚠️  No API key provided. You can add it later if needed."
fi

# Set all app settings
az webapp config appsettings set \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings "${SETTINGS[@]}" \
    --output table

echo ""
echo "🔧 Configuring startup command..."
echo "=================================================="

# Set startup command for Next.js
az webapp config set \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --startup-file "npm start" \
    --output table

echo ""
echo "🔧 Configuring CORS (if needed)..."
echo "=================================================="

# Configure CORS for API access
az webapp cors add \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --allowed-origins "*" || echo "⚠️  CORS configuration skipped (may already be configured)"

echo ""
echo "🔧 Enabling logging..."
echo "=================================================="

# Enable application logging
az webapp log config \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --application-logging filesystem \
    --level information \
    --output table

echo ""
echo "✅ Configuration completed successfully!"
echo "=================================================="

echo ""
echo "📋 Current App Settings:"
echo "========================"
az webapp config appsettings list \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --output table

echo ""
echo "🌐 Web App URL:"
WEB_APP_URL=$(az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName -o tsv)
echo "   https://$WEB_APP_URL"

echo ""
echo "📚 Useful management commands:"
echo "   View logs: az webapp log tail --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP"
echo "   Restart: az webapp restart --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP"
echo "   Update settings: az webapp config appsettings set --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --settings KEY=VALUE"
echo ""
