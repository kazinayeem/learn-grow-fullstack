/**
 * PM2 Ecosystem Configuration for Learn & Grow (Cluster Mode)
 * Run: pm2 start ecosystem.config.js
 * 
 * Cluster Mode Benefits:
 * - Utilizes all CPU cores (4 instances for better fault tolerance)
 * - Zero-downtime reloads
 * - Active process monitoring
 * - Automatic restart on crash
 */

module.exports = {
  apps: [
    // ========================================
    // NEXT.JS FRONTEND (Cluster Mode - 4 instances)
    // ========================================
    {
      name: "next-app",
      script: ".next/standalone/server.js",  // Use standalone build for production
      cwd: "/root/learn-grow",              // Working directory
      instances: 4,                          // Number of cluster instances (match CPU cores)
      exec_mode: "cluster",                  // Enable cluster mode
      
      // Environment variables
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },

      // Performance tuning
      max_memory_restart: "400M",            // Restart if exceeds 400MB
      watch: false,                          // Don't watch in production
      autorestart: true,                     // Auto-restart on crash
      max_restarts: 10,                      // Max restarts in 1 minute
      min_uptime: "10s",                     // Min uptime before considering it crashed

      // Logging
      output: "/var/log/pm2/next-out.log",
      error: "/var/log/pm2/next-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Graceful shutdown
      kill_timeout: 5000,                    // 5 seconds graceful shutdown timeout
      listen_timeout: 3000,                  // Wait for app to start listening
      
      // Monitoring
      merge_logs: true,                      // Merge logs from all instances
      combine_logs: true,
    },

    // ========================================
    // BACKEND API (Single instance - CPU-bound)
    // ========================================
    {
      name: "backend-api",
      script: "/root/grow-backend/dist/server.js",
      cwd: "/root/grow-backend",
      
      instances: 1,                          // Single instance (can scale if needed)
      exec_mode: "fork",

      env: {
        NODE_ENV: "production",
        PORT: 5000,
        MONGODB_URI: "mongodb://learnandgrow:learnandgrow@127.0.0.1:27017/learnandgrow?authSource=admin",
      },

      max_memory_restart: "600M",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",

      output: "/var/log/pm2/backend-out.log",
      error: "/var/log/pm2/backend-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      kill_timeout: 5000,
      listen_timeout: 3000,
    },
  ],

  // ========================================
  // GLOBAL SETTINGS
  // ========================================
  deploy: {
    production: {
      user: "root",
      host: "104.207.70.54",
      ref: "origin/main",
      repo: "git@github.com:yourusername/learn-grow-fullstack.git",
      path: "/root/learn-grow-fullstack",
      "post-deploy": "npm install && npm run build && pm2 reload ecosystem.config.js --env production"
    }
  }
};
