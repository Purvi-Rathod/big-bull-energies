# Deployment User Setup Guide

This guide explains how to create a dedicated deployment user instead of using root, which is more secure and follows best practices.

## Why Use a Deployment User?

- **Security**: Root access is dangerous if compromised
- **Audit Trail**: Easier to track who did what
- **Least Privilege**: Only grant necessary permissions
- **SSH Best Practices**: Disable root SSH login

## Step 1: Create Deployment User on Server

SSH into your server as root:

```bash
ssh root@199.188.204.202
```

Create a new user for deployments:

```bash
# Create user
adduser deployer

# Add user to docker group (so they can run docker without sudo)
usermod -aG docker deployer

# Add user to sudoers for system operations (optional, if needed)
# This allows running commands with sudo when needed
echo "deployer ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose, /usr/local/bin/docker-compose" | sudo tee /etc/sudoers.d/deployer
```

## Step 2: Set Up SSH Key for Deployment User

On your **local machine**, if you don't already have an SSH key:

```bash
ssh-keygen -t ed25519 -C "deployer@github-actions" -f ~/.ssh/deployer_key
```

Copy the **public key** to the server:

```bash
# From your local machine
ssh-copy-id -i ~/.ssh/deployer_key.pub deployer@199.188.204.202

# OR manually:
cat ~/.ssh/deployer_key.pub | ssh root@199.188.204.202 "mkdir -p /home/deployer/.ssh && cat >> /home/deployer/.ssh/authorized_keys && chown -R deployer:deployer /home/deployer/.ssh && chmod 700 /home/deployer/.ssh && chmod 600 /home/deployer/.ssh/authorized_keys"
```

## Step 3: Set Up Directory Permissions

Ensure the deployment user can access the application directory:

```bash
# On the server, as root
# Option 1: Change ownership (if deployer should own the directory)
chown -R deployer:deployer /root/webapps/binary_system

# Option 2: Add deployer to a group and give group permissions (recommended)
# Create a group
groupadd app-deploy
usermod -aG app-deploy deployer
chgrp -R app-deploy /root/webapps/binary_system
chmod -R g+rwx /root/webapps/binary_system

# Option 3: Move to deployer's home directory (cleanest)
# Move the application
mv /root/webapps/binary_system /home/deployer/apps/binary_system
mkdir -p /home/deployer/apps
chown -R deployer:deployer /home/deployer/apps
```

**Recommended**: Use Option 3 (move to `/home/deployer/apps/binary_system`) for cleanest setup.

## Step 4: Test Deployment User Access

Test that the deployment user can:
1. SSH into the server
2. Access the application directory
3. Run Docker commands

```bash
# From your local machine
ssh -i deployer_key deployer@199.188.204.202

# On the server, test docker access
docker ps
docker compose version

# Test access to app directory
cd /home/deployer/apps/binary_system  # or wherever you moved it
ls -la
```

## Step 5: Disable Root SSH Login (After Verification)

**⚠️ IMPORTANT**: Only do this AFTER you've verified the deployment user works!

Edit SSH configuration:

```bash
# On the server, as root
nano /etc/ssh/sshd_config
```

Find and modify these lines:

```bash
# Change from:
# PermitRootLogin yes

# To:
PermitRootLogin no

# Also ensure password authentication is disabled (more secure):
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH service:

```bash
# Test configuration first
sshd -t

# If test passes, restart SSH
systemctl restart sshd

# Keep a root session open in another terminal to verify it still works!
```

## Step 6: Update GitHub Secrets

Update your GitHub repository secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**

2. Update **PROD_USER**:
   - Old: `root`
   - New: `deployer`

3. Update **PROD_PATH** (if you moved the directory):
   - Old: `/root/webapps/binary_system`
   - New: `/home/deployer/apps/binary_system` (or wherever you moved it)

4. Update **PROD_SSH_KEY**:
   - Copy the **private key** content from `~/.ssh/deployer_key` on your local machine
   - Replace the entire `PROD_SSH_KEY` secret with this new key

## Step 7: Update Deployment Scripts

If you're using custom deployment scripts, ensure they use the new user and path.

## Step 8: Verify Deployment Works

1. Make a small change and push to `main`
2. Check GitHub Actions deployment
3. Verify the application is running correctly

## Troubleshooting

### "Permission denied" errors

- Check file permissions: `ls -la /home/deployer/apps/binary_system`
- Verify deployer is in docker group: `groups deployer`
- Check SSH key permissions: `chmod 600 ~/.ssh/deployer_key` (on local machine)

### Docker permission errors

- Ensure user is in docker group: `usermod -aG docker deployer`
- User may need to log out and back in for group changes to take effect
- Verify with: `docker ps` (should work without sudo)

### Can't access application directory

- Check ownership: `ls -la /home/deployer/apps/`
- Adjust permissions: `chown -R deployer:deployer /home/deployer/apps/binary_system`

### Root SSH disabled and locked out

If you accidentally lock yourself out:

1. Access the server via console/KVM (if available)
2. Or use your hosting provider's rescue mode/console
3. Re-enable root login temporarily: `PermitRootLogin yes` in `/etc/ssh/sshd_config`

## Security Best Practices

1. **Use SSH keys only** - Disable password authentication
2. **Disable root login** - Use sudo for privileged operations
3. **Regular key rotation** - Rotate SSH keys periodically
4. **Monitor access** - Check `/var/log/auth.log` for SSH access
5. **Fail2ban** - Install fail2ban to prevent brute force attacks
6. **Firewall** - Use UFW or iptables to restrict SSH access

## Optional: Install Fail2ban

```bash
# Install fail2ban
apt-get update
apt-get install -y fail2ban

# Configure fail2ban for SSH
systemctl enable fail2ban
systemctl start fail2ban

# Check status
fail2ban-client status sshd
```

## Summary

After completing these steps:
- ✅ Deployment user `deployer` created
- ✅ SSH key authentication configured
- ✅ Docker access granted via group membership
- ✅ Application directory accessible
- ✅ Root SSH disabled (more secure)
- ✅ GitHub Actions updated with new credentials

Your deployment pipeline is now more secure!
