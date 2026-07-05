import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

type Variant = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple'

const VARIANTS: Record<Variant, string> = {
  green:  'bg-success/10 text-success',
  red:    'bg-danger/10 text-danger',
  yellow: 'bg-warning/10 text-warning',
  blue:   'bg-info/10 text-info',
  gray:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
}

interface Props {
  variant?: Variant
  children: ReactNode
  className?: string
}

export default function Badge({ variant = 'gray', children, className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      VARIANTS[variant], className,
    )}>
      {children}
    </span>
  )
}
