import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, RefreshCw, Trash2, Pencil, PauseCircle, PlayCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import Badge from '@/components/ui/Badge'
import { subscriptionService } from '@/services/subscriptionService'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency, formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Subscription } from '@/types'

const COLORS = ['#E50914','#1DB954','#FF9900','#0070CC','#6171f6','#8b5cf6','#ec4899','#14b8a6']
const CYCLES = ['DAILY','WEEKLY','MONTHLY','QUARTERLY','YEARLY']

function SubscriptionForm({
  onSave, onClose, loading,
}: { onSave: (d: Record<string, any>) => Promise<void>; onClose: () => void; loading: boolean }) {
  const { categories } = useCategories()
  const [form, setForm] = useState({
    name: '', provider: '', amount: '', billingCycle: 'MONTHLY',
    nextBillingDate: '', color: '#6171f6', categoryId: '',
    remindDaysBefore: '3', paymentMethod: 'CARD',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={async e => { e.preventDefault(); await onSave({ ...form, amount: parseFloat(form.amount) }) }}
      className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Service Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required
            placeholder="Netflix, Spotify..." className="input" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Provider</label>
          <input value={form.provider} onChange={e => set('provider', e.target.value)}
            placeholder="Netflix Inc." className="input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Amount (₹) *</label>
          <input value={form.amount} onChange={e => set('amount', e.target.value)} required type="number" step="0.01" className="input" />
        </div>
        <div>
          <label className="label">Billing Cycle</label>
          <select value={form.billingCycle} onChange={e => set('billingCycle', e.target.value)} className="input">
            {CYCLES.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Next Billing Date *</label>
          <input value={form.nextBillingDate} onChange={e => set('nextBillingDate', e.target.value)}
            required type="date" className="input" />
        </div>
        <div>
          <label className="label">Payment Method</label>
          <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} className="input">
            {['CARD','UPI','NET_BANKING','WALLET'].map(p => <option key={p} value={p}>{p.replace('_',' ')}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Category</label>
        <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className="input">
          <option value="">None</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Remind me (days before): {form.remindDaysBefore}</label>
        <input value={form.remindDaysBefore} onChange={e => set('remindDaysBefore', e.target.value)}
          type="range" min="1" max="14" className="w-full accent-brand-500" />
      </div>
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => set('color', c)}
              className={cn('w-8 h-8 rounded-full transition-all', form.color === c && 'ring-2 ring-offset-2 ring-brand-500 scale-110')}
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-semibold text-sm">
        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</> : 'Add Subscription'}
      </button>
    </form>
  )
}

export default function SubscriptionsPage() {
  const [subs, setSubs]         = useState<Subscription[]>([])
  const [loading, setLoading]   = useState(true)
  const [addOpen, setAddOpen]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    subscriptionService.list().then(setSubs).finally(() => setLoading(false))
  }, [])

  const handleAdd = async (data: Record<string, any>) => {
    setSaving(true)
    try {
      const created = await subscriptionService.create(data)
      setSubs(s => [created, ...s])
      setAddOpen(false)
      toast.success('Subscription added!')
    } catch (e: any) { toast.error(e?.response?.data?.error || 'Failed to add') }
    finally { setSaving(false) }
  }

  const toggleStatus = async (sub: Subscription) => {
    const newStatus = sub.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      const updated = await subscriptionService.updateStatus(sub.id, newStatus)
      setSubs(s => s.map(x => x.id === sub.id ? updated : x))
      toast.success(`Subscription ${newStatus.toLowerCase()}`)
    } catch { toast.error('Failed to update status') }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await subscriptionService.delete(deleteId)
      setSubs(s => s.filter(x => x.id !== deleteId))
      setDeleteId(null)
      toast.success('Subscription removed')
    } catch { toast.error('Failed to delete') }
  }

  const active   = subs.filter(s => s.status === 'ACTIVE')
  const paused   = subs.filter(s => s.status === 'PAUSED')
  const monthly  = active.reduce((sum, s) => {
    const factors: Record<string, number> = { DAILY: 30, WEEKLY: 4.3, MONTHLY: 1, QUARTERLY: 1/3, YEARLY: 1/12 }
    return sum + s.amount * (factors[s.billingCycle] || 1)
  }, 0)

  return (
    <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{active.length} active · {formatCurrency(monthly)}/month</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      {/* Summary */}
      {!loading && subs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Monthly Cost',  value: formatCurrency(monthly),         icon: '💸' },
            { label: 'Active',        value: `${active.length} services`,      icon: '✅' },
            { label: 'Paused',        value: `${paused.length} services`,      icon: '⏸️' },
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
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex gap-3"><div className="shimmer w-10 h-10 rounded-xl" /><div className="flex-1 space-y-2"><div className="shimmer h-3.5 w-28 rounded" /><div className="shimmer h-2.5 w-20 rounded" /></div></div>
              <div className="shimmer h-3 w-24 rounded" />
            </div>
          ))}
        </div>
      ) : subs.length === 0 ? (
        <EmptyState icon={RefreshCw} title="No subscriptions yet"
          description="Track your recurring bills and never miss a payment"
          action={<button onClick={() => setAddOpen(true)} className="btn-primary gap-2"><Plus className="w-4 h-4" />Add Subscription</button>} />
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subs.map((sub, i) => (
              <motion.div key={sub.id} layout
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                className="card p-5 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0"
                      style={{ background: sub.color || '#6171f6' }}>
                      {sub.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{sub.name}</p>
                      <p className="text-xs text-gray-400">{sub.provider || sub.billingCycle.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleStatus(sub)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                      {sub.status === 'ACTIVE' ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setDeleteId(sub.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-red-50 dark:hover:bg-danger/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(sub.amount)}</p>
                    <p className="text-xs text-gray-400">per {sub.billingCycle.toLowerCase()}</p>
                  </div>
                  <div className="text-right">
                    {sub.status === 'ACTIVE' ? (
                      <Badge variant={sub.daysUntilBilling <= 3 ? 'red' : sub.daysUntilBilling <= 7 ? 'yellow' : 'green'}>
                        {sub.daysUntilBilling === 0 ? 'Due today' : `${sub.daysUntilBilling}d left`}
                      </Badge>
                    ) : (
                      <Badge variant="gray">Paused</Badge>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">{formatDate(sub.nextBillingDate)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Subscription" size="md">
        <SubscriptionForm onSave={handleAdd} onClose={() => setAddOpen(false)} loading={saving} />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Remove Subscription" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Remove this subscription? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-danger flex-1">Remove</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
