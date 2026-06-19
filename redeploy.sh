#!/bin/bash
# =============================================================================
# EcoConnect — Redéploiement (mise à jour) sur formcam.net
# Usage : bash redeploy.sh
# À lancer en root après un `git pull`.
# =============================================================================
set -e

APP=/var/www/clients/client0/web98/web/ecoconnect
WEB=/var/www/clients/client0/web98/web
PHP=php8.2
COMPOSER=/root/.local/bin/composer
OWNER=web98:client0

echo "▶ Backend (Laravel)…"
cd "$APP/backend"
export COMPOSER_ALLOW_SUPERUSER=1
$PHP $COMPOSER install --no-dev --optimize-autoloader --no-interaction
$PHP artisan migrate --force
$PHP artisan config:cache
$PHP artisan route:cache
# (pas de view:cache : API sans vues Blade)

echo "▶ Frontend (React + PWA)…"
cd "$APP/frontend"
npm install --no-audit --no-fund
npm run build

echo "▶ Déploiement du build dans le docroot…"
rm -rf "$WEB/assets" "$WEB"/sw.js "$WEB"/workbox-*.js "$WEB"/registerSW.js \
       "$WEB"/manifest.webmanifest "$WEB"/index.html "$WEB"/pwa-*.png \
       "$WEB"/apple-touch-icon.png "$WEB"/favicon-64.png "$WEB"/eco-icon.svg 2>/dev/null || true
rsync -a "$APP/frontend/dist"/ "$WEB"/

echo "▶ Permissions…"
chown -R $OWNER "$APP"
chown -R $OWNER "$WEB/assets" 2>/dev/null || true
chown $OWNER "$WEB"/index.html "$WEB"/sw.js "$WEB"/registerSW.js \
       "$WEB"/manifest.webmanifest "$WEB"/workbox-*.js "$WEB"/*.png "$WEB"/eco-icon.svg 2>/dev/null || true
chmod -R 775 "$APP/backend/storage" "$APP/backend/bootstrap/cache"
chmod 640 "$APP/backend/.env"
ln -sfn "$WEB/error" "$APP/backend/public/error"
chown -h $OWNER "$APP/backend/public/error"

echo "▶ Reload services…"
systemctl reload php8.2-fpm
nginx -t && systemctl reload nginx

echo "✅ Redéploiement terminé — https://formcam.net  |  https://backend.formcam.net/api/v1"
