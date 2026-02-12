# 🚨 IMMEDIATE ACTION REQUIRED - Security Breach Response

## ⚡ CRITICAL: Your Application Was Compromised

A cryptocurrency miner (`systemdd-worker`) was found running on your server, spawned from your Next.js application process. This indicates a **Remote Code Execution (RCE) vulnerability** was exploited.

---

## ✅ SECURITY FIXES APPLIED

I've patched the following **critical vulnerabilities**:

### 1. **Public Admin Signup** - DISABLED ✅
- **Before:** Anyone could create admin accounts at `/api/v1/admin/signup`
- **After:** Route disabled - admin accounts must be created securely
- **File:** `server/src/routes/admin.routes.ts`

### 2. **Public Password Change** - SECURED ✅
- **Before:** `/api/v1/admin/users/:userId/password` was public
- **After:** Now requires admin authentication
- **File:** `server/src/routes/admin.routes.ts`

### 3. **Docker Security Hardening** - IMPLEMENTED ✅
- **Before:** Containers running as root, full capabilities, no restrictions
- **After:** 
  - Non-root user execution (`nodejs` user)
  - Read-only root filesystem
  - All capabilities dropped (except `NET_BIND_SERVICE`)
  - No privilege escalation (`no-new-privileges`)
  - Secure temporary filesystems (`noexec,nosuid`)
- **Files:** `server/Dockerfile`, `docker-compose.yml`

### 4. **Dangerous Code Removed** - CLEANED ✅
- Removed `execSync` import from `server/src/index.ts`
- Eliminates potential command injection vector

---

## 🔥 IMMEDIATE ACTIONS YOU MUST TAKE NOW

### Step 1: Kill the Miner Process (DO THIS FIRST!)

```bash
# SSH into your server
ssh user@your-server

# Kill the miner process
kill -9 3724659
pkill -f systemdd-worker

# Verify it's gone
ps aux | grep systemdd
# Should return nothing

# Check for zombie processes
ps aux | grep -i zombie
# If you see many zombies, reboot the server
```

### Step 2: Stop All Containers

```bash
cd /path/to/binary_system

# Stop containers
docker stop binary-system-backend binary-system-frontend

# Remove containers
docker rm binary-system-backend binary-system-frontend
```

### Step 3: Audit Admin Accounts

```bash
# Connect to MongoDB
mongosh "your-mongodb-connection-string"

# Check admin accounts
use your-database-name
db.admins.find({})

# Look for suspicious accounts:
# - Recently created accounts
# - Accounts with unusual emails
# - Multiple admin accounts you didn't create

# Delete suspicious accounts (replace OBJECT_ID)
db.admins.deleteOne({ _id: ObjectId("suspicious-id") })
```

### Step 4: Rotate All Credentials

**CRITICAL:** Change these immediately:

1. **JWT Secrets:**
   ```bash
   # Generate new secrets
   openssl rand -base64 32  # For ACCESS_TOKEN_SECRET
   openssl rand -base64 32  # For REFRESH_TOKEN_SECRET
   openssl rand -base64 32  # For ADMIN_JWT_SECRET
   ```

2. **Database Password:**
   - Change MongoDB password
   - Update connection string in `.env`

3. **Admin Passwords:**
   - Change all admin account passwords
   - Use strong, unique passwords

4. **API Keys:**
   - Rotate NOWPayments API key
   - Rotate any other API keys

### Step 5: Rebuild Containers with Security Fixes

```bash
cd /path/to/binary_system

# Pull latest code with security fixes
git pull origin main  # or your branch

# CRITICAL: Rebuild frontend first (Next.js CVE-2025-66478 fix)
docker compose build --no-cache frontend

# Rebuild backend (security hardening)
docker compose build --no-cache backend

# Start containers
docker compose up -d

# Verify they're running
docker ps

# Verify Next.js version is patched (should show 16.0.10)
docker exec binary-system-frontend npm list next

# Check logs for errors
docker logs binary-system-backend
docker logs binary-system-frontend
```

**⚠️ IMPORTANT:** The Next.js vulnerability (CVE-2025-66478) was CRITICAL. Ensure frontend is rebuilt with Next.js 16.0.10.

### Step 6: Verify Security Fixes

```bash
# Check containers are running as non-root
docker exec binary-system-backend whoami
# Should output: nodejs (not root)

# Check read-only filesystem
docker exec binary-system-backend touch /test.txt
# Should fail with "Read-only file system"

# Check capabilities
docker inspect binary-system-backend | grep -i cap
# Should show dropped capabilities
```

---

## 🔍 INVESTIGATION CHECKLIST

### Check for Additional Compromises:

```bash
# 1. Check for modified files
docker diff binary-system-backend
docker diff binary-system-frontend

# 2. Check for suspicious processes
ps auxf | grep -E "node|npm|next"

# 3. Check network connections
netstat -tulpn | grep -E "8000|3000"

# 4. Check Docker logs for suspicious activity
docker logs binary-system-backend | grep -iE "error|exec|spawn|upload|admin"
docker logs binary-system-frontend | grep -iE "error|exec|spawn"

# 5. Check for suspicious files
find /tmp -name "*systemdd*" 2>/dev/null
find /tmp -name "*.kok" 2>/dev/null
find / -name "*.sh" -newer /tmp 2>/dev/null | head -20

# 6. Check cron jobs
crontab -l
cat /etc/crontab
ls -la /etc/cron.d/
```

### Review Access Logs:

```bash
# Check for admin signup attempts
docker logs binary-system-backend | grep -i "admin.*signup" | tail -50

# Check for password change attempts
docker logs binary-system-backend | grep -i "password" | tail -50

# Check for file uploads
docker logs binary-system-backend | grep -i "upload" | tail -50

# Check for suspicious API calls
docker logs binary-system-backend | grep -E "POST|PUT|DELETE" | tail -100
```

---

## 🛡️ PREVENTION MEASURES

### 1. Enable Monitoring

Set up alerts for:
- Failed admin login attempts (> 5 in 5 minutes)
- Admin account creation
- Unusual CPU usage (> 80% for > 5 minutes)
- Process spawns from Node.js
- File uploads to admin endpoints

### 2. Regular Security Audits

```bash
# Weekly security checks
npm audit --production
docker scan binary-system-backend
docker scan binary-system-frontend

# Check for suspicious processes
ps aux | grep -vE "^USER|^root|^nodejs" | awk '{print $1, $11}' | sort | uniq -c
```

### 3. Backup Strategy

```bash
# Daily backups before deploying changes
mongodump --uri="your-mongodb-uri" --out=/backups/$(date +%Y%m%d)
```

---

## 📋 POST-INCIDENT CHECKLIST

- [ ] Miner process killed
- [ ] Containers stopped and removed
- [ ] Suspicious admin accounts deleted
- [ ] All credentials rotated
- [ ] Containers rebuilt with security fixes
- [ ] Security fixes verified
- [ ] Monitoring enabled
- [ ] Team notified
- [ ] Incident documented
- [ ] Security audit scheduled

---

## 🆘 IF PROBLEMS PERSIST

If the miner comes back or you see other suspicious activity:

1. **Immediately:**
   - Disconnect server from network
   - Take snapshot/backup
   - Document all findings

2. **Investigation:**
   - Check if attacker left backdoors
   - Review all recent code changes
   - Check for database modifications
   - Look for new cron jobs or services

3. **Recovery:**
   - Consider rebuilding server from scratch
   - Restore from clean backup
   - Re-deploy with all security fixes

---

## 📞 SUPPORT RESOURCES

- **Security Documentation:** See `SECURITY_FIXES.md`
- **Docker Security:** https://docs.docker.com/engine/security/
- **Node.js Security:** https://nodejs.org/en/docs/guides/security/

---

**⚠️ REMEMBER:** The vulnerability that allowed this breach has been patched, but you MUST:
1. Kill the miner immediately
2. Rotate all credentials
3. Rebuild containers
4. Monitor for reinfection

**The attacker may have left backdoors - thorough investigation is required!**

---

**Last Updated:** $(date)
**Status:** 🔴 CRITICAL - Immediate action required
