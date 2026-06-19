// src/api/axios.js
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { Accept: 'application/json' },
  withCredentials: false,
})

export function apiAssetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin
  const origin = new URL(apiUrl, window.location.origin).origin

  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

// Injecter le token Sanctum automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eco_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirection sur 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('eco_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── src/api/auth.js ──────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login',    data),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/user'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (data)  => api.post('/auth/reset-password', data),
}

// ─── src/api/incidents.js ─────────────────────────────────────────────────────
export const incidentsApi = {
  list:       (params) => api.get('/incidents', { params }),
  public:     ()       => api.get('/incidents/public'),
  nearby:     (params) => api.get('/incidents/nearby', { params }),
  create:     (data)   => api.post('/incidents', data),
  get:        (id)     => api.get(`/incidents/${id}`),
  update:     (id, d)  => api.put(`/incidents/${id}`, d),
  delete:     (id)     => api.delete(`/incidents/${id}`),
  validate:   (id, s)  => api.post(`/incidents/${id}/validate`, { status: s }),
}

// ─── src/api/posts.js ─────────────────────────────────────────────────────────
export const postsApi = {
  list:       (params) => api.get('/posts', { params }),
  create:     (data)   => api.post('/posts', data),
  like:       (id)     => api.post(`/posts/${id}/like`),
  comment:    (id, c)  => api.post(`/posts/${id}/comment`, { content: c }),
  comments:   (id)     => api.get(`/posts/${id}/comments`),
  delete:     (id)     => api.delete(`/posts/${id}`),
}

// ─── src/api/challenges.js ────────────────────────────────────────────────────
export const challengesApi = {
  list:           (params) => api.get('/challenges', { params }),
  join:           (id)     => api.post(`/challenges/${id}/join`),
  updateProgress: (id, p)  => api.post(`/challenges/${id}/progress`, { progress: p }),
  my:             ()       => api.get('/challenges/my'),
}

// ─── src/api/stats.js ─────────────────────────────────────────────────────────
export const statsApi = {
  dashboard:   () => api.get('/stats/dashboard'),
  reportTypes: () => api.get('/stats/reports'),
  leaderboard: () => api.get('/stats/leaderboard'),
  prediction:  () => api.get('/stats/prediction'),
  public:      () => api.get('/stats/public'),
}

// ─── src/api/ai.js ────────────────────────────────────────────────────────────
export const aiApi = {
  chat:    (message, conversation_id) => api.post('/ai/chat', { message, conversation_id }),
  history: ()                         => api.get('/ai/history'),
}

// ─── src/api/learning.js ──────────────────────────────────────────────────────
export const learningApi = {
  list:     (params) => api.get('/learning', { params }),
  get:      (id)     => api.get(`/learning/${id}`),
  complete: (id)     => api.post(`/learning/${id}/complete`),
}

// ─── src/api/environment.js ──────────────────────────────────────────────────
export const environmentApi = {
  list:           () => api.get('/environment-hub'),
  favorites:      () => api.get('/environment-hub/favorites'),
  toggleFavorite: (item_type, item_id) => api.post('/environment-hub/favorites', { item_type, item_id }),
}

// ─── src/api/notifications.js ─────────────────────────────────────────────────
export const notificationsApi = {
  list:       () => api.get('/notifications'),
  read:       (id) => api.post(`/notifications/${id}/read`),
  readAll:    ()   => api.post('/notifications/read-all'),
}

// ─── src/api/user.js ──────────────────────────────────────────────────────────
export const userApi = {
  me:           ()     => api.get('/user'),
  update:       (data) => api.put('/user', data),
  uploadAvatar: (file) => {
    const fd = new FormData(); fd.append('avatar', file)
    return api.post('/user/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  stats:       () => api.get('/user/stats'),
  badges:      () => api.get('/user/badges'),
  leaderboard: () => api.get('/user/leaderboard'),
}
