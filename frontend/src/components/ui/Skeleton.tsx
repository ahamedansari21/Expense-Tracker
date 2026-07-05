import { cn } from '@/utils/cn'

interface Props {
  className?: string
  rows?: number
  avatar?: boolean
}

/** Generic skeleton loader */
export default function Skeleton({ className, rows = 3, avatar = false }: Props) {
  return (
    <div className={cn('animate-pulse space-y-3', className)}>
      {avatar && <div className="shimmer w-12 h-12 rounded-full" />}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={cn(
          'shimmer h-3 rounded',
          i === 0 ? 'w-3/4' : i % 3 === 0 ? 'w-1/2' : 'w-full',
        )} />
      ))}
    </div>
  )
}
