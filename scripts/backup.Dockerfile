# Minimal image bundling pg_dump (matching server) + mc (MinIO client) + cron.
# Used by the synora-backup service in docker-compose.backup.yml.
FROM alpine:3.20

RUN apk add --no-cache \
        postgresql16-client \
        tar \
        gzip \
        curl \
        coreutils \
        findutils \
        tzdata \
    && curl -fsSL https://dl.min.io/client/mc/release/linux-amd64/mc \
         -o /usr/local/bin/mc \
    && chmod +x /usr/local/bin/mc

COPY backup.sh /usr/local/bin/synora-backup
RUN chmod +x /usr/local/bin/synora-backup

# Entrypoint installs a daily crontab and tails its log.
# BACKUP_CRON defaults to "0 3 * * *" (03:00 UTC daily).
ENV BACKUP_CRON="0 3 * * *"
ENTRYPOINT ["/bin/sh", "-c", "\
  echo \"$BACKUP_CRON  /usr/local/bin/synora-backup >> /var/log/backup.log 2>&1\" > /etc/crontabs/root && \
  touch /var/log/backup.log && \
  crond -f -L /dev/stdout & \
  tail -F /var/log/backup.log"]
