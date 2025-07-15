#!/bin/bash

# Azure Setup Script for Phish Stats Application
# This script creates the necessary Azure resources for deployment

set -e  # Exit on any error

# Configuration variables
RESOURCE_GROUP="rg-phish-stats"
LOCATION="eastus"
APP_SERVICE_PLAN="asp-phish-stats"
WEB_APP_NAME="phish-stats-app"
SKU="B1"
RUNTIME="NODE:20-lts"

echo "🚀 Starting Azure resource creation for Phish Stats Application..."
echo "=================================================="

# Check if Azure CLI is installed and logged in
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo "❌ You are not logged in to Azure CLI. Please run 'az login' first."
    exit 1
fi

echo "✅ Azure CLI is available and you are logged in."

# Get current subscription info
SUBSCRIPTION=$(az account show --query name -o tsv)
echo "📋 Using subscription: $SUBSCRIPTION"

echo ""
echo "🏗️  Creating Resource Group..."
echo "=================================================="

# Create Resource Group
if az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo "✅ Resource group '$RESOURCE_GROUP' already exists."
else
    echo "📦 Creating resource group '$RESOURCE_GROUP' in '$LOCATION'..."
    az group create \
        --name $RESOURCE_GROUP \
        --location $LOCATION \
        --output table
    echo "✅ Resource group created successfully."
fi

echo ""
echo "🖥️  Creating App Service Plan..."
echo "=================================================="

# Create App Service Plan
if az appservice plan show --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "✅ App Service Plan '$APP_SERVICE_PLAN' already exists."
else
    echo "📋 Creating App Service Plan '$APP_SERVICE_PLAN' with SKU '$SKU'..."
    az appservice plan create \
        --name $APP_SERVICE_PLAN \
        --resource-group $RESOURCE_GROUP \
        --sku $SKU \
        --is-linux \
        --output table
    echo "✅ App Service Plan created successfully."
fi

echo ""
echo "🌐 Creating Web App..."
echo "=================================================="

# Create Web App
if az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "✅ Web App '$WEB_APP_NAME' already exists."
else
    echo "🚀 Creating Web App '$WEB_APP_NAME' with runtime '$RUNTIME'..."
    az webapp create \
        --name $WEB_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --plan $APP_SERVICE_PLAN \
        --runtime "$RUNTIME" \
        --output table
    echo "✅ Web App created successfully."
fi

echo ""
echo "⚙️  Configuring Web App Settings..."
echo "=================================================="

# Configure app settings for Node.js
echo "🔧 Setting Node.js startup command..."
az webapp config set \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --startup-file "npm start" \
    --output table

# Configure app settings for environment
echo "🔧 Configuring environment variables..."
az webapp config appsettings set \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        NODE_ENV=production \
        WEBSITE_NODE_DEFAULT_VERSION=20-lts \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    --output table

echo ""
echo "🎯 Getting Web App Information..."
echo "=================================================="

# Get web app URL
WEB_APP_URL=$(az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName -o tsv)
echo "🌐 Web App URL: https://$WEB_APP_URL"

# Get deployment credentials
echo ""
echo "📋 Deployment Information:"
echo "=========================="
echo "Resource Group: $RESOURCE_GROUP"
echo "App Service Plan: $APP_SERVICE_PLAN"
echo "Web App Name: $WEB_APP_NAME"
echo "Runtime: $RUNTIME"
echo "Location: $LOCATION"
echo "URL: https://$WEB_APP_URL"

echo ""
echo "✅ Azure resources created successfully!"
echo "=================================================="
echo ""
echo "🔄 Next Steps:"
echo "1. Set up deployment credentials (if using Git deployment)"
echo "2. Configure environment variables for your app"
echo "3. Deploy your application using GitHub Actions or Git"
echo ""
echo "📚 Useful Commands:"
echo "   View web app: az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP"
echo "   View logs: az webapp log tail --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP"
echo "   Restart app: az webapp restart --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
