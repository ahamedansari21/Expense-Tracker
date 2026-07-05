import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock } from 'lucide-react'
import type { Subscription } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

interface Props { bills: Subscription[]; loading?: boolean }

export default function UpcomingBills({ bills, loading }: Props) {
  if (loading) return (
    <div className="card p-6">
      <div className="shimmer h-4 w-32 rounded mb-4" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-[#1e2130] last:border-0">
          <div className="shimmer w-9 h-9 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <div className="shimmer h-3 w-24 rounded" />
            <div className="shimmer h-2.5 w-16 rounded" />
          </div>
          <div className="shimmer h-4 w-14 rounded" />
        </div>
      ))}
    </div>
  )

  if (!bills.length) return null

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Bills</h3>
        </div>
        <Link to="/subscriptions"
          className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-0">
        {bills.map((bill) => {
          const urgent = bill.daysUntilBilling <= 3
          return (
            <div key={bill.id}
              className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-[#1e2130] last:border-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: bill.color || '#6171f6' }}
              >
                {bill.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{bill.name}</p>
                <p className={cn('text-xs mt-0.5 font-medium',
                  urgent ? 'text-danger' : 'text-gray-400')}>
                  {bill.daysUntilBilling === 0 ? '🔴 Due today'
                    : bill.daysUntilBilling === 1 ? '🟠 Due tomorrow'
                    : `Due in ${bill.daysUntilBilling} days`}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                {formatCurrency(bill.amount)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
