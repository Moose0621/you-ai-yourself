#!/bin/bash

# Azure Management and Monitoring Script
# This script provides utilities for managing and monitoring the deployed application

set -e  # Exit on any error

# Configuration variables
RESOURCE_GROUP="rg-phish-stats"
WEB_APP_NAME="phish-stats-app"

# Function to display usage
show_usage() {
    echo "Azure Management Script for Phish Stats Application"
    echo "=================================================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status      - Show application status and health"
    echo "  logs        - Stream application logs"
    echo "  restart     - Restart the application"
    echo "  scale       - Scale the application (up/down)"
    echo "  backup      - Create a backup of app settings"
    echo "  restore     - Restore app settings from backup"
    echo "  metrics     - Show application metrics"
    echo "  cleanup     - Clean up Azure resources"
    echo "  help        - Show this help message"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    if ! command -v az &> /dev/null; then
        echo "❌ Azure CLI is not installed."
        exit 1
    fi

    if ! az account show &> /dev/null; then
        echo "❌ You are not logged in to Azure CLI. Please run 'az login' first."
        exit 1
    fi

    if ! az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
        echo "❌ Web app '$WEB_APP_NAME' does not exist."
        exit 1
    fi
}

# Function to show application status
show_status() {
    echo "📊 Application Status"
    echo "===================="
    
    # Get basic app info
    echo "🔍 Basic Information:"
    az webapp show \
        --name $WEB_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --query "{Name:name, State:state, Location:location, DefaultHostName:defaultHostName}" \
        --output table

    echo ""
    echo "🔍 Runtime Information:"
    az webapp config show \
        --name $WEB_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --query "{NodeVersion:nodeVersion, LinuxFxVersion:linuxFxVersion, StartupFile:appCommandLine}" \
        --output table

    echo ""
    echo "🔍 Health Check:"
    WEB_APP_URL=$(az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName -o tsv)
    echo "   URL: https://$WEB_APP_URL"
    
    if curl -s -o /dev/null -w "%{http_code}" "https://$WEB_APP_URL" | grep -q "200"; then
        echo "   ✅ Application is responding"
    else
        echo "   ❌ Application may not be responding properly"
    fi
}

# Function to stream logs
stream_logs() {
    echo "📝 Streaming Application Logs"
    echo "============================="
    echo "Press Ctrl+C to stop streaming"
    echo ""
    
    az webapp log tail \
        --name $WEB_APP_NAME \
        --resource-group $RESOURCE_GROUP
}

# Function to restart application
restart_app() {
    echo "🔄 Restarting Application"
    echo "========================="
    
    az webapp restart \
        --name $WEB_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --output table
    
    echo "✅ Application restarted successfully"
}

# Function to scale application
scale_app() {
    echo "📈 Scaling Application"
    echo "======================"
    
    echo "Current App Service Plan:"
    az appservice plan show \
        --name asp-phish-stats \
        --resource-group $RESOURCE_GROUP \
        --query "{Name:name, Sku:sku, NumberOfWorkers:numberOfWorkers}" \
        --output table
    
    echo ""
    echo "Available SKUs: F1 (Free), D1 (Shared), B1 (Basic), B2, B3, S1 (Standard), S2, S3, P1 (Premium), P2, P3"
    echo "Enter new SKU (or press Enter to cancel):"
    read -r NEW_SKU
    
    if [ -n "$NEW_SKU" ]; then
        echo "Scaling to $NEW_SKU..."
        az appservice plan update \
            --name asp-phish-stats \
            --resource-group $RESOURCE_GROUP \
            --sku "$NEW_SKU" \
            --output table
        echo "✅ Scaling completed"
    else
        echo "⚠️  Scaling cancelled"
    fi
}

# Function to backup app settings
backup_settings() {
    echo "💾 Backing Up App Settings"
    echo "=========================="
    
    BACKUP_FILE="appsettings-backup-$(date +%Y%m%d-%H%M%S).json"
    
    az webapp config appsettings list \
        --name $WEB_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --output json > "$BACKUP_FILE"
    
    echo "✅ App settings backed up to: $BACKUP_FILE"
}

# Function to show metrics
show_metrics() {
    echo "📊 Application Metrics"
    echo "======================"
    
    # Get resource ID
    RESOURCE_ID=$(az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query id -o tsv)
    
    echo "🔍 CPU Usage (last 24 hours):"
    az monitor metrics list \
        --resource "$RESOURCE_ID" \
        --metric "CpuPercentage" \
        --interval PT1H \
        --output table 2>/dev/null || echo "   ⚠️  Metrics not available (may need time to populate)"
    
    echo ""
    echo "🔍 Memory Usage (last 24 hours):"
    az monitor metrics list \
        --resource "$RESOURCE_ID" \
        --metric "MemoryPercentage" \
        --interval PT1H \
        --output table 2>/dev/null || echo "   ⚠️  Metrics not available (may need time to populate)"
    
    echo ""
    echo "🔍 Request Count (last 24 hours):"
    az monitor metrics list \
        --resource "$RESOURCE_ID" \
        --metric "Requests" \
        --interval PT1H \
        --output table 2>/dev/null || echo "   ⚠️  Metrics not available (may need time to populate)"
}

# Function to cleanup resources
cleanup_resources() {
    echo "🧹 Cleaning Up Azure Resources"
    echo "==============================="
    echo ""
    echo "⚠️  WARNING: This will delete ALL resources in the resource group '$RESOURCE_GROUP'"
    echo "This action cannot be undone!"
    echo ""
    echo "Type 'DELETE' to confirm deletion, or anything else to cancel:"
    read -r CONFIRMATION
    
    if [ "$CONFIRMATION" = "DELETE" ]; then
        echo "🗑️  Deleting resource group and all resources..."
        az group delete \
            --name $RESOURCE_GROUP \
            --yes \
            --no-wait
        echo "✅ Cleanup initiated. Resources will be deleted in the background."
    else
        echo "⚠️  Cleanup cancelled"
    fi
}

# Main script logic
case "${1:-help}" in
    "status")
        check_prerequisites
        show_status
        ;;
    "logs")
        check_prerequisites
        stream_logs
        ;;
    "restart")
        check_prerequisites
        restart_app
        ;;
    "scale")
        check_prerequisites
        scale_app
        ;;
    "backup")
        check_prerequisites
        backup_settings
        ;;
    "metrics")
        check_prerequisites
        show_metrics
        ;;
    "cleanup")
        check_prerequisites
        cleanup_resources
        ;;
    "help"|*)
        show_usage
        ;;
esac
