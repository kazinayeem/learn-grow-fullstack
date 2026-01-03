# ✅ Performance Optimization Deployment Checklist

Use this checklist to ensure all optimizations are properly implemented.

---

## Pre-Deployment

### 1. Backup Current System
- [ ] Backup MongoDB database
  ```bash
  mongodump --out ~/backup-$(date +%Y%m%d)
  ```
- [ ] Backup application code
  ```bash
  cd ~/learn-grow-fullstack
  tar -czf ~/backup-code-$(date +%Y%m%d).tar.gz .
  ```
- [ ] Backup PM2 configuration (if exists)
  ```bash
  pm2 save
  cp ~/.pm2/dump.pm2 ~/.pm2/dump.pm2.backup
  ```
- [ ] Document current performance metrics
  ```bash
  # Response times, CPU%, Memory%, Concurrent users
  ```

### 2. Verify Prerequisites
- [ ] SSH access to EC2
- [ ] Root/sudo privileges
- [ ] Node.js installed (v18+)
  ```bash
  node --version  # Should be >= 18
  ```
- [ ] npm installed
  ```bash
  npm --version
  ```
- [ ] Git installed
  ```bash
  git --version
  ```
- [ ] Sufficient disk space (5GB+)
  ```bash
  df -h /
  ```

---

## Phase 1: Backend Optimization

### 3. Install Dependencies
- [ ] Navigate to backend directory
  ```bash
  cd ~/learn-grow-fullstack/grow-backend
  ```
- [ ] Install production dependencies
  ```bash
  npm install compression ioredis express-rate-limit response-time --save
  ```
- [ ] Install dev dependencies
  ```bash
  npm install @types/compression --save-dev
  ```
- [ ] Verify installation
  ```bash
  npm list compression ioredis express-rate-limit
  ```

### 4. Setup Redis
- [ ] Install Redis
  ```bash
  sudo apt update
  sudo apt install redis-server -y
  ```
- [ ] Configure Redis
  ```bash
  sudo nano /etc/redis/redis.conf
  # Set: maxmemory 256mb
  # Set: maxmemory-policy allkeys-lru
  ```
- [ ] Start Redis
  ```bash
  sudo systemctl start redis-server
  sudo systemctl enable redis-server
  ```
- [ ] Test Redis connection
  ```bash
  redis-cli ping  # Should return PONG
  ```
- [ ] Add Redis to environment
  ```bash
  # Add to grow-backend/.env:
  REDIS_HOST=localhost
  REDIS_PORT=6379
  ```

### 5. Implement Backend Optimizations
- [ ] Copy cache.ts to utils
  ```bash
  # File should exist: grow-backend/src/utils/cache.ts
  ls -l src/utils/cache.ts
  ```
- [ ] Copy cache.middleware.ts
  ```bash
  # File should exist: grow-backend/src/middleware/cache.middleware.ts
  ls -l src/middleware/cache.middleware.ts
  ```
- [ ] Update app.ts with compression and rate limiting
  ```bash
  # Review changes in app.ts
  ```
- [ ] Update database/mongoose.ts with connection pooling
  ```bash
  # Review changes in database/mongoose.ts
  ```
- [ ] Build backend
  ```bash
  npm run build
  ```
- [ ] Check for build errors
  ```bash
  # Should complete without errors
  ```

### 6. Create Database Indexes
- [ ] Run index creation script
  ```bash
  npx tsx src/scripts/createIndexes.ts
  ```
- [ ] Verify indexes created
  ```bash
  # Should show indexes for all collections
  ```
- [ ] Test with monitorDB script
  ```bash
  npx tsx src/scripts/monitorDB.ts
  ```

---

## Phase 2: Frontend Optimization

### 7. Update Next.js Configuration
- [ ] Review next.config.js
  ```bash
  cd ~/learn-grow-fullstack/learn-grow
  cat next.config.js
  ```
- [ ] Verify optimization settings present:
  - [ ] swcMinify: true
  - [ ] compress: true
  - [ ] optimizeFonts: true
  - [ ] Image optimization configured
  - [ ] Headers for caching configured

### 8. Build Frontend
- [ ] Build Next.js application
  ```bash
  npm run build
  ```
- [ ] Review build output
  ```bash
  # Check for:
  # - Page sizes
  # - Static/Dynamic pages
  # - No errors
  ```
- [ ] Verify build artifacts
  ```bash
  ls -la .next/
  ```

---

## Phase 3: PM2 Cluster Configuration

### 9. Install PM2
- [ ] Install PM2 globally
  ```bash
  sudo npm install -g pm2
  ```
- [ ] Verify PM2 version
  ```bash
  pm2 --version  # Should be latest
  ```

### 10. Configure PM2 Ecosystem
- [ ] Verify ecosystem.config.js exists
  ```bash
  cd ~/learn-grow-fullstack
  ls -l ecosystem.config.js
  ```
- [ ] Review configuration
  ```bash
  cat ecosystem.config.js
  ```
- [ ] Create log directories
  ```bash
  mkdir -p grow-backend/logs
  mkdir -p learn-grow/logs
  ```

### 11. Stop Current Processes
- [ ] Check currently running processes
  ```bash
  pm2 list
  ps aux | grep node
  ```
- [ ] Stop old PM2 processes
  ```bash
  pm2 stop all
  pm2 delete all
  ```
- [ ] Kill any manual node processes if needed
  ```bash
  # Only if necessary:
  # pkill -f "node.*server.js"
  # pkill -f "next start"
  ```

### 12. Start PM2 Cluster
- [ ] Start with ecosystem config
  ```bash
  pm2 start ecosystem.config.js
  ```
- [ ] Verify all processes started
  ```bash
  pm2 status
  # backend-api: Should show multiple instances
  # frontend-nextjs: Should show 2 instances
  # All should be "online"
  ```
- [ ] Check PM2 logs for errors
  ```bash
  pm2 logs --lines 50
  ```
- [ ] Save PM2 configuration
  ```bash
  pm2 save
  ```
- [ ] Setup PM2 startup script
  ```bash
  pm2 startup
  # Run the command it provides
  ```

---

## Phase 4: Nginx Configuration

### 13. Install Nginx
- [ ] Install Nginx
  ```bash
  sudo apt install nginx -y
  ```
- [ ] Verify installation
  ```bash
  nginx -v
  ```

### 14. Configure Nginx
- [ ] Copy configuration file
  ```bash
  sudo cp ~/learn-grow-fullstack/nginx-config.conf /etc/nginx/sites-available/learngrow
  ```
- [ ] Review configuration
  ```bash
  sudo cat /etc/nginx/sites-available/learngrow
  ```
- [ ] Create symbolic link
  ```bash
  sudo ln -s /etc/nginx/sites-available/learngrow /etc/nginx/sites-enabled/
  ```
- [ ] Remove default site
  ```bash
  sudo rm /etc/nginx/sites-enabled/default
  ```
- [ ] Test Nginx configuration
  ```bash
  sudo nginx -t
  # Should say: test is successful
  ```

### 15. Start Nginx
- [ ] Start Nginx service
  ```bash
  sudo systemctl start nginx
  ```
- [ ] Enable Nginx on boot
  ```bash
  sudo systemctl enable nginx
  ```
- [ ] Check Nginx status
  ```bash
  sudo systemctl status nginx
  # Should show: active (running)
  ```

### 16. Configure Firewall
- [ ] Allow HTTP
  ```bash
  sudo ufw allow 80
  ```
- [ ] Allow HTTPS (if using SSL)
  ```bash
  sudo ufw allow 443
  ```
- [ ] Check firewall status
  ```bash
  sudo ufw status
  ```

---

## Phase 5: System Optimization

### 17. Run EC2 Optimization Script
- [ ] Make script executable
  ```bash
  cd ~/learn-grow-fullstack
  chmod +x ec2-optimize.sh
  ```
- [ ] Review script before running
  ```bash
  cat ec2-optimize.sh
  ```
- [ ] Run optimization script
  ```bash
  ./ec2-optimize.sh
  ```
- [ ] Verify changes applied
  ```bash
  # Check file limits
  ulimit -n  # Should be 65535
  
  # Check sysctl settings
  sudo sysctl -a | grep "net.core.somaxconn"
  ```

### 18. Reboot System (Recommended)
- [ ] Schedule reboot
  ```bash
  sudo reboot
  ```
- [ ] Wait for system to come back (2-3 minutes)
- [ ] SSH back into server
- [ ] Verify PM2 auto-started
  ```bash
  pm2 status
  ```
- [ ] If PM2 didn't start, resurrect it
  ```bash
  pm2 resurrect
  ```

---

## Phase 6: Monitoring Setup

### 19. Setup Monitoring Scripts
- [ ] Make scripts executable
  ```bash
  cd ~/learn-grow-fullstack
  chmod +x monitor.sh healthcheck.sh
  ```
- [ ] Test monitor script
  ```bash
  ./monitor.sh
  ```
- [ ] Test healthcheck script
  ```bash
  ./healthcheck.sh
  ```

### 20. Setup Automated Health Checks
- [ ] Edit crontab
  ```bash
  crontab -e
  ```
- [ ] Add health check job
  ```bash
  # Add this line:
  */5 * * * * ~/learn-grow-fullstack/healthcheck.sh >> ~/healthcheck.log 2>&1
  ```
- [ ] Save and exit
- [ ] Verify cron job added
  ```bash
  crontab -l
  ```
- [ ] Wait 5 minutes and check log
  ```bash
  tail -f ~/healthcheck.log
  ```

---

## Phase 7: Testing & Verification

### 21. Basic Functionality Tests
- [ ] Test backend health endpoint
  ```bash
  curl http://localhost:5000/health
  # Should return: {"status":"ok"}
  ```
- [ ] Test backend API
  ```bash
  curl http://localhost:5000/api/course
  # Should return course data
  ```
- [ ] Test frontend
  ```bash
  curl -I http://localhost:3000
  # Should return: 200 OK
  ```
- [ ] Test through Nginx
  ```bash
  curl http://localhost
  # Should return HTML
  ```

### 22. Redis Verification
- [ ] Check Redis is running
  ```bash
  redis-cli ping
  # Should return: PONG
  ```
- [ ] Check cache is working
  ```bash
  # Make API call twice
  curl http://localhost/api/course
  curl http://localhost/api/course
  
  # Check Redis for cache keys
  redis-cli KEYS "*"
  # Should show cache keys
  ```
- [ ] Check cache hit rate
  ```bash
  redis-cli INFO stats | grep keyspace
  ```

### 23. Performance Testing
- [ ] Install k6 (if not already)
  ```bash
  curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
  sudo mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/
  ```
- [ ] Run load test
  ```bash
  cd ~/learn-grow-fullstack
  k6 run loadtest.js
  ```
- [ ] Review test results
  ```bash
  # Check:
  # - http_req_duration p(95) < 2000ms
  # - Error rate < 10%
  # - All checks passed
  ```

### 24. System Resource Verification
- [ ] Check CPU usage
  ```bash
  top -bn1 | grep "Cpu(s)"
  # Should be < 50%
  ```
- [ ] Check memory usage
  ```bash
  free -h
  # Should have free memory
  ```
- [ ] Check disk space
  ```bash
  df -h /
  # Should have space available
  ```
- [ ] Check PM2 resource usage
  ```bash
  pm2 monit
  # Watch for a minute
  ```

### 25. Database Performance
- [ ] Verify indexes exist
  ```bash
  cd ~/learn-grow-fullstack/grow-backend
  npx tsx src/scripts/monitorDB.ts
  ```
- [ ] Test query performance
  ```bash
  # Time API calls
  time curl http://localhost:5000/api/course
  # Should be < 500ms
  ```

---

## Phase 8: Documentation & Handover

### 26. Document Baseline Metrics
- [ ] Record current metrics
  ```bash
  ./monitor.sh > metrics-$(date +%Y%m%d).txt
  ```
- [ ] Save load test results
  ```bash
  k6 run --out json=baseline-results.json loadtest.js
  ```
- [ ] Document configuration
  ```bash
  pm2 jlist > pm2-config.json
  sudo nginx -T > nginx-config.txt
  ```

### 27. Create Rollback Plan
- [ ] Document rollback steps
  ```bash
  # In case of issues:
  # 1. pm2 stop all
  # 2. Restore backup
  # 3. Start old processes manually
  ```
- [ ] Keep old backups
  ```bash
  ls -l ~/backup-*
  ```

### 28. Team Training
- [ ] Document how to:
  - [ ] Check system status
  - [ ] Restart services
  - [ ] View logs
  - [ ] Deploy updates
  - [ ] Troubleshoot issues

---

## Post-Deployment Monitoring

### 29. Monitor for 24 Hours
- [ ] Hour 1: Check every 15 minutes
  ```bash
  pm2 status
  ./monitor.sh
  pm2 logs --lines 20
  ```
- [ ] Hour 2-8: Check every hour
- [ ] Hour 8-24: Check every 4 hours
- [ ] Watch for:
  - [ ] Process crashes
  - [ ] Memory leaks
  - [ ] Error spikes
  - [ ] Performance degradation

### 30. Fine-Tuning
- [ ] Adjust PM2 instances if needed
  ```bash
  # If CPU is high:
  pm2 scale backend-api +1
  
  # If CPU is low:
  pm2 scale backend-api -1
  ```
- [ ] Adjust Redis cache TTL if needed
  ```bash
  # Update TTL values in cache.middleware.ts
  ```
- [ ] Adjust Nginx buffers if needed
  ```bash
  # Edit /etc/nginx/sites-available/learngrow
  ```

---

## Success Criteria

### 31. Performance Targets Met
- [ ] Homepage loads in < 2 seconds
- [ ] API responses < 500ms
- [ ] Database queries < 200ms
- [ ] Can handle 100+ concurrent users
- [ ] CPU usage < 50%
- [ ] Memory usage < 70%
- [ ] Error rate < 1%
- [ ] Uptime > 99%

### 32. Monitoring Active
- [ ] PM2 monitoring working
- [ ] Health checks running
- [ ] Logs rotating
- [ ] Alerts configured (if applicable)

### 33. Documentation Complete
- [ ] Baseline metrics recorded
- [ ] Configuration documented
- [ ] Team trained
- [ ] Rollback plan ready

---

## Emergency Contacts & Commands

### Quick Restart Everything
```bash
pm2 restart all
sudo systemctl restart nginx redis-server
```

### Check What's Wrong
```bash
pm2 logs --err --lines 50
sudo tail -f /var/log/nginx/error.log
./monitor.sh
```

### Rollback to Backup
```bash
pm2 stop all
# Restore from backup
mongorestore ~/backup-YYYYMMDD
cd ~/learn-grow-fullstack
git reset --hard  # or restore from backup
pm2 start ecosystem.config.js
```

---

## Final Sign-Off

- [ ] All checklist items completed
- [ ] Performance targets met
- [ ] No critical errors in logs
- [ ] Team aware of changes
- [ ] Documentation updated
- [ ] Backup verified
- [ ] Monitoring active

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Verified By:** _______________  
**Status:** ⬜ Success  ⬜ Partial  ⬜ Rollback

---

**Notes:**
- Keep this checklist for future deployments
- Update as needed based on your environment
- Add custom checks specific to your application
- Share with your team

**Version:** 1.0  
**Last Updated:** January 2026
