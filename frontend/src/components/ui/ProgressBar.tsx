import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface Props {
  value: number          // 0–100
  color?: string         // hex or Tailwind colour token
  height?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showLabel?: boolean
  className?: string
}

const HEIGHTS = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

export default function ProgressBar({
  value,
  color = '#6171f6',
  height = 'md',
  animated = true,
  showLabel = false,
  className,
}: Props) {
  const clamped = Math.min(Math.max(value, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden',
        HEIGHTS[height],
      )}>
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clamped}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        ) : (
          <div
            className="h-full rounded-full"
            style={{ width: `${clamped}%`, background: color }}
          />
        )}
      </div>
      {showLabel && (
        <p className="text-xs text-right mt-0.5 font-medium" style={{ color }}>
          {clamped.toFixed(0)}%
        </p>
      )}
    </div>
  )
}
