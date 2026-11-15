#!/usr/bin/env bash
# Préparation unique d'une VM Ubuntu 24.04 (AWS, 4 Go) pour la production.
# Depuis le poste : scp deploy/setup-vm.sh ubuntu@<ip>:~
# Sur la VM      : sudo bash setup-vm.sh ubuntu
# Relançable. Le fichier /opt/jamah/.env n'est pas géré ici : le workflow Deploy le réécrit à chaque
# déploiement à partir des secrets et variables GitHub (environnement « production »).
set -euo pipefail

DEPLOY_USER="${1:-ubuntu}"
APP_DIR=/opt/jamah

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
# Pas de chown récursif : relancer le script ne doit pas reprendre data/postgres (uid du conteneur)
chown "$DEPLOY_USER":"$DEPLOY_USER" "$APP_DIR" "$APP_DIR/data" "$APP_DIR/data/backups" "$APP_DIR/data/models"
# Directus et Elasticsearch tournent sous l'uid 1000
chown -R 1000:1000 "$APP_DIR/data/directus" "$APP_DIR/data/elasticsearch"

# Sauvegarde quotidienne de la base (14 jours, sur le disque de la VM : compléter par des instantanés EBS)
cat > /etc/cron.d/jamah-backup <<EOF
30 2 * * * $DEPLOY_USER cd $APP_DIR && docker compose -f deploy/compose.prod.yml --env-file .env exec -T postgres sh -c 'pg_dump -U "\$POSTGRES_USER" "\$POSTGRES_DB"' | gzip > data/backups/jamah-\$(date +\\%F).sql.gz && find data/backups -name '*.sql.gz' -mtime +14 -delete
EOF

echo "VM prête. Se reconnecter pour appliquer le groupe docker à $DEPLOY_USER."
