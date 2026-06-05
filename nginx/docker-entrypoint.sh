#!/bin/sh
set -eu

DOMAIN="${DOMAIN:-solsticerow.nvarscar.ca}"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"

if [ -f "${CERT_DIR}/fullchain.pem" ] && [ -f "${CERT_DIR}/privkey.pem" ]; then
    echo "[nginx] TLS certificates found for ${DOMAIN} — enabling HTTPS with HTTP→HTTPS redirect"
    sed -e "s/SERVER_NAME/${DOMAIN}/g" -e "s|CERT_DOMAIN|${DOMAIN}|g" /etc/nginx/templates/https.conf > /etc/nginx/conf.d/default.conf
else
    echo "[nginx] No TLS certificates found for ${DOMAIN} — serving HTTP only on port 80"
    cp /etc/nginx/templates/http-only.conf /etc/nginx/conf.d/default.conf
fi

exec nginx -g 'daemon off;'
