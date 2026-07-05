import { cn } from '@/utils/cn'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export default function LoadingSpinner({ size = 'md', className, label }: Props) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn(
        'rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-brand-500 animate-spin',
        s,
      )} />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  )
}
