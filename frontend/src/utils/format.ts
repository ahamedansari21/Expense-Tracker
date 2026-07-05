import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from 'date-fns'

/** Format currency with symbol */
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format a number compactly: 1200 → ₹1.2K */
export function formatCompact(amount: number, currency = 'INR'): string {
  if (amount >= 1_000_000) return `${currency === 'INR' ? '₹' : '$'}${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000)     return `${currency === 'INR' ? '₹' : '$'}${(amount / 1_000).toFixed(1)}K`
  return formatCurrency(amount, currency)
}

/** Human-readable date */
export function formatDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    if (isToday(d))     return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'MMM d, yyyy')
  } catch { return dateStr }
}

/** Short date: Jan 4 */
export function formatShortDate(dateStr: string): string {
  try { return format(parseISO(dateStr), 'MMM d') }
  catch { return dateStr }
}

/** Relative time: 2 hours ago */
export function formatRelative(dateStr: string): string {
  try { return formatDistanceToNow(parseISO(dateStr), { addSuffix: true }) }
  catch { return dateStr }
}

/** Percentage display */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/** Change indicator: +12.5% or -3.2% */
export function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/** Get color for health score */
export function healthScoreColor(score: number): string {
  if (score >= 80) return '#00c896'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

/** Today's date as YYYY-MM-DD */
export function today(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** First day of current month */
export function startOfMonthStr(): string {
  const d = new Date()
  return format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd')
}

/** Last day of current month */
export function endOfMonthStr(): string {
  const d = new Date()
  return format(new Date(d.getFullYear(), d.getMonth() + 1, 0), 'yyyy-MM-dd')
}
