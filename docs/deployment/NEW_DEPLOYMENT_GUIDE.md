# New Deployment Guide

## Prerequisites

1. **Docker and Docker Compose**
   - Modern Docker installations use `docker compose` (v2) instead of `docker-compose` (v1)
   - Check your version: `docker --version` and `docker compose version`

2. **Environment Variables**
   - Create/update `.env` file in the project root
   - Ensure all required variables are set

## Deployment Steps

### 1. Stop and Remove Old Containers

```bash
# Stop running containers
docker stop binary-system-frontend binary-system-backend

# Remove old containers (optional, but recommended for clean deployment)
docker rm binary-system-frontend binary-system-backend

# Or use Docker Compose (if available)
docker compose down
```

### 2. Verify Environment Variables

Ensure your `.env` file has the correct production values:

```env
# Backend Configuration
API_URL=http://199.188.204.202:8000
NODE_ENV=production
PORT=8000

# Frontend Configuration  
NEXT_PUBLIC_API_URL=http://199.188.204.202:8000/api/v1
NODE_ENV=production

# Database (update with your production MongoDB URL)
MONGODB_URL_PRODUCTION=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Secrets (use strong, unique values)
ACCESS_TOKEN_SECRET=your_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
ADMIN_JWT_SECRET=your_admin_secret_here

# CORS (include your frontend URL)
ALLOWED_ORIGINS=http://199.188.204.202:3000
```

### 3. Rebuild Images

**Using Docker Compose v2 (recommended):**
```bash
docker compose build --no-cache
```

**If you have docker-compose v1 installed:**
```bash
docker-compose build --no-cache
```

**Using Docker directly:**
```bash
# Build backend
docker build -t binary_system-backend -f server/Dockerfile server/

# Build frontend
docker build -t binary_system-frontend -f client/Dockerfile client/
```

### 4. Start New Containers

**Using Docker Compose v2:**
```bash
docker compose up -d
```

**Using Docker Compose v1:**
```bash
docker-compose up -d
```

**Using Docker directly:**
```bash
# Start backend
docker run -d \
  --name binary-system-backend \
  -p 8000:8000 \
  --env-file .env \
  binary_system-backend

# Start frontend
docker run -d \
  --name binary-system-frontend \
  -p 3000:3000 \
  --env-file .env \
  -e NEXT_PUBLIC_API_URL=http://199.188.204.202:8000/api/v1 \
  binary_system-frontend
```

### 5. Verify Deployment

```bash
# Check running containers
docker ps

# Check logs
docker logs binary-system-backend
docker logs binary-system-frontend

# Check specific service logs
docker compose logs -f backend
docker compose logs -f frontend
```

### 6. Health Checks

```bash
# Backend health check
curl http://199.188.204.202:8000/health

# Frontend (should return HTML)
curl http://199.188.204.202:3000
```

## Troubleshooting

### Docker Compose Command Not Found

If you see `Command 'docker-compose' not found`, you have two options:

**Option 1: Install docker-compose v1 (legacy)**
```bash
apt install docker-compose
```

**Option 2: Use Docker Compose v2 (recommended - already included with Docker)**
```bash
# Just use 'docker compose' instead of 'docker-compose'
docker compose build
docker compose up -d
```

### Port Already in Use

If ports 8000 or 3000 are already in use:

```bash
# Find process using the port
sudo lsof -i :8000
sudo lsof -i :3000

# Kill the process (replace PID with actual process ID)
sudo kill -9 <PID>
```

Or stop the existing containers:
```bash
docker stop $(docker ps -q --filter "publish=8000")
docker stop $(docker ps -q --filter "publish=3000")
```

### Environment Variables Not Loading

Ensure `.env` file is in the project root and properly formatted:
- No spaces around `=` sign
- No quotes unless the value contains spaces
- Use absolute paths if needed

### Build Errors

1. **Clear Docker cache:**
   ```bash
   docker system prune -a
   ```

2. **Rebuild without cache:**
   ```bash
   docker compose build --no-cache
   ```

3. **Check Dockerfile syntax:**
   ```bash
   docker compose config
   ```

## Updating Deployment

For future updates:

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Or in one command
docker compose up -d --build --force-recreate
```

## Rollback

If you need to rollback to a previous version:

```bash
# Stop current containers
docker compose down

# Tag and start previous image
docker run -d --name binary-system-backend -p 8000:8000 --env-file .env binary_system-backend:<previous-tag>
docker run -d --name binary-system-frontend -p 3000:3000 --env-file .env binary_system-frontend:<previous-tag>
```

## Production Best Practices

1. **Use Docker Compose v2** - It's the modern standard
2. **Use environment files** - Never hardcode secrets
3. **Enable logging** - Configure log rotation
4. **Set up monitoring** - Use Docker healthchecks
5. **Backup data** - Regular MongoDB backups
6. **Use reverse proxy** - Nginx or Traefik for SSL/TLS
7. **Resource limits** - Set memory/CPU limits in docker-compose.yml
