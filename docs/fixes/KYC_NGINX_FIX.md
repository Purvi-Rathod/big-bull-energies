# KYC File Upload - Nginx Configuration Fix

## Problem
The KYC file upload is failing with **413 Request Entity Too Large** error because nginx has a default `client_max_body_size` limit of 1MB, but the KYC document is 1.6MB.

## Solution
Update your nginx configuration to allow larger file uploads.

### Step 1: Update Nginx Configuration

SSH into your server and edit the nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/api.crownbankers.com
# or
sudo nano /etc/nginx/nginx.conf
```

### Step 2: Add/Update These Settings

Add or update the following in your nginx server block:

```nginx
server {
    listen 443 ssl http2;
    server_name api.crownbankers.com;
    
    # IMPORTANT: Increase max body size for file uploads
    # Set to 15MB to allow for 10MB KYC documents + overhead
    client_max_body_size 15M;
    
    # Increase timeouts for file uploads
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;
    
    location /api/ {
        proxy_pass http://localhost:8000;
        
        # Increase buffer sizes for file uploads
        proxy_buffering off;
        proxy_request_buffering off;
        
        # ... rest of your proxy settings
    }
}
```

### Step 3: Test and Reload Nginx

```bash
# Test the configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

### Step 4: Verify the Fix

After updating nginx, try the KYC upload again:

```bash
curl -X POST https://api.crownbankers.com/api/v1/user/kyc \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "document=@CTA1.png" \
  -F "documentType=id_card" \
  -F "dateOfBirth=1990-01-01"
```

## Alternative: Compress Image Before Upload

If you can't update nginx immediately, you can compress the image:

```bash
# Using ImageMagick (if installed)
convert CTA1.png -quality 85 -resize 1024x1024 CTA1_compressed.png

# Or using sips (macOS)
sips -Z 1024 -s format jpeg CTA1.png --out CTA1_compressed.jpg
```

## Current Limits

- **Nginx default**: 1MB (needs to be increased)
- **Multer limit**: 10MB (already configured)
- **Cloudinary**: No specific limit, but larger files take longer

## Recommended Settings

- `client_max_body_size`: 15M (allows 10MB files + overhead)
- Timeouts: 600 seconds (for large file uploads)
