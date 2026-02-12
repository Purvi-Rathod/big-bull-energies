# Quick Fix: Deployer SSH Setup

Run these commands on your server **as root** to fix the SSH setup:

## Commands to Run

```bash
# 1. Create SSH directory for deployer user
mkdir -p /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
chown deployer:deployer /home/deployer/.ssh

# 2. Copy the public key to deployer's authorized_keys
cat /root/.ssh/deployer_key.pub >> /home/deployer/.ssh/authorized_keys

# 3. Set correct permissions for authorized_keys
chmod 600 /home/deployer/.ssh/authorized_keys
chown deployer:deployer /home/deployer/.ssh/authorized_keys

# 4. Verify the public key was added
cat /home/deployer/.ssh/authorized_keys

# 5. Display the private key (copy this to GitHub Secrets PROD_SSH_KEY)
echo "=== Copy everything below (including BEGIN and END lines) ==="
cat /root/.ssh/deployer_key

# 6. Test deployer user can access Docker
su - deployer -c "docker ps"

# 7. Check where your app is located
ls -la /home/deployer/apps/binary_system 2>/dev/null || echo "App not at /home/deployer/apps/"
ls -la /root/webapps/binary_system 2>/dev/null || echo "App not at /root/webapps/"

# 8. If app is at /root/webapps, give deployer access
if [ -d "/root/webapps/binary_system" ]; then
  chgrp -R deployer /root/webapps/binary_system
  chmod -R g+rwx /root/webapps/binary_system
  echo "✅ Granted deployer access to /root/webapps/binary_system"
fi
```

## Update GitHub Secrets

After running the above commands:

1. Go to GitHub → Your Repo → Settings → Secrets and variables → Actions

2. Update these secrets:
   - **PROD_USER**: `root` → `deployer`
   - **PROD_PATH**: 
     - If moved: `/home/deployer/apps/binary_system`
     - If at root: `/root/webapps/binary_system`
   - **PROD_SSH_KEY**: Paste the **entire private key** output from step 5 above (including `-----BEGIN` and `-----END` lines)

3. Save the secrets

## Test Connection

From your local machine:

```bash
# If you have the private key locally
ssh -i deployer_key deployer@199.188.204.202

# Or test from server
ssh deployer@localhost
```

If this works, GitHub Actions should work too!
