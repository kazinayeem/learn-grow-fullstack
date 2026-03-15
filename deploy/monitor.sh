#!/bin/bash

# Learn & Grow - Performance Monitoring & Health Check Script
# Run with: chmod +x monitor.sh && ./monitor.sh

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========================================
# UTILITY FUNCTIONS
# ========================================

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
    fi
}

print_metric() {
    echo -e "${YELLOW}$1:${NC} $2"
}

# ========================================
# SYSTEM CHECKS
# ========================================

print_header "System Resources"

# CPU Usage
cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
print_metric "CPU Usage" "${cpu_usage}%"

if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    echo -e "${RED}  WARNING: High CPU usage!${NC}"
fi

# Memory Usage  
mem_total=$(free -m | awk 'NR==2{print $2}')
mem_used=$(free -m | awk 'NR==2{print $3}')
mem_percent=$((mem_used * 100 / mem_total))
print_metric "Memory Usage" "${mem_used}MB / ${mem_total}MB (${mem_percent}%)"

if [ $mem_percent -gt 80 ]; then
    echo -e "${RED}  WARNING: High memory usage!${NC}"
fi

# Disk Usage
disk=$(df -h / | awk 'NR==2{print $5}')
print_metric "Disk Usage" "$disk"

if [[ ${disk%\%} -gt 80 ]]; then
    echo -e "${RED}  WARNING: Low disk space!${NC}"
fi

echo ""

# ========================================
# SERVICE CHECKS
# ========================================

print_header "Service Status"

# Nginx
sudo systemctl is-active --quiet nginx
check_status "Nginx"

# PM2
pm2 status > /dev/null 2>&1
check_status "PM2 Running"

# MongoDB
pgrep mongod > /dev/null 2>&1
check_status "MongoDB"

echo ""

# ========================================
# NGINX CACHE PERFORMANCE
# ========================================

print_header "Nginx Cache Performance"

# Cache directory sizes
cache_sizes=$(du -sh /var/cache/nginx/* 2>/dev/null | awk '{print $1"\t"$2}')
if [ ! -z "$cache_sizes" ]; then
    echo "$cache_sizes"
fi

# Cache hit ratio (last 100 requests)
cache_hits=$(sudo tail -100 /var/log/nginx/learnandgrow_access.log 2>/dev/null | grep "X-Cache-Status: HIT" | wc -l)
cache_misses=$(sudo tail -100 /var/log/nginx/learnandgrow_access.log 2>/dev/null | grep "X-Cache-Status: MISS" | wc -l)
if [ $((cache_hits + cache_misses)) -gt 0 ]; then
    hit_ratio=$((cache_hits * 100 / (cache_hits + cache_misses)))
    print_metric "Cache Hit Ratio (Last 100 requests)" "${hit_ratio}% (${cache_hits} HIT, ${cache_misses} MISS)"
fi

echo ""

# ========================================
# PM2 PROCESS INFO
# ========================================

print_header "PM2 Process Status"

pm2 list

echo ""

# ========================================
# NGINX CONNECTIONS
# ========================================

print_header "Nginx Connection Stats"

# Active connections
active_conns=$(sudo ss -tun 2>/dev/null | grep ":80\|:443\|:3000\|:5000" | grep ESTAB | wc -l)
print_metric "Active Connections" "$active_conns"

# Open file descriptors
open_fds=$(lsof -u www-data 2>/dev/null | wc -l || echo "N/A")
print_metric "Nginx Open File Descriptors" "$open_fds"

# Nginx config test
sudo nginx -t -q
check_status "Nginx Config Valid"

echo ""

# ========================================
# BACKEND API HEALTH
# ========================================

print_header "Backend API Health"

# Test API endpoint
api_response=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/health 2>/dev/null || echo "000")
if [ "$api_response" == "200" ] || [ "$api_response" == "401" ]; then
    echo -e "${GREEN}✓ Backend API is responding${NC}"
    print_metric "Response Code" "$api_response"
else
    echo -e "${RED}✗ Backend API is not responding${NC}"
    print_metric "Response Code" "$api_response"
fi

echo ""

# ========================================
# MONGODB STATUS
# ========================================

print_header "MongoDB Status"

# MongoDB connection test
if command -v mongo &> /dev/null; then
    mongo_status=$(mongo --eval "db.adminCommand('ping')" 2>/dev/null | grep ok | head -1)
    if [[ $mongo_status == *"1"* ]]; then
        echo -e "${GREEN}✓ MongoDB is connected${NC}"
        
        # Database size
        db_size=$(mongo --eval "db.stats()" 2>/dev/null | grep '"dataSize"' | awk '{print $NF}' | tr -d ',')
        if [ ! -z "$db_size" ]; then
            print_metric "Database Size" "$(numfmt --to=iec-i --suffix=B $db_size 2>/dev/null || echo $db_size' bytes')"
        fi
    fi
fi

echo ""

# ========================================
# RECOMMENDATIONS
# ========================================

print_header "Recommendations"

if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    echo -e "${YELLOW}• CPU usage is high. Consider:${NC}"
    echo "  - Increasing PM2 cluster instances"
    echo "  - Optimizing database queries"
    echo "  - Enabling more aggressive caching"
fi

if [ $mem_percent -gt 80 ]; then
    echo -e "${YELLOW}• Memory usage is high. Consider:${NC}"
    echo "  - Reducing MongoDB maxPoolSize"
    echo "  - Restarting Node.js processes gracefully"
    echo "  - Adding more RAM to VPS"
fi

if [ $((cache_hits + cache_misses)) -gt 0 ] && [ $hit_ratio -lt 50 ]; then
    echo -e "${YELLOW}• Cache hit ratio is low. Consider:${NC}"
    echo "  - Increasing cache_zone size"
    echo "  - Adjusting cache validity timeouts"
    echo "  - Adding more cacheable endpoints"
fi

echo -e "\n${GREEN}Monitor generated at $(date)${NC}\n"
