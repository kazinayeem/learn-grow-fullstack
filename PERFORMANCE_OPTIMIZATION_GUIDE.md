# 🚀 Performance Optimization Guide - Learn & Grow Platform

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Backend Optimization (Node.js + Express)](#backend-optimization)
4. [Database Optimization (MongoDB)](#database-optimization)
5. [Frontend Optimization (Next.js)](#frontend-optimization)
6. [PM2 Configuration](#pm2-configuration)
7. [Nginx Reverse Proxy Setup](#nginx-reverse-proxy-setup)
8. [EC2 Instance Optimization](#ec2-instance-optimization)
9. [Caching Strategy (Redis)](#caching-strategy)
10. [Load Testing & Monitoring](#load-testing-monitoring)
11. [Implementation Checklist](#implementation-checklist)

---

## Executive Summary

**Current Status:** Functional application with basic configuration  
**Target:** Handle 100-1000 concurrent users with <2s page load times  
**Optimization Focus:** Performance only (no new features)

**Expected Improvements:**
- API response time: 50-70% reduction
- Page load time: 40-60% reduction
- Server CPU usage: 30-40% reduction
- Database query time: 60-80% reduction
- Concurrent user capacity: 5-10x increase

---

## System Architecture Overview

```
Internet → EC2 (Ubuntu) → Nginx (Port 80/443) → PM2 Cluster
                              ↓
                         Node.js Backend (Port 5000)
                         Next.js Frontend (Port 3000)
                              ↓
                          MongoDB + Redis
```

---

## Backend Optimization

### 1. Express Middleware Optimization

**Current Issues:**
- No compression middleware
- JSON body limit too high (2mb)
- No request caching
- Missing rate limiting

**Optimizations:**

#### Install Performance Dependencies
```bash
cd grow-backend
npm install compression express-rate-limit response-time ioredis --save
npm install @types/compression --save-dev
```

#### Update app.ts Configuration
Add these optimizations to `grow-backend/src/app.ts`:

```typescript
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import responseTime from 'response-time';

export const createApp = () => {
  const app = express();

  // Add response time tracking (for monitoring)
  app.use(responseTime((req, res, time) => {
    console.log(`${req.method} ${req.url} - ${time.toFixed(2)}ms`);
  }));

  // Enable gzip compression for all responses
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6 // Balance between speed and compression ratio
  }));

  // Rate limiting for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiter to all API routes
  app.use('/api/', apiLimiter);

  // Stricter rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Only 5 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later'
  });

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // CORS optimization - reduce options
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [ENV.FRONTEND_URL, "http://174.129.111.162:3000"]
      : true,
    credentials: true,
    maxAge: 86400 // 24 hours - cache preflight requests
  }));

  // Reduce JSON limit (most API calls don't need 2mb)
  app.use(express.json({ limit: "500kb" }));
  app.use(express.urlencoded({ extended: true, limit: "500kb" }));

  // ... rest of middleware
};
```

### 2. Database Connection Pooling

Update `grow-backend/src/database/mongoose.ts`:

```typescript
import mongoose from "mongoose";

mongoose.set('toJSON', {
  transform: function (doc, ret) {
    return ret;
  }
});

export const connectDB = async (MONGODB_URI: string) => {
  try {
    await mongoose.connect(MONGODB_URI, {
      // Connection pool settings
      maxPoolSize: 50, // Maximum number of connections
      minPoolSize: 10, // Minimum number of connections
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      serverSelectionTimeoutMS: 5000, // Timeout for selecting server
      socketTimeoutMS: 45000, // Socket timeout
      
      // Performance optimizations
      compressors: ['zlib'], // Enable compression
      
      // Write concern for better performance (adjust based on data criticality)
      w: 1, // Acknowledge writes from primary only
      journal: false, // Don't wait for journal
    });

    console.log("✅ MongoDB connected with optimized pool settings");
    console.log(`📊 Connection Pool: Min ${10} | Max ${50}`);
    
    // Monitor connection pool
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
```

### 3. API Response Optimization

Create a caching utility: `grow-backend/src/utils/cache.ts`

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err));

export class CacheService {
  /**
   * Get cached data
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache with TTL (Time To Live)
   */
  static async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cache key
   */
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }
}

export default redis;
```

Create caching middleware: `grow-backend/src/middleware/cache.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../utils/cache.js';

/**
 * Cache middleware for GET requests
 * @param ttl - Time to live in seconds
 */
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `cache:${req.originalUrl}`;

    try {
      // Try to get cached response
      const cachedResponse = await CacheService.get(cacheKey);
      
      if (cachedResponse) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.json(cachedResponse);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function(data: any) {
        // Cache the response
        CacheService.set(cacheKey, data, ttl).catch(console.error);
        // Send response
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};
```

### 4. Optimize Specific Routes

Example for frequently accessed routes. Apply to routes in modules:

```typescript
// Example: grow-backend/src/modules/course/routes/course.route.ts
import { cacheMiddleware } from '../../../middleware/cache.middleware.js';

// Cache course list for 5 minutes
router.get('/courses', cacheMiddleware(300), courseController.getCourses);

// Cache single course for 10 minutes
router.get('/courses/:id', cacheMiddleware(600), courseController.getCourse);

// Cache public data longer (30 minutes)
router.get('/categories', cacheMiddleware(1800), categoryController.getCategories);
```

---

## Database Optimization

### 1. Create Essential Indexes

Create script: `grow-backend/src/scripts/createIndexes.ts`

```typescript
import mongoose from 'mongoose';
import { ENV } from '../config/env.js';

const createIndexes = async () => {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // User collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ phone: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ isApproved: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    
    // Compound indexes for common queries
    await db.collection('users').createIndex({ role: 1, isApproved: 1 });
    await db.collection('users').createIndex({ email: 1, role: 1 });

    // Course collection indexes
    await db.collection('courses').createIndex({ title: 'text', description: 'text' });
    await db.collection('courses').createIndex({ categoryId: 1 });
    await db.collection('courses').createIndex({ instructorId: 1 });
    await db.collection('courses').createIndex({ status: 1 });
    await db.collection('courses').createIndex({ createdAt: -1 });
    await db.collection('courses').createIndex({ price: 1 });
    
    // Compound indexes for filtering
    await db.collection('courses').createIndex({ status: 1, categoryId: 1 });
    await db.collection('courses').createIndex({ instructorId: 1, status: 1 });

    // Enrollment collection indexes
    await db.collection('enrollments').createIndex({ studentId: 1, courseId: 1 }, { unique: true });
    await db.collection('enrollments').createIndex({ courseId: 1 });
    await db.collection('enrollments').createIndex({ studentId: 1 });
    await db.collection('enrollments').createIndex({ enrolledAt: -1 });

    // Order collection indexes
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ userId: 1, status: 1 });

    // Blog collection indexes
    await db.collection('blogs').createIndex({ title: 'text', content: 'text' });
    await db.collection('blogs').createIndex({ slug: 1 }, { unique: true });
    await db.collection('blogs').createIndex({ published: 1 });
    await db.collection('blogs').createIndex({ createdAt: -1 });
    await db.collection('blogs').createIndex({ authorId: 1 });

    // LiveClass collection indexes
    await db.collection('liveclasses').createIndex({ courseId: 1 });
    await db.collection('liveclasses').createIndex({ instructorId: 1 });
    await db.collection('liveclasses').createIndex({ scheduledAt: 1 });
    await db.collection('liveclasses').createIndex({ status: 1 });
    await db.collection('liveclasses').createIndex({ scheduledAt: 1, status: 1 });

    // Event collection indexes
    await db.collection('events').createIndex({ date: 1 });
    await db.collection('events').createIndex({ createdAt: -1 });
    
    // Category collection
    await db.collection('categories').createIndex({ name: 1 }, { unique: true });

    console.log('✅ All indexes created successfully');
    
    // List all indexes for verification
    const collections = ['users', 'courses', 'enrollments', 'orders', 'blogs', 'liveclasses', 'events'];
    for (const collName of collections) {
      const indexes = await db.collection(collName).indexes();
      console.log(`\n📊 ${collName} indexes:`, indexes.length);
    }

  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createIndexes();
```

Run the script:
```bash
cd grow-backend
npm run build
npx tsx src/scripts/createIndexes.ts
```

### 2. Query Optimization

Create a document: `grow-backend/QUERY_OPTIMIZATION_PATTERNS.md`

```markdown
# Query Optimization Patterns

## 1. Use Lean Queries (No Mongoose Documents)

❌ Bad:
```typescript
const users = await User.find({ role: 'student' });
```

✅ Good:
```typescript
const users = await User.find({ role: 'student' }).lean();
```

**Performance Gain:** 5-10x faster

## 2. Select Only Needed Fields

❌ Bad:
```typescript
const user = await User.findOne({ email });
```

✅ Good:
```typescript
const user = await User.findOne({ email }).select('name email role').lean();
```

**Performance Gain:** 2-3x faster

## 3. Use Projections in Aggregations

❌ Bad:
```typescript
const results = await Course.aggregate([
  { $match: { status: 'active' } },
  { $lookup: { from: 'users', localField: 'instructorId', foreignField: '_id', as: 'instructor' } }
]);
```

✅ Good:
```typescript
const results = await Course.aggregate([
  { $match: { status: 'active' } },
  { $project: { title: 1, price: 1, instructorId: 1 } }, // Project early
  { $lookup: { from: 'users', localField: 'instructorId', foreignField: '_id', as: 'instructor' } },
  { $project: { title: 1, price: 1, 'instructor.name': 1 } } // Project after lookup
]);
```

## 4. Avoid N+1 Queries

❌ Bad:
```typescript
const courses = await Course.find();
for (const course of courses) {
  course.instructor = await User.findById(course.instructorId);
}
```

✅ Good:
```typescript
const courses = await Course.aggregate([
  { $lookup: { from: 'users', localField: 'instructorId', foreignField: '_id', as: 'instructor' } },
  { $unwind: '$instructor' }
]);
```

## 5. Use Cursor for Large Datasets

❌ Bad:
```typescript
const allCourses = await Course.find(); // Loads all in memory
```

✅ Good:
```typescript
const cursor = Course.find().cursor();
for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  // Process doc
}
```

## 6. Limit and Skip Optimization

❌ Bad (for pagination):
```typescript
const page = 1000;
const limit = 10;
const results = await Course.find().skip(page * limit).limit(limit);
```

✅ Good (cursor-based pagination):
```typescript
const lastId = req.query.lastId;
const results = await Course.find({ _id: { $gt: lastId } }).limit(10).lean();
```
```

### 3. Database Monitoring Script

Create: `grow-backend/src/scripts/monitorDB.ts`

```typescript
import mongoose from 'mongoose';
import { ENV } from '../config/env.js';

const monitorDB = async () => {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    const db = mongoose.connection.db;

    // Get database stats
    const stats = await db.stats();
    console.log('\n📊 Database Statistics:');
    console.log(`- Database: ${stats.db}`);
    console.log(`- Collections: ${stats.collections}`);
    console.log(`- Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Indexes: ${stats.indexes}`);
    console.log(`- Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);

    // Get slow queries (if profiler is enabled)
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections:');
    for (const coll of collections) {
      const collStats = await db.collection(coll.name).stats();
      console.log(`\n${coll.name}:`);
      console.log(`  - Documents: ${collStats.count}`);
      console.log(`  - Avg Document Size: ${collStats.avgObjSize} bytes`);
      console.log(`  - Total Size: ${(collStats.size / 1024 / 1024).toFixed(2)} MB`);
      
      // List indexes
      const indexes = await db.collection(coll.name).indexes();
      console.log(`  - Indexes: ${indexes.length}`);
      indexes.forEach(idx => {
        console.log(`    * ${JSON.stringify(idx.key)}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

monitorDB();
```

---

## Frontend Optimization

### 1. Next.js Configuration Optimization

Update `learn-grow/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */

const nextConfig = {
  // Enable SWC minification (faster than Terser)
  swcMinify: true,
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Optimize bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'], // Use modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
        port: "",
        pathname: "**",
      },
    ],
  },

  // Optimize fonts
  optimizeFonts: true,

  // Enable React strict mode for better performance
  reactStrictMode: true,

  // Optimize production builds
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: ['lucide-react', '@nextui-org/react'], // Tree-shake these packages
  },

  // Configure headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
```

### 2. Implement Static Generation for Pages

Convert pages to SSG/ISR where possible. Example for blog pages:

Update `learn-grow/app/blog/[id]/page.tsx`:

```typescript
// Add ISR with revalidation
export const revalidate = 300; // Revalidate every 5 minutes

export async function generateStaticParams() {
  // Pre-generate top 100 blog pages
  const res = await fetch('http://localhost:5000/api/blog?limit=100');
  const blogs = await res.json();
  
  return blogs.data.map((blog: any) => ({
    id: blog._id,
  }));
}

export default async function BlogPage({ params }: { params: { id: string } }) {
  // This will be statically generated and revalidated every 5 minutes
  const blog = await fetch(`http://localhost:5000/api/blog/${params.id}`, {
    next: { revalidate: 300 }
  });
  
  // ... render blog
}
```

### 3. Implement Client-Side Caching

Create: `learn-grow/lib/api-cache.ts`

```typescript
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry>();

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const apiCache = new APICache();

// Cached fetch wrapper
export async function cachedFetch(url: string, options?: RequestInit, ttl: number = 60000) {
  const cacheKey = `${url}${JSON.stringify(options)}`;
  
  // Try cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    console.log('Cache hit:', url);
    return cached;
  }

  // Fetch and cache
  const response = await fetch(url, options);
  const data = await response.json();
  apiCache.set(cacheKey, data, ttl);
  
  return data;
}
```

### 4. Code Splitting and Dynamic Imports

Update heavy components to use dynamic imports:

```typescript
// Instead of:
import RichTextEditor from '@/components/RichTextEditor';

// Use:
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false, // Don't server-side render heavy components
  loading: () => <div>Loading editor...</div>
});
```

Apply to:
- `learn-grow/components/RichTextEditor.tsx`
- `learn-grow/components/course/*` (heavy course components)
- Chart libraries (recharts)
- Quill editor components

---

## PM2 Configuration

### 1. Create PM2 Ecosystem File

Create: `ecosystem.config.js` in root directory:

```javascript
module.exports = {
  apps: [
    // Backend API
    {
      name: 'backend-api',
      cwd: './grow-backend',
      script: 'dist/server.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Performance tuning
      node_args: '--max-old-space-size=512', // Limit memory
      
      // Health check
      kill_timeout: 5000,
    },
    
    // Frontend Next.js
    {
      name: 'frontend-nextjs',
      cwd: './learn-grow',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 2, // Run 2 instances (adjust based on EC2 size)
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      node_args: '--max-old-space-size=1024',
      
      kill_timeout: 5000,
    }
  ]
};
```

### 2. PM2 Commands

```bash
# Install PM2 globally on EC2
npm install -g pm2

# Start all apps
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs

# View specific app logs
pm2 logs backend-api
pm2 logs frontend-nextjs

# Restart apps (zero-downtime)
pm2 reload ecosystem.config.js

# Stop all
pm2 stop all

# Delete all
pm2 delete all

# Save PM2 configuration to startup on boot
pm2 startup
pm2 save

# Performance monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Nginx Reverse Proxy Setup

### 1. Install Nginx on EC2

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Configure Nginx

Create: `/etc/nginx/sites-available/learngrow`

```nginx
# Upstream backends
upstream backend_api {
    least_conn; # Load balancing method
    server 127.0.0.1:5000 max_fails=3 fail_timeout=30s;
    keepalive 32; # Keep connections alive
}

upstream frontend_app {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP -> HTTPS redirect (if you have SSL)
# server {
#     listen 80;
#     server_name your-domain.com www.your-domain.com;
#     return 301 https://$server_name$request_uri;
# }

# Main server block
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    # If using SSL:
    # listen 443 ssl http2;
    # listen [::]:443 ssl http2;
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;
    
    server_name 174.129.111.162;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        image/svg+xml;
    
    # Client body size limit
    client_max_body_size 10M;
    client_body_buffer_size 128k;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    send_timeout 60s;
    
    # Buffer settings
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
    
    # Backend API routes
    location /api/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Websocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Keep alive
        proxy_set_header Connection "";
        
        # Disable buffering for API calls
        proxy_buffering off;
        
        # Cache API responses (GET only)
        proxy_cache_methods GET;
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
        proxy_cache_bypass $http_authorization;
        add_header X-Cache-Status $upstream_cache_status;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://backend_api/health;
        access_log off;
    }
    
    # Static files from Next.js (high cache)
    location /_next/static/ {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Cache static files aggressively
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Images from Next.js optimizer
    location /_next/image {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Cache optimized images
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # All other requests go to Next.js frontend
    location / {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Websocket support (for Next.js HMR in dev, hot reload)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Keep alive
        proxy_set_header Connection "";
    }
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;

# Connection limiting
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
```

### 3. Enable Configuration

```bash
# Test configuration
sudo nginx -t

# Create symlink
sudo ln -s /etc/nginx/sites-available/learngrow /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Reload Nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

### 4. Nginx Performance Tuning

Edit `/etc/nginx/nginx.conf`:

```nginx
user www-data;
worker_processes auto; # Auto-detect CPU cores
worker_rlimit_nofile 65535;
pid /run/nginx.pid;

events {
    worker_connections 4096; # Increase from default 768
    use epoll; # Efficient connection processing
    multi_accept on;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 100;
    types_hash_max_size 2048;
    server_tokens off; # Hide Nginx version
    
    # File cache
    open_file_cache max=10000 inactive=30s;
    open_file_cache_valid 60s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log warn;
    
    # Gzip (already defined in server block, but global settings)
    gzip on;
    
    # Include server configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

---

## EC2 Instance Optimization

### 1. System Tuning

Create script: `ec2-optimize.sh`

```bash
#!/bin/bash

echo "🚀 Optimizing EC2 instance for production..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y htop iotop nethogs sysstat

# 1. Increase file descriptor limits
echo "* soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "root soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "root hard nofile 65535" | sudo tee -a /etc/security/limits.conf

# 2. Kernel parameters optimization
sudo tee -a /etc/sysctl.conf > /dev/null <<EOF

# Network performance tuning
net.core.somaxconn = 4096
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15
net.ipv4.tcp_tw_reuse = 1

# Memory management
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# File system
fs.file-max = 2097152
fs.inotify.max_user_watches = 524288
EOF

# Apply sysctl changes
sudo sysctl -p

# 3. Configure swap (if not exists)
if [ ! -f /swapfile ]; then
    echo "Creating 2GB swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# 4. Install Node.js performance monitoring tools
sudo npm install -g clinic autocannon

# 5. Setup log rotation
sudo tee /etc/logrotate.d/nodejs > /dev/null <<EOF
/home/ubuntu/learn-grow-fullstack/grow-backend/logs/*.log
/home/ubuntu/learn-grow-fullstack/learn-grow/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
}
EOF

echo "✅ EC2 optimization complete!"
echo "⚠️  Please reboot the instance for all changes to take effect"
```

Run:
```bash
chmod +x ec2-optimize.sh
./ec2-optimize.sh
sudo reboot
```

### 2. Monitoring Setup

Create monitoring script: `monitor.sh`

```bash
#!/bin/bash

echo "=== System Resources ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}'

echo -e "\nMemory Usage:"
free -h | grep Mem | awk '{print $3 "/" $2 " (" $3/$2*100 "%)"}'

echo -e "\nDisk Usage:"
df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}'

echo -e "\n=== PM2 Status ==="
pm2 jlist

echo -e "\n=== Nginx Status ==="
systemctl status nginx | grep Active

echo -e "\n=== MongoDB Connection ==="
echo "db.serverStatus().connections" | mongo --quiet

echo -e "\n=== Top 5 CPU Processes ==="
ps aux --sort=-%cpu | head -6

echo -e "\n=== Network Connections ==="
ss -s
```

### 3. Automated Health Checks

Create: `healthcheck.sh`

```bash
#!/bin/bash

# Check backend API
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$backend_status" != "200" ]; then
    echo "⚠️ Backend API is down! Restarting..."
    pm2 restart backend-api
    # Send alert (configure your notification)
fi

# Check frontend
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$frontend_status" != "200" ]; then
    echo "⚠️ Frontend is down! Restarting..."
    pm2 restart frontend-nextjs
fi

# Check MongoDB
mongo_status=$(echo "db.runCommand({ping: 1})" | mongo --quiet | grep ok)
if [ -z "$mongo_status" ]; then
    echo "⚠️ MongoDB is down! Check service..."
    sudo systemctl restart mongod
fi

# Check Nginx
nginx_status=$(systemctl is-active nginx)
if [ "$nginx_status" != "active" ]; then
    echo "⚠️ Nginx is down! Restarting..."
    sudo systemctl restart nginx
fi

echo "✅ Health check completed at $(date)"
```

Setup cron job:
```bash
# Edit crontab
crontab -e

# Add (runs every 5 minutes)
*/5 * * * * /home/ubuntu/learn-grow-fullstack/healthcheck.sh >> /home/ubuntu/healthcheck.log 2>&1
```

---

## Caching Strategy

### 1. Install Redis

```bash
# On EC2 Ubuntu
sudo apt update
sudo apt install redis-server -y

# Configure Redis for performance
sudo nano /etc/redis/redis.conf
```

Update Redis configuration:
```conf
# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence (disable for pure cache)
save ""
appendonly no

# Network
bind 127.0.0.1
port 6379
timeout 300

# Performance
tcp-backlog 511
tcp-keepalive 300
```

```bash
# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test
redis-cli ping  # Should return PONG
```

### 2. Backend Caching Implementation

Add to `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

Implement caching in services (example for courses):

Update: `grow-backend/src/modules/course/service/course.service.ts`

```typescript
import { CacheService } from '../../../utils/cache.js';

export class CourseService {
  
  // Get all courses with caching
  static async getAllCourses(filters: any) {
    const cacheKey = `courses:${JSON.stringify(filters)}`;
    
    // Try cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Query database
    const courses = await Course.find(filters)
      .select('title description price thumbnail categoryId')
      .populate('categoryId', 'name')
      .lean();
    
    // Cache for 5 minutes
    await CacheService.set(cacheKey, courses, 300);
    
    return courses;
  }
  
  // Get single course with caching
  static async getCourseById(id: string) {
    const cacheKey = `course:${id}`;
    
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const course = await Course.findById(id)
      .populate('instructorId', 'name email')
      .populate('categoryId', 'name')
      .lean();
    
    if (course) {
      // Cache for 10 minutes
      await CacheService.set(cacheKey, course, 600);
    }
    
    return course;
  }
  
  // Invalidate cache on update
  static async updateCourse(id: string, data: any) {
    const course = await Course.findByIdAndUpdate(id, data, { new: true });
    
    // Clear cache
    await CacheService.del(`course:${id}`);
    await CacheService.delPattern('courses:*'); // Clear list cache
    
    return course;
  }
}
```

### 3. Frontend Caching with SWR

Install SWR:
```bash
cd learn-grow
npm install swr
```

Create hooks: `learn-grow/hooks/useCourses.ts`

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useCourses() {
  const { data, error, isLoading, mutate } = useSWR(
    'http://174.129.111.162:5000/api/courses',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000, // Refresh every 5 minutes
      dedupingInterval: 60000, // Dedupe requests within 1 minute
    }
  );

  return {
    courses: data?.data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useCourse(id: string) {
  const { data, error, isLoading } = useSWR(
    id ? `http://174.129.111.162:5000/api/courses/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    course: data?.data,
    isLoading,
    isError: error
  };
}
```

---

## Load Testing & Monitoring

### 1. Install Load Testing Tools

```bash
# Install k6
curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
sudo mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/

# Install Apache Bench
sudo apt install apache2-utils -y

# Install autocannon (Node.js based)
npm install -g autocannon
```

### 2. Enhanced Load Test Script

Update `loadtest.js` with comprehensive tests:

```javascript
import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const successCounter = new Counter('success_count');

// Test configuration
export let options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Spike to 200 users
    { duration: '3m', target: 200 },  // Stay at 200
    { duration: '2m', target: 500 },  // Spike to 500
    { duration: '1m', target: 500 },  // Stay at 500
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests under 2s
    'errors': ['rate<0.1'],               // Error rate under 10%
    'http_req_failed': ['rate<0.05'],     // Failed requests under 5%
  },
};

const BASE_URL = 'http://174.129.111.162';
const API_URL = `${BASE_URL}:5000/api`;

export default function () {
  // Test homepage
  group('Homepage', function () {
    const res = http.get(BASE_URL);
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 2s': (r) => r.timings.duration < 2000,
    });
    
    errorRate.add(!success);
    if (success) successCounter.add(1);
  });

  sleep(1);

  // Test API endpoints
  group('API - Course List', function () {
    const res = http.get(`${API_URL}/courses`);
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 1s': (r) => r.timings.duration < 1000,
      'has courses': (r) => JSON.parse(r.body).data.length > 0,
    });
    
    apiDuration.add(res.timings.duration);
    errorRate.add(!success);
  });

  sleep(1);

  // Test blog endpoint
  group('API - Blog List', function () {
    const res = http.get(`${API_URL}/blog?limit=20`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 1s': (r) => r.timings.duration < 1000,
    });
  });

  sleep(2);

  // Test course detail page
  group('Course Detail Page', function () {
    const res = http.get(`${BASE_URL}/courses/some-course-id`);
    check(res, {
      'loads successfully': (r) => r.status === 200 || r.status === 404,
    });
  });

  sleep(1);
}

// Summary at end of test
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'loadtest-results.json': JSON.stringify(data),
  };
}
```

### 3. Run Load Tests

```bash
# Basic load test
k6 run loadtest.js

# With more detailed output
k6 run --out json=results.json loadtest.js

# Test specific endpoint with Apache Bench
ab -n 10000 -c 100 http://174.129.111.162:5000/api/courses

# Test with autocannon (faster than ab)
autocannon -c 100 -d 60 http://174.129.111.162
```

### 4. Performance Monitoring Dashboard

Create: `monitor-performance.sh`

```bash
#!/bin/bash

echo "======================================"
echo "  Performance Monitoring Dashboard"
echo "======================================"
date
echo ""

# API Response Time Test
echo "🔍 API Response Times:"
echo "------------------------------"
time curl -s http://localhost:5000/api/courses > /dev/null
echo "Courses API: $(curl -w "%{time_total}s\n" -o /dev/null -s http://localhost:5000/api/courses)"
echo "Blog API: $(curl -w "%{time_total}s\n" -o /dev/null -s http://localhost:5000/api/blog)"
echo "Health Check: $(curl -w "%{time_total}s\n" -o /dev/null -s http://localhost:5000/health)"

# Frontend Response Times
echo -e "\n🌐 Frontend Response Times:"
echo "------------------------------"
echo "Homepage: $(curl -w "%{time_total}s\n" -o /dev/null -s http://localhost:3000)"
echo "Courses Page: $(curl -w "%{time_total}s\n" -o /dev/null -s http://localhost:3000/courses)"

# Redis Stats
echo -e "\n📊 Redis Stats:"
echo "------------------------------"
redis-cli info stats | grep -E "total_commands_processed|instantaneous_ops_per_sec|keyspace_hits|keyspace_misses"

# MongoDB Stats
echo -e "\n🗄️  MongoDB Performance:"
echo "------------------------------"
echo "db.serverStatus().connections" | mongo --quiet

# PM2 Metrics
echo -e "\n⚙️  PM2 Process Stats:"
echo "------------------------------"
pm2 jlist | jq '.[] | {name: .name, status: .pm2_env.status, cpu: .monit.cpu, memory: .monit.memory}'

# Nginx Access Rate
echo -e "\n🌍 Nginx Request Rate (last 60 seconds):"
echo "------------------------------"
tail -n 1000 /var/log/nginx/access.log | awk '{print $4}' | cut -d: -f1,2 | uniq -c | tail -5

echo ""
echo "======================================"
```

### 5. Real-time Monitoring with PM2 Plus (Optional)

```bash
# Link to PM2 Plus for free monitoring
pm2 link <secret_key> <public_key>

# Or use PM2 built-in monitoring
pm2 install pm2-server-monit
```

---

## Implementation Checklist

### Phase 1: Backend Optimization (Day 1-2)

- [ ] Install dependencies (`compression`, `ioredis`, `express-rate-limit`)
- [ ] Update `app.ts` with compression and rate limiting
- [ ] Optimize database connection pooling
- [ ] Create and run index creation script
- [ ] Install and configure Redis
- [ ] Implement caching utility
- [ ] Add cache middleware to routes
- [ ] Test backend improvements

**Verification:**
```bash
# Test API response times
time curl http://174.129.111.162:5000/api/courses
# Should be <500ms for cached, <1s for uncached
```

### Phase 2: Database Optimization (Day 2-3)

- [ ] Run `createIndexes.ts` script
- [ ] Verify indexes created
- [ ] Update queries to use `.lean()`
- [ ] Add `.select()` to limit fields
- [ ] Implement Redis caching for frequent queries
- [ ] Run monitoring script
- [ ] Test query performance

**Verification:**
```bash
# MongoDB explain plan
echo 'db.courses.find({status: "active"}).explain("executionStats")' | mongo
# Should show index usage
```

### Phase 3: Frontend Optimization (Day 3-4)

- [ ] Update `next.config.js`
- [ ] Implement dynamic imports for heavy components
- [ ] Add ISR/SSG to pages
- [ ] Implement SWR for data fetching
- [ ] Optimize images (use Next.js Image component)
- [ ] Build and test frontend
- [ ] Measure bundle size

**Verification:**
```bash
cd learn-grow
npm run build
# Check build output for page sizes
```

### Phase 4: Server Configuration (Day 4-5)

- [ ] Create `ecosystem.config.js`
- [ ] Configure PM2 cluster mode
- [ ] Install and configure Nginx
- [ ] Setup Nginx caching
- [ ] Configure SSL (if applicable)
- [ ] Run EC2 optimization script
- [ ] Setup monitoring and health checks
- [ ] Configure log rotation

**Verification:**
```bash
# PM2 status
pm2 status

# Nginx status
sudo nginx -t && sudo systemctl status nginx
```

### Phase 5: Testing & Monitoring (Day 5-6)

- [ ] Install k6 and load testing tools
- [ ] Run load tests with increasing concurrency
- [ ] Monitor CPU, memory, and network usage
- [ ] Fine-tune based on results
- [ ] Setup automated health checks
- [ ] Configure alerts
- [ ] Document performance improvements

**Verification:**
```bash
# Load test
k6 run loadtest.js

# Should handle 100-500 concurrent users
# Response times should be <2s for 95th percentile
```

### Phase 6: Production Deployment (Day 6-7)

- [ ] Backup current setup
- [ ] Deploy optimizations gradually
- [ ] Monitor for issues
- [ ] Rollback plan ready
- [ ] Document changes
- [ ] Update team

---

## Expected Performance Improvements

### Before Optimization (Baseline)
- Homepage load: 3-5s
- API response: 500-1000ms
- Concurrent users: 20-50
- CPU usage: 60-80%
- Memory usage: 70-85%
- Database queries: 200-500ms

### After Optimization (Target)
- Homepage load: 1-2s (50-60% improvement)
- API response: 100-300ms (70-80% improvement)
- Concurrent users: 100-1000 (5-10x increase)
- CPU usage: 30-50% (40% reduction)
- Memory usage: 40-60% (30% reduction)
- Database queries: 50-100ms (75-80% improvement)

---

## Quick Start Commands

```bash
# 1. Backend optimization
cd grow-backend
npm install compression ioredis express-rate-limit response-time
npm run build
npx tsx src/scripts/createIndexes.ts

# 2. Install Redis
sudo apt install redis-server -y
sudo systemctl start redis-server

# 3. Setup PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save

# 4. Install and configure Nginx
sudo apt install nginx -y
sudo cp nginx-config.conf /etc/nginx/sites-available/learngrow
sudo ln -s /etc/nginx/sites-available/learngrow /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# 5. Run optimization script
chmod +x ec2-optimize.sh
./ec2-optimize.sh

# 6. Test performance
k6 run loadtest.js
```

---

## Troubleshooting

### Issue: High CPU Usage

**Solution:**
1. Check PM2 cluster mode is enabled
2. Reduce PM2 instances if EC2 is small
3. Add more aggressive caching
4. Enable Nginx caching

### Issue: Slow Database Queries

**Solution:**
1. Verify indexes exist: `npm run db:sync-indexes`
2. Add `.lean()` to queries
3. Use Redis caching
4. Check MongoDB connection pool size

### Issue: Memory Leaks

**Solution:**
1. Monitor with `pm2 monit`
2. Set max_memory_restart in PM2
3. Check for unclosed connections
4. Review Redis memory usage

### Issue: Too Many Connections

**Solution:**
1. Increase MongoDB connection pool
2. Enable Nginx connection limiting
3. Add rate limiting to API
4. Check for connection leaks

---

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Performance Tuning](https://www.nginx.com/blog/tuning-nginx/)
- [MongoDB Performance Best Practices](https://www.mongodb.com/docs/manual/administration/analyzing-mongodb-performance/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [k6 Load Testing](https://k6.io/docs/)

---

## Support

For issues or questions:
1. Check logs: `pm2 logs`, `/var/log/nginx/error.log`
2. Monitor: `pm2 monit`, `htop`
3. Test endpoints manually with `curl -v`
4. Review this guide's troubleshooting section

---

**Last Updated:** January 2026  
**Version:** 1.0  
**Maintained By:** Performance Engineering Team
