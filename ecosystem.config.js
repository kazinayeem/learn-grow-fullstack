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
      node_args: '--max-old-space-size=512',
      
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
