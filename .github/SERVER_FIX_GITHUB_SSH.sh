#!/bin/bash
# Quick fix script to run on server as root
# This fixes GitHub SSH access for the deployer user

echo "🔧 Fixing GitHub SSH access for deployer user..."

# 1. Add GitHub host key to deployer's known_hosts
echo "📝 Adding GitHub to known_hosts..."
su - deployer -c "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
su - deployer -c "ssh-keyscan -H github.com >> ~/.ssh/known_hosts 2>/dev/null || true"
su - deployer -c "chmod 600 ~/.ssh/known_hosts"

# 2. Copy root's GitHub SSH key to deployer (if it exists)
if [ -f /root/.ssh/id_ed25519 ]; then
  echo "📋 Copying root's GitHub SSH key to deployer..."
  cp /root/.ssh/id_ed25519 /home/deployer/.ssh/id_ed25519
  cp /root/.ssh/id_ed25519.pub /home/deployer/.ssh/id_ed25519.pub 2>/dev/null || true
  chown deployer:deployer /home/deployer/.ssh/id_ed25519*
  chmod 600 /home/deployer/.ssh/id_ed25519
  chmod 644 /home/deployer/.ssh/id_ed25519.pub 2>/dev/null || true
  echo "✅ Copied SSH key"
elif [ -f /root/.ssh/id_rsa ]; then
  echo "📋 Copying root's GitHub SSH key to deployer..."
  cp /root/.ssh/id_rsa /home/deployer/.ssh/id_rsa
  cp /root/.ssh/id_rsa.pub /home/deployer/.ssh/id_rsa.pub 2>/dev/null || true
  chown deployer:deployer /home/deployer/.ssh/id_rsa*
  chmod 600 /home/deployer/.ssh/id_rsa
  chmod 644 /home/deployer/.ssh/id_rsa.pub 2>/dev/null || true
  echo "✅ Copied SSH key"
else
  echo "⚠️  No GitHub SSH key found in /root/.ssh/"
  echo "   You may need to generate one or add deployer's key to GitHub"
fi

# 3. Test git access
echo "🧪 Testing git access..."
APP_PATH="/home/deployer/apps/binary_system"
if [ ! -d "$APP_PATH" ]; then
  APP_PATH="/root/webapps/binary_system"
fi

if [ -d "$APP_PATH" ]; then
  su - deployer -c "cd $APP_PATH && git fetch origin" && echo "✅ Git access works!" || echo "❌ Git access failed - check SSH keys"
else
  echo "⚠️  App directory not found at $APP_PATH"
fi

echo ""
echo "✅ Fix complete! Try deploying again."
