import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CreditCard, Target, MessageSquareText,
  RefreshCw, BarChart3, Settings, Wallet, LogOut, X, TrendingUp, Sparkles,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const NAV = [
  { label: 'Dashboard',     icon: LayoutDashboard,  path: '/dashboard' },
  { label: 'Expenses',      icon: CreditCard,        path: '/expenses' },
  { label: 'Budgets',       icon: Target,            path: '/budgets' },
  { label: 'AI Assistant',  icon: MessageSquareText, path: '/ai-assistant', badge: 'AI' },
  { label: 'Subscriptions', icon: RefreshCw,         path: '/subscriptions' },
  { label: 'Reports',       icon: BarChart3,         path: '/reports' },
  { label: 'Goals',         icon: TrendingUp,        path: '/goals' },
  { label: 'Settings',      icon: Settings,          path: '/settings' },
]

export default function MobileSidebar() {
  const { logout } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useUiStore()
  const user = useAuthStore((s) => s.user)

  const close = () => setSidebarOpen(false)

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={close}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#13151f]
              border-r border-gray-100 dark:border-[#2a2d3a] flex flex-col lg:hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-[#2a2d3a]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Smart Expense</p>
                  <p className="text-[10px] text-brand-500 font-semibold tracking-wider uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Powered
                  </p>
                </div>
              </div>
              <button onClick={close}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e2130]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide space-y-0.5">
              {NAV.map(({ label, icon: Icon, path, badge }) => (
                <NavLink key={path} to={path} onClick={close}>
                  {({ isActive }) => (
                    <div className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                      isActive
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e2130] hover:text-gray-900 dark:hover:text-gray-100',
                    )}>
                      <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-brand-500')} />
                      <span className="text-sm font-medium flex-1">{label}</span>
                      {badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-500 text-white">
                          {badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Bottom */}
            <div className="border-t border-gray-100 dark:border-[#2a2d3a] p-3">
              {user && (
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 dark:bg-[#1e2130] mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <button onClick={() => { close(); logout() }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400
                  hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
