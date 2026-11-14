#!/usr/bin/env bash
# Redéploie le site public sur la VM partagée (itvision) — build local, exécution légère sur la VM.
# Usage : SSH_KEY=~/.ssh/utils.pem SITE_URL=https://jamah.52-47-120-35.sslip.io ./deploy/deploy.sh
set -euo pipefail

SSH_KEY="${SSH_KEY:-$HOME/.ssh/utils.pem}"
SSH_TARGET="${SSH_TARGET:-admin@52.47.120.35}"
SITE_URL="${SITE_URL:-https://jamah.52-47-120-35.sslip.io}"
# Vide tant que la VM dédiée n'est pas en place : la page de recherche l'annonce.
SEARCH_API_URL="${SEARCH_API_URL:-}"
# URL de Directus vue depuis le conteneur du site (vide = textes et images par défaut du code).
CMS_URL="${CMS_URL:-}"
# Jeton attendu par /api/revalidate (flow Directus « Mise à jour du site »). Vide = route désactivée.
REVALIDATE_TOKEN="${REVALIDATE_TOKEN:-}"
cd "$(dirname "$0")/.."

NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_SITE_URL="$SITE_URL" CMS_URL="$CMS_URL" npx next build

STAGE="$(mktemp -d)"
mkdir -p "$STAGE/standalone/.next"
cp -r .next/standalone/. "$STAGE/standalone/"
cp -r .next/static "$STAGE/standalone/.next/static"
cp -r public "$STAGE/standalone/public"
rm -rf "$STAGE"/standalone/node_modules/@img/sharp-*win32* "$STAGE"/standalone/node_modules/@img/sharp-libvips-win32*
cp deploy/Dockerfile.runtime "$STAGE/"
# Variables d'exécution (dont le jeton) : fichier à part, jamais copié dans l'image.
(umask 077 && printf 'NEXT_PUBLIC_SITE_URL=%s\nSEARCH_API_URL=%s\nCMS_URL=%s\nREVALIDATE_TOKEN=%s\n' \
  "$SITE_URL" "$SEARCH_API_URL" "$CMS_URL" "$REVALIDATE_TOKEN" > "$STAGE/runtime.env")
(umask 077 && tar czf "$STAGE.tgz" -C "$STAGE" .)

scp -i "$SSH_KEY" "$STAGE.tgz" "$SSH_TARGET:/tmp/jamah-deploy.tgz"
ssh -i "$SSH_KEY" "$SSH_TARGET" "bash -s" <<'EOF'
set -euo pipefail
rm -rf ~/jamah-site && mkdir -p ~/jamah-site
tar xzf /tmp/jamah-deploy.tgz -C ~/jamah-site && rm /tmp/jamah-deploy.tgz
mv ~/jamah-site/runtime.env ~/.jamah-web.env && chmod 600 ~/.jamah-web.env
docker build -q -f ~/jamah-site/Dockerfile.runtime -t jamah-web:latest ~/jamah-site
docker rm -f jamah-web >/dev/null 2>&1 || true
docker run -d --name jamah-web --restart unless-stopped --memory 300m --memory-swap 300m \
  -p 127.0.0.1:8090:3000 --env-file ~/.jamah-web.env jamah-web:latest >/dev/null
sleep 5
curl -fsS -o /dev/null http://127.0.0.1:8090/fr && echo "jamah-web OK"
docker image prune -f >/dev/null
EOF
rm -rf "$STAGE" "$STAGE.tgz"
