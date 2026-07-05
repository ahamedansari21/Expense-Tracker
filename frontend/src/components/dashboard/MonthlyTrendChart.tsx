import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { MonthlyTrendPoint } from '@/types'
import { useThemeStore } from '@/stores/themeStore'

interface Props {
  data: MonthlyTrendPoint[]
  loading?: boolean
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-[#2a2d3a] rounded-xl p-3 shadow-card-md text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 dark:text-gray-400 capitalize">{p.name}:</span>
          <span className="font-semibold text-gray-800 dark:text-white">
            ₹{Number(p.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function MonthlyTrendChart({ data, loading }: Props) {
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'
  const gridColor = isDark ? '#2a2d3a' : '#f0f0f0'
  const axisColor = isDark ? '#4b5563' : '#9ca3af'

  if (loading) return (
    <div className="card p-6">
      <div className="shimmer h-4 w-32 rounded mb-4" />
      <div className="shimmer h-56 w-full rounded-xl" />
    </div>
  )

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">
        6-Month Income vs Expenses
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00c896" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#00c896" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6171f6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6171f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
          <Area type="monotone" dataKey="income" stroke="#00c896" strokeWidth={2}
            fill="url(#incomeGrad)" dot={{ fill: '#00c896', r: 3 }} name="income" />
          <Area type="monotone" dataKey="expenses" stroke="#6171f6" strokeWidth={2}
            fill="url(#expenseGrad)" dot={{ fill: '#6171f6', r: 3 }} name="expenses" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
