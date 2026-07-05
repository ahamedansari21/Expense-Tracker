import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, Pencil, Trash2, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import Badge from '@/components/ui/Badge'
import { budgetService } from '@/services/budgetService'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency, startOfMonthStr, endOfMonthStr } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Budget, BudgetFormData } from '@/types'

const schema = z.object({
  name:           z.string().min(1, 'Budget name is required'),
  amount:         z.coerce.number().positive('Amount must be positive'),
  categoryId:     z.coerce.number().optional(),
  period:         z.enum(['WEEKLY','MONTHLY','QUARTERLY','YEARLY']),
  startDate:      z.string().min(1),
  endDate:        z.string().min(1),
  alertThreshold: z.coerce.number().min(1).max(100),
  color:          z.string(),
})

const COLORS = ['#6171f6','#00c896','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316']

function BudgetCard({ budget, onEdit, onDelete }: {
  budget: Budget
  onEdit: (b: Budget) => void
  onDelete: (id: number) => void
}) {
  const pct = Math.min(budget.percentageUsed, 100)
  const barColor = budget.isOverBudget ? '#ef4444' : budget.isNearLimit ? '#f59e0b' : budget.color || '#6171f6'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="card p-5 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${barColor}18` }}>
            {budget.category?.icon || '🎯'}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{budget.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{budget.period} · {budget.category?.name || 'All categories'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(budget.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-red-50 dark:hover:bg-danger/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {budget.isOverBudget
            ? <Badge variant="red"><AlertTriangle className="w-3 h-3 mr-1" />Over Budget</Badge>
            : budget.isNearLimit
            ? <Badge variant="yellow">⚠️ Near Limit</Badge>
            : <Badge variant="green"><CheckCircle2 className="w-3 h-3 mr-1" />On Track</Badge>}
        </div>
        <span className="text-xs font-bold" style={{ color: barColor }}>{pct.toFixed(0)}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>

      {/* Amounts */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-gray-400">Spent</p>
          <p className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(budget.spent)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{budget.isOverBudget ? 'Over by' : 'Remaining'}</p>
          <p className={cn('text-base font-bold', budget.isOverBudget ? 'text-danger' : 'text-success')}>
            {budget.isOverBudget
              ? formatCurrency(budget.spent - budget.amount)
              : formatCurrency(budget.remaining)}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 dark:border-[#2a2d3a] flex justify-between text-xs text-gray-400">
        <span>Budget: {formatCurrency(budget.amount)}</span>
        <span>Alert at {budget.alertThreshold}%</span>
      </div>
    </motion.div>
  )
}

function BudgetFormModal({
  open, onClose, onSave, initial, loading,
}: {
  open: boolean; onClose: () => void
  onSave: (data: BudgetFormData) => Promise<void>
  initial?: Budget | null; loading: boolean
}) {
  const { categories } = useCategories()
  const expCats = categories.filter(c => c.type === 'EXPENSE' || c.type === 'BOTH')

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<BudgetFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      period: 'MONTHLY', alertThreshold: 80,
      color: '#6171f6', startDate: startOfMonthStr(), endDate: endOfMonthStr(),
    },
  })

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name, amount: initial.amount,
        categoryId: initial.category?.id, period: initial.period as any,
        startDate: initial.startDate, endDate: initial.endDate,
        alertThreshold: initial.alertThreshold, color: initial.color || '#6171f6',
      })
    } else {
      reset({ period: 'MONTHLY', alertThreshold: 80, color: '#6171f6',
        startDate: startOfMonthStr(), endDate: endOfMonthStr() })
    }
  }, [initial, reset])

  const selColor = watch('color')

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Budget' : 'Create Budget'} size="md">
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <div>
          <label className="label">Budget Name *</label>
          <input {...register('name')} placeholder="e.g. Food & Dining" className={cn('input', errors.name && 'border-danger')} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Amount (₹) *</label>
            <input {...register('amount')} type="number" step="100" placeholder="5000" className={cn('input', errors.amount && 'border-danger')} />
            {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="label">Period</label>
            <select {...register('period')} className="input">
              {['WEEKLY','MONTHLY','QUARTERLY','YEARLY'].map(p => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Category (optional)</label>
          <select {...register('categoryId')} className="input">
            <option value="">All categories</option>
            {expCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start Date</label>
            <input {...register('startDate')} type="date" className="input" />
          </div>
          <div>
            <label className="label">End Date</label>
            <input {...register('endDate')} type="date" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Alert Threshold: {watch('alertThreshold')}%</label>
          <input {...register('alertThreshold')} type="range" min="10" max="100" step="5" className="w-full accent-brand-500" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>10%</span><span>100%</span></div>
        </div>

        <div>
          <label className="label">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setValue('color', c)}
                className={cn('w-8 h-8 rounded-full transition-all', selColor === c && 'ring-2 ring-offset-2 ring-brand-500 scale-110')}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-semibold text-sm">
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : initial ? 'Update Budget' : 'Create Budget'}
        </button>
      </form>
    </Modal>
  )
}

export default function BudgetPage() {
  const [budgets, setBudgets]     = useState<Budget[]>([])
  const [loading, setLoading]     = useState(true)
  const [formOpen, setFormOpen]   = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    budgetService.list().then(setBudgets).finally(() => setLoading(false))
  }, [])

  const handleSave = async (data: BudgetFormData) => {
    setSaving(true)
    try {
      if (editBudget) {
        const updated = await budgetService.update(editBudget.id, data)
        setBudgets(bs => bs.map(b => b.id === editBudget.id ? updated : b))
        toast.success('Budget updated!')
      } else {
        const created = await budgetService.create(data)
        setBudgets(bs => [created, ...bs])
        toast.success('Budget created!')
      }
      setFormOpen(false); setEditBudget(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to save budget')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await budgetService.delete(deleteId)
      setBudgets(bs => bs.filter(b => b.id !== deleteId))
      setDeleteId(null); toast.success('Budget deleted')
    } catch { toast.error('Failed to delete') }
  }

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0)
  const overCount   = budgets.filter(b => b.isOverBudget).length

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{budgets.length} active budgets</p>
        </div>
        <button onClick={() => { setEditBudget(null); setFormOpen(true) }} className="btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" /> Create Budget
        </button>
      </div>

      {/* Summary stats */}
      {!loading && budgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Budget', value: formatCurrency(totalBudget), icon: '🎯', color: 'text-brand-500' },
            { label: 'Total Spent',  value: formatCurrency(totalSpent),  icon: '💸', color: totalSpent > totalBudget ? 'text-danger' : 'text-gray-900 dark:text-white' },
            { label: 'Over Budget',  value: `${overCount} budget${overCount !== 1 ? 's' : ''}`, icon: overCount > 0 ? '⚠️' : '✅', color: overCount > 0 ? 'text-danger' : 'text-success' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className={cn('text-lg font-bold mt-1', s.color)}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Budget cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="flex gap-3 mb-4"><div className="shimmer w-10 h-10 rounded-xl" /><div className="space-y-2 flex-1"><div className="shimmer h-3.5 w-32 rounded" /><div className="shimmer h-2.5 w-20 rounded" /></div></div>
              <div className="shimmer h-2.5 w-full rounded-full mb-3" /><div className="shimmer h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState icon={Target} title="No budgets yet"
          description="Create your first budget to start tracking spending limits"
          action={<button onClick={() => setFormOpen(true)} className="btn-primary gap-2"><Plus className="w-4 h-4" />Create Budget</button>} />
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map(b => (
              <BudgetCard key={b.id} budget={b}
                onEdit={b => { setEditBudget(b); setFormOpen(true) }}
                onDelete={setDeleteId} />
            ))}
          </div>
        </AnimatePresence>
      )}

      <BudgetFormModal open={formOpen} onClose={() => { setFormOpen(false); setEditBudget(null) }}
        onSave={handleSave} initial={editBudget} loading={saving} />

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Budget" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Delete this budget? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
