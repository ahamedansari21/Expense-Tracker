// ============================================================
// Core Domain Types
// ============================================================

export interface User {
  id: number
  email: string
  fullName: string
  avatarUrl?: string
  phone?: string
  currency: string
  monthlyIncome: number
  role: 'USER' | 'ADMIN'
  provider: 'LOCAL' | 'GOOGLE'
  notificationEnabled: boolean
  themePreference: 'LIGHT' | 'DARK' | 'SYSTEM'
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface Category {
  id: number
  name: string
  icon: string
  color: string
  type: 'EXPENSE' | 'INCOME' | 'BOTH'
  isDefault: boolean
}

export interface Expense {
  id: number
  title: string
  description?: string
  amount: number
  type: 'EXPENSE' | 'INCOME'
  date: string
  time?: string
  paymentMethod: PaymentMethod
  merchant?: string
  location?: string
  receiptUrl?: string
  isRecurring: boolean
  recurringInterval?: RecurringInterval
  tags?: string[]
  notes?: string
  isFraudulent: boolean
  fraudReason?: string
  aiConfidence?: number
  category?: Category
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: number
  name: string
  amount: number
  spent: number
  remaining: number
  percentageUsed: number
  period: BudgetPeriod
  startDate: string
  endDate: string
  alertThreshold: number
  isActive: boolean
  color: string
  category?: Category
  isOverBudget: boolean
  isNearLimit: boolean
}

export interface Subscription {
  id: number
  name: string
  provider?: string
  amount: number
  billingCycle: BillingCycle
  nextBillingDate: string
  lastBilledDate?: string
  paymentMethod: PaymentMethod
  status: SubscriptionStatus
  logoUrl?: string
  color: string
  remindDaysBefore: number
  autoRenew: boolean
  category?: Category
  daysUntilBilling: number
}

export interface DashboardData {
  financialHealthScore: number
  healthScoreLabel: string
  healthScoreTip: string
  totalExpenses: number
  totalIncome: number
  netSavings: number
  savingsRate: number
  expenseChangePercent: number
  incomeChangePercent: number
  monthlyTrend: MonthlyTrendPoint[]
  categoryBreakdown: CategoryBreakdown[]
  recentExpenses: Expense[]
  budgetAlerts: Budget[]
  upcomingBills: Subscription[]
  goals: GoalSummary[]
}

export interface MonthlyTrendPoint {
  month: string
  expenses: number
  income: number
}

export interface CategoryBreakdown {
  category: string
  icon: string
  color: string
  amount: number
  percentage: number
}

export interface GoalSummary {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  progressPercentage: number
  icon: string
  color: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  time?: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: 'BUDGET_ALERT' | 'BILL_DUE' | 'FRAUD_ALERT' | 'INSIGHT' | 'SYSTEM'
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  error?: string
  timestamp: string
}

// ============================================================
// Enums
// ============================================================
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET' | 'OTHER'
export type BudgetPeriod   = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
export type BillingCycle   = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED'
export type RecurringInterval  = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

// ============================================================
// Form Types
// ============================================================
export interface ExpenseFormData {
  title: string
  amount: number
  type: 'EXPENSE' | 'INCOME'
  date: string
  time?: string
  categoryId?: number
  paymentMethod: PaymentMethod
  merchant?: string
  location?: string
  notes?: string
  tags?: string[]
  isRecurring?: boolean
  recurringInterval?: RecurringInterval
}

export interface BudgetFormData {
  name: string
  amount: number
  categoryId?: number
  period: BudgetPeriod
  startDate: string
  endDate: string
  alertThreshold: number
  color: string
}

export interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  currency?: string
}

export interface LoginFormData {
  email: string
  password: string
}
