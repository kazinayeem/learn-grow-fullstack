# HTTPS Setup Guide for Backend (EC2)

## Problem
Your Vercel frontend (HTTPS) cannot make requests to HTTP backend - browsers block mixed content.

## Solution Options

### Option 1: Use Nginx as Reverse Proxy with SSL (Recommended)

1. **Install Certbot and Nginx**
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

2. **Get a Domain Name**
   - Point your domain (e.g., `api.yourdomain.com`) to your EC2 IP: `174.129.111.162`

3. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/api
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Enable the site**
```bash
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **Get SSL Certificate**
```bash
sudo certbot --nginx -d api.yourdomain.com
```

6. **Update Frontend Environment Variable**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Option 2: Use Cloudflare Tunnel (Free, No Domain Required)

1. **Install Cloudflare Tunnel**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

2. **Authenticate**
```bash
cloudflared tunnel login
```

3. **Create Tunnel**
```bash
cloudflared tunnel create learn-grow-api
```

4. **Configure Tunnel**
Create `~/.cloudflared/config.yml`:
```yaml
tunnel: <TUNNEL-ID>
credentials-file: /home/ubuntu/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: your-tunnel.trycloudflare.com
    service: http://localhost:5000
  - service: http_status:404
```

5. **Run Tunnel**
```bash
cloudflared tunnel run learn-grow-api
```

### Option 3: Self-Signed Certificate (Testing Only - NOT for Production)

**⚠️ Warning: Browsers will show security warnings**

1. **Generate Certificate**
```bash
cd grow-backend
mkdir ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes
```

2. **Update app.ts to use HTTPS**
```typescript
import https from 'https';
import fs from 'fs';

// After creating Express app
const server = https.createServer({
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
}, app);

server.listen(5000, () => {
  console.log('HTTPS Server running on port 5000');
});
```

## Recommended Approach

**For Production: Use Option 1 (Nginx + Let's Encrypt)**
- Free SSL certificates
- Auto-renewal
- Production-ready
- Best performance

## Quick Fix (Temporary)

If you need immediate access while setting up HTTPS:

1. **Update Vercel Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Set: `NEXT_PUBLIC_API_URL=https://174.129.111.162:5000/api`

2. **Note:** This requires your backend to have SSL configured first.

## After Setup

1. Redeploy your Vercel app
2. Test API calls work without mixed content errors
3. Check browser console - no more HTTPS warnings

## Current Configuration

✅ CORS origins updated to include all Vercel URLs
✅ Frontend configured to use HTTPS API URL
✅ Mobile navbar logout button added
⚠️ Backend needs SSL certificate setup

## Support

If you encounter issues:
1. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
2. Check backend logs: `pm2 logs`
3. Test SSL: `curl -I https://api.yourdomain.com`
