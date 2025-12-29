# Quick Deployment Commands

## For Your Current Server Deployment

### Step 1: Stop Old Containers

```bash
# Stop and remove old containers
docker stop binary-system-frontend binary-system-backend
docker rm binary-system-frontend binary-system-backend
```

### Step 2: Ensure Environment Variables Are Set

Your `.env` file should have:
```env
API_URL=http://199.188.204.202:8000
NEXT_PUBLIC_API_URL=http://199.188.204.202:8000
NODE_ENV=production
PORT=8000

# Add other required variables (MongoDB, JWT secrets, etc.)
MONGODB_URL_PRODUCTION=your_mongodb_url
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
# ... etc
```

### Step 3: Build and Deploy

**Option A: Use Docker Compose v2 (recommended - already installed)**
```bash
# Build with no cache (clean build)
docker compose build --no-cache

# Start containers
docker compose up -d
```

**Option B: If docker-compose v1 is installed**
```bash
# Install docker-compose if needed
apt install docker-compose

# Then use
docker-compose build --no-cache
docker-compose up -d
```

### Step 4: Verify Deployment

```bash
# Check running containers
docker ps

# Check logs
docker compose logs -f

# Or check individual services
docker compose logs -f backend
docker compose logs -f frontend
```

### Step 5: Health Checks

```bash
# Backend health
curl http://199.188.204.202:8000/health

# Frontend (should return HTML)
curl http://199.188.204.202:3000
```

## One-Line Deployment (After setup)

```bash
docker compose down && docker compose build --no-cache && docker compose up -d
```

## Troubleshooting

### If "docker-compose" command not found:
- Use `docker compose` (with space, not hyphen) - this is v2, included with Docker

### If build fails:
```bash
# Clean Docker system
docker system prune -a

# Try again
docker compose build --no-cache
```

### View logs if something fails:
```bash
docker compose logs backend
docker compose logs frontend
```

## Access Your Application

- Frontend: http://199.188.204.202:3000
- Backend API: http://199.188.204.202:8000
- API Docs: http://199.188.204.202:8000/api-docs
