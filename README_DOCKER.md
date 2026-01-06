# 🐳 Learn & Grow - Complete Docker Setup

> **Migration Complete!** Your project is now fully dockerized with local MongoDB instead of Atlas.

## 📋 Quick Overview

| Component | Status | Port | Access |
|-----------|--------|------|--------|
| MongoDB | ✅ Docker | 27017 | `mongodb://admin:admin123@localhost:27017` |
| Backend API | ✅ Docker | 5000 | http://localhost:5000 |
| Frontend | ✅ Docker | 3000 | http://localhost:3000 |
| Mongo Express | ✅ Docker (dev) | 8081 | http://localhost:8081 |

---

## 🚀 Quick Start (3 Commands)

```bash
# 1. Navigate to project
cd /c/Users/NAYEEM/OneDrive/Desktop/learn-grow-fullstack

# 2. Start everything
docker-compose up -d

# 3. Watch logs
docker-compose logs -f
```

**That's it!** Your application is now running:
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend: http://localhost:5000
- 💾 Database UI: http://localhost:8081 (run with `--profile dev`)

---

## 📁 What Changed?

### ✅ Files Modified

1. **grow-backend/.env** - MongoDB URI changed from Atlas to Docker
2. **grow-backend/src/database/mongoose.ts** - Removed hardcoded Atlas URL
3. **docker-compose.yml** - Complete orchestration with health checks
4. **grow-backend/Dockerfile** - Multi-stage optimized build
5. **learn-grow/Dockerfile** - Multi-stage optimized build
6. **.env** (root) - Centralized configuration

### 🔄 Database Change

**Before:**
```
mongodb+srv://awsnayeem7_db_user:***@learn-grow.1vvwxhs.mongodb.net/
```

**After:**
```
mongodb://admin:admin123@mongodb:27017/learn_grow_db?authSource=admin
```

---

## 🎯 Common Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Start with database UI
docker-compose --profile dev up -d

# Stop all services
docker-compose down

# Stop and remove data (WARNING!)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mongodb
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Rebuild Services

```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend

# Clean rebuild (no cache)
docker-compose build --no-cache
```

### Check Status

```bash
# List running containers
docker-compose ps

# Check resource usage
docker stats

# Check container details
docker inspect learn-grow-backend
```

---

## 💾 Database Management

### Access MongoDB Shell

```bash
# From your terminal
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Inside MongoDB shell:
use learn_grow_db
show collections
db.users.find().pretty()
```

### Backup Database

```bash
# Create backup
docker-compose exec mongodb mongodump \
  -u admin -p admin123 \
  --authenticationDatabase admin \
  -d learn_grow_db \
  -o /data/backup

# Copy to your machine
docker cp learn-grow-mongodb:/data/backup ./mongodb-backup
```

### Restore Database

```bash
# Copy backup to container
docker cp ./mongodb-backup learn-grow-mongodb:/data/backup

# Restore
docker-compose exec mongodb mongorestore \
  -u admin -p admin123 \
  --authenticationDatabase admin \
  -d learn_grow_db \
  /data/backup/learn_grow_db
```

### Use Mongo Express UI

```bash
# Start with dev profile
docker-compose --profile dev up -d

# Access at: http://localhost:8081
# Username: admin
# Password: admin123
```

---

## 🔧 Configuration

### Environment Variables

Edit `.env` in the root directory:

```env
# Ports
BACKEND_PORT=5000
FRONTEND_PORT=3000
MONGODB_PORT=27017

# MongoDB Credentials
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=admin123

# JWT (CHANGE IN PRODUCTION!)
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Backend Environment

Edit `grow-backend/.env`:

```env
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/learn_grow_db?authSource=admin
JWT_SECRET=your_secret_here
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment

Edit `learn-grow/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🔄 Migrate from Atlas

### Export from Atlas

```bash
# Using mongodump
mongodump --uri="mongodb+srv://awsnayeem7_db_user:IbbqcElMtKJWCH6r@learn-grow.1vvwxhs.mongodb.net/" -o ./atlas-backup

# Or use Atlas UI
# 1. Go to Atlas Dashboard
# 2. Click "..." on your cluster
# 3. Select "Export Data"
```

### Import to Docker

```bash
# Start MongoDB container
docker-compose up -d mongodb

# Wait for MongoDB to be ready (check logs)
docker-compose logs -f mongodb

# Import data
mongorestore -h localhost:27017 \
  -u admin -p admin123 \
  --authenticationDatabase admin \
  -d learn_grow_db \
  ./atlas-backup/<database-name>
```

---

## 🐛 Troubleshooting

### Containers Won't Start

```bash
# Check what's running
docker-compose ps

# View error logs
docker-compose logs

# Check Docker daemon
docker info

# Restart Docker Desktop (Windows/Mac)
```

### Port Already in Use

```bash
# Find what's using the port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Linux/Mac

# Change port in .env
BACKEND_PORT=5001

# Restart
docker-compose down
docker-compose up -d
```

### Database Connection Failed

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string
docker-compose exec backend env | grep MONGODB_URI

# Test connection
docker-compose exec mongodb mongosh -u admin -p admin123
```

### Backend Build Failed

```bash
# Check backend logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend

# Check Dockerfile syntax
docker-compose config
```

### Permission Issues (Linux)

```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Or run with sudo
sudo docker-compose up -d
```

---

## 🚀 Production Deployment

### On a VPS (Ubuntu)

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone repository
git clone <your-repo-url>
cd learn-grow-fullstack

# 4. Configure environment
cp .env.example .env
nano .env  # Edit with production values

# 5. Start services
docker-compose up -d

# 6. Check status
docker-compose ps
docker-compose logs -f
```

### Production Checklist

- [ ] Change MongoDB password in `.env`
- [ ] Update JWT secrets (use random 64-char strings)
- [ ] Configure real email credentials
- [ ] Set up Google OAuth with production URLs
- [ ] Configure HTTPS (use nginx-proxy or Traefik)
- [ ] Set up automatic backups
- [ ] Configure monitoring and alerts
- [ ] Set up log rotation
- [ ] Enable firewall (allow only 80, 443, 22)

---

## 📊 Monitoring

### View Logs

```bash
# Real-time logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# With timestamps
docker-compose logs -f --timestamps
```

### Resource Usage

```bash
# Live stats
docker stats

# Container details
docker inspect learn-grow-backend
```

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3000

# MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

---

## 🎓 Docker Concepts

### Services in docker-compose.yml

1. **mongodb** - Database server (MongoDB 7)
2. **mongo-express** - Database UI (dev only)
3. **backend** - Node.js API (Express + TypeScript)
4. **frontend** - Next.js application

### Volumes

- `mongo_data` - Persists MongoDB data
- `mongo_config` - Persists MongoDB configuration

### Networks

- `learn-grow-network` - Custom bridge network for service communication

---

## 📚 Documentation Files

- **DOCKER_SETUP_COMPLETE.md** - Comprehensive guide
- **DOCKER_QUICK_START.md** - Quick reference
- **DOCKER_MIGRATION_SUMMARY.md** - Summary of changes
- **README_DOCKER.md** - This file

---

## ⚡ Performance Tips

1. **Use Docker BuildKit** - Faster builds
   ```bash
   export DOCKER_BUILDKIT=1
   docker-compose build
   ```

2. **Prune Unused Resources**
   ```bash
   docker system prune -a
   ```

3. **Limit Log Size**
   ```yaml
   # Add to each service in docker-compose.yml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

---

## 🆘 Need Help?

1. **Check logs first**: `docker-compose logs -f`
2. **Verify configuration**: `docker-compose config`
3. **Check running containers**: `docker-compose ps`
4. **Test connectivity**: `docker-compose exec backend ping mongodb`

---

## ✅ Success Checklist

- [x] MongoDB switched from Atlas to Docker
- [x] docker-compose.yml configured
- [x] Health checks added
- [x] Multi-stage Dockerfiles
- [x] Environment variables configured
- [x] Documentation created

**Status:** ✅ Ready to Deploy

---

**Last Updated:** January 6, 2026  
**Author:** Docker Migration Script  
**Version:** 1.0.0
