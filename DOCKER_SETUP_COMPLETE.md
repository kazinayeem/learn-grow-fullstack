# 🐳 Docker Setup Guide - Learn & Grow Platform

## ✅ What's Changed

### MongoDB Configuration
- **Switched from MongoDB Atlas to Local Docker MongoDB**
- Connection string updated in `grow-backend/.env`
- Old: `mongodb+srv://...@learn-grow.1vvwxhs.mongodb.net/...`
- New: `mongodb://admin:admin123@mongodb:27017/learn_grow_db?authSource=admin`

### Complete Dockerization
- ✅ MongoDB 7 container with persistent volumes
- ✅ Backend API (Node.js + Express + TypeScript)
- ✅ Frontend (Next.js)
- ✅ Mongo Express UI for database management (dev only)
- ✅ Health checks for all services
- ✅ Custom network for service communication
- ✅ Production-ready Dockerfiles with multi-stage builds

---

## 📁 Updated Files

1. **`docker-compose.yml`** - Main orchestration file
2. **`.env`** - Root environment variables
3. **`grow-backend/.env`** - Backend-specific environment
4. **`grow-backend/Dockerfile`** - Optimized backend container
5. **`grow-backend/.dockerignore`** - Build exclusions
6. **`learn-grow/.dockerignore`** - Frontend build exclusions

---

## 🚀 Quick Start

### 1. Start All Services
```bash
# Start everything (MongoDB, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 2. Start with Mongo Express (Database UI)
```bash
# Start with dev profile (includes Mongo Express)
docker-compose --profile dev up -d

# Access Mongo Express at: http://localhost:8081
# Username: admin
# Password: admin123
```

### 3. Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

---

## 🔧 Configuration

### Environment Variables

Edit `.env` in the root directory:

```bash
# Port Configuration
MONGODB_PORT=27017
BACKEND_PORT=5000
FRONTEND_PORT=3000

# MongoDB Credentials
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=admin123

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 📊 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:5000 | - |
| API Health | http://localhost:5000/api/health | - |
| MongoDB | mongodb://localhost:27017 | admin / admin123 |
| Mongo Express | http://localhost:8081 | admin / admin123 |

---

## 🛠️ Development Commands

### Build Services
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache (clean build)
docker-compose build --no-cache
```

### Service Management
```bash
# Start specific service
docker-compose up -d backend

# Restart a service
docker-compose restart backend

# View running containers
docker-compose ps

# Execute command in container
docker-compose exec backend npm run seed
docker-compose exec mongodb mongosh -u admin -p admin123
```

### Logs and Debugging
```bash
# Follow all logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f mongodb

# Check container status
docker-compose ps
```

---

## 💾 Database Management

### Access MongoDB Shell
```bash
# From host machine
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Inside MongoDB shell
use learn_grow_db
show collections
db.users.find()
```

### Backup Database
```bash
# Export database
docker-compose exec mongodb mongodump \
  -u admin -p admin123 \
  --authenticationDatabase admin \
  -d learn_grow_db \
  -o /data/backup

# Copy backup to host
docker cp learn-grow-mongodb:/data/backup ./backup
```

### Restore Database
```bash
# Copy backup to container
docker cp ./backup learn-grow-mongodb:/data/backup

# Restore database
docker-compose exec mongodb mongorestore \
  -u admin -p admin123 \
  --authenticationDatabase admin \
  -d learn_grow_db \
  /data/backup/learn_grow_db
```

---

## 🔄 Migration from Atlas

Your data is currently in MongoDB Atlas. Here's how to migrate:

### Option 1: Export/Import (Recommended)

1. **Export from Atlas:**
```bash
mongodump --uri="mongodb+srv://awsnayeem7_db_user:IbbqcElMtKJWCH6r@learn-grow.1vvwxhs.mongodb.net/?appName=learn-grow" -o ./atlas_backup
```

2. **Start Docker MongoDB:**
```bash
docker-compose up -d mongodb
```

3. **Import to Docker:**
```bash
mongorestore -h localhost:27017 \
  -u admin -p admin123 \
  --authenticationDatabase admin \
  -d learn_grow_db \
  ./atlas_backup/<your_database_name>
```

### Option 2: Keep Both (Development + Production)

Create `.env.production` for Atlas and `.env.development` for local:

```bash
# .env.development (Docker - local dev)
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/learn_grow_db?authSource=admin

# .env.production (Atlas - production)
MONGODB_URI=mongodb+srv://awsnayeem7_db_user:IbbqcElMtKJWCH6r@learn-grow.1vvwxhs.mongodb.net/?appName=learn-grow
```

---

## 🔍 Health Checks

All services include health checks:

```bash
# Check backend health
curl http://localhost:5000/api/health

# Check MongoDB health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check all container health status
docker-compose ps
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string
docker-compose exec backend env | grep MONGODB_URI
```

### Backend Not Starting
```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend
docker-compose build --no-cache backend
docker-compose up -d backend

# Check environment variables
docker-compose exec backend env
```

### Port Already in Use
```bash
# Change ports in .env file
BACKEND_PORT=5001
FRONTEND_PORT=3001
MONGODB_PORT=27018

# Or stop conflicting services
docker-compose down
```

### Clear Everything and Restart
```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d
```

---

## 📦 Production Deployment

### On VPS (Ubuntu/Debian)

1. **Install Docker:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Install Docker Compose:**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Clone and Configure:**
```bash
git clone <your-repo>
cd learn-grow-fullstack
cp .env.example .env
# Edit .env with production values
nano .env
```

4. **Deploy:**
```bash
docker-compose up -d
docker-compose logs -f
```

### Environment Variables for Production

**Important:** Change these in production `.env`:

```bash
# Strong passwords
MONGO_INITDB_ROOT_PASSWORD=<strong-random-password>
JWT_SECRET=<64-character-random-string>
JWT_REFRESH_SECRET=<64-character-random-string>

# Production URLs
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback

# Real email credentials
EMAIL_USER=your-real-email@gmail.com
EMAIL_PASSWORD=your-real-app-password
```

---

## 📝 Useful Docker Commands

```bash
# View container resource usage
docker stats

# Clean up unused resources
docker system prune -a

# View Docker networks
docker network ls

# Inspect a container
docker inspect learn-grow-backend

# View container IP address
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' learn-grow-backend

# Execute shell in container
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec mongodb bash
```

---

## 🎯 Next Steps

1. ✅ Services are running
2. 📊 Access Mongo Express at http://localhost:8081
3. 🔧 Configure your email and OAuth credentials in `.env`
4. 💾 Migrate data from Atlas (if needed)
5. 🧪 Test your API endpoints
6. 🚀 Deploy to VPS when ready

---

## 📞 Support

If you encounter any issues:

1. Check logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose exec backend env`
3. Check MongoDB connectivity: `docker-compose exec backend npm run test-db`
4. Restart services: `docker-compose restart`

---

**Last Updated:** January 6, 2026
**Docker Version Required:** 20.10+
**Docker Compose Version Required:** 2.0+
