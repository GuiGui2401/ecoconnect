// =============================================================================
// PAGES — Map, Report, AI, Challenges, Stats
// =============================================================================
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Check, ChevronLeft, Flame, MapPin, Send, Upload, X } from 'lucide-react'
import { incidentsApi, challengesApi, statsApi, aiApi } from '@/api'
import { useAuthStore } from '@/store'
import { asCollection, EcoIcon, INCIDENT_TYPES, STATUS_META, uniqueById } from '@/lib/ecoconnect'

function renderInlineMarkdown(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="rounded bg-gray-100 px-1 py-0.5 text-[12px] text-gray-800">{part.slice(1, -1)}</code>
    }

    return <span key={index}>{part}</span>
  })
}

function MarkdownMessage({ content }) {
  const lines = String(content || '').split(/\r?\n/)
  const blocks = []

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (!line) continue

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      blocks.push(
        <p key={i} className={`font-display font-bold text-gray-900 ${level === 1 ? 'text-base' : 'text-sm'} ${blocks.length ? 'mt-3' : ''}`}>
          {renderInlineMarkdown(heading[2])}
        </p>,
      )
      continue
    }

    if (line.startsWith('>')) {
      blocks.push(
        <div key={i} className="mt-2 border-l-4 border-amber-300 bg-amber-50 px-3 py-2 text-amber-900 rounded-r-lg">
          {renderInlineMarkdown(line.replace(/^>\s*/, ''))}
        </div>,
      )
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i += 1
      }
      i -= 1
      blocks.push(
        <ul key={i} className="mt-2 list-disc space-y-1 pl-5">
          {items.map((item, index) => <li key={index}>{renderInlineMarkdown(item)}</li>)}
        </ul>,
      )
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i += 1
      }
      i -= 1
      blocks.push(
        <ol key={i} className="mt-2 list-decimal space-y-1 pl-5">
          {items.map((item, index) => <li key={index}>{renderInlineMarkdown(item)}</li>)}
        </ol>,
      )
      continue
    }

    if (line.startsWith('|') && line.endsWith('|')) {
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        const row = lines[i].trim()
        if (!/^\|[\s:-]+\|?$/.test(row.replace(/\|/g, '|'))) {
          rows.push(row.split('|').slice(1, -1).map((cell) => cell.trim()))
        }
        i += 1
      }
      i -= 1
      const [head, ...body] = rows
      blocks.push(
        <div key={i} className="mt-3 overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[240px] text-left text-xs">
            {head && (
              <thead className="bg-gray-50 text-gray-600">
                <tr>{head.map((cell, index) => <th key={index} className="px-2 py-2 font-semibold">{renderInlineMarkdown(cell)}</th>)}</tr>
              </thead>
            )}
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-gray-100">
                  {row.map((cell, cellIndex) => <td key={cellIndex} className="px-2 py-2 align-top">{renderInlineMarkdown(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    const paragraph = [line]
    while (i + 1 < lines.length) {
      const next = lines[i + 1].trim()
      if (!next || /^(#{1,3})\s+/.test(next) || next.startsWith('>') || /^[-*]\s+/.test(next) || /^\d+\.\s+/.test(next) || next.startsWith('|')) break
      paragraph.push(next)
      i += 1
    }

    blocks.push(
      <p key={i} className={blocks.length ? 'mt-2' : ''}>
        {renderInlineMarkdown(paragraph.join(' '))}
      </p>,
    )
  }

  return <div className="space-y-1">{blocks}</div>
}


// ─────────────────────────────────────────────────────────────────────────────
// src/pages/MapPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function MapPage() {
  const mapRef      = useRef(null)
  const mapInstance = useRef(null)
  const navigate    = useNavigate()
  const qc          = useQueryClient()
  const user        = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const canReview   = ['admin', 'moderator', 'expert'].includes(user?.profile_type)

  const { data: incidents } = useQuery({
    queryKey: ['incidents-public'],
    queryFn:  () => incidentsApi.public().then(r => r.data),
  })

  const { data: authIncidents } = useQuery({
    queryKey: ['incidents-auth'],
    queryFn: () => incidentsApi.list().then(r => r.data),
    enabled: isAuthenticated,
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }) => incidentsApi.validate(id, status),
    onSuccess: () => {
      toast.success('Signalement mis a jour')
      qc.invalidateQueries({ queryKey: ['incidents-auth'] })
      qc.invalidateQueries({ queryKey: ['incidents-public'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
    onError: () => toast.error('Action impossible pour ce compte'),
  })

  const incidentsList = uniqueById([
    ...asCollection(authIncidents),
    ...asCollection(incidents),
  ])
  const incidentsMapKey = incidentsList
    .map((inc) => `${inc.id}:${inc.status}:${inc.latitude}:${inc.longitude}`)
    .join('|')
  const highlightedIncident = incidentsList.find((inc) => ['high', 'critical'].includes(inc.risk_level)) || incidentsList[0]

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    let cancelled = false

    import('leaflet').then(L => {
      if (cancelled || !mapRef.current || mapInstance.current) return

      if (mapRef.current._leaflet_id) {
        delete mapRef.current._leaflet_id
        mapRef.current.innerHTML = ''
      }

      const map = L.map(mapRef.current, { zoomControl: false }).setView([3.87, 11.52], 6)
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      incidentsList.forEach(inc => {
        const cfg = INCIDENT_TYPES[inc.type] || INCIDENT_TYPES.other
        const icon = L.divIcon({
          html: `<div style="
            background:${cfg.color};width:36px;height:36px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:18px;box-shadow:0 3px 10px rgba(0,0,0,0.25);
            border:2.5px solid white;cursor:pointer;">
            ${cfg.icon}
          </div>`,
          iconSize: [36, 36], className: 'eco-marker',
        })
        L.marker([inc.latitude, inc.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;padding:4px">
              <strong>${cfg.icon} ${cfg.label}</strong><br/>
              <span style="color:#7f8c8d;font-size:12px">${inc.location_name}</span><br/>
              <span style="color:#64748b;font-size:11px">${inc.status || 'validated'}</span><br/>
              <span style="background:${inc.risk_level === 'high' || inc.risk_level === 'critical' ? '#fde8e8' : '#fef3e2'};
                color:${inc.risk_level === 'high' || inc.risk_level === 'critical' ? '#e74c3c' : '#e67e22'};
                padding:2px 6px;border-radius:100px;font-size:11px;font-weight:600">
                ${inc.risk_level?.toUpperCase()}
              </span>
            </div>
          `)
      })
    })

    return () => {
      cancelled = true
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [incidentsMapKey])

  const LEGEND = [
    { color: '#e74c3c', label: 'Fire' },
    { color: '#2980b9', label: 'Pollution' },
    { color: '#e67e22', label: 'Deforestation' },
    { color: '#8e44ad', label: 'Poaching' },
    { color: '#27ae60', label: 'Protected' },
  ]

  return (
    <div className="pb-4">
      <h1 className="font-display font-bold text-xl px-4 pt-5 pb-3">🗺️ Smart Map</h1>

      {/* Map */}
      <div ref={mapRef} className="mx-4 rounded-2xl overflow-hidden" style={{ height: 340 }} />

      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-4 mt-3">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Risk Card */}
      {highlightedIncident && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="font-semibold text-sm text-red-600">
            ⚠️ {INCIDENT_TYPES[highlightedIncident.type]?.label || 'Incident'} — {highlightedIncident.status || 'validated'}
          </p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {highlightedIncident.location_name || 'Unknown location'} · Risk Level:{' '}
            <strong className="text-red-500">{(highlightedIncident.risk_level || 'medium').toUpperCase()}</strong><br/>
            Updated: {highlightedIncident.created_at ? new Date(highlightedIncident.created_at).toLocaleString('fr-FR') : 'now'}
          </p>
        </div>
      )}

      <div className="px-4 mt-4">
        <button onClick={() => navigate('/report')} className="btn-green w-full flex items-center justify-center gap-2">
          <MapPin size={16} /> Report an Incident
        </button>
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-display font-bold text-base">Reports</p>
          <span className="text-xs text-gray-400">{incidentsList.length} shown</span>
        </div>
        <div className="space-y-2.5">
          {incidentsList.map((incident) => {
            const type = INCIDENT_TYPES[incident.type] || INCIDENT_TYPES.other
            const status = STATUS_META[incident.status || 'validated'] || STATUS_META.pending

            return (
              <div key={incident.id} className="card p-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${type.color}18` }}>
                    {type.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{type.label}</p>
                      <span className={`text-[11px] border px-2 py-0.5 rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{incident.location_name || 'Unknown location'}</p>
                    {incident.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{incident.description}</p>
                    )}
                  </div>
                </div>

                {canReview && incident.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => reviewMutation.mutate({ id: incident.id, status: 'validated' })}
                      disabled={reviewMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-primary text-white text-xs font-semibold rounded-lg py-2"
                    >
                      <Check size={14} /> Validate
                    </button>
                    <button
                      onClick={() => reviewMutation.mutate({ id: incident.id, status: 'rejected' })}
                      disabled={reviewMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg py-2"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          {incidentsList.length === 0 && (
            <div className="card p-4 text-center text-sm text-gray-500">
              No reports yet. Create the first one from the report form.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// src/pages/ReportPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
const REPORT_INCIDENT_TYPES = [
  { value: 'pollution',     label: 'Pollution',     icon: '💧' },
  { value: 'fire',          label: 'Fire',          icon: '🔥' },
  { value: 'deforestation', label: 'Deforestation', icon: '🌲' },
  { value: 'poaching',      label: 'Poaching',      icon: '🦁' },
  { value: 'waste',         label: 'Waste',         icon: '🗑️' },
  { value: 'other',         label: 'Other',         icon: '⚠️' },
]

export function ReportPage() {
  const navigate  = useNavigate()
  const qc = useQueryClient()
  const [selType, setSelType] = useState('pollution')
  const [preview, setPreview] = useState(null)
  const [mediaFile, setMediaFile] = useState(null)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { location_name: 'Yaoundé, Cameroon', risk_level: 'medium' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => {
      const fd = new FormData()
      fd.append('type', selType)
      Object.entries(data).forEach(([k, v]) => fd.append(k, v))
      // Coordonnées simulées (en prod : navigator.geolocation)
      fd.append('latitude',  3.87)
      fd.append('longitude', 11.52)
      if (mediaFile) fd.append('media[]', mediaFile)
      return incidentsApi.create(fd)
    },
    onSuccess: () => {
      toast.success('✅ Signalement soumis! +50 points')
      qc.invalidateQueries({ queryKey: ['incidents-auth'] })
      qc.invalidateQueries({ queryKey: ['incidents-public'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      navigate('/map')
    },
    onError: () => toast.error('Erreur lors de la soumission'),
  })

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="font-display font-bold text-lg">Report an Incident</h2>
          <p className="text-xs text-gray-400">Help protect nature</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(mutate)}>
        {/* Incident Type */}
        <p className="px-4 mt-5 text-xs font-semibold text-gray-700 mb-2">Incident Type</p>
        <div className="grid grid-cols-3 gap-2 px-4">
          {REPORT_INCIDENT_TYPES.map(({ value, label, icon }) => (
            <button type="button" key={value} onClick={() => setSelType(value)}
              className={`p-3 rounded-2xl border-2 text-center transition-all
                ${selType === value
                  ? 'border-green-primary bg-green-pale'
                  : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <div className="text-3xl mb-1.5">{icon}</div>
              <div className="text-xs font-medium">{label}</div>
            </button>
          ))}
        </div>

        {/* Upload */}
        <p className="px-4 mt-5 text-xs font-semibold text-gray-700 mb-2">Upload Photo / Video</p>
        <label className="mx-4 block border-2 border-dashed border-gray-200 rounded-2xl p-7 text-center cursor-pointer
                          hover:border-green-primary hover:bg-green-pale transition-all">
          <input type="file" accept="image/*,video/*" className="hidden"
            onChange={e => {
              const f = e.target.files[0]
              if (f) {
                setMediaFile(f)
                setPreview(URL.createObjectURL(f))
              }
            }} />
          {preview
            ? <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-xl" />
            : <>
                <div className="text-4xl mb-2">📸</div>
                <p className="text-sm text-gray-400">Tap to take a photo or upload</p>
              </>
          }
        </label>

        {/* Location */}
        <div className="px-4 mt-4">
          <label className="block text-xs font-semibold mb-1.5">Location</label>
          <input {...register('location_name')} className="input" placeholder="Your location..." />
        </div>

        {/* Risk Level */}
        <div className="px-4 mt-3">
          <label className="block text-xs font-semibold mb-1.5">Risk Level</label>
          <select {...register('risk_level')} className="input">
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
            <option value="critical">🟣 Critical</option>
          </select>
        </div>

        {/* Description */}
        <div className="px-4 mt-3">
          <label className="block text-xs font-semibold mb-1.5">Description</label>
          <textarea {...register('description', { required: 'Description requise', minLength: { value: 20, message: 'Minimum 20 caractères' } })}
            className="input resize-none" rows={3} placeholder="Describe what you observed..." />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="px-4 mt-5">
          <button type="submit" disabled={isPending} className="btn-green w-full flex items-center justify-center gap-2">
            {isPending ? 'Envoi...' : <><Upload size={16} /> Submit Report</>}
          </button>
        </div>
      </form>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// src/pages/AiPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function AiPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you protect our environment today? 🌍' }
  ])
  const [input, setInput]       = useState('')
  const [convId, setConvId]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const endRef = useRef(null)

  const QUICK = [
    '♻️ How to reduce plastic?',
    '🗺️ Protected areas in Cameroon?',
    '🌲 Report deforestation',
    '💡 Daily eco tips',
  ]

  const send = async (text) => {
    if (!text.trim() || loading) return
    const msg = text.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const { data } = await aiApi.chat(msg, convId)
      setConvId(data.conversation_id)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (error) {
      const apiMessage = error.response?.data?.message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: apiMessage || "Oops! Vérifie ta connexion et réessaie. 🌿",
      }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-eco-dark to-green-primary px-4 py-4 text-white text-center">
        <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center text-3xl mx-auto mb-2">🌿</div>
        <h3 className="font-display font-bold text-base">Eco Assistant</h3>
        <p className="text-xs opacity-70 mt-0.5">Your intelligent ecological guide</p>
      </div>

      {/* Quick replies */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-gray-100 flex-shrink-0">
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full border border-green-primary text-green-primary text-xs font-medium
                       hover:bg-green-primary hover:text-white transition-all whitespace-nowrap">
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`${m.role === 'user' ? 'max-w-[78%]' : 'max-w-[92%]'} px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${m.role === 'user'
                ? 'bg-green-primary text-white rounded-br-sm'
                : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'}`}>
              {m.role === 'assistant' ? <MarkdownMessage content={m.content} /> : m.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${delay}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2 items-end flex-shrink-0">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          placeholder="Ask me anything about ecology..."
          rows={1}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm bg-gray-50
                     focus:outline-none focus:border-green-primary resize-none"
        />
        <button onClick={() => send(input)} disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-full bg-green-primary text-white flex items-center justify-center
                     hover:bg-green-mid transition-all disabled:opacity-50 flex-shrink-0">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// src/pages/ChallengesPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function ChallengesPage() {
  const qc   = useQueryClient()
  const [tab, setTab] = useState('Daily')
  const TABS = ['Daily', 'Community', 'Completed']

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn:  () => challengesApi.list().then(r => r.data),
  })

  const joinMutation = useMutation({
    mutationFn: (id) => challengesApi.join(id),
    onSuccess:  () => { toast.success('Challenge rejoint! 🎯'); qc.invalidateQueries({ queryKey: ['challenges'] }) },
    onError:    (e) => { if (e.response?.status === 409) toast('Déjà rejoint'); else toast.error('Erreur') },
  })

  const progressMutation = useMutation({
    mutationFn: (challenge) => challengesApi.updateProgress(challenge.id, (challenge.progress || 0) + 1),
    onSuccess: () => {
      toast.success('Progression enregistree')
      qc.invalidateQueries({ queryKey: ['challenges'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
    onError: () => toast.error('Rejoins ce defi avant de progresser'),
  })

  const challengeItems = asCollection(challenges)
  const items = challengeItems.filter(c =>
    tab === 'Completed' ? c.completed :
    tab === 'Community' ? c.type === 'community' :
    !c.completed
  )

  return (
    <div className="pb-4">
      <h1 className="font-display font-bold text-xl px-4 pt-5">🎯 Challenges</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mx-4 mt-3">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px
              ${tab === t ? 'border-green-primary text-green-primary' : 'border-transparent text-gray-400'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 mt-3 space-y-3">
        {items.map(c => (
          <div key={c.id} className="card p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-pale flex items-center justify-center text-green-primary flex-shrink-0">
              <EcoIcon name={c.icon} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{c.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-primary to-green-light rounded-full transition-all"
                     style={{ width: `${c.pct || 0}%` }} />
              </div>
              <p className={`text-xs mt-1 ${c.completed ? 'text-green-primary font-semibold' : 'text-gray-400'}`}>
                {c.completed ? '✅ Completed!' : `${c.progress || 0}/${c.goal_value} ${c.goal_unit || ''}`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="text-xs font-semibold text-green-primary bg-green-pale px-2 py-0.5 rounded-full">
                +{c.points_reward}
              </span>
              {!c.joined && !c.completed && (
                <button onClick={() => joinMutation.mutate(c.id)} disabled={joinMutation.isPending}
                  className="text-xs font-semibold text-white bg-green-primary px-3 py-1 rounded-full hover:bg-green-mid transition-all">
                  Join
                </button>
              )}
              {c.joined && !c.completed && (
                <button onClick={() => progressMutation.mutate(c)} disabled={progressMutation.isPending}
                  className="text-xs font-semibold text-green-primary bg-green-pale px-3 py-1 rounded-full hover:bg-green-pale/80 transition-all">
                  + Progress
                </button>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">🎉</div>
            <p>No challenges in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// src/pages/StatsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function StatsPage() {
  const { data: stats }    = useQuery({ queryKey: ['stats-dash'],  queryFn: () => statsApi.dashboard().then(r => r.data) })
  const { data: types }    = useQuery({ queryKey: ['stats-types'], queryFn: () => statsApi.reportTypes().then(r => r.data) })
  const { data: leaders }  = useQuery({ queryKey: ['leaderboard'], queryFn: () => statsApi.leaderboard().then(r => r.data) })
  const { data: pred }     = useQuery({ queryKey: ['prediction'],  queryFn: () => statsApi.prediction().then(r => r.data) })

  const BIG = [
    { label: 'My reports', value: stats?.incidents_count ?? 0, sub: 'Created' },
    { label: 'Validated',  value: stats?.global_incidents ?? 0, sub: 'Public' },
    { label: 'Challenges', value: stats?.challenges_done ?? 0, sub: 'Done' },
  ]

  const TYPE_COLORS = {
    pollution: '#2980b9', deforestation: '#e67e22', fire: '#e74c3c',
    poaching: '#8e44ad', waste: '#27ae60',
  }

  const DONUT_ITEMS = Object.entries(types || {})
    .map(([t, v]) => ({ type: t, value: Number(v), color: TYPE_COLORS[t] || '#999' }))
    .filter((item) => item.value > 0)
  const donutTotal = DONUT_ITEMS.reduce((sum, item) => sum + item.value, 0)
  const LEADERS = asCollection(leaders)

  const RANK_STYLE = ['text-yellow-400', 'text-gray-400', 'text-amber-600']

  return (
    <div className="pb-6">
      <h1 className="font-display font-bold text-xl px-4 pt-5 mb-3">📊 Statistics & Analytics</h1>

      {/* Big numbers */}
      <div className="grid grid-cols-3 gap-2 px-4">
        {BIG.map(({ label, value, sub }) => (
          <div key={label} className="card p-3 text-center">
            <p className="font-display font-bold text-2xl text-green-primary">{value.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-green-mid font-semibold mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Donut */}
      <div className="mx-4 mt-3 card p-4">
        <h4 className="font-display font-bold text-sm mb-4">Reports by Type</h4>
        <div className="flex items-center gap-4">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="0 0 100 100" width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" strokeWidth="18" />
              {(() => {
                let offset = 0
                const circ = 2 * Math.PI * 40
                return DONUT_ITEMS.map(({ type, value, color }) => {
                  const pct   = donutTotal ? value / donutTotal : 0
                  const dash  = pct * circ
                  const el = (
                    <circle key={type} cx="50" cy="50" r="40" fill="none"
                      stroke={color} strokeWidth="18"
                      strokeDasharray={`${dash} ${circ - dash}`}
                      strokeDashoffset={-offset} />
                  )
                  offset += dash
                  return el
                })
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-xl">{donutTotal}</span>
              <span className="text-[10px] text-gray-400">Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {DONUT_ITEMS.map(({ type, value, color }) => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="capitalize text-gray-600">{type}</span>
                <span className="font-semibold text-gray-800">{value}</span>
              </div>
            ))}
            {DONUT_ITEMS.length === 0 && (
              <p className="text-xs text-gray-400">No validated reports yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Prediction */}
      <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-2xl p-4">
        <p className="font-bold text-sm text-red-600 flex items-center gap-2">
          <Flame size={16} /> Risk Prediction
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {pred?.message || 'Pas assez de donnees pour calculer une prediction fiable.'}
        </p>
        <p className="font-display font-bold text-4xl text-red-500 mt-1">
          {pred?.risk_score ?? 0}%
        </p>
      </div>

      {/* Leaderboard */}
      <div className="mx-4 mt-3 card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h4 className="font-display font-bold text-sm">🏆 Leaderboard</h4>
        </div>
        {LEADERS.map((u, i) => (
          <div key={u.name} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
            <span className={`font-display font-bold text-base w-5 ${RANK_STYLE[i] || 'text-gray-400'}`}>{i + 1}</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-primary to-green-light flex items-center justify-center text-white font-bold text-sm">
              {u.avatar || u.name[0]}
            </div>
            <span className="flex-1 font-medium text-sm">{u.name}</span>
            <span className="font-display font-bold text-sm text-green-primary">{u.points.toLocaleString()} pts</span>
          </div>
        ))}
        {LEADERS.length === 0 && (
          <div className="px-4 py-5 text-center text-sm text-gray-500">
            Aucun classement disponible pour le moment.
          </div>
        )}
      </div>
    </div>
  )
}
