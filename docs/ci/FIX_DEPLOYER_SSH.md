# Fix Deployer SSH Setup

You've created the deployer user and generated SSH keys, but they need to be set up for the deployer user. Follow these steps:

## Step 1: Set Up SSH Directory for Deployer User

```bash
# Create .ssh directory for deployer user
mkdir -p /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
chown deployer:deployer /home/deployer/.ssh
```

## Step 2: Copy Public Key to Deployer's authorized_keys

```bash
# Copy the public key you generated to deployer's authorized_keys
cat /root/.ssh/deployer_key.pub >> /home/deployer/.ssh/authorized_keys

# Set correct permissions
chmod 600 /home/deployer/.ssh/authorized_keys
chown deployer:deployer /home/deployer/.ssh/authorized_keys
```

## Step 3: Copy Private Key (for GitHub Secrets)

```bash
# Display the private key (copy this to GitHub Secrets)
cat /root/.ssh/deployer_key
```

The output should look like:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
...
-----END OPENSSH PRIVATE KEY-----
```

**Copy the ENTIRE output including the BEGIN and END lines.**

## Step 4: Test SSH Connection

From your **local machine**, test the connection:

```bash
# First, copy the private key from server to your local machine
# (or recreate it - see alternative below)

# Test connection
ssh -i ~/.ssh/deployer_key deployer@199.188.204.202
```

If you can't copy the key, you can generate a new key pair:

### Alternative: Generate Keys on Local Machine

```bash
# On your LOCAL machine
ssh-keygen -t ed25519 -C "deployer@github-actions" -f ~/.ssh/deployer_key

# Copy public key to server
ssh-copy-id -i ~/.ssh/deployer_key.pub deployer@199.188.204.202

# Or manually copy the public key content and add it on server:
cat ~/.ssh/deployer_key.pub
# Then on server:
echo "PASTE_PUBLIC_KEY_HERE" >> /home/deployer/.ssh/authorized_keys
chmod 600 /home/deployer/.ssh/authorized_keys
chown deployer:deployer /home/deployer/.ssh/authorized_keys
```

## Step 5: Verify Application Directory

Check if the application directory exists and has correct permissions:

```bash
# Check where the app is located
ls -la /home/deployer/apps/

# If it's at /root/webapps/binary_system, either:
# Option A: Move it (if not already moved)
mv /root/webapps/binary_system /home/deployer/apps/binary_system
chown -R deployer:deployer /home/deployer/apps

# Option B: Keep it at /root/webapps and give deployer access
chgrp -R deployer /root/webapps/binary_system
chmod -R g+rwx /root/webapps/binary_system
```

## Step 6: Test Deployer User Can Run Docker

```bash
# Switch to deployer user
su - deployer

# Test docker access
docker ps

# Test docker compose
docker compose version

# If these work, you're good!
exit
```

## Step 7: Update GitHub Secrets

Go to GitHub → Settings → Secrets and variables → Actions:

1. **PROD_USER**: Change from `root` to `deployer`
2. **PROD_PATH**: 
   - If moved: `/home/deployer/apps/binary_system`
   - If kept at root: `/root/webapps/binary_system`
3. **PROD_SSH_KEY**: Paste the **private key** (entire content from Step 3 or from `~/.ssh/deployer_key` on your local machine)

## Step 8: Test Deployment

1. Make a small commit and push to main
2. Watch GitHub Actions
3. Check if deployment succeeds

## Complete Commands Summary

Run these on your server as root:

```bash
# 1. Set up SSH directory
mkdir -p /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
chown deployer:deployer /home/deployer/.ssh

# 2. Add public key to authorized_keys
cat /root/.ssh/deployer_key.pub >> /home/deployer/.ssh/authorized_keys
chmod 600 /home/deployer/.ssh/authorized_keys
chown deployer:deployer /home/deployer/.ssh/authorized_keys

# 3. Verify application directory location
ls -la /home/deployer/apps/ 2>/dev/null || ls -la /root/webapps/

# 4. If app is at /root/webapps, give deployer access
chgrp -R deployer /root/webapps/binary_system 2>/dev/null || true
chmod -R g+rwx /root/webapps/binary_system 2>/dev/null || true

# 5. Test as deployer user
su - deployer -c "docker ps"
su - deployer -c "cd /home/deployer/apps/binary_system && ls -la" 2>/dev/null || \
su - deployer -c "cd /root/webapps/binary_system && ls -la"

# 6. Display private key for GitHub Secrets
echo "=== Copy this entire output to PROD_SSH_KEY in GitHub Secrets ==="
cat /root/.ssh/deployer_key
```

## Troubleshooting

### Still getting "Permission denied"?

1. **Check SSH key permissions on server:**
   ```bash
   ls -la /home/deployer/.ssh/
   # Should show:
   # drwx------ (700) for .ssh directory
   # -rw------- (600) for authorized_keys
   ```

2. **Check if public key is in authorized_keys:**
   ```bash
   cat /home/deployer/.ssh/authorized_keys
   # Should show your public key
   ```

3. **Test SSH connection from server itself:**
   ```bash
   ssh deployer@localhost
   # Should work without password
   ```

4. **Check SSH logs:**
   ```bash
   tail -f /var/log/auth.log
   # Try connecting and see what errors appear
   ```

5. **Verify deployer user exists:**
   ```bash
   id deployer
   # Should show user and groups
   ```
