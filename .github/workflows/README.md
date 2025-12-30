# GitHub Actions CI/CD Workflows

This directory contains CI/CD workflows for the Binary System application.

## Workflows

### 1. CI (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**What it does:**
- Lints and builds both client (Next.js) and server (Node.js/Express) projects
- Tests Docker image builds to ensure they compile correctly
- Uses matrix strategy to run builds in parallel for both projects
- Caches npm dependencies for faster builds

### 2. Deploy to Production (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Tags starting with `v*` (e.g., `v1.0.0`)
- Manual trigger via GitHub Actions UI (`workflow_dispatch`)

**What it does:**
- Connects to production server via SSH using the configured SSH key
- Pulls latest code from the `main` branch
- Stops existing Docker containers
- Rebuilds Docker images with `--no-cache` for clean builds
- Starts new containers
- Performs health checks on backend and frontend
- Cleans up unused Docker resources

## Required GitHub Secrets

Make sure you have the following secrets configured in your GitHub repository settings:

1. **PROD_SSH_KEY** - Private SSH key for connecting to your production server
   - Contents of your `github_deploy_key` file (private key)

2. **PROD_HOST** - Production server IP address or domain
   - Example: `199.188.204.202` or `yourdomain.com`

3. **PROD_USER** - SSH user for the production server
   - Example: `root` (as per your server setup)

4. **PROD_PATH** - Path to the application directory on the server
   - Example: `/root/webapps/binary_system` (as per your server setup)

## How to Configure Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of the secrets listed above

## Server Requirements

Your production server must have:
- Docker and Docker Compose installed
- Git installed
- SSH access configured
- The application directory already cloned from the repository
- `.env` file with all required environment variables
- SSH key added to authorized_keys (or the key configured in PROD_SSH_KEY should be authorized)

## Deployment Process

When code is pushed to `main`:

1. CI workflow runs first (if enabled)
2. Deploy workflow:
   - Connects to server via SSH
   - Navigates to `PROD_PATH`
   - Runs `git fetch origin && git reset --hard origin/main`
   - Stops containers: `docker compose down`
   - Builds images: `docker compose build --no-cache`
   - Starts containers: `docker compose up -d`
   - Waits 10 seconds for services to start
   - Checks container status
   - Performs health checks
   - Cleans up unused Docker images

## Manual Deployment

You can trigger a deployment manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Production** workflow
3. Click **Run workflow**
4. Select the branch (usually `main`)
5. Click **Run workflow**

## Troubleshooting

### SSH Connection Issues

**Most Common Issue:** `Permission denied (publickey, password)`

This means the SSH key authentication is failing. See **`.github/SSH_SETUP_GUIDE.md`** for detailed instructions.

Quick checklist:
- Verify `PROD_SSH_KEY` contains the **complete private key** (including `-----BEGIN` and `-----END` lines)
- Ensure the corresponding **public key** is in the server's `~/.ssh/authorized_keys`
- Check file permissions on server: `~/.ssh` should be `700`, `authorized_keys` should be `600`
- Verify `PROD_HOST`, `PROD_USER`, and `PROD_PATH` are correct
- Test SSH connection manually: `ssh -i ~/.ssh/github_deploy_key root@199.188.204.202`

### Build Failures
- Check the Actions logs for specific error messages
- Verify that `.env` file exists on the server with all required variables
- Ensure Docker and Docker Compose are installed on the server

### Deployment Fails After Code Pull
- Verify the server directory has the correct git remote configured
- Check that the server has access to pull from the repository
- Ensure `PROD_PATH` points to the correct directory

## Notes

- The deployment script uses `docker compose` (v2) by default, but falls back to `docker-compose` (v1) if needed
- Health checks may fail initially as services start - this is normal
- Old Docker images are automatically pruned after deployment to save space
- The workflow uses `git reset --hard` which will discard any local changes on the server
