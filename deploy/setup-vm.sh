#!/usr/bin/env bash
# Préparation unique d'une VM Ubuntu 24.04 (AWS, 4 Go) pour la production.
# Depuis le poste : scp deploy/setup-vm.sh deploy/prod.env.example ubuntu@<ip>:~
# Sur la VM      : sudo bash setup-vm.sh ubuntu
set -euo pipefail

DEPLOY_USER="${1:-ubuntu}"
APP_DIR=/opt/jamah
TEMPLATE="$(dirname "$0")/prod.env.example"

export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -yq docker.io docker-compose-v2 rsync openssl unattended-upgrades
usermod -aG docker "$DEPLOY_USER"

mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'EOF'
{ "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }
EOF
systemctl enable docker
systemctl restart docker

if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
# max_map_count : exigé par Elasticsearch (2e partie)
printf 'vm.max_map_count=262144\nvm.swappiness=10\n' > /etc/sysctl.d/99-jamah.conf
sysctl --system >/dev/null

mkdir -p "$APP_DIR"/data/{postgres,directus/uploads,caddy/data,caddy/config,elasticsearch,models,backups}
chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$APP_DIR"
# Directus et Elasticsearch tournent sous l'uid 1000
chown -R 1000:1000 "$APP_DIR/data/directus" "$APP_DIR/data/elasticsearch"

if [ ! -f "$APP_DIR/.env" ]; then
  (
    umask 077
    while IFS= read -r line; do
      while [[ "$line" == *__RANDOM__* ]]; do line="${line/__RANDOM__/$(openssl rand -hex 24)}"; done
      printf '%s\n' "$line"
    done < "$TEMPLATE" > "$APP_DIR/.env"
  )
  chown "$DEPLOY_USER":"$DEPLOY_USER" "$APP_DIR/.env"
  echo "Créé : $APP_DIR/.env (secrets générés). Compléter SITE_DOMAIN, CMS_DOMAIN, ACME_EMAIL, DIRECTUS_ADMIN_EMAIL."
fi

# Sauvegarde quotidienne de la base (14 jours, sur le disque de la VM : compléter par des instantanés EBS)
cat > /etc/cron.d/jamah-backup <<EOF
30 2 * * * $DEPLOY_USER cd $APP_DIR && docker compose -f deploy/compose.prod.yml --env-file .env exec -T postgres sh -c 'pg_dump -U "\$POSTGRES_USER" "\$POSTGRES_DB"' | gzip > data/backups/jamah-\$(date +\\%F).sql.gz && find data/backups -name '*.sql.gz' -mtime +14 -delete
EOF

echo "VM prête. Se reconnecter pour appliquer le groupe docker à $DEPLOY_USER."
