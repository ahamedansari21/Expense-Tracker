import api from './api'
import type { Expense, ExpenseFormData, PageResponse } from '@/types'

export const expenseService = {
  list: (page = 0, size = 20, search?: string) =>
    api.get<{ data: PageResponse<Expense> }>('/expenses', {
      params: { page, size, search },
    }).then(r => r.data.data),

  get: (id: number) =>
    api.get<{ data: Expense }>(`/expenses/${id}`).then(r => r.data.data),

  create: (data: ExpenseFormData) =>
    api.post<{ data: Expense }>('/expenses', data).then(r => r.data.data),

  update: (id: number, data: Partial<ExpenseFormData>) =>
    api.put<{ data: Expense }>(`/expenses/${id}`, data).then(r => r.data.data),

  delete: (id: number) => api.delete(`/expenses/${id}`),

  voiceParse: (text: string) =>
    api.post<{ data: Expense }>('/expenses/voice-parse', { text }).then(r => r.data.data),

  scanReceipt: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ data: Record<string, unknown> }>('/expenses/scan-receipt', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data)
  },
}
