#!/usr/bin/env bash
# Run this from the ~/certbot directory (where the certbot docker-compose service is defined).
set -euo pipefail

DOMAIN="solsticerow.nvarscar.ca"
EMAIL="admin@nvarscar.ca"

exec docker compose run --rm certbot certonly \
  --manual \
  --preferred-challenges dns \
  --cert-name "${DOMAIN}" \
  --domain "${DOMAIN}" \
  --email "${EMAIL}" \
  --agree-tos
