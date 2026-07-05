import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Mic, ScanLine, Filter,
  Trash2, Pencil, CreditCard, X,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useExpenseStore } from '@/stores/expenseStore'
import { expenseService } from '@/services/expenseService'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import Badge from '@/components/ui/Badge'
import ExpenseForm from '@/components/expenses/ExpenseForm'
import VoiceExpenseModal from '@/components/expenses/VoiceExpenseModal'
import ReceiptScanModal from '@/components/expenses/ReceiptScanModal'
import { formatCurrency, formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Expense, ExpenseFormData } from '@/types'

const PM_ICONS: Record<string, string> = {
  UPI: '⚡', CARD: '💳', CASH: '💵', NET_BANKING: '🏦', WALLET: '👛', OTHER: '🔄',
}

export default function ExpensesPage() {
  const { expenses, pagination, loading, fetchExpenses, addExpense, updateExpense, removeExpense } = useExpenseStore()
  const [page, setPage]                     = useState(0)
  const [search, setSearch]                 = useState('')
  const [searchInput, setSearchInput]       = useState('')
  const [addOpen, setAddOpen]               = useState(false)
  const [editExpense, setEditExpense]        = useState<Expense | null>(null)
  const [deleteId, setDeleteId]             = useState<number | null>(null)
  const [voiceOpen, setVoiceOpen]           = useState(false)
  const [receiptOpen, setReceiptOpen]       = useState(false)
  const [formLoading, setFormLoading]       = useState(false)
  const [prefill, setPrefill]               = useState<Partial<Expense> | undefined>()
  const [typeFilter, setTypeFilter]         = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL')

  useEffect(() => { fetchExpenses(page, 20, search) }, [page, search, fetchExpenses])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleCreate = async (data: ExpenseFormData) => {
    setFormLoading(true)
    try {
      const created = await expenseService.create(data)
      addExpense(created)
      setAddOpen(false)
      setPrefill(undefined)
      toast.success('Expense added!')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to add expense')
    } finally { setFormLoading(false) }
  }

  const handleUpdate = async (data: ExpenseFormData) => {
    if (!editExpense) return
    setFormLoading(true)
    try {
      const updated = await expenseService.update(editExpense.id, data)
      updateExpense(updated)
      setEditExpense(null)
      toast.success('Expense updated!')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to update')
    } finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await expenseService.delete(deleteId)
      removeExpense(deleteId)
      setDeleteId(null)
      toast.success('Expense deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleVoiceConfirm = (data: Partial<Expense>) => {
    setPrefill(data)
    setAddOpen(true)
  }

  const handleReceiptConfirm = (data: Record<string, any>) => {
    setPrefill({
      merchant: data.merchant,
      amount:   data.amount,
      date:     data.date || undefined,
      receiptUrl: data.receiptUrl,
      paymentMethod: data.paymentMethod,
    })
    setAddOpen(true)
  }

  const displayed = typeFilter === 'ALL'
    ? expenses
    : expenses.filter(e => e.type === typeFilter)

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pagination?.totalElements ?? 0} transactions
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setVoiceOpen(true)}
            className="btn-secondary btn-sm gap-2">
            <Mic className="w-4 h-4 text-brand-500" /> Voice
          </button>
          <button onClick={() => setReceiptOpen(true)}
            className="btn-secondary btn-sm gap-2">
            <ScanLine className="w-4 h-4 text-brand-500" /> Scan
          </button>
          <button onClick={() => { setPrefill(undefined); setAddOpen(true) }}
            className="btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by title or merchant..."
            className="input pl-10 pr-10" />
          {searchInput && (
            <button onClick={() => setSearchInput('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-[#1e2130] rounded-xl">
          {(['ALL', 'EXPENSE', 'INCOME'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                typeFilter === t
                  ? 'bg-white dark:bg-[#1a1d27] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700')}>
              {t === 'ALL' ? 'All' : t === 'EXPENSE' ? '💸 Expenses' : '💰 Income'}
            </button>
          ))}
        </div>
      </div>

      {/* Expense list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50 dark:divide-[#1e2130]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="shimmer w-11 h-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-3.5 w-40 rounded" />
                  <div className="shimmer h-2.5 w-24 rounded" />
                </div>
                <div className="shimmer h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No expenses found"
            description={search ? 'Try a different search term' : 'Add your first expense to get started'}
            action={
              <button onClick={() => setAddOpen(true)} className="btn-primary gap-2">
                <Plus className="w-4 h-4" /> Add Expense
              </button>
            }
          />
        ) : (
          <AnimatePresence initial={false}>
            <div className="divide-y divide-gray-50 dark:divide-[#1e2130]">
              {displayed.map((expense, i) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50/50 dark:hover:bg-[#1e2130]/50
                    transition-colors group"
                >
                  {/* Category icon */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${expense.category?.color || '#6171f6'}18` }}>
                    {expense.category?.icon || '💸'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {expense.title}
                      </p>
                      {expense.isFraudulent && (
                        <Badge variant="red">⚠️ Suspicious</Badge>
                      )}
                      {expense.isRecurring && (
                        <Badge variant="purple">🔄 Recurring</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
                      {expense.merchant && (
                        <><span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className="text-xs text-gray-400 truncate max-w-[100px]">{expense.merchant}</span></>
                      )}
                      {expense.category && (
                        <><span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className="text-xs" style={{ color: expense.category.color }}>
                            {expense.category.icon} {expense.category.name}
                          </span></>
                      )}
                    </div>
                  </div>

                  {/* Payment method + amount */}
                  <div className="text-right shrink-0">
                    <p className={cn('text-base font-bold',
                      expense.type === 'INCOME' ? 'text-success' : 'text-gray-900 dark:text-white')}>
                      {expense.type === 'INCOME' ? '+' : '-'}{formatCurrency(expense.amount)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {PM_ICONS[expense.paymentMethod]} {expense.paymentMethod?.replace('_', ' ')}
                    </p>
                  </div>

                  {/* Actions (show on hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button onClick={() => setEditExpense(expense)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(expense.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-red-50 dark:hover:bg-danger/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {page * 20 + 1}–{Math.min((page + 1) * 20, pagination.totalElements)} of {pagination.totalElements}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={pagination.first}
              className="btn-secondary btn-sm disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {page + 1} / {pagination.totalPages}
            </span>
            <button onClick={() => setPage(p => p + 1)} disabled={pagination.last}
              className="btn-secondary btn-sm disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={addOpen || !!editExpense}
        onClose={() => { setAddOpen(false); setEditExpense(null); setPrefill(undefined) }}
        title={editExpense ? 'Edit Expense' : 'Add Expense'}
        size="lg"
      >
        <ExpenseForm
          onSubmit={editExpense ? handleUpdate : handleCreate}
          loading={formLoading}
          initialData={editExpense ?? prefill}
          submitLabel={editExpense ? 'Update Expense' : 'Add Expense'}
        />
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Expense" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
          </div>
        </div>
      </Modal>

      {/* Voice Modal */}
      <VoiceExpenseModal
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onConfirm={handleVoiceConfirm}
      />

      {/* Receipt Scan Modal */}
      <ReceiptScanModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        onConfirm={handleReceiptConfirm}
      />
    </div>
  )
}
