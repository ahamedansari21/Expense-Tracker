import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp } from 'lucide-react'
import { healthScoreColor } from '@/utils/format'
import { cn } from '@/utils/cn'

interface Props {
  score: number
  label: string
  tip: string
  loading?: boolean
}

export default function HealthScoreCard({ score, label, tip, loading }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || loading) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width = 200
    const h = canvas.height = 200
    const cx = w / 2, cy = h / 2
    const r = 80
    const start = Math.PI * 0.75
    const end = start + Math.PI * 1.5

    ctx.clearRect(0, 0, w, h)

    // Track
    ctx.beginPath()
    ctx.arc(cx, cy, r, start, end)
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.stroke()

    // Fill (animated via requestAnimationFrame)
    const color = healthScoreColor(score)
    const fillEnd = start + (Math.PI * 1.5 * Math.min(score, 100)) / 100

    ctx.beginPath()
    ctx.arc(cx, cy, r, start, fillEnd)
    ctx.strokeStyle = color
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.shadowBlur = 12
    ctx.shadowColor = color
    ctx.stroke()
  }, [score, loading])

  if (loading) return (
    <div className="card p-6">
      <div className="shimmer h-4 w-32 rounded mb-4" />
      <div className="shimmer h-40 w-40 rounded-full mx-auto mb-4" />
      <div className="shimmer h-3 w-48 rounded mx-auto" />
    </div>
  )

  const color = healthScoreColor(score)
  const labelColor: Record<string, string> = {
    Excellent: 'text-success', Good: 'text-success',
    Fair: 'text-warning', 'Needs Improvement': 'text-warning', Critical: 'text-danger',
  }

  return (
    <div className="card p-6 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-1 self-start">
        <Sparkles className="w-4 h-4 text-brand-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Financial Health Score
        </span>
      </div>

      <div className="relative my-2">
        <canvas ref={canvasRef} className="w-[160px] h-[160px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-4xl font-extrabold"
            style={{ color }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-gray-400 font-medium">out of 100</span>
        </div>
      </div>

      <span className={cn('text-base font-bold mb-2', labelColor[label] || 'text-gray-700 dark:text-gray-200')}>
        {label}
      </span>

      <div className="flex items-start gap-2 mt-1 bg-brand-50 dark:bg-brand-500/10 rounded-xl px-4 py-3">
        <TrendingUp className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-600 dark:text-gray-400 text-left leading-relaxed">{tip}</p>
      </div>
    </div>
  )
}
