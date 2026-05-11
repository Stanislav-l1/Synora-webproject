#!/usr/bin/env bash
# ============================================================
# Bootstrap Let's Encrypt cert for Synora
#
# Why this script exists:
#   nginx won't start without a cert at the path it references,
#   but certbot can't get a cert without nginx serving the ACME
#   challenge. So we:
#     1. Create a self-signed dummy cert
#     2. Start nginx (it now boots and serves /.well-known/...)
#     3. Replace the dummy with a real Let's Encrypt cert
#     4. Reload nginx
#
# Requires .env with DOMAIN and LETSENCRYPT_EMAIL set.
# Run from project root:  bash scripts/init-letsencrypt.sh
# ============================================================
set -euo pipefail

# --- Load .env ---
if [[ ! -f .env ]]; then
  echo "ERROR: .env not found. Copy .env.example and fill in values." >&2
  exit 1
fi
set -a; source .env; set +a

: "${DOMAIN:?DOMAIN must be set in .env}"
: "${LETSENCRYPT_EMAIL:?LETSENCRYPT_EMAIL must be set in .env}"

STAGING="${LETSENCRYPT_STAGING:-0}"  # set to 1 for testing (avoids rate limits)

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.https.yml"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}"

echo "==> Domain:   ${DOMAIN}"
echo "==> Email:    ${LETSENCRYPT_EMAIL}"
echo "==> Staging:  ${STAGING}"
echo

# --- 1. Create dummy self-signed cert so nginx can start ---
echo "==> Creating dummy certificate for ${DOMAIN}..."
$COMPOSE run --rm --entrypoint "\
  sh -c '\
    mkdir -p ${CERT_PATH} && \
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout ${CERT_PATH}/privkey.pem \
      -out    ${CERT_PATH}/fullchain.pem \
      -subj   \"/CN=localhost\"'" certbot

# --- 2. Start nginx (will serve ACME challenge on :80) ---
echo "==> Starting nginx..."
$COMPOSE up -d --force-recreate --no-deps nginx
sleep 5

# --- 3. Delete dummy cert ---
echo "==> Deleting dummy certificate..."
$COMPOSE run --rm --entrypoint "\
  sh -c 'rm -rf /etc/letsencrypt/live/${DOMAIN} \
                /etc/letsencrypt/archive/${DOMAIN} \
                /etc/letsencrypt/renewal/${DOMAIN}.conf'" certbot

# --- 4. Request real cert ---
echo "==> Requesting Let's Encrypt certificate..."
STAGING_FLAG=""
[[ "$STAGING" == "1" ]] && STAGING_FLAG="--staging"

$COMPOSE run --rm --entrypoint "\
  sh -c 'certbot certonly --webroot -w /var/www/certbot \
    --email ${LETSENCRYPT_EMAIL} \
    --agree-tos --no-eff-email \
    ${STAGING_FLAG} \
    -d ${DOMAIN}'" certbot

# --- 5. Reload nginx to pick up real cert ---
echo "==> Reloading nginx..."
$COMPOSE exec nginx nginx -s reload

echo
echo "==> Done. Visit https://${DOMAIN}"
echo "==> To bring the full stack up: $COMPOSE up -d"
