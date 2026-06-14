import {
  AlertTriangle,
  Bell,
  BookOpen,
  Bot,
  CheckCircle2,
  FileText,
  Flame,
  GraduationCap,
  HelpCircle,
  Leaf,
  MapPin,
  Podcast,
  Recycle,
  ShieldCheck,
  Sprout,
  Target,
  Trash2,
  TreePine,
  Trophy,
  User,
  Users,
  Video,
  Waves,
} from 'lucide-react'

export function asCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export function uniqueById(items) {
  return Array.from(new Map(items.filter(Boolean).map((item) => [item.id, item])).values())
}

export const INCIDENT_TYPES = {
  pollution: { label: 'Pollution', icon: '💧', color: '#2980b9', badge: 'bg-blue-50 text-blue-700' },
  fire: { label: 'Fire', icon: '🔥', color: '#e74c3c', badge: 'bg-red-50 text-red-700' },
  deforestation: { label: 'Deforestation', icon: '🌲', color: '#e67e22', badge: 'bg-orange-50 text-orange-700' },
  poaching: { label: 'Poaching', icon: '🦁', color: '#8e44ad', badge: 'bg-purple-50 text-purple-700' },
  waste: { label: 'Waste', icon: '🗑️', color: '#7f8c8d', badge: 'bg-gray-100 text-gray-700' },
  other: { label: 'Other', icon: '⚠️', color: '#64748b', badge: 'bg-gray-100 text-gray-700' },
}

export const STATUS_META = {
  pending: { label: 'Pending', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  validated: { label: 'Validated', className: 'bg-green-pale text-green-primary border-green-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  resolved: { label: 'Resolved', className: 'bg-blue-50 text-blue-700 border-blue-200' },
}

export const ROLE_META = {
  citizen: {
    label: 'Citoyen Eco',
    icon: User,
    focus: 'Signaler et suivre tes actions environnementales.',
    cta: 'Report an Incident',
    path: '/report',
  },
  student: {
    label: 'Etudiant',
    icon: GraduationCap,
    focus: 'Apprendre, relever des defis et suivre ta progression.',
    cta: 'Open Learning',
    path: '/learning',
  },
  ngo: {
    label: 'ONG',
    icon: Users,
    focus: 'Coordonner les signalements et suivre les zones prioritaires.',
    cta: 'Open Map',
    path: '/map',
  },
  expert: {
    label: 'Expert',
    icon: ShieldCheck,
    focus: 'Examiner les signalements et aider a les qualifier.',
    cta: 'Review Reports',
    path: '/map',
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    focus: 'Piloter les utilisateurs, les signalements et les defis.',
    cta: 'Open Stats',
    path: '/stats',
  },
  moderator: {
    label: 'Moderateur',
    icon: ShieldCheck,
    focus: 'Verifier les signalements et maintenir la qualite des donnees.',
    cta: 'Review Reports',
    path: '/map',
  },
}

const ICONS = {
  alert: AlertTriangle,
  article: FileText,
  bell: Bell,
  biodiversity: Leaf,
  book: BookOpen,
  bot: Bot,
  check: CheckCircle2,
  climate: Flame,
  file: FileText,
  fire: Flame,
  flame: Flame,
  forest: TreePine,
  guide: BookOpen,
  'help-circle': HelpCircle,
  laws: ShieldCheck,
  'map-pin': MapPin,
  podcast: Podcast,
  recycle: Recycle,
  seedling: Sprout,
  'shield-check': ShieldCheck,
  target: Target,
  'trash-2': Trash2,
  'tree-pine': TreePine,
  trophy: Trophy,
  users: Users,
  video: Video,
  waste: Trash2,
  water: Waves,
  waves: Waves,
  wildlife: Leaf,
}

function isProbablyEmoji(value) {
  return /\p{Extended_Pictographic}/u.test(value)
}

export function EcoIcon({ name, className = '', size = 22, fallback = '🌿' }) {
  const value = String(name || '').trim()
  const normalized = value.toLowerCase()
  const Icon = ICONS[normalized]

  if (Icon) {
    return <Icon size={size} className={className} />
  }

  if (!value || isProbablyEmoji(value)) {
    return <span className={className}>{value || fallback}</span>
  }

  return <Leaf size={size} className={className} />
}

export function roleMeta(profileType) {
  return ROLE_META[profileType] || ROLE_META.citizen
}
