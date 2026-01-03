#!/bin/bash

# Check backend API
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$backend_status" != "200" ]; then
    echo "⚠️ Backend API is down! Restarting..."
    pm2 restart backend-api
fi

# Check frontend
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$frontend_status" != "200" ]; then
    echo "⚠️ Frontend is down! Restarting..."
    pm2 restart frontend-nextjs
fi

# Check Nginx
nginx_status=$(systemctl is-active nginx)
if [ "$nginx_status" != "active" ]; then
    echo "⚠️ Nginx is down! Restarting..."
    sudo systemctl restart nginx
fi

echo "✅ Health check completed at $(date)"
