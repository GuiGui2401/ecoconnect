// =============================================================================
// PAGES — Profile, Notifications, Settings, Learning, Home
// =============================================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  Bell,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  FileText,
  Filter,
  Flower2,
  Globe,
  HandHeart,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  Newspaper,
  Scale,
  Search,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'
import { apiAssetUrl, authApi, environmentApi, incidentsApi, learningApi, notificationsApi, postsApi, statsApi, userApi } from '@/api'
import { useAuthStore, useSettingsStore } from '@/store'
import { asCollection, EcoIcon, INCIDENT_TYPES, ROLE_META, roleMeta } from '@/lib/ecoconnect'
import { useT } from '@/lib/i18n'

const NOTIFICATION_META = {
  new_incident: { icon: 'alert', bg: 'bg-orange-50', text: 'New environmental incident reported' },
  incident_validated: { icon: 'check', bg: 'bg-green-pale', text: 'Your report has been validated' },
  default: { icon: 'bell', bg: 'bg-blue-50', text: 'Notification' },
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('fr-FR') : ''
}

function formatMonth(value) {
  return value
    ? new Date(value).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    : 'Compte actif'
}

function openExternal(url) {
  if (!url) {
    toast('Aucun lien disponible')
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

const HUB_TABS = [
  { id: 'news', label: 'Actualités', icon: Newspaper },
  { id: 'orgs', label: 'ONG', icon: Building2 },
  { id: 'law', label: 'Droit', icon: Scale },
]

function matchesSearch(item, search) {
  if (!search.trim()) return true
  const haystack = [
    item.title,
    item.name,
    item.summary,
    item.project,
    item.focus,
    item.region,
    item.source,
    item.topic,
    item.jurisdiction,
    ...(item.tags || []),
  ].filter(Boolean).join(' ').toLowerCase()

  return haystack.includes(search.trim().toLowerCase())
}

// ─────────────────────────────────────────────────────────────────────────────
// src/pages/ProfilePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)
  const role     = roleMeta(user?.profile_type)
  const RoleIcon = role.icon

  const { data: stats }  = useQuery({ queryKey: ['user-stats'],  queryFn: () => userApi.stats().then(r => r.data) })
  const { data: badges } = useQuery({ queryKey: ['user-badges'], queryFn: () => userApi.badges().then(r => r.data) })
  const { data: posts }  = useQuery({ queryKey: ['posts', 'profile'], queryFn: () => postsApi.list().then(r => r.data) })
  const { data: savedHubItems } = useQuery({
    queryKey: ['environment-favorites'],
    queryFn: () => environmentApi.favorites().then(r => r.data),
  })

  const badgeList = asCollection(badges)
  const favoriteList = asCollection(savedHubItems).slice(0, 4)
  const postList = asCollection(posts)
    .filter((post) => !user?.id || post.user_id === user.id || post.user?.id === user.id)
    .slice(0, 6)

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-eco-dark to-green-primary px-4 py-7 text-white text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 border-3 border-white/40 flex items-center justify-center text-4xl mx-auto mb-3 overflow-hidden">
          {user?.avatar ? <img src={apiAssetUrl(user.avatar)} className="w-full h-full object-cover" /> : '👤'}
        </div>
        <h2 className="font-display font-bold text-xl">{user?.name || 'Econnect'}</h2>
        <p className="text-sm opacity-75 mt-0.5">{stats?.level || user?.level || 'Eco Starter'}</p>
        <p className="text-xs opacity-60 mt-0.5">Membre depuis {formatMonth(user?.created_at)}</p>
        <div className="flex justify-around mt-5">
          {[
            { label: 'Points',  value: stats?.points ?? user?.points ?? 0 },
            { label: 'Reports', value: stats?.incidents ?? 0 },
            { label: 'Badges',  value: stats?.badges ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-display font-bold text-xl">{value}</p>
              <p className="text-xs opacity-70 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4 card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-pale text-green-primary flex items-center justify-center flex-shrink-0">
          <RoleIcon size={21} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{role.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{role.focus}</p>
        </div>
        <button
          onClick={() => navigate(role.path)}
          className="text-xs font-semibold text-white bg-green-primary rounded-lg px-3 py-2 flex-shrink-0"
        >
          {role.cta}
        </button>
      </div>

      {/* Badges */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-bold text-base">🏅 Badges</p>
          <button onClick={() => navigate('/challenges')} className="text-xs font-semibold text-green-primary">Gagner plus</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {badgeList.map(b => (
            <div key={b.name || b.slug} className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-green-primary"><EcoIcon name={b.icon || b.slug} size={16} /></span>
              <span className="text-xs font-medium">{b.name}</span>
            </div>
          ))}
          {badgeList.length === 0 && (
            <div className="card p-4 text-sm text-gray-500 w-full">
              Aucun badge pour l instant. Rejoins un challenge ou signale un incident pour en debloquer.
            </div>
          )}
        </div>
      </div>

      {/* Favorites */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-bold text-base">⭐ Mes favoris</p>
          <button onClick={() => navigate('/environment-hub')} className="text-xs font-semibold text-green-primary">Ouvrir le centre</button>
        </div>
        <div className="space-y-2.5">
          {favoriteList.map((favorite) => {
            const item = favorite.item || {}
            const title = item.title || item.name || 'Favori EcoConnect'
            const icon = favorite.item_type === 'organization' ? 'users' : favorite.item_type === 'legal_guide' ? 'laws' : 'book'
            const typeLabel = favorite.item_type === 'organization' ? 'ONG' : favorite.item_type === 'legal_guide' ? 'Droit' : 'Actualite'

            return (
              <button
                key={`${favorite.item_type}-${favorite.item_id}`}
                onClick={() => openExternal(item.url || item.website)}
                className="w-full card p-3 flex items-center gap-3 text-left hover:border-green-primary transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-green-pale text-green-primary flex items-center justify-center flex-shrink-0">
                  <EcoIcon name={icon} size={19} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{typeLabel}</span>
                  </div>
                  <p className="text-sm font-semibold mt-1 line-clamp-1">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.summary || item.focus || item.topic}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            )
          })}
          {favoriteList.length === 0 && (
            <div className="card p-4 text-sm text-gray-500">
              Aucun favori pour l instant. Sauvegarde une actualite, une ONG ou un guide depuis le centre environnemental.
            </div>
          )}
        </div>
      </div>

      {/* Posts grid */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-bold text-base">📝 My Posts</p>
          <button onClick={() => navigate('/feed')} className="text-xs font-semibold text-green-primary">Ouvrir le feed</button>
        </div>
        {postList.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {postList.map((post) => (
              <button key={post.id} onClick={() => navigate('/feed')} className="relative aspect-square rounded-xl bg-green-pale text-left text-xs text-gray-600 overflow-hidden">
                {post.media_urls?.[0] && (
                  <img src={apiAssetUrl(post.media_urls[0])} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
                <div className={`absolute inset-x-0 bottom-0 p-3 ${post.media_urls?.[0] ? 'bg-gradient-to-t from-black/70 to-transparent text-white' : ''}`}>
                  <p className="line-clamp-4">{post.content}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="card p-4 text-sm text-gray-500">
            Tu n as pas encore publie. Va dans le feed pour partager ta premiere action.
          </div>
        )}
      </div>

      <div className="px-4 mt-5">
        <button onClick={() => navigate('/settings')} className="btn-green w-full flex items-center justify-center gap-2">
          <Settings size={16} /> Settings
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// src/pages/NotificationsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function NotificationsPage() {
  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationsApi.list().then(r => r.data),
  })

  const notifications = asCollection(data).map((n) => {
    const meta = NOTIFICATION_META[n.data?.type] || NOTIFICATION_META.default
    return {
      id: n.id,
      unread: !n.read_at,
      icon: meta.icon,
      bg: meta.bg,
      text: n.data?.message || meta.text,
      time: formatDate(n.created_at),
    }
  })

  const readAll = useMutation({
    mutationFn: () => notificationsApi.readAll(),
    onSuccess:  () => { toast.success('Tout est marque comme lu'); refetch() },
  })

  const markRead = useMutation({
    mutationFn: (id) => notificationsApi.read(id),
    onSuccess:  () => refetch(),
  })

  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h1 className="font-display font-bold text-xl">🔔 Notifications</h1>
        <button
          onClick={() => readAll.mutate()}
          disabled={readAll.isPending || notifications.length === 0}
          className="text-xs font-semibold text-green-primary disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      <div>
        {notifications.map(n => (
          <button
            key={n.id}
            onClick={() => n.unread && markRead.mutate(n.id)}
            className={`w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 transition-colors
              ${n.unread ? 'bg-green-pale/30' : 'hover:bg-gray-50'}`}
          >
            <div className={`w-10 h-10 rounded-full ${n.bg} flex items-center justify-center text-green-primary flex-shrink-0`}>
              <EcoIcon name={n.icon} size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm leading-snug text-gray-700">{n.text}</p>
              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
            </div>
            {n.unread && <div className="w-2 h-2 rounded-full bg-green-primary mt-2 flex-shrink-0" />}
          </button>
        ))}
        {notifications.length === 0 && (
          <div className="mx-4 card p-5 text-center text-sm text-gray-500">
            Aucune notification pour le moment.
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// src/pages/SettingsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const t = useT()

  const darkMode = useSettingsStore(s => s.darkMode)
  const language = useSettingsStore(s => s.language)
  const notifsEnabled = useSettingsStore(s => s.notificationsEnabled)

  const setDarkMode = useSettingsStore(s => s.setDarkMode)
  const setLanguage = useSettingsStore(s => s.setLanguage)
  const setNotifications = useSettingsStore(s => s.setNotifications)

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess:  () => { logout(); navigate('/'); toast.success('A bientot!') },
    onSettled:  () => { logout(); navigate('/') },
  })

  const passwordMutation = useMutation({
    mutationFn: () => authApi.forgotPassword(user?.email),
    onSuccess: () => toast.success('Demande de reinitialisation envoyee'),
    onError: () => toast.error('Impossible d envoyer la demande pour le moment'),
  })

  const SECTIONS = [
    {
      title: t('account'),
      items: [
        { icon: Lock, label: t('password'), sub: t('passwordSub'), action: () => passwordMutation.mutate() },
        { icon: Eye, label: t('privacy'),  sub: t('privacySub'),     action: () => navigate('/profile') },
      ],
    },
    {
      title: t('preferences'),
      items: [
        { icon: Bell, label: t('notifications'), sub: notifsEnabled ? t('enabled') : t('disabled'), toggle: notifsEnabled, onToggle: () => setNotifications(!notifsEnabled) },
        { icon: Globe, label: t('language'), sub: language === 'fr' ? 'Francais' : 'English', action: () => setLanguage(language === 'fr' ? 'en' : 'fr') },
        { icon: Moon, label: t('appearance'), sub: darkMode ? t('darkSaved') : t('lightSaved'), toggle: darkMode, onToggle: () => setDarkMode(!darkMode) },
      ],
    },
    {
      title: t('securityHelp'),
      items: [
        { icon: Shield, label: t('security'), sub: t('securitySub'), action: () => navigate('/notifications') },
        { icon: HelpCircle, label: t('helpSupport'), sub: t('helpSupportSub'), action: () => navigate('/help') },
        { icon: Info, label: t('about'), sub: t('aboutSub'), action: () => navigate('/about') },
      ],
    },
  ]

  return (
    <div className={`pb-6 min-h-screen ${darkMode ? 'bg-gray-950 text-white' : ''}`}>
      <h1 className="font-display font-bold text-xl px-4 pt-5 mb-1">⚙️ {t('settings')}</h1>
      <p className={`text-xs px-4 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>{user?.email}</p>

      {SECTIONS.map(({ title, items }) => (
        <div key={title} className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 mb-2">{title}</p>
          <div className="mx-4 space-y-2">
            {items.map(({ icon: Icon, label, sub, action, toggle, onToggle }) => (
              <button
                key={label}
                onClick={action || onToggle}
                className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-all
                  ${darkMode ? 'bg-gray-900 border-gray-800 hover:bg-gray-800' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                  ${darkMode ? 'bg-gray-800 text-green-light' : 'bg-gray-100 text-green-primary'}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{label}</p>
                  {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                </div>
                {toggle !== undefined
                  ? <div onClick={e => { e.stopPropagation(); onToggle() }}
                      className={`w-11 h-6 rounded-full relative transition-all cursor-pointer flex-shrink-0
                        ${toggle ? 'bg-green-primary' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all
                        ${toggle ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  : <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                }
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <div className="mx-4">
        <button onClick={() => logoutMutation.mutate()}
          className="w-full flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <LogOut size={18} className="text-red-500" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-red-600">{t('logout')}</span>
          <ChevronRight size={16} className="text-red-300" />
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">Econnect v1.0.0 · © 2026</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// src/pages/LearningPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function LearningPage() {
  const qc = useQueryClient()
  const [cat, setCat]       = useState('All')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const CATS = ['All', 'Biodiversity', 'Climate', 'Water', 'Waste', 'Laws']

  const { data, isLoading } = useQuery({
    queryKey: ['learning', cat],
    queryFn:  () => learningApi.list({ category: cat === 'All' ? '' : cat.toLowerCase() }).then(r => r.data),
  })

  const resources = asCollection(data)
  const items = resources.filter(r =>
    search ? (r.title || '').toLowerCase().includes(search.toLowerCase()) : true
  )
  const selected = items.find((r) => r.id === selectedId) || items[0]

  const completeMutation = useMutation({
    mutationFn: (id) => learningApi.complete(id),
    onSuccess: () => {
      toast.success('Ressource terminee: +15 points')
      qc.invalidateQueries({ queryKey: ['user-stats'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
    onError: () => toast.error('Impossible de marquer cette ressource'),
  })

  return (
    <div className="pb-4">
      <h1 className="font-display font-bold text-xl px-4 pt-5">📚 Learning Library</h1>

      {/* Search */}
      <div className="mx-4 mt-3 relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search resources..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-green-primary" />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto scrollbar-none pb-1">
        {CATS.map(c => (
          <button key={c} onClick={() => { setCat(c); setSelectedId(null) }}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all
              ${cat === c ? 'bg-green-primary text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            {c}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mx-4 mt-3 card p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-pale text-green-primary flex items-center justify-center flex-shrink-0">
              <EcoIcon name={selected.icon || selected.category || selected.type} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-snug">{selected.title}</p>
              <p className="text-xs text-gray-500 mt-1">{selected.description}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                {selected.type || 'resource'} · {selected.level || 'all levels'} · {selected.duration_minutes || 0} min
              </p>
            </div>
          </div>
          <button
            onClick={() => completeMutation.mutate(selected.id)}
            disabled={completeMutation.isPending}
            className="btn-green w-full mt-3"
          >
            Marquer comme termine
          </button>
        </div>
      )}

      {/* Resources */}
      <div className="px-4 mt-3 space-y-2.5">
        {isLoading && <div className="card p-4 text-sm text-gray-500">Chargement des ressources...</div>}
        {items.map(r => (
          <button key={r.id} onClick={() => setSelectedId(r.id)}
            className={`w-full card flex items-center gap-3 p-3.5 hover:translate-x-1 hover:border-green-primary transition-all text-left
              ${selected?.id === r.id ? 'border-green-primary' : ''}`}>
            <div className="w-14 h-14 rounded-xl bg-green-pale text-green-primary flex items-center justify-center flex-shrink-0">
              <EcoIcon name={r.icon || r.category || r.type} size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-snug">{r.title}</p>
              <p className="text-xs text-gray-400 mt-1">
                {r.type || 'Resource'} · {r.level || 'All levels'}
              </p>
            </div>
            <span className="text-xs font-semibold bg-green-pale text-green-primary px-2 py-0.5 rounded-full flex-shrink-0">
              {r.category}
            </span>
          </button>
        ))}
        {!isLoading && items.length === 0 && (
          <div className="card p-5 text-center text-sm text-gray-500">
            Aucune ressource trouvee pour ce filtre.
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// src/pages/EnvironmentHubPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function EnvironmentHubPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [tab, setTab] = useState('news')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [completedLawIds, setCompletedLawIds] = useState(() => new Set(JSON.parse(localStorage.getItem('eco_law_done') || '[]')))

  const { data: hubData, isLoading } = useQuery({
    queryKey: ['environment-hub'],
    queryFn: () => environmentApi.list().then(r => r.data),
  })

  const { data: favorites } = useQuery({
    queryKey: ['environment-favorites'],
    queryFn: () => environmentApi.favorites().then(r => r.data),
    enabled: isAuthenticated,
  })

  const newsItems = asCollection(hubData?.news)
  const organizations = asCollection(hubData?.organizations)
  const legalGuides = asCollection(hubData?.legal_guides)
  const favoriteKeys = new Set(asCollection(favorites).map((item) => `${item.item_type}:${item.item_id}`))

  const filterOptions = {
    news: ['all', ...new Set(newsItems.map((item) => item.type))],
    orgs: ['all', ...new Set(organizations.map((item) => item.scope))],
    law: ['all', ...new Set(legalGuides.map((item) => item.jurisdiction))],
  }

  const activeItems = {
    news: newsItems.filter((item) => matchesSearch(item, search) && (filter === 'all' || item.type === filter)),
    orgs: organizations.filter((item) => matchesSearch(item, search) && (filter === 'all' || item.scope === filter)),
    law: legalGuides.filter((item) => matchesSearch(item, search) && (filter === 'all' || item.jurisdiction === filter)),
  }[tab]

  const favoriteMutation = useMutation({
    mutationFn: (item) => environmentApi.toggleFavorite(item.item_type, item.id),
    onSuccess: ({ data }) => {
      toast(data.saved ? 'Ajoute aux favoris' : 'Retire des favoris')
      qc.invalidateQueries({ queryKey: ['environment-favorites'] })
    },
    onError: () => toast.error('Impossible de modifier ce favori'),
  })

  const updateSaved = (item) => {
    if (!isAuthenticated) {
      toast('Connecte-toi pour garder tes favoris')
      navigate('/login')
      return
    }

    favoriteMutation.mutate(item)
  }

  const toggleLawDone = (id) => {
    setCompletedLawIds((current) => {
      const next = new Set(current)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem('eco_law_done', JSON.stringify([...next]))
      return next
    })
  }

  const shareItem = async (item) => {
    const target = item.url || item.website
    try {
      await navigator.clipboard?.writeText(target)
      toast.success('Lien copie')
    } catch {
      toast('Lien disponible via le bouton ouvrir')
    }
  }

  const resetFilterForTab = (nextTab) => {
    setTab(nextTab)
    setFilter('all')
  }

  return (
    <div className="pb-8 bg-white min-h-screen">
      <div className="flex items-center gap-2 px-4 pt-5 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="font-display font-bold text-xl">Centre environnemental</h1>
          <p className="text-xs text-gray-400">Actualités, ONG et droit de l environnement</p>
        </div>
      </div>

      <div className="mx-4 bg-eco-dark rounded-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-green-light/20 flex items-center justify-center flex-shrink-0">
            <Globe size={22} className="text-green-light" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-lg">Veille active EcoConnect</p>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              Suis les informations utiles, trouve une communaute et comprends les textes qui encadrent tes droits et devoirs.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            [newsItems.length, 'actus'],
            [organizations.length, 'ONG'],
            [legalGuides.length, 'guides'],
          ].map(([value, label]) => (
            <div key={label} className="text-center bg-white/10 rounded-xl py-2">
              <p className="font-display font-bold text-lg">{value}</p>
              <p className="text-[10px] text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4 relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher: climat, ONG, loi, biodiversite..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-green-primary"
        />
      </div>

      <div className="flex gap-2 px-4 mt-3 overflow-x-auto scrollbar-none pb-1">
        {HUB_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => resetFilterForTab(id)}
            className={`flex items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${tab === id ? 'bg-green-primary text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="mx-4 mt-2 flex items-center gap-2">
        <Filter size={15} className="text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-green-primary"
        >
          {filterOptions[tab].map((option) => (
            <option key={option} value={option}>{option === 'all' ? 'Tous les filtres' : option}</option>
          ))}
        </select>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {isLoading && (
          <div className="card p-4 text-sm text-gray-500">Chargement du centre environnemental...</div>
        )}

        {tab === 'news' && activeItems.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${item.priority === 'high' ? 'bg-red-50 text-red-600' : item.priority === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-pale text-green-primary'}`}>
                {item.type === 'Decouverte scientifique' || item.type === 'Découverte scientifique' ? <Sparkles size={19} /> : item.type === 'Alerte climatique' ? <AlertCircle size={19} /> : <Newspaper size={19} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.type}</span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1"><CalendarDays size={12} />{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <p className="font-semibold text-sm mt-1.5 leading-snug">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.summary}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-green-pale text-green-primary px-2 py-0.5 rounded-full">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => openExternal(item.url)} className="flex-1 flex items-center justify-center gap-1.5 bg-green-primary text-white rounded-lg py-2 text-xs font-semibold">
                <ExternalLink size={14} /> Lire la source
              </button>
              <button
                onClick={() => updateSaved(item)}
                disabled={favoriteMutation.isPending}
                className={`px-3 rounded-lg text-xs font-semibold border ${favoriteKeys.has(`${item.item_type}:${item.id}`) ? 'border-green-primary text-green-primary bg-green-pale' : 'border-gray-200 text-gray-500'}`}
              >
                {favoriteKeys.has(`${item.item_type}:${item.id}`) ? 'Sauve' : 'Sauver'}
              </button>
              <button onClick={() => shareItem(item)} className="w-10 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
                <Share2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {tab === 'orgs' && activeItems.map((org) => (
          <div key={org.id} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-pale text-green-primary flex items-center justify-center flex-shrink-0">
                <Users size={19} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{org.name}</p>
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{org.scope}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={12} />{org.region}</p>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{org.focus}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{org.project}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {org.tags.map((tag) => (
                <span key={tag} className="text-[10px] bg-green-pale text-green-primary px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button onClick={() => openExternal(org.website)} className="flex items-center justify-center gap-1.5 bg-green-primary text-white rounded-lg py-2 text-xs font-semibold">
                <Users size={14} /> Rejoindre
              </button>
              <button onClick={() => openExternal(org.donateUrl)} className="flex items-center justify-center gap-1.5 bg-green-pale text-green-primary rounded-lg py-2 text-xs font-semibold">
                <HandHeart size={14} /> Faire un don
              </button>
            </div>
            <button
              onClick={() => updateSaved(org)}
              disabled={favoriteMutation.isPending}
              className={`w-full mt-2 rounded-lg py-2 text-xs font-semibold border ${favoriteKeys.has(`${org.item_type}:${org.id}`) ? 'border-green-primary text-green-primary bg-green-pale' : 'border-gray-200 text-gray-500'}`}
            >
              {favoriteKeys.has(`${org.item_type}:${org.id}`) ? 'Retirer des favoris' : 'Sauver dans mes favoris'}
            </button>
          </div>
        ))}

        {tab === 'law' && activeItems.map((guide) => (
          <div key={guide.id} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Scale size={19} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{guide.jurisdiction}</span>
                  <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{guide.topic}</span>
                </div>
                <p className="font-semibold text-sm mt-1.5 leading-snug">{guide.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{guide.summary}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {guide.duties.map((duty) => (
                <button
                  key={duty}
                  onClick={() => toggleLawDone(`${guide.id}:${duty}`)}
                  className="w-full flex items-center gap-2 text-left text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${completedLawIds.has(`${guide.id}:${duty}`) ? 'bg-green-primary border-green-primary text-white' : 'border-gray-300'}`}>
                    {completedLawIds.has(`${guide.id}:${duty}`) ? '✓' : ''}
                  </span>
                  {duty}
                </button>
              ))}
            </div>
            <button onClick={() => openExternal(guide.url)} className="w-full mt-3 flex items-center justify-center gap-1.5 bg-green-primary text-white rounded-lg py-2 text-xs font-semibold">
              <FileText size={14} /> Ouvrir le texte officiel
            </button>
            <button
              onClick={() => updateSaved(guide)}
              disabled={favoriteMutation.isPending}
              className={`w-full mt-2 rounded-lg py-2 text-xs font-semibold border ${favoriteKeys.has(`${guide.item_type}:${guide.id}`) ? 'border-green-primary text-green-primary bg-green-pale' : 'border-gray-200 text-gray-500'}`}
            >
              {favoriteKeys.has(`${guide.item_type}:${guide.id}`) ? 'Retirer des favoris' : 'Sauver dans mes favoris'}
            </button>
          </div>
        ))}

        {!isLoading && activeItems.length === 0 && (
          <div className="card p-5 text-center text-sm text-gray-500">
            Aucun resultat pour cette recherche.
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// src/pages/HomePage.jsx  (landing page publique)
// ─────────────────────────────────────────────────────────────────────────────
export function HomePage() {
  const navigate = useNavigate()

  const { data: publicStats } = useQuery({
    queryKey: ['stats-public'],
    queryFn: () => statsApi.public().then(r => r.data),
  })

  const { data: incidents } = useQuery({
    queryKey: ['incidents-public'],
    queryFn: () => incidentsApi.public().then(r => r.data),
  })

  const alerts = asCollection(incidents).slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col max-w-[480px] mx-auto bg-white shadow-2xl">
      {/* Hero */}
      <div className="bg-gradient-to-br from-eco-dark to-green-primary px-6 py-10 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 text-8xl opacity-10">🌍</div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-green-light/30 flex items-center justify-center text-xl">🌿</div>
          <span className="font-display font-bold text-lg">Econnect</span>
        </div>
        <h1 className="font-display font-bold text-3xl leading-tight mb-3">
          Protect Nature,<br /><span className="text-green-light">Together with AI</span> 🌍
        </h1>
        <p className="text-sm opacity-80 leading-relaxed mb-6">
          Join the Econnect community. Learn, act and make a difference for our planet.
        </p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/register')} className="btn-primary">
            Get Started
          </button>
          <button onClick={() => navigate('/map')}
            className="px-5 py-3 rounded-full border-2 border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-all">
            Explore
          </button>
        </div>
      </div>

      {/* Impact */}
      <div className="bg-eco-dark flex justify-around py-4">
        {[
          [publicStats?.total_actions ?? 0, 'Actions'],
          [publicStats?.total_incidents ?? 0, 'Reports'],
          [publicStats?.total_users ?? 0, 'Members'],
        ].map(([n, l]) => (
          <div key={l} className="text-center">
            <p className="font-display font-bold text-xl text-green-light">{n.toLocaleString()}</p>
            <p className="text-[10px] text-white/50 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="flex-1 px-4 py-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-bold text-base">⚠️ Recent Alerts</p>
          <button className="text-xs font-semibold text-green-primary" onClick={() => navigate('/login')}>View all</button>
        </div>
        <div className="space-y-2.5">
          {alerts.map((incident) => {
            const type = INCIDENT_TYPES[incident.type] || INCIDENT_TYPES.other
            const level = incident.risk_level || 'medium'
            return (
              <div key={incident.id} className="card flex items-center gap-3 p-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                  ${level === 'high' || level === 'critical' ? 'bg-red-50' : 'bg-orange-50'}`}>{type.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{type.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{incident.location_name}</p>
                </div>
                <span className={level === 'high' || level === 'critical' ? 'badge-high' : 'badge-medium'}>
                  {level.toUpperCase()}
                </span>
              </div>
            )
          })}
          {alerts.length === 0 && (
            <div className="card p-4 text-sm text-gray-500">
              Aucun signalement valide pour le moment.
            </div>
          )}
        </div>

        <button onClick={() => navigate('/register')} className="btn-green w-full mt-6">
          Join Econnect — It's Free
        </button>
        <p className="text-center text-sm text-gray-400 mt-3">
          Already a member?{' '}
          <button onClick={() => navigate('/login')} className="text-green-primary font-semibold">Log in</button>
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// src/pages/AboutPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function AboutPage() {
  const navigate = useNavigate()
  return (
    <div className="pb-8 bg-white min-h-screen">
      <div className="flex items-center gap-2 px-4 pt-5 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="font-display font-bold text-xl">About EcoConnect</h1>
      </div>

      <div className="flex flex-col items-center px-6 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm border border-green-100">
          <Flower2 size={40} className="text-green-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900">EcoConnect</h2>
        <p className="text-green-primary font-medium text-xs mt-1 bg-green-50 px-3 py-1 rounded-full">Version 1.0.0</p>

        <div className="mt-10 text-left w-full">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-3 px-1">Our Mission</h3>
          <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed">
              EcoConnect is a community-driven platform dedicated to environmental preservation.
              We believe that by connecting citizens, students, experts, and NGOs, we can create
              a powerful force for positive ecological change.
            </p>
          </div>
        </div>

        <div className="mt-10 text-left w-full">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-3 px-1">Community Roles</h3>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(ROLE_META).map(([key, role]) => (
              <div key={key} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-100 transition-colors group">
                <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-50 transition-colors">
                  <role.icon size={20} className="text-gray-400 group-hover:text-green-primary transition-colors" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{role.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{role.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// src/pages/HelpSupportPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function HelpSupportPage() {
  const navigate = useNavigate()
  const HELP_ITEMS = [
    { icon: HelpCircle, label: 'FAQ', sub: 'Common questions & answers' },
    { icon: Mail, label: 'Contact Us', sub: 'Get in touch with our team' },
    { icon: AlertCircle, label: 'Report a Problem', sub: 'Technical issues or bugs' },
    { icon: MessageSquare, label: 'Live Chat', sub: 'Talk to an agent now' },
  ]

  return (
    <div className="pb-8 bg-white min-h-screen">
      <div className="flex items-center gap-2 px-4 pt-5 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="font-display font-bold text-xl">Help & Support</h1>
      </div>

      <div className="px-4 space-y-3">
        {HELP_ITEMS.map((item) => (
          <button key={item.label} className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-left group">
            <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-50 transition-colors">
              <item.icon size={20} className="text-gray-400 group-hover:text-green-primary transition-colors" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
      </div>

      <div className="mx-4 mt-10 p-6 bg-green-primary rounded-[2.5rem] text-white relative overflow-hidden shadow-lg shadow-green-100">
        <div className="relative z-10 flex items-center gap-5">
          <div className="flex-1">
            <h3 className="font-display font-bold text-xl leading-tight">Together, we can make a difference!</h3>
            <p className="text-green-50 text-xs mt-3 opacity-90 leading-relaxed">Every small action counts towards a greener future for our planet.</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
            <Globe size={32} className="text-white" />
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-green-400/20 rounded-full blur-xl" />
      </div>
    </div>
  )
}
