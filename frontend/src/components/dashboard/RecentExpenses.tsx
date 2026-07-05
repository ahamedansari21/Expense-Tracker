import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'
import type { Expense } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

interface Props {
  expenses: Expense[]
  loading?: boolean
}

const PM_LABELS: Record<string, string> = {
  UPI: '⚡ UPI', CARD: '💳 Card', CASH: '💵 Cash',
  NET_BANKING: '🏦 Net Banking', WALLET: '👛 Wallet', OTHER: '🔄 Other',
}

export default function RecentExpenses({ expenses, loading }: Props) {
  if (loading) return (
    <div className="card p-6">
      <div className="shimmer h-4 w-32 rounded mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-[#1e2130] last:border-0">
          <div className="shimmer w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <div className="shimmer h-3 w-32 rounded" />
            <div className="shimmer h-2.5 w-20 rounded" />
          </div>
          <div className="shimmer h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        <Link to="/expenses"
          className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {expenses.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No transactions yet</p>
      ) : (
        <div className="space-y-0">
          {expenses.map((expense, i) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-[#1e2130] last:border-0"
            >
              {/* Category icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: `${expense.category?.color || '#6171f6'}18` }}
              >
                {expense.category?.icon || '💸'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {expense.title}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span>{formatDate(expense.date)}</span>
                  {expense.merchant && (
                    <><span className="opacity-40">·</span><span className="truncate max-w-[80px]">{expense.merchant}</span></>
                  )}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className={cn(
                  'text-sm font-semibold',
                  expense.type === 'INCOME' ? 'text-success' : 'text-gray-900 dark:text-white',
                )}>
                  {expense.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(expense.amount)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {PM_LABELS[expense.paymentMethod] || expense.paymentMethod}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
