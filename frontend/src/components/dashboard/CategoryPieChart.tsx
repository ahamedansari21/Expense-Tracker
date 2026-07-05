import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategoryBreakdown } from '@/types'
import { formatCurrency } from '@/utils/format'

interface Props {
  data: CategoryBreakdown[]
  loading?: boolean
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as CategoryBreakdown
  return (
    <div className="bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-[#2a2d3a] rounded-xl p-3 shadow-card-md text-xs">
      <p className="font-semibold text-gray-800 dark:text-white">{d.icon} {d.category}</p>
      <p className="text-gray-500 mt-1">{formatCurrency(d.amount)} · {d.percentage.toFixed(1)}%</p>
    </div>
  )
}

export default function CategoryPieChart({ data, loading }: Props) {
  if (loading) return (
    <div className="card p-6">
      <div className="shimmer h-4 w-36 rounded mb-4" />
      <div className="shimmer h-48 w-48 rounded-full mx-auto" />
    </div>
  )

  if (!data?.length) return (
    <div className="card p-6 flex flex-col items-center justify-center h-full">
      <p className="text-gray-400 text-sm">No expense data yet</p>
    </div>
  )

  const top5 = data.slice(0, 5)

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">
        Spending by Category
      </h3>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie data={top5} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
              paddingAngle={3} dataKey="amount">
              {top5.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 w-full space-y-2">
          {top5.map((cat) => (
            <div key={cat.category} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
              <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">
                {cat.icon} {cat.category}
              </span>
              <span className="text-xs font-semibold text-gray-800 dark:text-white">
                {cat.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
