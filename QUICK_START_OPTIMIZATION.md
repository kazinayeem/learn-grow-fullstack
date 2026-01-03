# 🚀 Quick Start - Performance Optimization

This guide will help you implement performance optimizations in **under 2 hours**.

## Prerequisites

- SSH access to EC2 instance
- Root/sudo privileges
- Node.js and npm installed
- Project running on EC2

## Step 1: Backend Performance (30 minutes)

### 1.1 Install Dependencies

```bash
cd ~/learn-grow-fullstack/grow-backend
npm install compression ioredis express-rate-limit response-time @types/compression --save
```

### 1.2 Install Redis

```bash
sudo apt update
sudo apt install redis-server -y
sudo systemctl start redis-server
sudo systemctl enable redis-server
redis-cli ping  # Should return PONG
```

### 1.3 Build Backend

```bash
cd ~/learn-grow-fullstack/grow-backend
npm run build
```

### 1.4 Create Database Indexes

```bash
npx tsx src/scripts/createIndexes.ts
```

**Expected Output:**
```
✅ All indexes created successfully
📊 users indexes: 7
📊 courses indexes: 8
...
```

## Step 2: Frontend Optimization (15 minutes)

### 2.1 Update Next.js Config

The optimized `next.config.js` is already in your project at:
`learn-grow/next.config.js`

Review and ensure it has:
- `swcMinify: true`
- `compress: true`
- Image optimization settings

### 2.2 Build Frontend

```bash
cd ~/learn-grow-fullstack/learn-grow
npm run build
```

**Check output for:**
- Page sizes (should show gzip sizes)
- Static/Dynamic pages identified

## Step 3: PM2 Cluster Mode (15 minutes)

### 3.1 Install PM2

```bash
sudo npm install -g pm2
```

### 3.2 Stop Current Processes

```bash
# If you're running manually, stop them
# Check what's running
pm2 list
pm2 stop all
pm2 delete all
```

### 3.3 Start with Cluster Mode

```bash
cd ~/learn-grow-fullstack
pm2 start ecosystem.config.js
```

### 3.4 Save Configuration

```bash
pm2 save
pm2 startup  # Follow the command it gives you
```

### 3.5 Verify

```bash
pm2 status
pm2 monit  # Real-time monitoring
```

**Expected:**
- `backend-api`: Multiple instances (based on CPU cores)
- `frontend-nextjs`: 2 instances
- All should show "online" status

## Step 4: Nginx Setup (20 minutes)

### 4.1 Install Nginx

```bash
sudo apt install nginx -y
```

### 4.2 Configure Nginx

```bash
# Copy the config file
sudo cp ~/learn-grow-fullstack/nginx-config.conf /etc/nginx/sites-available/learngrow

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/learngrow /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
```

### 4.3 Start Nginx

```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

### 4.4 Update Firewall (if needed)

```bash
sudo ufw allow 80
sudo ufw allow 443
```

## Step 5: System Optimization (15 minutes)

### 5.1 Run Optimization Script

```bash
cd ~/learn-grow-fullstack
chmod +x ec2-optimize.sh
./ec2-optimize.sh
```

### 5.2 Reboot (Optional but Recommended)

```bash
sudo reboot
```

After reboot, restart PM2:
```bash
pm2 resurrect
```

## Step 6: Setup Monitoring (10 minutes)

### 6.1 Create Log Directories

```bash
mkdir -p ~/learn-grow-fullstack/grow-backend/logs
mkdir -p ~/learn-grow-fullstack/learn-grow/logs
```

### 6.2 Setup Health Check Cron

```bash
cd ~/learn-grow-fullstack
chmod +x healthcheck.sh
chmod +x monitor.sh

# Add to crontab
crontab -e

# Add this line (runs every 5 minutes):
*/5 * * * * ~/learn-grow-fullstack/healthcheck.sh >> ~/healthcheck.log 2>&1
```

### 6.3 Manual Monitoring

```bash
# System resources
./monitor.sh

# PM2 monitoring
pm2 monit

# Check logs
pm2 logs
pm2 logs backend-api
pm2 logs frontend-nextjs
```

## Step 7: Test Performance (15 minutes)

### 7.1 Install k6 (Load Testing Tool)

```bash
curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
sudo mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/
```

### 7.2 Run Load Test

```bash
cd ~/learn-grow-fullstack
k6 run loadtest.js
```

### 7.3 Monitor During Test

Open another terminal:
```bash
# Watch system resources
htop

# Watch PM2
pm2 monit

# Watch Nginx logs
sudo tail -f /var/log/nginx/access.log
```

## Step 8: Verify Improvements

### 8.1 Test API Response Times

```bash
# Test backend API
time curl http://localhost:5000/api/health
time curl http://localhost:5000/api/course

# Should see sub-second response times
```

### 8.2 Test Frontend

```bash
# Test homepage
time curl http://localhost

# Check static file caching
curl -I http://localhost/_next/static/...
# Should see cache headers
```

### 8.3 Check Redis

```bash
redis-cli
> INFO stats
> KEYS *
> GET cache:*  # See cached data
> EXIT
```

## Quick Verification Checklist

After completing all steps:

- [ ] Redis running: `redis-cli ping` → PONG
- [ ] MongoDB indexes created: Check logs
- [ ] PM2 cluster running: `pm2 status` → All online
- [ ] Nginx running: `sudo systemctl status nginx` → Active
- [ ] Backend responding: `curl http://localhost:5000/health`
- [ ] Frontend responding: `curl http://localhost:3000`
- [ ] Load test passes: `k6 run loadtest.js`

## Troubleshooting

### Issue: PM2 apps won't start

```bash
# Check logs
pm2 logs --err

# Restart individual app
pm2 restart backend-api
pm2 restart frontend-nextjs

# Full restart
pm2 delete all
pm2 start ecosystem.config.js
```

### Issue: Nginx shows errors

```bash
# Check configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

### Issue: Redis connection fails

```bash
# Check Redis status
sudo systemctl status redis-server

# Restart Redis
sudo systemctl restart redis-server

# Test connection
redis-cli ping
```

### Issue: High CPU usage

```bash
# Check what's using CPU
htop

# Reduce PM2 instances
pm2 scale backend-api 2
pm2 scale frontend-nextjs 1
```

## Performance Targets

After optimization, you should see:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Homepage Load | 3-5s | 1-2s | 60% |
| API Response | 500-1000ms | 100-300ms | 70% |
| Concurrent Users | 20-50 | 100-500 | 5-10x |
| CPU Usage | 60-80% | 30-50% | 40% |
| Memory Usage | 70-85% | 40-60% | 30% |

## Next Steps

1. **Monitor for 24 hours** - Watch for any issues
2. **Fine-tune** - Adjust PM2 instances based on load
3. **Add SSL** - Setup Let's Encrypt for HTTPS
4. **Scale vertically** - Upgrade EC2 if needed
5. **Scale horizontally** - Add load balancer + multiple EC2s

## Useful Commands Reference

```bash
# PM2
pm2 status              # Check status
pm2 monit               # Real-time monitoring
pm2 logs                # View logs
pm2 restart all         # Restart all apps
pm2 reload all          # Zero-downtime reload

# Nginx
sudo nginx -t           # Test config
sudo systemctl restart nginx  # Restart
sudo tail -f /var/log/nginx/access.log  # Watch logs

# Redis
redis-cli               # Open CLI
redis-cli INFO          # Redis info
redis-cli FLUSHALL      # Clear all cache

# System
htop                    # System monitor
df -h                   # Disk usage
free -h                 # Memory usage
netstat -tulpn          # Network connections

# Load Testing
k6 run loadtest.js      # Full test
ab -n 1000 -c 100 http://localhost:5000/api/health  # Quick test
```

## Support

If you encounter issues:

1. Check logs: `pm2 logs`, `/var/log/nginx/error.log`
2. Review [PERFORMANCE_OPTIMIZATION_GUIDE.md](./PERFORMANCE_OPTIMIZATION_GUIDE.md)
3. Run monitoring: `./monitor.sh`
4. Check system resources: `htop`, `free -h`

---

**Estimated Time:** 2 hours  
**Difficulty:** Intermediate  
**Impact:** High (5-10x performance improvement)
