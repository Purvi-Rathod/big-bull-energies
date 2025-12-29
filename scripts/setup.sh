#!/bin/bash

# Setup script for CNEOX Binary MLM Platform
# This script helps set up the development environment

set -e

echo "🚀 CNEOX Platform Setup"
echo "======================"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20 or higher is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check if .env files exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env file from server/.env.example..."
    cp server/.env.example server/.env
    echo "⚠️  Please update server/.env with your configuration"
fi

if [ ! -f "client/.env.local" ]; then
    echo "📝 Creating client/.env.local file from client/.env.example..."
    cp client/.env.example client/.env.local
    echo "⚠️  Please update client/.env.local with your configuration"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

echo "Installing server dependencies..."
cd server
npm install
cd ..

echo "Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env files with your configuration"
echo "2. Start MongoDB and Redis services"
echo "3. Run 'npm run dev' in server/ and client/ directories"
echo "   Or use 'docker-compose up' for containerized setup"
