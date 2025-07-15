#!/bin/bash

# Azure Deployment Script for Phish Stats Application
# This script deploys the application to Azure App Service

set -e  # Exit on any error

# Configuration variables
RESOURCE_GROUP="rg-phish-stats"
WEB_APP_NAME="phish-stats-app"
BUILD_DIR="build"

# Enhanced logging functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_step() {
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 $1"
    echo "=================================================="
}

log_success() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1"
}

log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1"
}

log_warning() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1"
}

# Function to show progress with dots
show_progress() {
    local pid=$1
    local message=$2
    while kill -0 $pid 2>/dev/null; do
        echo -n "."
        sleep 2
    done
    echo ""
}

log "🚀 Starting deployment to Azure App Service..."
log_info "Target: $WEB_APP_NAME in $RESOURCE_GROUP"
echo "=================================================="

# Check if Azure CLI is installed and logged in
log_step "Checking Azure CLI and authentication"
if ! command -v az &> /dev/null; then
    log_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

if ! az account show &> /dev/null; then
    log_error "You are not logged in to Azure CLI. Please run 'az login' first."
    exit 1
fi

log_success "Azure CLI is available and you are logged in."

# Get current subscription info
SUBSCRIPTION_NAME=$(az account show --query name -o tsv 2>/dev/null)
SUBSCRIPTION_ID=$(az account show --query id -o tsv 2>/dev/null)
log_info "Using subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"

# Check if web app exists
log_step "Verifying Azure resources"
if ! az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    log_error "Web app '$WEB_APP_NAME' does not exist. Please run azure-setup.sh first."
    exit 1
fi

log_success "Web app '$WEB_APP_NAME' found."

# Get app service plan info
APP_SERVICE_PLAN=$(az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query appServicePlanId -o tsv | cut -d'/' -f9)
log_info "App Service Plan: $APP_SERVICE_PLAN"

log_step "Building application"

# Install dependencies and build
log "📦 Installing dependencies..."
START_TIME=$(date +%s)
npm ci --loglevel=warn > npm-install.log 2>&1 &
INSTALL_PID=$!

# Show progress during npm install
echo -n "Installing packages"
show_progress $INSTALL_PID "Installing dependencies"
wait $INSTALL_PID
INSTALL_EXIT_CODE=$?

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ $INSTALL_EXIT_CODE -eq 0 ]; then
    log_success "Dependencies installed in ${DURATION}s"
else
    log_error "Dependency installation failed. Check npm-install.log for details."
    tail -20 npm-install.log
    exit 1
fi

log "🔨 Building Next.js application..."
START_TIME=$(date +%s)
npm run build > build.log 2>&1 &
BUILD_PID=$!

# Show progress during build
echo -n "Building application"
show_progress $BUILD_PID "Building application"
wait $BUILD_PID
BUILD_EXIT_CODE=$?

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    log_success "Build completed successfully in ${DURATION}s"
    # Show build stats
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1 || echo "unknown")
    log_info "Build output size: $BUILD_SIZE"
    
    # Check for standalone build
    if [ -d ".next/standalone" ]; then
        STANDALONE_SIZE=$(du -sh .next/standalone 2>/dev/null | cut -f1 || echo "unknown")
        log_success "Standalone build created (${STANDALONE_SIZE})"
    else
        log_warning "No standalone build found - this may cause issues in Azure"
    fi
else
    log_error "Build failed. Check build.log for details."
    tail -20 build.log
    exit 1
fi

log_step "Deploying to Azure"

# Create deployment package
log "📦 Creating deployment package..."
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
fi
mkdir -p "$BUILD_DIR"

# Copy necessary files for deployment
log_info "Copying files for deployment..."

# Always copy essential files first
cp package*.json "$BUILD_DIR/"
if [ -f "server-azure.js" ]; then
    cp server-azure.js "$BUILD_DIR/server.js"
    log_success "✓ server-azure.js copied as server.js"
elif [ -f "server.js" ]; then
    cp server.js "$BUILD_DIR/"
    log_success "✓ server.js copied"
else
    log_error "Neither server-azure.js nor server.js found! This is required for Azure deployment."
    exit 1
fi

if [ -f "web.config" ]; then
    cp web.config "$BUILD_DIR/"
    log_success "✓ web.config copied"
fi

if [ -f "startup.sh" ]; then
    cp startup.sh "$BUILD_DIR/"
    chmod +x "$BUILD_DIR/startup.sh"
    log_success "✓ startup.sh copied and made executable"
fi

if [ -f ".deployment" ]; then
    cp .deployment "$BUILD_DIR/"
    log_success "✓ .deployment copied"
fi

if [ -f "deploy.cmd" ]; then
    cp deploy.cmd "$BUILD_DIR/"
    log_success "✓ deploy.cmd copied"
fi

# Copy the entire src directory for proper Next.js structure
if [ -d "src" ]; then
    log_info "✓ Copying src directory"
    cp -r src "$BUILD_DIR/"
fi

# Copy public directory
if [ -d "public" ]; then
    log_info "✓ Copying public directory"
    cp -r public "$BUILD_DIR/"
fi

# For Azure, copy the regular build instead of standalone
log_info "✓ Using regular Next.js build for Azure compatibility"
if [ -d ".next" ]; then
    cp -r .next "$BUILD_DIR/"
    log_success "✓ .next directory copied"
else
    log_error "No .next build directory found!"
    exit 1
fi

# Copy node_modules for production
if [ -d "node_modules" ]; then
    log_info "Copying node_modules (this may take a while)..."
    cp -r node_modules "$BUILD_DIR/"
    log_success "✓ node_modules copied"
else
    log_warning "No node_modules directory found - will rely on Azure build"
fi

# Copy configuration files
for file in next.config.js next.config.mjs tailwind.config.js postcss.config.js tsconfig.json .env.local; do
    if [ -f "$file" ]; then
        log_info "✓ Copying $file"
        cp "$file" "$BUILD_DIR/"
    fi
done

# Make startup script executable
chmod +x "$BUILD_DIR/startup.sh" 2>/dev/null || true

log_info "✓ Copied all necessary files"

# Verify critical files are present
log_step "Verifying deployment package"
CRITICAL_FILES=("package.json" "server.js")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$BUILD_DIR/$file" ]; then
        log_success "✓ $file verified in package"
    else
        log_error "❌ Critical file $file is missing from deployment package!"
        exit 1
    fi
done

# List contents of build directory for debugging
log_info "Build directory contents:"
ls -la "$BUILD_DIR/" | while read line; do
    log_info "  $line"
done

# Check deployment package size
PACKAGE_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
log_info "Deployment package size: $PACKAGE_SIZE"

# Deploy using zip deployment
log "🚀 Creating zip and deploying..."
START_TIME=$(date +%s)
cd "$BUILD_DIR"

# Create zip with progress
log_info "Creating deployment zip..."
zip -r ../deploy.zip . > /dev/null 2>&1 &
ZIP_PID=$!
echo -n "Creating zip"
show_progress $ZIP_PID "Creating deployment zip"
wait $ZIP_PID

cd ..
ZIP_SIZE=$(ls -lh deploy.zip | awk '{print $5}')
log_info "Deployment zip size: $ZIP_SIZE"

# Deploy with verbose output
log "📤 Uploading to Azure App Service..."
az webapp deployment source config-zip \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --src deploy.zip \
    --verbose 2>&1 | while read line; do
        log_info "Azure: $line"
    done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
log_success "Deployment completed in ${DURATION}s"

# Configure Azure App Service settings
log_step "Configuring Azure App Service settings"

log "⚙️ Setting Node.js version and startup command..."
az webapp config set \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --startup-file "node server.js" \
    --always-on true

log "📝 Setting environment variables..."
az webapp config appsettings set \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        NODE_ENV=production \
        WEBSITE_NODE_DEFAULT_VERSION=~20 \
        PORT=8080 \
        WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true \
        ENABLE_ORYX_BUILD=true

log_success "Azure App Service configured"

# Clean up
log "🧹 Cleaning up temporary files..."
rm -rf "$BUILD_DIR" deploy.zip npm-install.log build.log
log_success "Cleanup completed"

log_step "Restarting application"

az webapp restart \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP

log_success "Application restarted"

log_step "Deployment completed successfully!"

# Get web app URL
WEB_APP_URL=$(az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName -o tsv)
log "🌐 Your application is available at: https://$WEB_APP_URL"

# Check if app is responding
log_info "Checking application health..."
if curl -s -o /dev/null -w "%{http_code}" "https://$WEB_APP_URL" | grep -q "200"; then
    log_success "Application is responding with HTTP 200"
else
    log_warning "Application may not be fully ready yet. Give it a few moments."
fi

echo ""
log "📋 Post-deployment information:"
echo "• Application URL: https://$WEB_APP_URL"
echo "• Resource Group: $RESOURCE_GROUP"
echo "• App Service: $WEB_APP_NAME"
echo "• Subscription: $SUBSCRIPTION_NAME"
echo ""
log "🔧 Useful commands:"
echo "• View logs: az webapp log tail --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP"
echo "• Scale app: az webapp up --sku B1 --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP"
echo "• Monitor app: az monitor app-insights component show --app $WEB_APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
log_success "Deployment process completed! 🎉"
