import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CreditCard, Target, MessageSquareText,
  RefreshCw, BarChart3, Settings, Wallet, LogOut,
  ChevronLeft, TrendingUp, Sparkles,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const NAV = [
  { label: 'Dashboard',     icon: LayoutDashboard,    path: '/dashboard' },
  { label: 'Expenses',      icon: CreditCard,          path: '/expenses' },
  { label: 'Budgets',       icon: Target,              path: '/budgets' },
  { label: 'AI Assistant',  icon: MessageSquareText,   path: '/ai-assistant', badge: 'AI' },
  { label: 'Subscriptions', icon: RefreshCw,           path: '/subscriptions' },
  { label: 'Reports',       icon: BarChart3,           path: '/reports' },
  { label: 'Goals',         icon: TrendingUp,          path: '/goals' },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const { sidebarCollapsed, toggleCollapsed } = useUiStore()
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  const w = sidebarCollapsed ? 'w-[72px]' : 'w-64'

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className={cn(
        'relative hidden lg:flex flex-col h-screen',
        'bg-white dark:bg-[#13151f] border-r border-gray-100 dark:border-[#2a2d3a]',
        'shrink-0 overflow-hidden',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-[#2a2d3a]',
        sidebarCollapsed && 'justify-center px-0',
      )}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-glow">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Smart Expense</p>
              <p className="text-[10px] text-brand-500 font-semibold tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Powered
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide space-y-0.5">
        {NAV.map(({ label, icon: Icon, path, badge }) => {
          const active = location.pathname.startsWith(path)
          return (
            <NavLink key={path} to={path} title={sidebarCollapsed ? label : undefined}>
              <motion.div
                whileHover={{ x: sidebarCollapsed ? 0 : 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative',
                  active
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e2130] hover:text-gray-900 dark:hover:text-gray-100',
                  sidebarCollapsed && 'justify-center',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-brand-500"
                  />
                )}
                <Icon className={cn('w-5 h-5 shrink-0', active && 'text-brand-500')} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium flex-1"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {badge && !sidebarCollapsed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-500 text-white leading-none">
                    {badge}
                  </span>
                )}
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* User + Settings + Logout */}
      <div className="border-t border-gray-100 dark:border-[#2a2d3a] p-3 space-y-0.5">
        <NavLink to="/settings">
          <div className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400',
            'hover:bg-gray-100 dark:hover:bg-[#1e2130] hover:text-gray-900 dark:hover:text-gray-100',
            'transition-colors duration-150',
            sidebarCollapsed && 'justify-center',
          )}>
            <Settings className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
          </div>
        </NavLink>

        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400',
            'hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400',
            'transition-colors duration-150',
            sidebarCollapsed && 'justify-center',
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        {/* Avatar strip */}
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl bg-gray-50 dark:bg-[#1e2130]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleCollapsed}
        className={cn(
          'absolute top-6 -right-3 z-10 w-6 h-6 rounded-full',
          'bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-[#2a2d3a]',
          'flex items-center justify-center shadow-sm',
          'hover:border-brand-400 hover:text-brand-500 transition-colors',
          'text-gray-400',
        )}
      >
        <ChevronLeft className={cn('w-3.5 h-3.5 transition-transform', sidebarCollapsed && 'rotate-180')} />
      </button>
    </motion.aside>
  )
}
