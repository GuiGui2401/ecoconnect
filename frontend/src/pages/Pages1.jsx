// =============================================================================
// PAGES — EcoConnect React
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// src/pages/LoginPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi, challengesApi, incidentsApi, postsApi, statsApi, userApi } from '@/api'
import { useAuthStore } from '@/store'
import { Heart, MessageCircle, Send, Share2 } from 'lucide-react'
import { asCollection, EcoIcon, INCIDENT_TYPES, roleMeta } from '@/lib/ecoconnect'

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe requis'),
})

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token)
      toast.success('Bienvenue! 🌿')
      navigate('/dashboard')
    },
    onError: (e) => {
      const message = e.response?.data?.errors?.email?.[0]
        || e.response?.data?.message
        || 'Email ou mot de passe incorrect'

      toast.error(message)
    },
  })

  return (
    <div className="min-h-screen flex flex-col bg-white max-w-[480px] mx-auto shadow-2xl">
      {/* Hero */}
      <div className="bg-gradient-to-br from-eco-dark to-green-primary px-6 py-10 text-white text-center">
        <div className="text-5xl mb-3">🌿</div>
        <h1 className="font-display text-2xl font-bold">EcoConnect</h1>
        <p className="text-sm opacity-75 mt-2">Protect Nature, Together with AI</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8">
        <h2 className="font-display text-xl font-bold mb-6">Connexion</h2>

        <form onSubmit={handleSubmit(mutate)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">Email</label>
            <input {...register('email')} type="email" placeholder="emma@ecoconnect.cm" className="input" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Mot de passe</label>
            <input {...register('password')} type="password" placeholder="••••••••" className="input" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isPending} className="btn-green w-full mt-2">
            {isPending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas de compte?{' '}
          <Link to="/register" className="text-green-primary font-semibold">Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// src/pages/RegisterPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
const regSchema = z.object({
  name:         z.string().min(2),
  email:        z.string().email(),
  password:     z.string().min(8, 'Minimum 8 caractères'),
  password_confirmation: z.string(),
  profile_type: z.enum(['citizen', 'student', 'ngo', 'expert']),
  country:      z.string().default('CM'),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Mots de passe différents', path: ['password_confirmation'],
})

export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(regSchema),
    defaultValues: { profile_type: 'citizen', country: 'CM' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => authApi.register(data),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token)
      toast.success('Bienvenue sur EcoConnect! 🎉')
      navigate('/dashboard')
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Erreur lors de l\'inscription'),
  })

  return (
    <div className="min-h-screen flex flex-col bg-white max-w-[480px] mx-auto shadow-2xl">
      <div className="bg-gradient-to-br from-eco-dark to-green-primary px-6 py-8 text-white text-center">
        <div className="text-4xl mb-2">🌿</div>
        <h2 className="font-display text-xl font-bold">Créer un compte</h2>
        <p className="text-xs opacity-75 mt-1">Rejoins la communauté EcoConnect</p>
      </div>

      <div className="flex-1 px-6 py-6">
        <form onSubmit={handleSubmit(mutate)} className="space-y-4">
          {[
            { name: 'name',  label: 'Nom complet',     type: 'text',     placeholder: 'Emma Ngono' },
            { name: 'email', label: 'Email',            type: 'email',    placeholder: 'emma@example.com' },
            { name: 'password', label: 'Mot de passe', type: 'password', placeholder: '••••••••' },
            { name: 'password_confirmation', label: 'Confirmer', type: 'password', placeholder: '••••••••' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-semibold mb-1.5">{label}</label>
              <input {...register(name)} type={type} placeholder={placeholder} className="input" />
              {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold mb-1.5">Pays</label>
            <select {...register('country')} className="input">
              <option value="CM">🇨🇲 Cameroun</option>
              <option value="CI">🇨🇮 Côte d'Ivoire</option>
              <option value="SN">🇸🇳 Sénégal</option>
              <option value="FR">🇫🇷 France</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">Type de profil</label>
            <select {...register('profile_type')} className="input">
              <option value="citizen">🌱 Citoyen Éco</option>
              <option value="student">🎓 Étudiant</option>
              <option value="ngo">🏢 ONG</option>
              <option value="expert">🔬 Expert</option>
            </select>
          </div>

          <button type="submit" disabled={isPending} className="btn-green w-full mt-2">
            {isPending ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Déjà un compte?{' '}
          <Link to="/login" className="text-green-primary font-semibold">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// src/pages/DashboardPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const user     = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const role = roleMeta(user?.profile_type)
  const RoleIcon = role.icon

  const { data: stats }      = useQuery({ queryKey: ['stats'], queryFn: () => statsApi.dashboard().then(r => r.data) })
  const { data: challenges } = useQuery({ queryKey: ['challenges'], queryFn: () => challengesApi.list().then(r => r.data) })
  const { data: badges } = useQuery({ queryKey: ['user-badges'], queryFn: () => userApi.badges().then(r => r.data) })
  const { data: incidents } = useQuery({ queryKey: ['incidents-public'], queryFn: () => incidentsApi.public().then(r => r.data) })

  const challengeList = asCollection(challenges)
  const badgeList = asCollection(badges)
  const alertList = asCollection(incidents).slice(0, 3)

  return (
    <div className="pb-4">
      {/* User Card */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-green-primary to-green-mid rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-20">🏆</div>
        <p className="text-sm opacity-80">Hello, {user?.name?.split(' ')[0]}! 👋</p>
        <p className="font-display font-bold text-xl mt-0.5">{user?.name}</p>
        <p className="text-xs opacity-70 mt-0.5">{user?.level || '🌱 Eco Starter'}</p>
        <div className="flex items-end gap-2 mt-3">
          <span className="font-display font-bold text-3xl">{stats?.user_points ?? user?.points ?? 0}</span>
          <span className="text-sm opacity-70 mb-1">Points</span>
        </div>
      </div>

      <div className="mx-4 mt-3 card p-4 flex items-center gap-3">
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

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2.5 mx-4 mt-3">
        {[
          { label: 'Actions',    value: stats?.incidents_count ?? 0 },
          { label: 'Reports',    value: stats?.global_incidents ?? 0 },
          { label: 'Challenges', value: stats?.challenges_done ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="card p-3 text-center">
            <p className="font-display font-bold text-2xl text-green-primary">{value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="mx-4 mt-4 flex items-center justify-between mb-3">
        <p className="font-display font-bold text-base">🏅 Badges</p>
        <button onClick={() => navigate('/profile')} className="text-xs font-semibold text-green-primary">View all</button>
      </div>
      <div className="flex gap-3 px-4 overflow-x-auto pb-1 scrollbar-none">
        {badgeList.map(({ icon, name, slug }) => (
          <div key={name} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-orange-200">
              <EcoIcon name={icon || slug} size={24} />
            </div>
            <span className="text-[10px] text-gray-500 text-center max-w-[56px] leading-tight">{name}</span>
          </div>
        ))}
        {badgeList.length === 0 && (
          <div className="card px-4 py-3 text-sm text-gray-500">No badges yet.</div>
        )}
      </div>

      {/* Active Challenge */}
      {challengeList?.[0] && (
        <div className="mx-4 mt-4 card p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-green-pale text-green-primary flex items-center justify-center">
              <EcoIcon name={challengeList[0].icon} size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{challengeList[0].title}</p>
              <p className="text-xs text-gray-500">{challengeList[0].description}</p>
            </div>
            <span className="text-xs font-semibold text-green-primary bg-green-pale px-2 py-0.5 rounded-full">
              +{challengeList[0].points_reward} pts
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-primary to-green-light rounded-full transition-all"
                 style={{ width: `${challengeList[0].pct ?? 0}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{challengeList[0].progress ?? 0}/{challengeList[0].goal_value} completed</p>
        </div>
      )}

      {/* Recent Alerts */}
      <div className="mx-4 mt-4 flex items-center justify-between mb-3">
        <p className="font-display font-bold text-base">⚠️ Nearby Alerts</p>
        <button onClick={() => navigate('/map')} className="text-xs font-semibold text-green-primary">View on map</button>
      </div>
      <div className="mx-4 space-y-2.5">
        {alertList.map((incident) => {
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
            <span className={level === 'high' || level === 'critical' ? 'badge-high' : level === 'low' ? 'badge-low' : 'badge-medium'}>
              {level.toUpperCase()}
            </span>
          </div>
        )})}
        {alertList.length === 0 && (
          <div className="card p-4 text-sm text-gray-500">No validated reports yet.</div>
        )}
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// src/pages/FeedPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function FeedPage() {
  const qc      = useQueryClient()
  const user    = useAuthStore((s) => s.user)
  const [tab, setTab] = useState('Following')
  const [content, setContent] = useState('')
  const [commentingPostId, setCommentingPostId] = useState(null)
  const [commentText, setCommentText] = useState('')
  const TABS = ['Following', 'Groups', 'For You']

  const { data, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn:  () => postsApi.list().then(r => r.data),
  })

  const likeMutation = useMutation({
    mutationFn: (id) => postsApi.like(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })

  const createMutation = useMutation({
    mutationFn: () => postsApi.create({ content }),
    onSuccess: () => {
      setContent('')
      toast.success('Post publie')
      qc.invalidateQueries({ queryKey: ['posts'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
    onError: () => toast.error('Impossible de publier ce post'),
  })

  const commentMutation = useMutation({
    mutationFn: ({ postId, comment }) => postsApi.comment(postId, comment),
    onSuccess: () => {
      setCommentText('')
      setCommentingPostId(null)
      toast.success('Commentaire ajoute')
      qc.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: () => toast.error('Impossible d ajouter ce commentaire'),
  })

  const POSTS = asCollection(data)

  return (
    <div className="pb-4">
      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-4 pb-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${tab === t ? 'bg-green-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {t}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!content.trim()) return
          createMutation.mutate()
        }}
        className="mx-4 mb-3 card p-3"
      >
        <div className="flex gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-primary to-green-light flex items-center justify-center text-white font-bold flex-shrink-0">
            {user?.name?.[0] || 'E'}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Partage une action, une alerte ou une idee..."
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-100 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-green-primary resize-none"
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-gray-400">Les hashtags sont detectes automatiquement.</p>
          <button
            type="submit"
            disabled={createMutation.isPending || !content.trim()}
            className="flex items-center gap-1.5 bg-green-primary text-white text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
          >
            <Send size={14} /> Publier
          </button>
        </div>
      </form>

      {/* Posts */}
      <div className="space-y-3 px-4">
        {isLoading && <div className="card p-4 text-sm text-gray-500">Chargement du fil...</div>}

        {POSTS.map(post => (
          <div key={post.id} className="card overflow-hidden">
            <div className="flex items-center gap-2.5 p-3 pb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-primary to-green-light flex items-center justify-center text-white font-bold">
                {post.user?.avatar || post.user?.name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{post.user?.name}</p>
                <p className="text-xs text-gray-400">{post.time || post.created_at}</p>
              </div>
            </div>

            <p className="px-3 pb-2 text-sm leading-relaxed">
              {post.content?.split('\n').map((line, i) => (
                <span key={i}>
                  {line.split(/(#\w+)/).map((w, j) =>
                    w.startsWith('#')
                      ? <span key={j} className="text-green-primary font-medium">{w}</span>
                      : w
                  )}
                  {i < post.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>

            {post.media_urls?.[0] && (
              <img src={post.media_urls[0]} alt="" className="w-full max-h-64 object-cover" />
            )}

            <div className="flex gap-1 p-2 border-t border-gray-50">
              <button
                onClick={() => likeMutation.mutate(post.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${post.is_liked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                <Heart size={14} fill={post.is_liked ? 'currentColor' : 'none'} />
                {post.likes_count ?? post.likes}
              </button>
              <button
                onClick={() => setCommentingPostId((current) => current === post.id ? null : post.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all"
              >
                <MessageCircle size={14} />{post.comments_count ?? post.comments}
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Lien copié!') }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all">
                <Share2 size={14} />
              </button>
            </div>

            {commentingPostId === post.id && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!commentText.trim()) return
                  commentMutation.mutate({ postId: post.id, comment: commentText })
                }}
                className="flex gap-2 px-3 pb-3"
              >
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-green-primary"
                />
                <button
                  type="submit"
                  disabled={commentMutation.isPending || !commentText.trim()}
                  className="bg-green-primary text-white rounded-lg px-3 disabled:opacity-50"
                >
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        ))}

        {!isLoading && POSTS.length === 0 && (
          <div className="card p-5 text-center text-sm text-gray-500">
            Aucun post pour l instant. Publie la premiere action de la communaute.
          </div>
        )}
      </div>
    </div>
  )
}
