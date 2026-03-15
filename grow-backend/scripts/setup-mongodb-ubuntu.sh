#!/bin/bash

# MongoDB Installation Script for Ubuntu
# Run with: bash scripts/setup-mongodb-ubuntu.sh

echo "🚀 MongoDB Setup Script for Ubuntu"
echo "=================================="

# Check if running on Ubuntu
if ! grep -qi ubuntu /etc/os-release; then
  echo "❌ This script is designed for Ubuntu. Current OS may not be supported."
  exit 1
fi

# Check if already installed
if command -v mongod &> /dev/null; then
  echo "✅ MongoDB is already installed"
  mongod --version
  exit 0
fi

echo "📦 Installing MongoDB..."

# Update package lists
echo "Updating package lists..."
sudo apt-get update

# Install dependencies
echo "Installing dependencies..."
sudo apt-get install -y wget gnupg

# Add MongoDB GPG key
echo "Adding MongoDB GPG key..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository for Ubuntu 22.04 (Jammy)
# For Ubuntu 20.04, use 'focal', for Ubuntu 24.04, use 'noble'
UBUNTU_VERSION=$(lsb_release -cs)

echo "Detected Ubuntu version: $UBUNTU_VERSION"

# Map Ubuntu versions to MongoDB repo versions
case "$UBUNTU_VERSION" in
  focal)
    MONGO_REPO="focal"
    ;;
  jammy)
    MONGO_REPO="jammy"
    ;;
  noble)
    MONGO_REPO="noble"
    ;;
  *)
    echo "⚠️  Using jammy repository for unknown Ubuntu version"
    MONGO_REPO="jammy"
    ;;
esac

echo "Adding MongoDB repository for $MONGO_REPO..."
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $MONGO_REPO/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list > /dev/null

# Update package lists again
echo "Updating package lists..."
sudo apt-get update

# Install MongoDB
echo "Installing MongoDB Server..."
sudo apt-get install -y mongodb-org

# Enable and start MongoDB service
echo "Enabling MongoDB service..."
sudo systemctl enable mongod
sudo systemctl start mongod

# Verify installation
if command -v mongod &> /dev/null; then
  echo ""
  echo "✅ MongoDB installed successfully!"
  mongod --version
  echo ""
  echo "📊 MongoDB Service Status:"
  sudo systemctl status mongod --no-pager
  echo ""
  echo "✨ MongoDB is running on port 27017"
  echo "✨ Service name: mongod"
  echo ""
  echo "💡 Useful commands:"
  echo "  sudo systemctl start mongod    - Start MongoDB"
  echo "  sudo systemctl stop mongod     - Stop MongoDB"
  echo "  sudo systemctl restart mongod  - Restart MongoDB"
  echo "  sudo systemctl status mongod   - Check status"
  echo "  mongosh                        - Connect to MongoDB shell"
else
  echo "❌ MongoDB installation failed"
  exit 1
fi
