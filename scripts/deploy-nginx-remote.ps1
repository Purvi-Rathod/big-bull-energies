# Deploy nginx config to remote server from Windows.
# Usage:
#   .\scripts\deploy-nginx-remote.ps1 -User deployer -Host 104.219.250.57 -KeyPath C:\Users\you\.ssh\id_ed25519
# Or with password (interactive prompt):
#   .\scripts\deploy-nginx-remote.ps1 -User root -Host 104.219.250.57

param(
    [string]$User = "deployer",
    [string]$Host = "104.219.250.57",
    [string]$KeyPath = "",
    [string]$RemoteAppPath = "/home/deployer/apps/big-bull-energies"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ConfFile = Join-Path $RepoRoot "nginx\bigbull-energies.ip.conf"
$RemoteConf = "/tmp/bigbull-energies.ip.conf"

if (-not (Test-Path $ConfFile)) {
    Write-Error "Config not found: $ConfFile"
}

$sshArgs = @("-o", "StrictHostKeyChecking=accept-new")
if ($KeyPath -and (Test-Path $KeyPath)) {
    $sshArgs += @("-i", $KeyPath)
}

$target = "${User}@${Host}"
Write-Host "Deploying nginx to $target ..."

# Copy config
scp @sshArgs $ConfFile "${target}:${RemoteConf}"

# Install on server
$remoteScript = @"
set -e
if [ -d '$RemoteAppPath' ]; then cd '$RemoteAppPath'; fi
sudo cp '$RemoteConf' /etc/nginx/sites-available/bigbull-energies
sudo ln -sf /etc/nginx/sites-available/bigbull-energies /etc/nginx/sites-enabled/bigbull-energies
sudo rm -f /etc/nginx/sites-enabled/default
command -v nginx >/dev/null || (sudo apt-get update && sudo apt-get install -y nginx)
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl reload nginx
echo '--- health check ---'
curl -s -o /dev/null -w 'frontend: %{http_code}\n' http://127.0.0.1:3000/ || true
curl -s -o /dev/null -w 'backend:  %{http_code}\n' http://127.0.0.1:5000/api/v1/health || true
curl -s -o /dev/null -w 'nginx:    %{http_code}\n' http://127.0.0.1/api/v1/health || true
"@

ssh @sshArgs $target $remoteScript

Write-Host ""
Write-Host "Nginx deployed. Open: http://${Host}/"
Write-Host "API health: http://${Host}/api/v1/health"
