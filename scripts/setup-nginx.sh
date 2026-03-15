#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-/root/learn-grow-fullstack}"
NGINX_CONF_SOURCE="$REPO_DIR/deploy/nginx/learn-grow.conf"
NGINX_NOTICE_SOURCE="$REPO_DIR/deploy/nginx/errors/notice.html"
NGINX_CONF_TARGET="/etc/nginx/sites-available/learn-grow"
NGINX_CONF_LINK="/etc/nginx/sites-enabled/learn-grow"
NGINX_DEFAULT_LINK="/etc/nginx/sites-enabled/default"
NGINX_NOTICE_DIR="/var/www/learn-grow-errors"
NGINX_NOTICE_TARGET="$NGINX_NOTICE_DIR/_learn_grow_notice.html"

if [[ ! -f "$NGINX_CONF_SOURCE" ]]; then
  echo "Nginx config not found at $NGINX_CONF_SOURCE"
  exit 1
fi

if [[ ! -f "$NGINX_NOTICE_SOURCE" ]]; then
  echo "Nginx notice page not found at $NGINX_NOTICE_SOURCE"
  exit 1
fi

cp "$NGINX_CONF_SOURCE" "$NGINX_CONF_TARGET"
mkdir -p "$NGINX_NOTICE_DIR"
cp "$NGINX_NOTICE_SOURCE" "$NGINX_NOTICE_TARGET"
ln -sfn "$NGINX_CONF_TARGET" "$NGINX_CONF_LINK"

if [[ -L "$NGINX_DEFAULT_LINK" || -f "$NGINX_DEFAULT_LINK" ]]; then
  rm -f "$NGINX_DEFAULT_LINK"
fi

nginx -t

if systemctl is-active --quiet nginx; then
  systemctl reload nginx
else
  systemctl restart nginx
fi

echo "Nginx configuration applied successfully"
