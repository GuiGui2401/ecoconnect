# 🚀 EcoConnect — Déploiement production (formcam.net)

Déployé le 2026-06-14 sur le VPS ISPConfig (Debian 12, nginx, PHP 8.2, MySQL).

| Service  | URL                                   | Docroot                                                              |
|----------|---------------------------------------|---------------------------------------------------------------------|
| Frontend | https://formcam.net                   | `/var/www/clients/client0/web98/web` (build React déployé dedans)   |
| Backend  | https://backend.formcam.net/api/v1    | `/var/www/clients/client0/web98/web/ecoconnect/backend/public`      |
| Source   | `…/web98/web/ecoconnect` (front + backend) — **bloqué** au public via nginx |

- **DB** : `c0ecoconnect_db` / user `c0ecoconnect` (127.0.0.1:3306) — migrée + seedée.
- **SSL** : Let's Encrypt (certbot webroot, ECDSA) pour le front *et* le backend, renouvellement auto.
- **Auth** : Sanctum par token Bearer (`localStorage`). CORS limité à `https://formcam.net`.
- **PWA** : `vite-plugin-pwa` (manifest + service worker + cache offline + icônes).

### Comptes de démo (seed)
| Email                  | Mot de passe | Rôle  |
|------------------------|--------------|-------|
| admin@ecoconnect.cm    | Admin@2025!  | Admin |
| emma@ecoconnect.cm     | Demo@2025!   | User  |

### ⚠️ À FAIRE
La feature **AI Assistant** est inactive : ajoute ta clé dans `backend/.env`
(`CLAUDE_API_KEY=sk-ant-…`) puis lance `php8.2 artisan config:cache`.

---

## 🔁 Mettre à jour le site (après un `git pull`)

```bash
bash /var/www/clients/client0/web98/web/ecoconnect/redeploy.sh
```

---

## ⚠️ IMPORTANT — Persistance ISPConfig

La config nginx + l'`open_basedir` ont été modifiés **directement** dans les fichiers
générés (`nginx -t` OK, sites fonctionnels). ISPConfig **ne réécrit ces fichiers que si
tu rouvres/édites ces sites dans le panneau** (ou lors d'un *Resync*). Si tu le fais,
réapplique la config ci-dessous via le panneau pour que ce soit **permanent**.

Fichiers modifiés (backups `*.ecobak`) :
- `/etc/nginx/sites-available/formcam.net.vhost`
- `/etc/nginx/sites-available/backend.formcam.net.vhost`
- `/etc/php/8.2/fpm/pool.d/web83.conf` (open_basedir)

### Site `formcam.net` → Options → **nginx Directives**
```nginx
location ^~ /ecoconnect/  { deny all; return 404; }
location ^~ /backend-sie/ { deny all; return 404; }
location = /sw.js { add_header Cache-Control "no-cache, no-store, must-revalidate"; expires off; }
location = /manifest.webmanifest { default_type application/manifest+json; }
location ~* \.(?:js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2?)$ {
    expires 30d; add_header Cache-Control "public, max-age=2592000, immutable"; access_log off;
}
location / { try_files $uri $uri/ /index.html; }
```

### Site `backend.formcam.net`
1. **Web folder / Document Root** → `ecoconnect/backend/public`
   (met à jour automatiquement le `root` nginx **et** l'`open_basedir` PHP).
2. Cocher **SSL** + **Let's Encrypt SSL** (gère cert + bloc 443 + renouvellement).
3. Options → **nginx Directives** :
```nginx
client_max_body_size 1024M;
location / { try_files $uri $uri/ /index.php?$query_string; }
location ^~ /api/ { try_files $uri $uri/ /index.php?$query_string; }
location ~* \.(env|log|gitignore|gitattributes|htaccess)$ { deny all; return 404; }
gzip on; gzip_comp_level 6; gzip_min_length 256;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```
> Ne PAS remettre le `if ($request_method = OPTIONS) { return 204; }` : il empêchait
> Laravel de répondre aux préflights CORS.

---

## 📂 Fichiers de config clés
- Backend `.env` : `ecoconnect/backend/.env` (perms 640, propriété `web98:client0`).
- CORS : `ecoconnect/backend/config/cors.php` (origines via `CORS_ALLOWED_ORIGINS`).
- Front PWA : `ecoconnect/frontend/vite.config.js` (`VitePWA`).
- Pages d'erreur backend : symlink `…/backend/public/error` → `…/web/error`.
