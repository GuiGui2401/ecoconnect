# 🌿 EcoConnect — Full Stack

**Protect Nature, Together with AI**

Stack : **React 18** + **Laravel 11** + **MySQL** + **Claude API**

---

## 🏗️ Architecture

```
ecoconnect/
├── frontend/          # React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── api/       # Axios + tous les services API
│       ├── pages/     # 12 pages (Home, Dashboard, Map, Feed…)
│       ├── components/# Layout (TopNav, BottomNav, AppLayout)
│       └── store/     # Zustand (auth, ui, notifs)
│
├── backend/           # Laravel 11 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # 8 controllers
│   │   ├── Models/                 # 8 models (User, Incident…)
│   │   └── Services/               # BadgeService, NotificationService
│   ├── database/
│   │   ├── migrations/             # 8 tables MySQL
│   │   └── seeders/               # Données de démo
│   └── routes/api.php              # ~40 routes versionnées /api/v1
│
└── deploy.sh          # Script de déploiement VPS automatisé
```

---

## 🚀 Démarrage rapide (développement)

### Backend

```bash
cd backend
composer install
cp .env.example .env

# Configurer MySQL dans .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve          # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:8000/api/v1
npm run dev                # http://localhost:5173
```

---

## 🔑 Variables d'environnement clés

### Backend `.env`
```env
DB_DATABASE=ecoconnect_db
DB_USERNAME=ecoconnect_user
DB_PASSWORD=your_password

CLAUDE_API_KEY=sk-ant-xxxxx        # ← Clé Anthropic pour l'AI Assistant
SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 🗄️ Base de données

| Table                   | Description                          |
|-------------------------|--------------------------------------|
| `users`                 | Comptes utilisateurs + points/niveau |
| `incidents`             | Signalements environnementaux        |
| `posts`                 | Social feed                          |
| `post_likes`            | Likes sur les posts                  |
| `post_comments`         | Commentaires                         |
| `badges`                | Badges disponibles                   |
| `user_badges`           | Badges obtenus                       |
| `challenges`            | Défis disponibles                    |
| `user_challenges`       | Progression par utilisateur          |
| `learning_resources`    | Bibliothèque d'apprentissage         |
| `user_learning_progress`| Progression apprentissage            |
| `notifications`         | Notifications Laravel                |
| `ai_conversations`      | Historique chats IA                  |

---

## 🌐 API Endpoints principaux

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout

GET    /api/v1/incidents/public       ← map publique
POST   /api/v1/incidents              ← créer signalement
GET    /api/v1/incidents/nearby       ← incidents à proximité

GET    /api/v1/posts                  ← social feed
POST   /api/v1/posts/{id}/like        ← liker un post

GET    /api/v1/challenges             ← liste défis
POST   /api/v1/challenges/{id}/join   ← rejoindre un défi

POST   /api/v1/ai/chat                ← chat avec Claude

GET    /api/v1/stats/dashboard
GET    /api/v1/stats/leaderboard
GET    /api/v1/stats/prediction
```

---

## 🚢 Déploiement VPS

```bash
# Sur ton VPS Ubuntu 22.04
git clone https://github.com/ton-repo/ecoconnect.git
cd ecoconnect
chmod +x deploy.sh
sudo bash deploy.sh
```

Le script installe automatiquement : Nginx, PHP 8.3-FPM, MySQL, Node.js 20, Composer, Certbot (SSL), Supervisor (queue).

---

## 🔐 Comptes de démo (après seed)

| Email                    | Mot de passe  | Rôle  |
|--------------------------|---------------|-------|
| admin@ecoconnect.cm      | Admin@2025!   | Admin |
| emma@ecoconnect.cm       | Demo@2025!    | User  |

---

## ✅ Features implémentées

- 🔐 Auth (register, login, logout) avec Laravel Sanctum
- 📊 Dashboard gamifié (points, badges, niveaux)
- 📡 Social Feed (posts, likes, commentaires, hashtags)
- 🗺️ Smart Map interactive (Leaflet.js + incidents géolocalisés)
- 📸 Signalement d'incidents avec upload photo/vidéo
- 🤖 AI Assistant connecté à l'API Claude (claude-sonnet-4)
- 🎯 Système de défis avec progression
- 📚 Bibliothèque d'apprentissage
- 📊 Statistiques & Analytics (donut chart, leaderboard, prédiction IA)
- 🏅 Système de badges automatique
- 🔔 Notifications en temps réel
- ⚙️ Settings (profil, langue, dark mode)

---

## 📱 Compatibilité

- Mobile-first (max-width: 480px, bottom navigation)
- PWA-ready (à compléter avec manifest.json + service worker)
- iOS/Android WebView compatible
