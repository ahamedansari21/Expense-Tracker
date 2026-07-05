import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Download, FileSpreadsheet, FileText, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'
import { reportService } from '@/services/reportService'
import { formatCurrency, startOfMonthStr, endOfMonthStr } from '@/utils/format'
import { useThemeStore } from '@/stores/themeStore'
import { cn } from '@/utils/cn'

const PRESET_RANGES = [
  { label: 'This Month',  from: startOfMonthStr(), to: endOfMonthStr() },
  { label: 'Last 3 Months', from: (() => { const d = new Date(); d.setMonth(d.getMonth()-3); return d.toISOString().slice(0,10) })(), to: endOfMonthStr() },
  { label: 'Last 6 Months', from: (() => { const d = new Date(); d.setMonth(d.getMonth()-6); return d.toISOString().slice(0,10) })(), to: endOfMonthStr() },
  { label: 'This Year',  from: `${new Date().getFullYear()}-01-01`, to: endOfMonthStr() },
]

export default function ReportsPage() {
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'
  const [from, setFrom]         = useState(startOfMonthStr())
  const [to, setTo]             = useState(endOfMonthStr())
  const [summary, setSummary]   = useState<any>(null)
  const [loading, setLoading]   = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const data = await reportService.getSummary(from, to)
      setSummary(data)
    } catch { toast.error('Failed to load report') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSummary() }, [from, to])

  const exportFile = async (type: 'csv' | 'excel') => {
    setExporting(type)
    try {
      if (type === 'csv')   await reportService.exportCsv(from, to)
      else                  await reportService.exportExcel(from, to)
      toast.success(`${type.toUpperCase()} downloaded!`)
    } catch { toast.error('Export failed') }
    finally { setExporting(null) }
  }

  const chartData = summary?.categoryBreakdown?.map((c: any) => ({
    name: (c.category || 'Other').split(' ')[0],
    amount: Number(c.amount ?? 0),
  })) ?? []

  const CHART_COLORS = ['#6171f6','#00c896','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6']

  return (
    <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Export and analyse your financial data</p>
      </div>

      {/* Range selector */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Date Range</h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_RANGES.map(r => (
            <button key={r.label}
              onClick={() => { setFrom(r.from); setTo(r.to) }}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                from === r.from && to === r.to
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-[#1e2130] text-gray-600 dark:text-gray-400 hover:bg-gray-200')}>
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input w-40" />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input w-40" />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card p-5"><div className="shimmer h-4 w-24 rounded mb-3" /><div className="shimmer h-7 w-32 rounded" /></div>)}
        </div>
      ) : summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses ?? 0), color: 'text-danger', icon: '💸' },
            { label: 'Total Income',   value: formatCurrency(summary.totalIncome   ?? 0), color: 'text-success', icon: '💰' },
            { label: 'Net Savings',    value: formatCurrency((summary.totalIncome ?? 0) - (summary.totalExpenses ?? 0)), color: 'text-brand-500', icon: '🐷' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <span className="text-2xl">{s.icon}</span>
              <p className={cn('text-2xl font-bold mt-2', s.color)}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Category bar chart */}
      {!loading && chartData.length > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2a2d3a' : '#f0f0f0'} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), 'Amount']}
                contentStyle={{ background: isDark ? '#1a1d27' : '#fff', border: `1px solid ${isDark ? '#2a2d3a' : '#e5e7eb'}`, borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="amount" radius={[6,6,0,0]}>
                {chartData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Export buttons */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Export Data</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          Download your expense data for the selected period
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportFile('csv')} disabled={!!exporting}
            className="btn-secondary gap-2 font-medium">
            {exporting === 'csv'
              ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : <Download className="w-4 h-4 text-green-500" />}
            Export CSV
          </button>
          <button onClick={() => exportFile('excel')} disabled={!!exporting}
            className="btn-secondary gap-2 font-medium">
            {exporting === 'excel'
              ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : <FileSpreadsheet className="w-4 h-4 text-blue-500" />}
            Export Excel
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          📄 Exports include: date, title, category, amount, type, payment method, merchant, notes
        </p>
      </div>
    </div>
  )
}
