# High-Performance Deployment Guide for Learn & Grow
# Production Optimization for Low-Resource VPS (1-2GB RAM)

## 📋 Table of Contents
1. [Nginx Setup](#nginx-setup)
2. [PM2 Cluster Configuration](#pm2-cluster-configuration) 
3. [MongoDB Optimization](#mongodb-optimization)
4. [System Tuning](#system-tuning)
5. [Monitoring & Debugging](#monitoring--debugging)
6. [Performance Benchmarks](#performance-benchmarks)

---

## 🚀 NGINX SETUP

### 1. Install Nginx with Brotli Support

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Nginx from Ubuntu repos (includes brotli)
sudo apt-get install -y nginx

# Verify Brotli is enabled
nginx -V 2>&1 | grep -i brotli
```

### 2. Deploy Optimized Configuration

```bash
# Backup current config
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup

# Copy new optimized config
sudo cp learnandgrow-optimized.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/learnandgrow-optimized.conf /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Create cache directories
sudo mkdir -p /var/cache/nginx/production
sudo mkdir -p /var/cache/nginx/static
sudo mkdir -p /var/www/learn-grow-errors
sudo chown -R www-data:www-data /var/cache/nginx
sudo chown -R www-data:www-data /var/www/learn-grow-errors

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Enable on startup
sudo systemctl enable nginx
```

### 3. Create Error Pages

```bash
sudo tee /var/www/learn-grow-errors/maintenance.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head>
  <title>Maintenance</title>
  <style>
    body { font-family: Arial; text-align: center; padding-top: 50px; }
    h1 { color: #333; }
    p { color: #666; font-size: 18px; }
  </style>
</head>
<body>
  <h1>🔧 Maintenance in Progress</h1>
  <p>We're updating our systems. We'll be back shortly!</p>
  <p style="font-size: 14px; color: #999;">Check back in 15 minutes</p>
</body>
</html>
EOF

sudo tee /var/www/learn-grow-errors/not-found.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head>
  <title>404 Not Found</title>
  <style>
    body { font-family: Arial; text-align: center; padding-top: 50px; }
    h1 { color: #333; font-size: 48px; }
    p { color: #666; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>Page not found</p>
  <a href="/">Back to home</a>
</body>
</html>
EOF

sudo chown www-data:www-data /var/www/learn-grow-errors/*.html
```

---

## 🔧 PM2 CLUSTER CONFIGURATION

### 1. Install PM2 Globally

```bash
sudo npm install -g pm2

# Make PM2 startup script persistent
pm2 startup
pm2 save
```

### 2. Deploy with Cluster Mode

```bash
# Navigate to project root
cd /root/learn-grow-fullstack

# Start all apps in ecosystem
pm2 start ecosystem.config.js

# Monitor in real-time
pm2 monit

# View logs
pm2 logs

# View specific app logs
pm2 logs next-app
pm2 logs backend-api
```

### 3. Zero-Downtime Reloads

```bash
# Reload frontend (graceful restart)
pm2 reload next-app

# Restart all
pm2 restart all

# Check status
pm2 status
```

---

## 📊 PERFORMANCE TUNING

### 1. Next.js Build Optimization

```bash
cd /root/learn-grow

# Build for production (standalone)
npm run build

# Enable standalone output in next.config.js:
# output: 'standalone'

# This reduces bundle size and uses single server process
```

Update `next.config.js`:
```javascript
module.exports = {
  output: 'standalone',
  compress: true,
  swcMinify: true,  // Use SWC for faster minification
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  
  // Enable compression
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
};
```

### 2. MongoDB Connection Pooling

Update `grow-backend/src/database/mongoose.ts`:
```typescript
export const connectDB = async (mongoUri?: string) => {
  try {
    const uri = mongoUri || process.env.MONGODB_URI || MONGODB_URI;
    
    await mongoose.connect(uri, {
      maxPoolSize: 10,           // Connection pool size
      minPoolSize: 5,
      maxIdleTimeMS: 45000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority',
    });

    console.log("✅ MongoDB Connected");
  } catch (error: any) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
};
```

### 3. Backend API Optimization

```typescript
// Add compression middleware (grow-backend/src/app.ts)
import compression from 'compression';

// Use brotli compression
app.use(compression({ 
  brotli: { enabled: true, zlib: {} } 
}));

// Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

---

## 🔒 SECURITY CHECKLIST

```bash
# 1. Enable UFW Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 2. Install Fail2Ban
sudo apt-get install -y fail2ban

# 3. Generate SSL Certificate (Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d learnandgrow.io -d www.learnandgrow.io

# 4. Set up automatic renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 5. Update Nginx for HTTPS (uncomment in config)
# Then reload:
sudo systemctl reload nginx
```

---

## 📈 MONITORING & DEBUGGING

### 1. Monitor Cache Performance

```bash
# Watch Nginx cache hit ratio in real-time
watch -n 1 'curl -s http://127.0.0.1/nginx_status'

# Check cache directory
du -sh /var/cache/nginx/*

# Clear cache if needed
sudo rm -rf /var/cache/nginx/production/*
sudo rm -rf /var/cache/nginx/static/*
```

### 2. Monitor PM2 Processes

```bash
# Real-time monitoring dashboard
pm2 monit

# Check memory usage
pm2 list

# View process details
pm2 describe next-app
pm2 describe backend-api

# Check event logs
pm2 events
```

### 3. Check System Resources

```bash
# Monitor CPU, RAM, Disk
htop

# Check Nginx connections
ss -tun | grep -E ":(80|443|3000|5000)" | wc -l

# Check open files/connections (Nginx limits)
ulimit -n

# Increase file descriptors if needed
echo "* soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65535" | sudo tee -a /etc/security/limits.conf
```

### 4. Analyze Nginx Logs

```bash
# Real-time access log monitoring
sudo tail -f /var/log/nginx/learnandgrow_access.log

# Parse cache hit status
sudo grep "X-Cache-Status" /var/log/nginx/learnandgrow_access.log | sort | uniq -c

# Find slow requests (>1 second)
sudo awk '$NF > 1' /var/log/nginx/learnandgrow_access.log

# Monitor error logs
sudo tail -f /var/log/nginx/learnandgrow_error.log
```

---

## 🎯 LOAD TEST & OPTIMIZATION

### Before Optimization (Current State)
```
Concurrent Users: 500
CPU Usage: 95%
Response Time: 2.0+ seconds
Data Transfer: 3.6GB in 90 seconds
```

### After Optimization (Expected Results)

```bash
# Expected improvements:
# CPU Usage: 95% → 40-50% (with cluster mode + caching)
# Response Time: 2.0s → 0.3-0.5s (with cache hits)
# Data Transfer: 3.6GB → 800MB-1.2GB (with compression + caching)
# Cache Hit Rate: 60-80% for homepage and popular pages
```

### Load Testing Commands

```bash
# Install Apache Bench
sudo apt-get install -y apache2-utils

# Simple load test (100 concurrent, 1000 requests)
ab -n 1000 -c 100 http://learnandgrow.io/

# Advanced: Use wrk2 for better results
curl -L --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
git clone https://github.com/giltene/wrk2.git
cd wrk2 && make
./wrk -t4 -c100 -d30s http://learnandgrow.io/
```

---

## 📋 DEPLOYMENT CHECKLIST

- [ ] Nginx installed with Brotli support
- [ ] Cache directories created and permissions set
- [ ] Configuration tested with `nginx -t`
- [ ] Nginx restarted and enabled on boot
- [ ] PM2 ecosystem configured with cluster mode
- [ ] Next.js rebuilt with standalone output
- [ ] MongoDB connection pooling configured
- [ ] Error pages created and working
- [ ] SSL/TLS certificate installed
- [ ] Security headers verified
- [ ] Firewall and Fail2Ban configured
- [ ] Monitoring tools set up
- [ ] Load test performed
- [ ] Cache performance verified

---

## 🔧 TROUBLESHOOTING

### Issue: High CPU despite optimization

**Solution:**
```bash
# Check what's consuming CPU
top -o %CPU

# Profile Node.js app
NODE_OPTIONS="--prof" pm2 start ecosystem.config.js

# Analyze profile
node --prof-process isolate-*.log > profile.txt
```

### Issue: Cache not working

**Check:**
```bash
# Monitor cache directory size
watch -n 2 'du -sh /var/cache/nginx/*'

# Check Nginx cache status header
curl -i http://learnandgrow.io/ | grep X-Cache-Status

# Should show: HIT, MISS, or REVALIDATED
```

### Issue: MongoDB connection timeouts

**Solution:**
```bash
# Increase connection pool in mongoose.ts
maxPoolSize: 15
maxIdleTimeMS: 60000

# Restart backend
pm2 restart backend-api
```

---

## 📞 SUPPORT & RESOURCES

- Nginx Docs: https://nginx.org/en/docs/
- PM2 Docs: https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
- Next.js Performance: https://nextjs.org/docs/advanced-features/measuring-performance
- MongoDB Connection: https://docs.mongodb.com/drivers/node/current/

