#!/bin/bash

# Deploy script for avodah-timer to Fly.io
# This script builds and deploys the application to Fly.io

set -e

echo "🚀 Deploying avodah-timer to Fly.io..."

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

# Get app name from fly.toml
APP_NAME=${FLY_APP_NAME:-avodah-timer}

# Check if app exists
if ! flyctl apps list | grep -q "^$APP_NAME"; then
    echo "❌ Error: App '$APP_NAME' does not exist"
    echo "Please run ./scripts/create-app.sh first to create the app"
    exit 1
fi

echo "📦 Building and deploying..."
flyctl deploy --ha=false

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your app is live at: https://$APP_NAME.fly.dev"
echo ""
echo "📊 Useful commands:"
echo "  flyctl status          - Check app status"
echo "  flyctl logs            - View application logs"
echo "  flyctl ssh console     - SSH into the app"
echo "  flyctl dashboard       - Open Fly.io dashboard"
