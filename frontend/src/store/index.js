// src/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('eco_token', token)
        set({ user, token, isAuthenticated: true })
      },

      updateUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),

      logout: () => {
        localStorage.removeItem('eco_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    { name: 'eco-auth', partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
)

// src/store/uiStore.js
export const useUiStore = create((set) => ({
  activePage:  'home',
  sidebarOpen: false,
  setPage:     (page) => set({ activePage: page }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))

// src/store/notifStore.js
export const useNotifStore = create((set) => ({
  unreadCount: 0,
  setUnread:   (n) => set({ unreadCount: n }),
  decrement:   ()  => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  reset:       ()  => set({ unreadCount: 0 }),
}))

// src/store/settingsStore.js
export const useSettingsStore = create(
  persist(
    (set) => ({
      darkMode: false,
      language: 'fr',
      notificationsEnabled: true,

      setDarkMode: (val) => set({ darkMode: val }),
      setLanguage: (val) => set({ language: val }),
      setNotifications: (val) => set({ notificationsEnabled: val }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: 'eco-settings' }
  )
)
