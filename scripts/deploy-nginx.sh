#!/bin/bash
# Deploy Big Bull Energies nginx config on the server.
# Run ON the server (or via: ssh user@host 'bash -s' < scripts/deploy-nginx.sh)
set -euo pipefail

SERVER_IP="${SERVER_IP:-104.219.250.57}"
SITE_NAME="bigbull-energies"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONF_SRC="${REPO_ROOT}/nginx/bigbull-energies.ip.conf"
CONF_DST="/etc/nginx/sites-available/${SITE_NAME}"

echo "Big Bull Energies — nginx deploy"
echo "================================="

if [ ! -f "$CONF_SRC" ]; then
  echo "Missing config: $CONF_SRC"
  exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "Installing nginx..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y nginx
  elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y nginx
  else
    echo "Install nginx manually, then re-run this script."
    exit 1
  fi
fi

echo "Copying nginx config..."
sudo cp "$CONF_SRC" "$CONF_DST"
sudo ln -sf "$CONF_DST" "/etc/nginx/sites-enabled/${SITE_NAME}"

if [ -f /etc/nginx/sites-enabled/default ]; then
  echo "Disabling default site..."
  sudo rm -f /etc/nginx/sites-enabled/default
fi

echo "Testing nginx config..."
sudo nginx -t

echo "Reloading nginx..."
sudo systemctl enable nginx
sudo systemctl reload nginx

echo ""
echo "Done. Verify:"
echo "  curl -I http://${SERVER_IP}/"
echo "  curl -s http://${SERVER_IP}/api/v1/health"
echo ""
echo "Ensure app is running locally:"
echo "  frontend -> 127.0.0.1:3000"
echo "  backend  -> 127.0.0.1:5000"
