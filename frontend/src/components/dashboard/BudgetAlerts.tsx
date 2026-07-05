import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import type { Budget } from '@/types'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'

interface Props { budgets: Budget[]; loading?: boolean }

export default function BudgetAlerts({ budgets, loading }: Props) {
  if (loading) return (
    <div className="card p-6">
      <div className="shimmer h-4 w-28 rounded mb-4" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="mb-4">
          <div className="shimmer h-3 w-40 rounded mb-2" />
          <div className="shimmer h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  )

  if (!budgets.length) return null

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Budget Alerts</h3>
        </div>
        <Link to="/budgets"
          className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
          Manage <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-4">
        {budgets.map((b) => {
          const pct = Math.min(b.percentageUsed, 100)
          const barColor = b.isOverBudget ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#6171f6'

          return (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {b.category?.icon && (
                    <span className="text-base">{b.category.icon}</span>
                  )}
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                    {b.name}
                  </span>
                  {b.isOverBudget && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-danger/10 text-danger">
                      Over
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                  {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 text-right">{pct.toFixed(0)}% used</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
