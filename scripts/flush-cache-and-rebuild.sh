#!/bin/bash
set -e

echo "🔍 Clearing Docker cache and rebuilding frontend..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Stop containers
echo "📦 Stopping containers..."
docker compose down

# Remove the frontend cache volume
echo "🗑️  Removing frontend cache volume..."
docker volume rm binary_system_frontend-next-cache 2>/dev/null || echo "Volume doesn't exist or already removed"

# Remove local .next directory if it exists
echo "🧹 Cleaning local .next directory..."
rm -rf client/.next

# Rebuild frontend without cache
echo "🔨 Rebuilding frontend (no cache)..."
docker compose build --no-cache frontend

# Start containers
echo "🚀 Starting containers..."
docker compose up -d

echo "✅ Done! Frontend cache cleared and rebuilt."
echo "📝 The 'Flush All User Data' button should now be visible in the admin settings page."
