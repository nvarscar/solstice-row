#!/bin/sh
set -eu

DOMAIN="solsticerow.nvarscar.ca"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"

if [ -f "${CERT_DIR}/fullchain.pem" ] && [ -f "${CERT_DIR}/privkey.pem" ]; then
    echo "[nginx] TLS certificates found — enabling HTTPS with HTTP→HTTPS redirect"
    cp /etc/nginx/templates/https.conf /etc/nginx/conf.d/default.conf
else
    echo "[nginx] No TLS certificates found — serving HTTP only on port 80"
    cp /etc/nginx/templates/http-only.conf /etc/nginx/conf.d/default.conf
fi

exec nginx -g 'daemon off;'
