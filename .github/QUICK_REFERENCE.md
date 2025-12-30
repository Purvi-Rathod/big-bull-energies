# CI/CD Quick Reference Guide

## 🚀 Deployment Workflows

### 1. Standard Deployment (Main Branch)

**Trigger:** Push to `main` branch

```bash
git push origin main
```

**What happens:**
- ✅ Zero-downtime deployment
- ✅ Health checks
- ✅ Automatic rollback on failure

---

### 2. Versioned Release

**Trigger:** Create and push a version tag

```bash
# Create tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag
git push origin v1.0.0
```

**What happens:**
- ✅ GitHub Release created
- ✅ Changelog generated
- ✅ Production deployment
- ✅ Health checks & rollback

---

### 3. Manual Rollback

**How to trigger:**
1. Go to **Actions** → **Deploy to Production**
2. Click **Run workflow**
3. Check **"Rollback to previous version"**
4. Click **Run workflow**

**What happens:**
- ✅ Restores previous commit
- ✅ Rebuilds containers
- ✅ Restarts services
- ✅ Verifies health

---

## 📋 GitHub Secrets Required

```
PROD_SSH_KEY      - SSH private key for server access
PROD_HOST         - Server IP/domain (e.g., 199.188.204.202)
PROD_USER         - SSH user (root or deployer)
PROD_PATH         - Application path (e.g., /root/webapps/binary_system)
```

---

## 🔐 Security Setup

### Switch from Root to Deployment User

See: **[DEPLOYMENT_USER_SETUP.md](./DEPLOYMENT_USER_SETUP.md)**

**Quick Steps:**
1. Create `deployer` user on server
2. Add to docker group
3. Set up SSH keys
4. Update GitHub secrets
5. Disable root SSH login

---

## 📁 File Structure

```
.github/
├── workflows/
│   ├── ci.yml              # Continuous Integration
│   ├── deploy.yml          # Main deployment (zero-downtime)
│   ├── deploy-advanced.yml # Advanced deployment strategy
│   └── release.yml         # Versioned releases
├── ADVANCED_DEPLOYMENT_GUIDE.md  # Full feature documentation
├── DEPLOYMENT_USER_SETUP.md      # Security setup guide
├── SSH_SETUP_GUIDE.md            # SSH key setup
└── QUICK_REFERENCE.md            # This file
```

---

## 🎯 Common Tasks

### Deploy Latest Code
```bash
git push origin main
```

### Create and Deploy Release
```bash
git tag -a v1.2.3 -m "Release notes here"
git push origin v1.2.3
```

### Rollback Deployment
- Use GitHub Actions UI (see above)
- Or manually on server:
  ```bash
  cd /path/to/app
  git checkout $(cat .deploy-backup/last-commit.txt)
  docker compose up -d --build
  ```

### Check Deployment Status
```bash
# On server
cd /path/to/app
docker compose ps
docker compose logs -f
```

---

## 🔍 Monitoring

### Health Check Endpoints
- Backend: `http://your-server:8000/health`
- Frontend: `http://your-server:3000`

### Check Deployment Logs
1. Go to GitHub **Actions** tab
2. Click on latest workflow run
3. View detailed logs for each step

### Server Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

---

## ⚠️ Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs
2. Check server logs: `docker compose logs`
3. Verify health endpoints
4. Check backup exists: `cat .deploy-backup/last-commit.txt`

### Rollback Needed
- Use manual rollback via GitHub Actions
- Or restore from backup on server

### SSH Connection Issues
- See **[SSH_SETUP_GUIDE.md](./SSH_SETUP_GUIDE.md)**
- Verify keys in GitHub Secrets
- Check server authorized_keys

---

## 📚 Documentation

- **[ADVANCED_DEPLOYMENT_GUIDE.md](./ADVANCED_DEPLOYMENT_GUIDE.md)** - Complete feature documentation
- **[DEPLOYMENT_USER_SETUP.md](./DEPLOYMENT_USER_SETUP.md)** - Security setup guide
- **[SSH_SETUP_GUIDE.md](./SSH_SETUP_GUIDE.md)** - SSH key configuration
- **[workflows/README.md](./workflows/README.md)** - Workflow details
