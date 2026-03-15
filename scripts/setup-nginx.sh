#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-/root/learn-grow-fullstack}"
NGINX_CONF_SOURCE="$REPO_DIR/deploy/nginx/learn-grow.conf"
NGINX_CONF_TARGET="/etc/nginx/sites-available/learn-grow"
NGINX_CONF_LINK="/etc/nginx/sites-enabled/learn-grow"
NGINX_DEFAULT_LINK="/etc/nginx/sites-enabled/default"

if [[ ! -f "$NGINX_CONF_SOURCE" ]]; then
  echo "Nginx config not found at $NGINX_CONF_SOURCE"
  exit 1
fi

cp "$NGINX_CONF_SOURCE" "$NGINX_CONF_TARGET"
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
