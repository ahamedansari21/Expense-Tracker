import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ExpensesPage from '@/pages/ExpensesPage'
import BudgetPage from '@/pages/BudgetPage'
import AiChatPage from '@/pages/AiChatPage'
import SubscriptionsPage from '@/pages/SubscriptionsPage'
import ReportsPage from '@/pages/ReportsPage'
import GoalsPage from '@/pages/GoalsPage'
import SettingsPage from '@/pages/SettingsPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const { theme, setTheme } = useThemeStore()

  // Initialise theme on mount (run once, intentionally ignoring deps)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setTheme(theme) }, [])

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

      {/* Protected */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"    element={<DashboardPage />} />
        <Route path="/expenses"     element={<ExpensesPage />} />
        <Route path="/budgets"      element={<BudgetPage />} />
        <Route path="/ai-assistant" element={<AiChatPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/reports"      element={<ReportsPage />} />
        <Route path="/goals"        element={<GoalsPage />} />
        <Route path="/settings"     element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
