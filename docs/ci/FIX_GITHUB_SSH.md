# Fix: GitHub Host Key Verification Failed

## Issue

The deployment script fails with:
```
Host key verification failed.
fatal: Could not read from remote repository.
```

This happens because the `deployer` user doesn't have GitHub's host key in their `known_hosts` file.

## Solution 1: Automatic Fix (Already Added)

I've updated all deployment workflows to automatically add GitHub's host key to the deployer user's `known_hosts` file. This should work automatically on the next deployment.

## Solution 2: Manual Fix on Server

If you want to fix it manually on the server, run these commands as the deployer user:

```bash
# Switch to deployer user
su - deployer

# Add GitHub to known_hosts
mkdir -p ~/.ssh
chmod 700 ~/.ssh
ssh-keyscan -H github.com >> ~/.ssh/known_hosts
chmod 600 ~/.ssh/known_hosts

# Test git access
cd /home/deployer/apps/binary_system  # or wherever your app is
git fetch origin
```

## Solution 3: Ensure Deployer Has GitHub SSH Key

The deployer user also needs an SSH key that can access your GitHub repository. You have a few options:

### Option A: Use Root's GitHub Key (Quick Fix)

```bash
# As root, copy the GitHub SSH key to deployer
cp /root/.ssh/id_ed25519 /home/deployer/.ssh/id_ed25519 2>/dev/null || \
cp /root/.ssh/id_rsa /home/deployer/.ssh/id_rsa 2>/dev/null || true

# Set permissions
chown deployer:deployer /home/deployer/.ssh/id_* 2>/dev/null || true
chmod 600 /home/deployer/.ssh/id_* 2>/dev/null || true
```

### Option B: Generate New Key for Deployer

```bash
# As deployer user
su - deployer
ssh-keygen -t ed25519 -C "deployer@github" -f ~/.ssh/id_ed25519

# Display public key
cat ~/.ssh/id_ed25519.pub

# Add this public key to GitHub:
# 1. Go to GitHub → Settings → SSH and GPG keys
# 2. Click "New SSH key"
# 3. Paste the public key
# 4. Save
```

### Option C: Use HTTPS Instead of SSH (Easiest)

If the repository is public or you use a personal access token:

```bash
# As deployer user
cd /home/deployer/apps/binary_system  # or your app path
git remote set-url origin https://github.com/mayanksahu17/binary_system.git

# Test
git fetch origin
```

## Verify Fix

After applying the fix, test from the server:

```bash
# As deployer user
su - deployer
cd /home/deployer/apps/binary_system  # or your app path
git fetch origin
```

If this works, the deployment should work too!

## Quick Commands Summary

Run these as root on your server:

```bash
# 1. Set up GitHub host key for deployer
su - deployer -c "mkdir -p ~/.ssh && chmod 700 ~/.ssh && ssh-keyscan -H github.com >> ~/.ssh/known_hosts && chmod 600 ~/.ssh/known_hosts"

# 2. Copy root's GitHub SSH key to deployer (if exists)
if [ -f /root/.ssh/id_ed25519 ]; then
  cp /root/.ssh/id_ed25519 /home/deployer/.ssh/id_ed25519
  chown deployer:deployer /home/deployer/.ssh/id_ed25519
  chmod 600 /home/deployer/.ssh/id_ed25519
fi

# 3. Test git access as deployer
su - deployer -c "cd /home/deployer/apps/binary_system && git fetch origin"
```

If step 3 works, your deployment should work!
