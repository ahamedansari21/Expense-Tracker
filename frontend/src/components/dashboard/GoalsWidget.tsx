import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Target } from 'lucide-react'
import type { GoalSummary } from '@/types'
import { formatCurrency } from '@/utils/format'

interface Props { goals: GoalSummary[]; loading?: boolean }

export default function GoalsWidget({ goals, loading }: Props) {
  if (loading) return (
    <div className="card p-6">
      <div className="shimmer h-4 w-28 rounded mb-4" />
      {[...Array(2)].map((_, i) => (
        <div key={i} className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-[#1e2130]">
          <div className="shimmer h-3 w-32 rounded mb-2" />
          <div className="shimmer h-2 w-full rounded-full mb-1" />
          <div className="shimmer h-2.5 w-24 rounded" />
        </div>
      ))}
    </div>
  )

  if (!goals.length) return null

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Financial Goals</h3>
        </div>
        <Link to="/goals"
          className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
          All goals <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {goals.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-4 rounded-xl bg-gray-50 dark:bg-[#1e2130]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{g.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[130px]">
                  {g.name}
                </span>
              </div>
              <span className="text-xs font-bold" style={{ color: g.color }}>
                {g.progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: g.color }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{formatCurrency(g.currentAmount)} saved</span>
              <span>Goal: {formatCurrency(g.targetAmount)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
