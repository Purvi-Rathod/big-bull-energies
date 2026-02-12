# Fix: Permission Denied on /tmp

## Issue

The deployment is failing with:
```
scp: dest open "/tmp/deploy.sh": Permission denied
```

This happens because the `deployer` user doesn't have write permissions to `/tmp/` on your server.

## Solution

I've updated all deployment workflows to use `~/deploy.sh` (in the deployer user's home directory) instead of `/tmp/deploy.sh`. This should work automatically.

## Alternative: Fix /tmp Permissions (Optional)

If you want to use `/tmp/` instead, you can fix permissions on the server:

```bash
# As root on server
chmod 1777 /tmp
# This allows all users to write to /tmp (standard Linux behavior)
```

However, using the home directory (`~/deploy.sh`) is safer and more secure.

## Verify Fix

After the workflow update, try deploying again. The script will now be copied to:
- `~/deploy.sh` (in deployer's home directory: `/home/deployer/deploy.sh`)

This location is writable by the deployer user and should work without any permission issues.
