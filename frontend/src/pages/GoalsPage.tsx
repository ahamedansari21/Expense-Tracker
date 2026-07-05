import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, Pencil, Trash2, CheckCircle2, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/services/api'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/utils/cn'

interface Goal {
  id: number; name: string; targetAmount: number; currentAmount: number
  progressPercentage: number; targetDate?: string; icon: string; color: string
  category?: string; isCompleted: boolean
}

const GOAL_ICONS = ['🏖️','🚗','🏠','💻','📱','🎓','💍','✈️','🏦','💊','🐾','🎸']
const COLORS = ['#6171f6','#00c896','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316']

function GoalForm({ onSave, onClose, loading, initial }: {
  onSave: (d: any) => Promise<void>; onClose: () => void
  loading: boolean; initial?: Goal | null
}) {
  const [form, setForm] = useState({
    name: initial?.name || '', targetAmount: initial?.targetAmount || '',
    currentAmount: initial?.currentAmount || 0, targetDate: initial?.targetDate || '',
    category: initial?.category || '', icon: initial?.icon || '🏖️', color: initial?.color || '#6171f6',
  })
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={async e => { e.preventDefault(); await onSave(form) }} className="space-y-4">
      <div>
        <label className="label">Goal Name *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} required
          placeholder="e.g. Emergency Fund" className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Target Amount (₹) *</label>
          <input value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)}
            required type="number" step="1000" placeholder="100000" className="input" />
        </div>
        <div>
          <label className="label">Current Saved (₹)</label>
          <input value={form.currentAmount} onChange={e => set('currentAmount', e.target.value)}
            type="number" step="100" placeholder="0" className="input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Target Date</label>
          <input value={form.targetDate} onChange={e => set('targetDate', e.target.value)}
            type="date" className="input" />
        </div>
        <div>
          <label className="label">Category</label>
          <input value={form.category} onChange={e => set('category', e.target.value)}
            placeholder="Travel, Tech..." className="input" />
        </div>
      </div>
      <div>
        <label className="label">Icon</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => set('icon', ic)}
              className={cn('w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all',
                form.icon === ic ? 'bg-brand-100 dark:bg-brand-500/20 ring-2 ring-brand-500' : 'bg-gray-100 dark:bg-[#1e2130] hover:bg-gray-200')}>
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => set('color', c)}
              className={cn('w-8 h-8 rounded-full transition-all', form.color === c && 'ring-2 ring-offset-2 ring-brand-500 scale-110')}
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-semibold text-sm">
        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : initial ? 'Update Goal' : 'Create Goal'}
      </button>
    </form>
  )
}

export default function GoalsPage() {
  const [goals, setGoals]       = useState<Goal[]>([])
  const [loading, setLoading]   = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    api.get<{ data: Goal[] }>('/financial-goals')
      .then(r => setGoals(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (data: any) => {
    setSaving(true)
    try {
      if (editGoal) {
        const res = await api.put<{ data: Goal }>(`/financial-goals/${editGoal.id}`, data)
        setGoals(g => g.map(x => x.id === editGoal.id ? res.data.data : x))
        toast.success('Goal updated!')
      } else {
        const res = await api.post<{ data: Goal }>('/financial-goals', data)
        setGoals(g => [res.data.data, ...g])
        toast.success('Goal created!')
      }
      setFormOpen(false); setEditGoal(null)
    } catch (e: any) { toast.error(e?.response?.data?.error || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/financial-goals/${deleteId}`)
      setGoals(g => g.filter(x => x.id !== deleteId))
      setDeleteId(null); toast.success('Goal deleted')
    } catch { toast.error('Failed to delete') }
  }

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved  = goals.reduce((s, g) => s + g.currentAmount, 0)
  const completed   = goals.filter(g => g.isCompleted).length

  return (
    <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Goals</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{goals.length - completed} active · {completed} completed</p>
        </div>
        <button onClick={() => { setEditGoal(null); setFormOpen(true) }} className="btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {!loading && goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Target', value: formatCurrency(totalTarget), icon: '🎯' },
            { label: 'Total Saved',  value: formatCurrency(totalSaved),  icon: '💰' },
            { label: 'Completed',    value: `${completed} goals`,        icon: '🏆' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex gap-3"><div className="shimmer w-12 h-12 rounded-2xl" /><div className="space-y-2 flex-1"><div className="shimmer h-3.5 w-28 rounded" /><div className="shimmer h-2.5 w-20 rounded" /></div></div>
              <div className="shimmer h-2 w-full rounded-full" />
              <div className="shimmer h-3 w-32 rounded" />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet"
          description="Set financial goals and track your progress towards them"
          action={<button onClick={() => setFormOpen(true)} className="btn-primary gap-2"><Plus className="w-4 h-4" />Create First Goal</button>} />
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal, i) => {
              const pct = Math.min(goal.progressPercentage ?? 0, 100)
              return (
                <motion.div key={goal.id} layout
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                  className="card p-5 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: `${goal.color}18` }}>
                        {goal.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{goal.name}</p>
                        {goal.category && <p className="text-xs text-gray-400">{goal.category}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditGoal(goal); setFormOpen(true) }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(goal.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-red-50 dark:hover:bg-danger/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {goal.isCompleted && (
                    <div className="flex items-center gap-1.5 text-success text-xs font-semibold mb-3">
                      <Trophy className="w-4 h-4" /> Goal achieved!
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Progress</span>
                    <span className="font-bold" style={{ color: goal.color }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.06 }}
                      className="h-full rounded-full"
                      style={{ background: goal.color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <div>
                      <p className="text-gray-400">Saved</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">Target</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(goal.targetAmount)}</p>
                    </div>
                  </div>
                  {goal.targetDate && (
                    <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-50 dark:border-[#2a2d3a]">
                      🗓️ Target: {new Date(goal.targetDate).toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric' })}
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      )}

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditGoal(null) }}
        title={editGoal ? 'Edit Goal' : 'Create Goal'} size="md">
        <GoalForm onSave={handleSave} onClose={() => setFormOpen(false)} loading={saving} initial={editGoal} />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Goal" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Delete this goal permanently?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
