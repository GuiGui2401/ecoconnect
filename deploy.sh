#!/bin/bash
# =============================================================================
# EcoConnect — Script de déploiement VPS (Ubuntu 22.04+)
# Usage : bash deploy.sh
# =============================================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[EcoConnect]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# ─── 0. Variables ─────────────────────────────────────────────────────────────
DOMAIN="ecoconnect.cm"
API_DOMAIN="api.ecoconnect.cm"
APP_DIR="/var/www/ecoconnect"
DB_NAME="ecoconnect_db"
DB_USER="ecoconnect_user"
DB_PASS=$(openssl rand -base64 16)

# ─── 1. Dépendances système ───────────────────────────────────────────────────
log "Installation des dépendances système..."
apt-get update -q
apt-get install -y nginx mysql-server php8.3-fpm php8.3-cli php8.3-mysql \
    php8.3-xml php8.3-curl php8.3-mbstring php8.3-zip php8.3-gd \
    php8.3-intl unzip curl git certbot python3-certbot-nginx

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Composer
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

log "✅ Dépendances installées"

# ─── 2. MySQL ─────────────────────────────────────────────────────────────────
log "Configuration MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
log "✅ Base de données créée"

# ─── 3. Backend Laravel ───────────────────────────────────────────────────────
log "Déploiement du backend Laravel..."
mkdir -p ${APP_DIR}/backend
cd ${APP_DIR}/backend

# Si le code existe déjà, pull — sinon cloner
if [ -d ".git" ]; then
    git pull origin main
else
    warn "Copiez votre code backend dans ${APP_DIR}/backend/"
fi

composer install --no-dev --optimize-autoloader

cp .env.example .env
sed -i "s/DB_DATABASE=.*/DB_DATABASE=${DB_NAME}/"   .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=${DB_USER}/"   .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASS}/"   .env
sed -i "s|APP_URL=.*|APP_URL=https://${API_DOMAIN}|" .env
sed -i "s/APP_ENV=.*/APP_ENV=production/"           .env
sed -i "s/APP_DEBUG=.*/APP_DEBUG=false/"            .env

php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

chown -R www-data:www-data ${APP_DIR}/backend
chmod -R 755 ${APP_DIR}/backend/storage
chmod -R 755 ${APP_DIR}/backend/bootstrap/cache

log "✅ Backend configuré"

# ─── 4. Frontend React ────────────────────────────────────────────────────────
log "Build du frontend React..."
mkdir -p ${APP_DIR}/frontend
cd ${APP_DIR}/frontend

cp .env.example .env
echo "VITE_API_URL=https://${API_DOMAIN}/api/v1" > .env

npm install --frozen-lockfile
npm run build

log "✅ Frontend buildé → dist/"

# ─── 5. Nginx ─────────────────────────────────────────────────────────────────
log "Configuration Nginx..."

# Frontend
cat > /etc/nginx/sites-available/ecoconnect-front <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    root ${APP_DIR}/frontend/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
}
NGINX

# Backend API
cat > /etc/nginx/sites-available/ecoconnect-api <<NGINX
server {
    listen 80;
    server_name ${API_DOMAIN};
    root ${APP_DIR}/backend/public;
    index index.php;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* { deny all; }

    client_max_body_size 25M;

    add_header 'Access-Control-Allow-Origin' 'https://${DOMAIN}' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;

    if (\$request_method = 'OPTIONS') { return 204; }
}
NGINX

ln -sf /etc/nginx/sites-available/ecoconnect-front /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/ecoconnect-api   /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
log "✅ Nginx configuré"

# ─── 6. SSL (Let's Encrypt) ───────────────────────────────────────────────────
log "Génération des certificats SSL..."
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m admin@${DOMAIN} || warn "SSL front skipped"
certbot --nginx -d ${API_DOMAIN} --non-interactive --agree-tos -m admin@${DOMAIN} || warn "SSL API skipped"

# ─── 7. Queue worker (Supervisor) ────────────────────────────────────────────
log "Configuration Supervisor (queue worker)..."
apt-get install -y supervisor

cat > /etc/supervisor/conf.d/ecoconnect-worker.conf <<CONF
[program:ecoconnect-worker]
process_name=%(program_name)s_%(process_num)02d
command=php ${APP_DIR}/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=${APP_DIR}/backend/storage/logs/worker.log
stopwaitsecs=3600
CONF

supervisorctl reread
supervisorctl update
supervisorctl start ecoconnect-worker:*

log "✅ Queue worker démarré"

# ─── 8. Cron (scheduler Laravel) ─────────────────────────────────────────────
(crontab -l 2>/dev/null; echo "* * * * * www-data php ${APP_DIR}/backend/artisan schedule:run >> /dev/null 2>&1") | crontab -
log "✅ Cron configuré"

# ─── Résumé ───────────────────────────────────────────────────────────────────
echo ""
echo "================================================================="
echo -e "${GREEN}  🌿 EcoConnect déployé avec succès!${NC}"
echo "================================================================="
echo "  Frontend : https://${DOMAIN}"
echo "  API      : https://${API_DOMAIN}/api/v1"
echo "  DB User  : ${DB_USER}"
echo "  DB Pass  : ${DB_PASS}   ← SAUVEGARDEZ CE MOT DE PASSE!"
echo "================================================================="
echo "  ⚠️  Ajoutez votre CLAUDE_API_KEY dans ${APP_DIR}/backend/.env"
echo "================================================================="
