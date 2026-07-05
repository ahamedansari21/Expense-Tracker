import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Search, Sun, Moon, Menu, X, Check,
  Wallet, CreditCard, Target, MessageSquareText,
  RefreshCw, BarChart3, TrendingUp, Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useThemeStore } from '@/stores/themeStore'
import { notificationService } from '@/services/notificationService'
import { useAuth } from '@/hooks/useAuth'
import { formatRelative } from '@/utils/format'
import type { Notification } from '@/types'

// Page title map
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/expenses':      'Expenses',
  '/budgets':       'Budgets',
  '/ai-assistant':  'AI Assistant',
  '/subscriptions': 'Subscriptions',
  '/reports':       'Reports',
  '/goals':         'Goals',
  '/settings':      'Settings',
}

export default function Navbar() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const { toggleSidebar, notificationPanelOpen, setNotificationPanel } = useUiStore()
  const { theme, setTheme, resolvedTheme } = useThemeStore()
  const { logout } = useAuth()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)

  const title = PAGE_TITLES[location.pathname] || 'Smart Expense'

  useEffect(() => {
    notificationService.unreadCount().then(setUnreadCount).catch(() => {})
  }, [location.pathname])

  const openNotifications = async () => {
    setNotificationPanel(!notificationPanelOpen)
    if (!notificationPanelOpen) {
      const data = await notificationService.list(0, 10)
      setNotifications(data)
      await notificationService.markAllRead()
      setUnreadCount(0)
    }
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const NOTIFICATION_ICONS: Record<string, string> = {
    BUDGET_ALERT: '⚠️', BILL_DUE: '📅', FRAUD_ALERT: '🚨', INSIGHT: '💡', SYSTEM: '🔔',
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-4 md:px-6
        bg-white/80 dark:bg-[#13151f]/80 backdrop-blur-xl
        border-b border-gray-100 dark:border-[#2a2d3a]">

        {/* Mobile menu toggle */}
        <button onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e2130] transition-colors">
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title */}
        <h1 className="text-lg font-bold text-gray-900 dark:text-white flex-1 hidden sm:block">
          {title}
        </h1>

        <div className="flex items-center gap-2 ml-auto">
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e2130]
              hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            {resolvedTheme === 'dark'
              ? <Sun className="w-5 h-5" />
              : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={openNotifications}
              className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e2130]
                hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold
                  flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Avatar / profile */}
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500
                flex items-center justify-center text-white text-sm font-bold
                hover:ring-2 hover:ring-brand-400 transition-all">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                : user?.fullName?.charAt(0).toUpperCase()}
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-2 w-56 card p-1.5 z-50 shadow-card-md"
                >
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-[#2a2d3a] mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <Link to="/settings" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300
                      hover:bg-gray-100 dark:hover:bg-[#1e2130] transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button onClick={() => { setProfileOpen(false); logout() }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400
                      hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Notification panel */}
      <AnimatePresence>
        {notificationPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
              onClick={() => setNotificationPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
              className="fixed top-16 right-4 z-50 w-80 card shadow-card-md max-h-[480px] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2a2d3a]">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                <button onClick={() => setNotificationPanel(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id}
                      className={cn(
                        'flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-[#1e2130] last:border-0',
                        !n.isRead && 'bg-brand-50/50 dark:bg-brand-500/5',
                      )}>
                      <span className="text-xl shrink-0 mt-0.5">{NOTIFICATION_ICONS[n.type] || '🔔'}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatRelative(n.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click-outside for profile */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </>
  )
}
