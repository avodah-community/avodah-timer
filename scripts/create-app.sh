#!/bin/bash

# Create Fly.io app script for avodah-timer
# This script creates a new Fly.io app with the configuration from fly.toml

set -e

echo "🚀 Creating Fly.io app..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Error: flyctl is not installed"
    echo "Please install it from: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Fly.io"
    echo "Please run: flyctl auth login"
    exit 1
fi

# Get app name from fly.toml or use default
APP_NAME=${FLY_APP_NAME:-avodah-timer}

# Check if app already exists
if flyctl apps list | grep -q "^$APP_NAME"; then
    echo "⚠️  App '$APP_NAME' already exists"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
else
    # Create the app
    echo "Creating app: $APP_NAME"
    flyctl apps create "$APP_NAME" --org personal
    echo "✅ App created successfully!"
fi

echo ""
echo "📋 Next steps:"
echo "1. Review and customize fly.toml if needed"
echo "2. Run ./scripts/deploy.sh to deploy your app"
echo ""
echo "🔗 Your app will be available at: https://$APP_NAME.fly.dev"
