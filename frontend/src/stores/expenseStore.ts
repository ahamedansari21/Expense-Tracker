import { create } from 'zustand'
import type { Expense, PageResponse } from '@/types'
import { expenseService } from '@/services/expenseService'

interface ExpenseState {
  expenses: Expense[]
  pagination: Omit<PageResponse<Expense>, 'content'> | null
  loading: boolean
  search: string

  fetchExpenses: (page?: number, size?: number, search?: string) => Promise<void>
  addExpense: (expense: Expense) => void
  updateExpense: (expense: Expense) => void
  removeExpense: (id: number) => void
  setSearch: (search: string) => void
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  pagination: null,
  loading: false,
  search: '',

  fetchExpenses: async (page = 0, size = 20, search) => {
    set({ loading: true })
    try {
      const result = await expenseService.list(page, size, search ?? get().search)
      set({
        expenses: result.content,
        pagination: {
          page: result.page,
          size: result.size,
          totalElements: result.totalElements,
          totalPages: result.totalPages,
          last: result.last,
          first: result.first,
        },
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  addExpense: (expense) =>
    set((state) => ({ expenses: [expense, ...state.expenses] })),

  updateExpense: (expense) =>
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === expense.id ? expense : e)),
    })),

  removeExpense: (id) =>
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

  setSearch: (search) => set({ search }),
}))
