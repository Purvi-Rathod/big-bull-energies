# SSH Key Setup Guide for GitHub Actions Deployment

This guide will help you set up SSH keys correctly for the GitHub Actions deployment workflow.

## Problem

If you're seeing `Permission denied (publickey, password)` errors, it means the SSH key in GitHub Secrets doesn't match what's authorized on your server.

## Solution

### Step 1: Generate SSH Key Pair (if you don't have one)

On your **local machine**:

```bash
# Generate a new SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key

# Or if ed25519 is not available, use RSA
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key
```

**Important:** Don't set a passphrase when prompted (press Enter twice), as GitHub Actions cannot handle passphrases automatically.

This creates two files:
- `~/.ssh/github_deploy_key` (private key) - **This goes to GitHub Secrets**
- `~/.ssh/github_deploy_key.pub` (public key) - **This goes to the server**

### Step 2: Add Public Key to Server

On your **production server**:

```bash
# Connect to your server
ssh root@199.188.204.202

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Copy the public key content from your local machine and add it to authorized_keys
# Option 1: Copy from your local machine
cat ~/.ssh/github_deploy_key.pub | ssh root@199.188.204.202 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Option 2: Manually add (from local machine, copy the output of this command):
cat ~/.ssh/github_deploy_key.pub

# Then on the server, add it manually:
nano ~/.ssh/authorized_keys
# Paste the public key content
# Save and exit (Ctrl+X, then Y, then Enter)

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Step 3: Add Private Key to GitHub Secrets

On your **local machine**, copy the private key:

```bash
# Display the private key (copy everything including headers)
cat ~/.ssh/github_deploy_key
```

The output should look like this:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn
...
(lots of encoded text)
...
-----END OPENSSH PRIVATE KEY-----
```

**OR for RSA keys:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

**Important:** Copy the **entire output** including the `-----BEGIN...-----` and `-----END...-----` lines.

### Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add or update the following secrets:

   **PROD_SSH_KEY:**
   - Paste the **complete private key** (including headers)
   - It should start with `-----BEGIN` and end with `-----END`

   **PROD_HOST:**
   - Value: `199.188.204.202` (or your server IP/domain)

   **PROD_USER:**
   - Value: `root` (based on your server setup)

   **PROD_PATH:**
   - Value: `/root/webapps/binary_system` (based on your pwd output)

### Step 5: Test SSH Connection

Test from your local machine first:

```bash
# Test SSH connection using the key
ssh -i ~/.ssh/github_deploy_key root@199.188.204.202 "echo 'Connection successful'"
```

If this works, GitHub Actions should work too.

### Step 6: Test GitHub Actions

1. Make a small change and push to `main` branch
2. Go to **Actions** tab in GitHub
3. Watch the deployment workflow
4. Check the logs if it fails

## Troubleshooting

### Still getting "Permission denied"?

1. **Verify the public key is on the server:**
   ```bash
   ssh root@199.188.204.202
   cat ~/.ssh/authorized_keys
   # You should see your public key here
   ```

2. **Check file permissions on server:**
   ```bash
   ls -la ~/.ssh/
   # Should show:
   # drwx------ (700) for .ssh directory
   # -rw------- (600) for authorized_keys
   ```

3. **Verify the private key format in GitHub Secrets:**
   - Must include BEGIN and END lines
   - No extra whitespace at start/end
   - Should be exactly as generated

4. **Test with verbose SSH:**
   ```bash
   ssh -vvv -i ~/.ssh/github_deploy_key root@199.188.204.202
   ```
   Look for authentication errors in the output.

### Alternative: Use Existing Server SSH Key

If you already have an SSH key set up on the server that works:

1. Find the existing private key on your local machine or server
2. Copy the private key to GitHub Secrets as `PROD_SSH_KEY`
3. Ensure the corresponding public key is in `~/.ssh/authorized_keys` on the server

### Security Note

- Never commit SSH private keys to the repository
- Rotate keys periodically
- Use different keys for different environments if possible
- The private key in GitHub Secrets is encrypted by GitHub
