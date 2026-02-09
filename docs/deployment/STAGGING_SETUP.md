# Stagging Environment Setup

The stagging environment runs alongside production on the same server with different ports and domains.

## Ports & Domains

| Service   | Port | Domain                      |
|-----------|------|-----------------------------|
| API       | 4000 | stagging.api.crownbankers.com |
| Frontend  | 3002 | stagging.crownbankers.com     |

## Quick Start

### 1. Create environment file

```bash
cp .env.stagging.example .env.stagging
# Edit .env.stagging with stagging-specific values
nano .env.stagging
```

### 2. Build and run

```bash
# From project root
docker compose -f docker-compose.stagging.yml --env-file .env.stagging up -d --build
```

### 3. Or use the deploy script

```bash
./scripts/deploy-stagging.sh
```

## Nginx Configuration

Add these server blocks to route the stagging domains. Create `/etc/nginx/sites-available/stagging-crownbankers`:

```nginx
# stagging.api.crownbankers.com -> localhost:4000
server {
    listen 80;
    server_name stagging.api.crownbankers.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
    }
}

# stagging.crownbankers.com -> localhost:3002
server {
    listen 80;
    server_name stagging.crownbankers.com;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
    }
}
```

For HTTPS, use Let's Encrypt:

```bash
sudo ln -s /etc/nginx/sites-available/stagging-crownbankers /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d stagging.api.crownbankers.com -d stagging.crownbankers.com
```

## DNS Configuration

Add A records pointing to your production server IP:

| Record  | Type | Value         |
|---------|------|---------------|
| stagging.api | A | YOUR_SERVER_IP |
| stagging     | A | YOUR_SERVER_IP |

## Firewall

Allow the stagging ports (if not using nginx reverse proxy):

```bash
sudo ufw allow 4000/tcp  # API
sudo ufw allow 3002/tcp  # Frontend
sudo ufw reload
```

## Running Both Environments

Production and stagging run independently. Use different compose files:

```bash
# Production (default)
docker compose up -d

# Stagging
docker compose -f docker-compose.stagging.yml --env-file .env.stagging up -d
```

Container names are unique to avoid conflicts:
- Production: `binary-system-backend`, `binary-system-frontend`
- Stagging: `binary-system-backend-stagging`, `binary-system-frontend-stagging`

## Useful Commands

```bash
# View stagging logs
docker compose -f docker-compose.stagging.yml --env-file .env.stagging logs -f

# Stop stagging
docker compose -f docker-compose.stagging.yml --env-file .env.stagging down

# Rebuild stagging
docker compose -f docker-compose.stagging.yml --env-file .env.stagging up -d --build
```
