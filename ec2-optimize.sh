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
