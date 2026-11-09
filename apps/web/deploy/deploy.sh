#!/usr/bin/env bash
# Redéploie le site public sur la VM partagée (itvision) — build local, exécution légère sur la VM.
# Usage : SSH_KEY=~/.ssh/utils.pem SITE_URL=https://jamah.52-47-120-35.sslip.io ./deploy/deploy.sh
set -euo pipefail

SSH_KEY="${SSH_KEY:-$HOME/.ssh/utils.pem}"
SSH_TARGET="${SSH_TARGET:-admin@52.47.120.35}"
SITE_URL="${SITE_URL:-https://jamah.52-47-120-35.sslip.io}"
cd "$(dirname "$0")/.."

NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_SITE_URL="$SITE_URL" npx next build

STAGE="$(mktemp -d)"
mkdir -p "$STAGE/standalone/.next"
cp -r .next/standalone/. "$STAGE/standalone/"
cp -r .next/static "$STAGE/standalone/.next/static"
cp -r public "$STAGE/standalone/public"
rm -rf "$STAGE"/standalone/node_modules/@img/sharp-*win32* "$STAGE"/standalone/node_modules/@img/sharp-libvips-win32*
cp deploy/Dockerfile.runtime "$STAGE/"
tar czf "$STAGE.tgz" -C "$STAGE" .

scp -i "$SSH_KEY" "$STAGE.tgz" "$SSH_TARGET:/tmp/jamah-deploy.tgz"
ssh -i "$SSH_KEY" "$SSH_TARGET" "SITE_URL='$SITE_URL' bash -s" <<'EOF'
set -euo pipefail
rm -rf ~/jamah-site && mkdir -p ~/jamah-site
tar xzf /tmp/jamah-deploy.tgz -C ~/jamah-site && rm /tmp/jamah-deploy.tgz
docker build -q -f ~/jamah-site/Dockerfile.runtime -t jamah-web:latest ~/jamah-site
docker rm -f jamah-web >/dev/null 2>&1 || true
docker run -d --name jamah-web --restart unless-stopped --memory 300m --memory-swap 300m \
  -p 127.0.0.1:8090:3000 -e NEXT_PUBLIC_SITE_URL="$SITE_URL" jamah-web:latest >/dev/null
sleep 5
curl -fsS -o /dev/null http://127.0.0.1:8090/fr && echo "jamah-web OK"
docker image prune -f >/dev/null
EOF
rm -rf "$STAGE" "$STAGE.tgz"
