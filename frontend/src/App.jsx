import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useSettingsStore } from '@/store'
import { AppLayout } from '@/components/layout/Layout'
import {
  AiPage,
  ChallengesPage,
  DashboardPage,
  FeedPage,
  HomePage,
  LearningPage,
  LoginPage,
  MapPage,
  NotificationsPage,
  ProfilePage,
  RegisterPage,
  ReportPage,
  SettingsPage,
  StatsPage,
  AboutPage,
  EnvironmentHubPage,
  HelpSupportPage,
} from '@/pages'

// Guard pour routes protégées
function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Guard pour pages publiques (redirige si déjà connecté)
function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const darkMode = useSettingsStore((s) => s.darkMode)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<HomePage />} />
      <Route path="/environment-hub" element={<EnvironmentHubPage />} />
      <Route path="/login"   element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Authenticated — avec AppLayout (top nav + bottom nav) */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/dashboard"    element={<DashboardPage />} />
        <Route path="/feed"         element={<FeedPage />} />
        <Route path="/map"          element={<MapPage />} />
        <Route path="/report"       element={<ReportPage />} />
        <Route path="/ai"           element={<AiPage />} />
        <Route path="/challenges"   element={<ChallengesPage />} />
        <Route path="/stats"        element={<StatsPage />} />
        <Route path="/learning"     element={<LearningPage />} />
        <Route path="/profile"      element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings"     element={<SettingsPage />} />
        <Route path="/about"        element={<AboutPage />} />
        <Route path="/help"         element={<HelpSupportPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
