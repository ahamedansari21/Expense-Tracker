import { motion } from 'framer-motion'
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import CountUp from 'react-countup'
import { cn } from '@/utils/cn'
import { formatChange } from '@/utils/format'

interface Props {
  title: string
  value: number
  prefix?: string
  suffix?: string
  change?: number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  loading?: boolean
  decimals?: number
}

export default function StatCard({
  title, value, prefix = '₹', suffix, change, icon: Icon,
  iconColor = 'text-brand-500', iconBg = 'bg-brand-500/10',
  loading, decimals = 0,
}: Props) {
  if (loading) return (
    <div className="stat-card">
      <div className="shimmer h-4 w-24 rounded mb-3" />
      <div className="shimmer h-7 w-32 rounded mb-2" />
      <div className="shimmer h-3 w-20 rounded" />
    </div>
  )

  const isPositive = (change ?? 0) >= 0
  const isZero = change === undefined || change === 0
  const TrendIcon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {prefix}
            <CountUp end={value} duration={1.2} separator="," decimals={decimals} />
            {suffix}
          </p>
        </div>
        <div className={cn('p-2.5 rounded-xl', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>

      {change !== undefined && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium mt-2',
          isZero ? 'text-gray-400'
            : isPositive ? 'text-success' : 'text-danger',
        )}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{formatChange(change)} vs last month</span>
        </div>
      )}
    </motion.div>
  )
}
