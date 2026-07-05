import api from './api'
import type { Budget, BudgetFormData } from '@/types'

export const budgetService = {
  list: () => api.get<{ data: Budget[] }>('/budgets').then(r => r.data.data),

  create: (data: BudgetFormData) =>
    api.post<{ data: Budget }>('/budgets', data).then(r => r.data.data),

  update: (id: number, data: Partial<BudgetFormData>) =>
    api.put<{ data: Budget }>(`/budgets/${id}`, data).then(r => r.data.data),

  delete: (id: number) => api.delete(`/budgets/${id}`),
}
