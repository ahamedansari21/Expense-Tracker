import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet, TrendingDown, TrendingUp, PiggyBank,
  Sparkles, RefreshCw,
} from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useAuthStore } from '@/stores/authStore'
import StatCard from '@/components/ui/StatCard'
import HealthScoreCard from '@/components/dashboard/HealthScoreCard'
import MonthlyTrendChart from '@/components/dashboard/MonthlyTrendChart'
import CategoryPieChart from '@/components/dashboard/CategoryPieChart'
import RecentExpenses from '@/components/dashboard/RecentExpenses'
import BudgetAlerts from '@/components/dashboard/BudgetAlerts'
import UpcomingBills from '@/components/dashboard/UpcomingBills'
import GoalsWidget from '@/components/dashboard/GoalsWidget'
import { formatDate } from '@/utils/format'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function DashboardPage() {
  const { data, loading, fetch, lastFetched } = useDashboardStore()
  const user = useAuthStore((s) => s.user)

  useEffect(() => { fetch() }, [fetch])

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.fullName?.split(' ')[0] || 'there'

  return (
    <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, {firstName} 👋
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => { useDashboardStore.setState({ lastFetched: null }); fetch() }}
          disabled={loading}
          className="btn-secondary btn-sm gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Top stat cards */}
      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <StatCard
            title="Total Expenses" value={data?.totalExpenses ?? 0}
            icon={TrendingDown} iconBg="bg-danger/10" iconColor="text-danger"
            change={data?.expenseChangePercent}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Total Income" value={data?.totalIncome ?? 0}
            icon={TrendingUp} iconBg="bg-success/10" iconColor="text-success"
            change={data?.incomeChangePercent}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Net Savings" value={data?.netSavings ?? 0}
            icon={PiggyBank} iconBg="bg-brand-500/10" iconColor="text-brand-500"
            loading={loading}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Savings Rate" value={data?.savingsRate ?? 0}
            prefix="" suffix="%"
            icon={Wallet} iconBg="bg-purple-500/10" iconColor="text-purple-500"
            decimals={1}
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {/* Main grid */}
      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Health Score */}
        <motion.div variants={item} className="lg:col-span-1">
          <HealthScoreCard
            score={data?.financialHealthScore ?? 50}
            label={data?.healthScoreLabel ?? 'Fair'}
            tip={data?.healthScoreTip ?? 'Track expenses daily to improve your score.'}
            loading={loading}
          />
        </motion.div>

        {/* Trend chart */}
        <motion.div variants={item} className="lg:col-span-2">
          <MonthlyTrendChart data={data?.monthlyTrend ?? []} loading={loading} />
        </motion.div>
      </motion.div>

      {/* Middle grid */}
      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Recent expenses — spans 2 cols */}
        <motion.div variants={item} className="lg:col-span-2">
          <RecentExpenses expenses={data?.recentExpenses ?? []} loading={loading} />
        </motion.div>

        {/* Category pie */}
        <motion.div variants={item} className="lg:col-span-1">
          <CategoryPieChart data={data?.categoryBreakdown ?? []} loading={loading} />
        </motion.div>
      </motion.div>

      {/* Bottom grid */}
      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <motion.div variants={item}>
          <BudgetAlerts budgets={data?.budgetAlerts ?? []} loading={loading} />
        </motion.div>
        <motion.div variants={item}>
          <UpcomingBills bills={data?.upcomingBills ?? []} loading={loading} />
        </motion.div>
        <motion.div variants={item}>
          <GoalsWidget goals={data?.goals ?? []} loading={loading} />
        </motion.div>
      </motion.div>

      {/* AI insight strip */}
      {!loading && data && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card p-5 bg-gradient-to-r from-brand-500/5 via-purple-500/5 to-brand-500/5 border-brand-200 dark:border-brand-500/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                AI Insight
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.financialHealthScore >= 70
                  ? `Great work, ${firstName}! Your savings rate of ${data.savingsRate?.toFixed(0)}% is above average. Consider investing your surplus for long-term growth.`
                  : `Your expenses are ₹${data.totalExpenses?.toLocaleString('en-IN')} this month. Try reducing discretionary spending to boost your savings rate.`}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
