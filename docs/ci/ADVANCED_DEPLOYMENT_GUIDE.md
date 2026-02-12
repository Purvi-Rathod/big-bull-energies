# Advanced Deployment Features Guide

This guide explains the advanced deployment features implemented in the CI/CD pipeline.

## Features Overview

1. ✅ **Zero-Downtime Deployment** - No container stops during deployment
2. ✅ **Automatic Rollback** - Rolls back on deployment failure
3. ✅ **Deployment User Setup** - Secure SSH without root access
4. ✅ **Versioned Releases** - Automatic deployment from version tags

---

## 1. Zero-Downtime Deployment 🔄

### How It Works

The zero-downtime deployment uses Docker Compose's `--no-deps --force-recreate` flags to:

1. **Build new images** while old containers are still running
2. **Create new containers** with the new images
3. **Health check** the new containers
4. **Switch traffic** to new containers (automatically via Docker)
5. **Remove old containers** only after new ones are confirmed healthy

### Benefits

- ✅ No service interruption
- ✅ Users don't experience downtime
- ✅ Smooth updates for your application
- ✅ Automatic rollback if health checks fail

### Workflow

When you push to `main`:
1. New Docker images are built
2. New containers start alongside old ones
3. Health checks run on new containers
4. Old containers are stopped only if new ones pass health checks
5. If health checks fail, old containers keep running

---

## 2. Automatic Rollback 🧯

### How It Works

Before each deployment:
1. Current commit hash is saved to `.deploy-backup/last-commit.txt`
2. Current container state is saved
3. If deployment fails health checks, the system automatically:
   - Checks out the previous commit
   - Rebuilds containers with previous code
   - Restarts services
   - Verifies health

### Manual Rollback

You can manually trigger a rollback:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Production** workflow
3. Click **Run workflow**
4. Check the **"Rollback to previous version"** checkbox
5. Click **Run workflow**

### Rollback Process

```
Current State → Save State → Deploy New → Health Check
                                        ↓
                                    Failed?
                                        ↓
                              Rollback to Previous
                                        ↓
                              Rebuild & Restart
                                        ↓
                              Health Check & Verify
```

---

## 3. Deployment User Setup 🔐

### Why Disable Root SSH?

- **Security**: Root access is dangerous if compromised
- **Audit Trail**: Easier to track deployments
- **Least Privilege**: Only grant necessary permissions
- **Best Practice**: Industry standard for production

### Setup Steps

See **`docs/ci/DEPLOYMENT_USER_SETUP.md`** for detailed instructions.

**Quick Summary:**

1. Create a `deployer` user on the server
2. Add user to `docker` group
3. Set up SSH keys for the user
4. Move application directory or adjust permissions
5. Update GitHub Secrets (PROD_USER, PROD_PATH, PROD_SSH_KEY)
6. Disable root SSH login

### GitHub Secrets to Update

```
PROD_USER: root → deployer
PROD_PATH: /root/webapps/binary_system → /home/deployer/apps/binary_system
PROD_SSH_KEY: (new private key for deployer user)
```

---

## 4. Versioned Releases 🏷️

### How It Works

When you create a version tag (e.g., `v1.0.0`):

1. **Release workflow** (`release.yml`) triggers automatically
2. Creates a GitHub Release with changelog
3. Deploys the tagged version to production
4. Health checks verify deployment
5. Automatic rollback if deployment fails

### Creating a Release

#### Option 1: Create Tag Locally

```bash
# Tag the current commit
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push the tag to GitHub
git push origin v1.0.0
```

#### Option 2: Create Tag on GitHub

1. Go to **Releases** → **Create a new release**
2. Choose a tag (e.g., `v1.0.0`) or create a new one
3. Fill in release notes
4. Click **Publish release**

#### Option 3: Use Semantic Versioning

```bash
# Patch release (1.0.0 → 1.0.1)
git tag v1.0.1 && git push origin v1.0.1

# Minor release (1.0.0 → 1.1.0)
git tag v1.1.0 && git push origin v1.1.0

# Major release (1.0.0 → 2.0.0)
git tag v2.0.0 && git push origin v2.0.0
```

### Release Workflow Features

- ✅ **Automatic changelog generation** from git commits
- ✅ **GitHub Release creation** with notes
- ✅ **Production deployment** of tagged version
- ✅ **Health checks** and automatic rollback
- ✅ **Version tracking** in backup files

---

## Workflow Files

### 1. `deploy.yml` (Main Deployment)

**Triggers:**
- Push to `main` branch
- Manual trigger with rollback option

**Features:**
- Zero-downtime deployment
- Automatic rollback on failure
- Health checks

### 2. `release.yml` (Versioned Releases)

**Triggers:**
- Push of version tags (`v*.*.*`)

**Features:**
- GitHub Release creation
- Changelog generation
- Production deployment

### 3. `deploy-advanced.yml` (Alternative Strategy)

**Advanced features:**
- Blue-green deployment strategy
- Enhanced rollback mechanisms
- Version management

---

## Health Checks

The deployment process checks:

1. **Backend Health** - `http://localhost:8000/health`
2. **Frontend Health** - `http://localhost:3000`

**Health Check Process:**
- 30 attempts maximum
- 2 seconds between attempts
- Total timeout: ~60 seconds
- Fails if either service doesn't respond

---

## Backup and Recovery

### Backup Location

All deployment backups are stored in:
```
${DEPLOY_PATH}/.deploy-backup/
├── last-commit.txt        # Last successful commit hash
├── last-version.txt       # Last deployed version
├── last-deployment-time.txt  # Timestamp of last deployment
└── last-state.json        # Container state (if available)
```

### Recovery Process

If you need to manually recover:

```bash
# SSH into server
ssh deployer@your-server

# Navigate to app directory
cd /home/deployer/apps/binary_system

# Check last commit
cat .deploy-backup/last-commit.txt

# Restore to that commit
git fetch origin
git checkout $(cat .deploy-backup/last-commit.txt)

# Rebuild and restart
docker compose build --no-cache
docker compose up -d
```

---

## Best Practices

### 1. Testing Before Deployment

- ✅ Test changes locally first
- ✅ Run CI pipeline (automatically on push)
- ✅ Deploy to staging first (if available)
- ✅ Monitor deployment logs

### 2. Version Management

- ✅ Use semantic versioning (v1.0.0, v1.1.0, v2.0.0)
- ✅ Tag releases with meaningful messages
- ✅ Keep a changelog
- ✅ Document breaking changes

### 3. Monitoring

- ✅ Monitor application after deployment
- ✅ Check error logs
- ✅ Verify all features work
- ✅ Watch for performance issues

### 4. Rollback Strategy

- ✅ Always test rollback process
- ✅ Keep backups of critical data
- ✅ Document rollback procedures
- ✅ Test health checks regularly

---

## Troubleshooting

### Deployment Fails Health Checks

1. Check container logs: `docker compose logs`
2. Verify environment variables
3. Check database connections
4. Review application logs

### Rollback Not Working

1. Verify `.deploy-backup/last-commit.txt` exists
2. Check git history for the commit
3. Ensure Docker has permissions
4. Check disk space

### Zero-Downtime Not Working

1. Verify Docker Compose version (v2 recommended)
2. Check container networking
3. Ensure ports are available
4. Review health check endpoints

---

## Summary

You now have a production-ready deployment pipeline with:

- ✅ **Zero-downtime deployments** - No service interruption
- ✅ **Automatic rollback** - Safe deployments with recovery
- ✅ **Secure SSH** - Deployment user instead of root
- ✅ **Versioned releases** - Tag-based deployments

All features work together to provide a robust, secure, and reliable deployment process!
