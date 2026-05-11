#!/usr/bin/env bash
# ============================================================
# Bootstrap a fresh Ubuntu 22.04/24.04 server for Synora.
#
# What it does:
#   1. apt update + install Docker Engine + Compose plugin
#   2. UFW firewall: allow 22 + 80 + 443, deny the rest
#   3. Create a `synora` system user in the docker group
#   4. Clone the repo into /opt/synora and chown it to that user
#
# Run as root (or via sudo) on the VPS, ONCE:
#   curl -fsSL https://raw.githubusercontent.com/<YOUR_GH>/synora/main/scripts/bootstrap-server.sh | sudo bash
# Or, if the repo is private, scp it over and run:
#   sudo bash bootstrap-server.sh
# ============================================================
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root (sudo)." >&2
  exit 1
fi

REPO_URL="${REPO_URL:-https://github.com/CHANGE_ME/synora.git}"
TARGET_USER="${TARGET_USER:-synora}"
TARGET_DIR="${TARGET_DIR:-/opt/synora}"

echo "==> Updating package index"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "==> Installing prerequisites"
apt-get install -y \
  ca-certificates curl git ufw gnupg lsb-release \
  fail2ban unattended-upgrades

# --- Docker ---
if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker Engine"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list >/dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io \
                     docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

# --- Firewall ---
echo "==> Configuring UFW"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# --- Automatic security updates ---
echo "==> Enabling unattended-upgrades"
dpkg-reconfigure -plow unattended-upgrades || true

# --- Deploy user ---
if ! id -u "$TARGET_USER" >/dev/null 2>&1; then
  echo "==> Creating $TARGET_USER user"
  useradd -m -s /bin/bash "$TARGET_USER"
fi
usermod -aG docker "$TARGET_USER"

# --- Clone repo ---
if [[ ! -d "$TARGET_DIR" ]]; then
  if [[ "$REPO_URL" == *"CHANGE_ME"* ]]; then
    echo "==> Skipping clone (REPO_URL not set). Manually clone into $TARGET_DIR."
  else
    echo "==> Cloning $REPO_URL into $TARGET_DIR"
    git clone "$REPO_URL" "$TARGET_DIR"
  fi
fi
[[ -d "$TARGET_DIR" ]] && chown -R "$TARGET_USER:$TARGET_USER" "$TARGET_DIR"

echo
echo "==> Done. Next steps:"
echo "    sudo -iu $TARGET_USER"
echo "    cd $TARGET_DIR"
echo "    cp .env.example .env && nano .env   # fill in secrets + DOMAIN"
echo "    bash scripts/init-letsencrypt.sh"
echo "    docker compose -f docker-compose.yml -f docker-compose.https.yml \\"
echo "                   -f docker-compose.backup.yml \\"
echo "                   -f docker-compose.monitoring.yml up -d"
