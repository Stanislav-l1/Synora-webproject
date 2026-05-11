#!/usr/bin/env sh
# ============================================================
# Synora backup runner (runs inside the synora-backup container).
#
# Each invocation:
#   1. Dumps postgres → /backups/postgres/synora-<ts>.sql.gz
#   2. Mirrors the minio bucket → /backups/minio/synora-<ts>.tar.gz
#   3. Prunes anything older than RETENTION_DAYS (default 14)
#
# Designed for the busybox `sh` shell in the alpine-based image.
# All env vars are passed in by docker-compose.
# ============================================================
set -eu

: "${DB_HOST:=postgres}"
: "${DB_PORT:=5432}"
: "${DB_NAME:=synora}"
: "${DB_USER:=synora}"
: "${DB_PASSWORD:?DB_PASSWORD is required}"

: "${S3_ENDPOINT:=http://minio:9000}"
: "${S3_ACCESS_KEY:?S3_ACCESS_KEY is required}"
: "${S3_SECRET_KEY:?S3_SECRET_KEY is required}"
: "${S3_BUCKET:=synora-files}"

: "${RETENTION_DAYS:=14}"
: "${BACKUP_DIR:=/backups}"

TS="$(date -u +%Y%m%d-%H%M%S)"
PG_DIR="${BACKUP_DIR}/postgres"
S3_DIR="${BACKUP_DIR}/minio"
mkdir -p "$PG_DIR" "$S3_DIR"

log() { echo "[$(date -u +%H:%M:%S)] $*"; }

# --- Postgres ---
PG_OUT="${PG_DIR}/synora-${TS}.sql.gz"
log "pg_dump → ${PG_OUT}"
PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" -p "$DB_PORT" \
  -U "$DB_USER" -d "$DB_NAME" \
  --no-owner --no-privileges --clean --if-exists \
  | gzip -9 > "$PG_OUT.tmp"
mv "$PG_OUT.tmp" "$PG_OUT"
log "  size: $(du -h "$PG_OUT" | cut -f1)"

# --- MinIO ---
S3_OUT="${S3_DIR}/synora-${TS}.tar.gz"
log "mc mirror → ${S3_OUT}"
mc alias set src "$S3_ENDPOINT" "$S3_ACCESS_KEY" "$S3_SECRET_KEY" >/dev/null

STAGE="$(mktemp -d)"
mc mirror --quiet --overwrite "src/${S3_BUCKET}" "$STAGE/${S3_BUCKET}"
tar -C "$STAGE" -czf "$S3_OUT.tmp" "${S3_BUCKET}"
mv "$S3_OUT.tmp" "$S3_OUT"
rm -rf "$STAGE"
log "  size: $(du -h "$S3_OUT" | cut -f1)"

# --- Retention ---
log "pruning files older than ${RETENTION_DAYS} days"
find "$PG_DIR" -type f -name '*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete
find "$S3_DIR" -type f -name '*.tar.gz' -mtime "+${RETENTION_DAYS}" -delete

log "done — kept $(ls -1 "$PG_DIR" | wc -l) pg, $(ls -1 "$S3_DIR" | wc -l) minio"
