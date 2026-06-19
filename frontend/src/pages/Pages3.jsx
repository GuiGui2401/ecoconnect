// =============================================================================
// PAGES — Profile, Notifications, Settings, Learning, Home
// =============================================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Bell,
  ChevronRight,
  Eye,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  Moon,
  Search,
  Settings,
  Shield,
} from 'lucide-react'
import { authApi, incidentsApi, learningApi, notificationsApi, postsApi, statsApi, userApi } from '@/api'
import { useAuthStore } from '@/store'
import { asCollection, EcoIcon, INCIDENT_TYPES, roleMeta } from '@/lib/ecoconnect'

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

  const badgeList = asCollection(badges)
  const postList = asCollection(posts)
    .filter((post) => !user?.id || post.user_id === user.id || post.user?.id === user.id)
    .slice(0, 6)

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-eco-dark to-green-primary px-4 py-7 text-white text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 border-3 border-white/40 flex items-center justify-center text-4xl mx-auto mb-3 overflow-hidden">
          {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : '👤'}
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

      {/* Posts grid */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-bold text-base">📝 My Posts</p>
          <button onClick={() => navigate('/feed')} className="text-xs font-semibold text-green-primary">Ouvrir le feed</button>
        </div>
        {postList.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {postList.map((post) => (
              <button key={post.id} onClick={() => navigate('/feed')} className="aspect-square rounded-xl bg-green-pale p-3 text-left text-xs text-gray-600 overflow-hidden">
                <p className="line-clamp-5">{post.content}</p>
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
  const [notifs, setNotifs] = useState(true)
  const [dark, setDark]     = useState(false)
  const [lang, setLang]     = useState('fr')

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
      title: 'Account',
      items: [
        { icon: Lock, label: 'Password', sub: 'Send reset link to your email', action: () => passwordMutation.mutate() },
        { icon: Eye, label: 'Privacy',  sub: 'Review public profile data',     action: () => navigate('/profile') },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', sub: notifs ? 'Enabled' : 'Disabled', toggle: notifs, onToggle: () => setNotifs(v => !v) },
        { icon: Globe, label: 'Language', sub: lang === 'fr' ? 'Francais' : 'English', action: () => setLang(v => v === 'fr' ? 'en' : 'fr') },
        { icon: Moon, label: 'Appearance', sub: dark ? 'Dark preference saved' : 'Light preference saved', toggle: dark, onToggle: () => setDark(v => !v) },
      ],
    },
    {
      title: 'Security & Help',
      items: [
        { icon: Shield, label: 'Security', sub: 'See account notifications', action: () => navigate('/notifications') },
        { icon: HelpCircle, label: 'Help & Support', sub: 'Ask the eco assistant', action: () => navigate('/ai') },
      ],
    },
  ]

  return (
    <div className={`pb-6 min-h-screen ${dark ? 'bg-gray-950 text-white' : ''}`}>
      <h1 className="font-display font-bold text-xl px-4 pt-5 mb-1">⚙️ Settings</h1>
      <p className={`text-xs px-4 mb-4 ${dark ? 'text-gray-400' : 'text-gray-400'}`}>{user?.email}</p>

      {SECTIONS.map(({ title, items }) => (
        <div key={title} className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-4 mb-2">{title}</p>
          <div className="mx-4 space-y-2">
            {items.map(({ icon: Icon, label, sub, action, toggle, onToggle }) => (
              <button
                key={label}
                onClick={action || onToggle}
                className={`w-full flex items-center gap-3 p-3.5 border rounded-xl transition-all
                  ${dark ? 'bg-gray-900 border-gray-800 hover:bg-gray-800' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                  ${dark ? 'bg-gray-800 text-green-light' : 'bg-gray-100 text-green-primary'}`}>
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
          <span className="flex-1 text-left text-sm font-medium text-red-600">Log Out</span>
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
