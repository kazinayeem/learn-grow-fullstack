#!/bin/bash

echo "=== System Resources ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}'

echo -e "\nMemory Usage:"
free -h | grep Mem | awk '{print $3 "/" $2}'

echo -e "\nDisk Usage:"
df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}'

echo -e "\n=== PM2 Status ==="
pm2 jlist | head -20

echo -e "\n=== Nginx Status ==="
systemctl status nginx | grep Active

echo -e "\n=== Top 5 CPU Processes ==="
ps aux --sort=-%cpu | head -6

echo -e "\n=== Network Connections ==="
ss -s
