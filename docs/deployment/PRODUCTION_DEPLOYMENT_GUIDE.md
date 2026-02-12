# Production Deployment Guide

## 🚀 Quick Deployment

```bash
cd ~/apps/binary_system

# Pull latest code
git pull origin main

# Stop containers and clean up
docker compose down --remove-orphans

# Build with retry logic (handles network timeouts)
docker compose build --no-cache

# Start containers
docker compose up -d

# Clean up unused images
docker image prune -f
docker builder prune -f

# Verify deployment
docker ps
docker logs binary-system-backend --tail 20
docker logs binary-system-frontend --tail 20
```

## 🔧 Network Timeout Issues

If builds fail with `ETIMEDOUT` errors, the Dockerfile now includes:
- Extended timeouts (5 minutes)
- Retry logic (3 attempts)
- Reduced connection pool (5 sockets)
- Better error handling

### Manual Retry
If build still fails:
```bash
# Build services separately
docker compose build backend
docker compose build frontend

# Or build without --no-cache to use cache
docker compose build
```

## ✅ Verification

### Check Versions:
```bash
# Next.js version (should be 16.0.10)
docker exec binary-system-frontend npm list next

# Backend dependencies
docker exec binary-system-backend npm list chalk
```

### Check Security:
```bash
# Frontend vulnerabilities
docker exec binary-system-frontend npm audit --production

# Backend vulnerabilities  
docker exec binary-system-backend npm audit --production
```

### Check Logs:
```bash
# Backend logs
docker logs binary-system-backend --tail 50

# Frontend logs
docker logs binary-system-frontend --tail 50

# Follow logs
docker logs -f binary-system-backend
```

## 🔒 Security Status

- ✅ Next.js 16.0.10 (All CVEs fixed)
- ✅ All dependencies updated
- ✅ Docker security hardening applied
- ✅ Input sanitization active
- ✅ Rate limiting enabled
- ✅ Security headers configured

## 📋 Pre-Deployment Checklist

- [ ] Code pulled from repository
- [ ] Environment variables updated
- [ ] Secrets rotated (if needed)
- [ ] Database backup created
- [ ] Old containers stopped
- [ ] Build successful
- [ ] Containers started
- [ ] Health checks passing
- [ ] Logs reviewed

## 🆘 Troubleshooting

### Build Fails with Network Error:
```bash
# Increase Docker build timeout
export DOCKER_BUILDKIT=1
export BUILDKIT_STEP_LOG_MAX_SIZE=50000000
docker compose build --progress=plain
```

### Container Keeps Restarting:
```bash
# Check logs for errors
docker logs binary-system-backend --tail 100
docker logs binary-system-frontend --tail 100

# Check container status
docker ps -a
docker inspect binary-system-backend
```

### Port Already in Use:
```bash
# Find process using port
sudo lsof -i :8000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

---

**Last Updated:** $(date)
**Status:** ✅ Ready for Production Deployment
