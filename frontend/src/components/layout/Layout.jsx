import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, BookOpen, Bot, Home, Map, Rss, Target, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useNotifStore } from '@/store'
import { useT } from '@/lib/i18n'

export function AppLayout() {
  return (
    <div className="app-shell flex flex-col min-h-screen max-w-[480px] mx-auto bg-white shadow-2xl relative">
      <TopNav />
      <main className="flex-1 overflow-y-auto pb-2 page-enter">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

function TopNav() {
  const navigate = useNavigate()
  const unread = useNotifStore((state) => state.unreadCount)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-primary to-green-light flex items-center justify-center text-lg">
          🌿
        </div>
        <span className="font-display font-bold text-green-primary text-[17px]">Econnect</span>
      </button>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-green-pale transition-colors"
        >
          <Bell size={18} className="text-gray-600" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-green-pale transition-colors"
        >
          <User size={18} className="text-gray-600" />
        </button>
      </div>
    </nav>
  )
}

function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const t = useT()
  const navItems = [
    { path: '/dashboard', icon: Home, label: t('home') },
    { path: '/environment-hub', icon: BookOpen, label: t('hub') },
    { path: '/feed', icon: Rss, label: t('feed') },
    { path: '/map', icon: Map, label: t('map') },
    { path: '/challenges', icon: Target, label: t('challenges') },
    { path: '/ai', icon: Bot, label: t('ai') },
  ]

  return (
    <nav className="sticky bottom-0 z-50 bg-white border-t border-gray-100 h-[70px] flex items-center justify-around px-1">
      {navItems.slice(0, 3).map(({ path, icon: Icon, label }) => (
        <NavItem
          key={path}
          icon={Icon}
          label={label}
          active={pathname === path}
          onClick={() => navigate(path)}
        />
      ))}

      <button
        onClick={() => navigate('/report')}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-green-primary to-green-mid flex items-center justify-center text-white text-2xl font-light shadow-lg shadow-green-primary/30 hover:scale-105 transition-transform active:scale-95"
      >
        +
      </button>

      {navItems.slice(3).map(({ path, icon: Icon, label }) => (
        <NavItem
          key={path}
          icon={Icon}
          label={label}
          active={pathname === path}
          onClick={() => navigate(path)}
        />
      ))}
    </nav>
  )
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-all min-w-[42px]',
        active ? 'text-green-primary' : 'text-gray-400 hover:text-gray-600',
      )}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
      <span className="text-[9px] font-medium leading-none">{label}</span>
    </button>
  )
}
