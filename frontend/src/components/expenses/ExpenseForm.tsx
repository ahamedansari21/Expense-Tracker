import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDays, DollarSign, Tag, MapPin, StickyNote } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useCategories } from '@/hooks/useCategories'
import { today } from '@/utils/format'
import type { Expense, ExpenseFormData } from '@/types'

const schema = z.object({
  title:             z.string().min(1, 'Title is required'),
  amount:            z.coerce.number().positive('Amount must be positive'),
  type:              z.enum(['EXPENSE', 'INCOME']),
  date:              z.string().min(1, 'Date is required'),
  time:              z.string().optional(),
  categoryId:        z.coerce.number().optional(),
  paymentMethod:     z.enum(['CASH','CARD','UPI','NET_BANKING','WALLET','OTHER']),
  merchant:          z.string().optional(),
  location:          z.string().optional(),
  notes:             z.string().optional(),
  isRecurring:       z.boolean().optional(),
  recurringInterval: z.enum(['DAILY','WEEKLY','MONTHLY','YEARLY']).optional(),
})

const PM_OPTIONS = [
  { value: 'UPI',         label: '⚡ UPI' },
  { value: 'CARD',        label: '💳 Card' },
  { value: 'CASH',        label: '💵 Cash' },
  { value: 'NET_BANKING', label: '🏦 Net Banking' },
  { value: 'WALLET',      label: '👛 Wallet' },
  { value: 'OTHER',       label: '🔄 Other' },
]

interface Props {
  onSubmit: (data: ExpenseFormData) => Promise<void>
  loading: boolean
  initialData?: Partial<Expense>
  submitLabel?: string
}

export default function ExpenseForm({ onSubmit, loading, initialData, submitLabel = 'Save Expense' }: Props) {
  const { categories } = useCategories()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:         initialData?.title         ?? '',
      amount:        initialData?.amount        ?? ('' as any),
      type:          initialData?.type          ?? 'EXPENSE',
      date:          initialData?.date          ?? today(),
      paymentMethod: initialData?.paymentMethod ?? 'UPI',
      merchant:      initialData?.merchant      ?? '',
      notes:         initialData?.notes         ?? '',
      categoryId:    initialData?.category?.id  ?? undefined,
      isRecurring:   initialData?.isRecurring   ?? false,
    },
  })

  const type = watch('type')
  const isRecurring = watch('isRecurring')

  // Prefill from scanned receipt / voice
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          if (k === 'category') setValue('categoryId', (v as any).id)
          else setValue(k as any, v)
        }
      })
    }
  }, [initialData, setValue])

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE' || c.type === 'BOTH')
  const incomeCategories  = categories.filter(c => c.type === 'INCOME'  || c.type === 'BOTH')
  const filteredCats = type === 'INCOME' ? incomeCategories : expenseCategories

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      {/* Type toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-[#1e2130] rounded-xl">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button key={t} type="button"
            onClick={() => setValue('type', t)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
              type === t
                ? t === 'EXPENSE'
                  ? 'bg-white dark:bg-[#1a1d27] text-danger shadow-sm'
                  : 'bg-white dark:bg-[#1a1d27] text-success shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            )}>
            {t === 'EXPENSE' ? '💸 Expense' : '💰 Income'}
          </button>
        ))}
      </div>

      {/* Title + Amount row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Title *</label>
          <input {...register('title')} placeholder="e.g. Lunch at Swiggy"
            className={cn('input', errors.title && 'border-danger')} />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="label">Amount (₹) *</label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input {...register('amount')} type="number" step="0.01" placeholder="0.00"
              className={cn('input pl-9', errors.amount && 'border-danger')} />
          </div>
          {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
        </div>
      </div>

      {/* Date + Payment */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Date *</label>
          <div className="relative">
            <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input {...register('date')} type="date"
              className={cn('input pl-9', errors.date && 'border-danger')} />
          </div>
        </div>
        <div>
          <label className="label">Payment Method</label>
          <select {...register('paymentMethod')} className="input">
            {PM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-1">
          {filteredCats.map((cat) => {
            const selected = String(watch('categoryId')) === String(cat.id)
            return (
              <button key={cat.id} type="button"
                onClick={() => setValue('categoryId', cat.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs',
                  selected
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                    : 'border-gray-100 dark:border-[#2a2d3a] hover:border-brand-300 bg-white dark:bg-[#1e2130]',
                )}>
                <span className="text-lg">{cat.icon}</span>
                <span className={cn('truncate w-full text-center',
                  selected ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-gray-600 dark:text-gray-400')}>
                  {cat.name.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Merchant + Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Merchant</label>
          <input {...register('merchant')} placeholder="e.g. Amazon, Swiggy"
            className="input" />
        </div>
        <div>
          <label className="label">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input {...register('location')} placeholder="City or place"
              className="input pl-9" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes</label>
        <div className="relative">
          <StickyNote className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <textarea {...register('notes')} placeholder="Optional note..."
            rows={2} className="input pl-9 resize-none" />
        </div>
      </div>

      {/* Recurring */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#1e2130]">
        <input {...register('isRecurring')} type="checkbox" id="recurring"
          className="w-4 h-4 rounded text-brand-500 accent-brand-500" />
        <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
          Recurring expense
        </label>
        {isRecurring && (
          <select {...register('recurringInterval')} className="input ml-auto w-32 text-xs py-1.5">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        )}
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-semibold text-sm">
        {loading
          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          : submitLabel}
      </button>
    </form>
  )
}
