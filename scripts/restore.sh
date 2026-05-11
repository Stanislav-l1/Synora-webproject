#!/usr/bin/env bash
# ============================================================
# Restore a Synora backup pair (postgres dump + minio archive)
# into a *running* docker-compose stack.
#
# Usage:
#   bash scripts/restore.sh <pg-dump.sql.gz> <minio-archive.tar.gz>
#
# Example:
#   bash scripts/restore.sh \
#     backups/postgres/synora-20260511-030001.sql.gz \
#     backups/minio/synora-20260511-030001.tar.gz
#
# WARNING: this drops and recreates all tables and overwrites every
# object in the MinIO bucket. Do not run against a live system unless
# you really mean it. Stops backend+frontend during the restore.
# ============================================================
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <pg-dump.sql.gz> <minio-archive.tar.gz>" >&2
  exit 2
fi

PG_FILE="$1"
S3_FILE="$2"

[[ -f "$PG_FILE" ]] || { echo "Postgres dump not found: $PG_FILE" >&2; exit 1; }
[[ -f "$S3_FILE" ]] || { echo "MinIO archive not found: $S3_FILE" >&2; exit 1; }

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found." >&2
  exit 1
fi
set -a; source .env; set +a

: "${DB_NAME:=synora}"
: "${DB_USER:=synora}"
: "${DB_PASSWORD:?DB_PASSWORD required in .env}"
: "${S3_ACCESS_KEY:?S3_ACCESS_KEY required in .env}"
: "${S3_SECRET_KEY:?S3_SECRET_KEY required in .env}"
: "${S3_BUCKET:=synora-files}"

read -r -p "This will OVERWRITE the database '${DB_NAME}' and the '${S3_BUCKET}' bucket. Type 'restore' to continue: " confirm
[[ "$confirm" == "restore" ]] || { echo "Aborted."; exit 1; }

echo "==> Stopping backend & frontend"
docker compose stop backend frontend || true

echo "==> Restoring postgres from $PG_FILE"
gunzip -c "$PG_FILE" \
  | docker compose exec -T -e PGPASSWORD="$DB_PASSWORD" postgres \
      psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1

echo "==> Restoring MinIO bucket '${S3_BUCKET}' from $S3_FILE"
STAGE="$(mktemp -d)"
tar -xzf "$S3_FILE" -C "$STAGE"

docker compose exec -T minio sh -c "rm -rf /tmp/restore && mkdir -p /tmp/restore"
docker cp "$STAGE/${S3_BUCKET}/." "$(docker compose ps -q minio):/tmp/restore/"
docker compose exec -T minio sh -c "\
  mc alias set local http://localhost:9000 ${S3_ACCESS_KEY} ${S3_SECRET_KEY} >/dev/null && \
  mc mb --ignore-existing local/${S3_BUCKET} && \
  mc mirror --overwrite --remove /tmp/restore local/${S3_BUCKET} && \
  rm -rf /tmp/restore"
rm -rf "$STAGE"

echo "==> Restarting backend & frontend"
docker compose start backend frontend

echo "==> Done."
