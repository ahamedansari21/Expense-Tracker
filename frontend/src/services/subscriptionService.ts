import api from './api'
import type { Subscription } from '@/types'

export const subscriptionService = {
  list: () => api.get<{ data: Subscription[] }>('/subscriptions').then(r => r.data.data),

  create: (data: Record<string, unknown>) =>
    api.post<{ data: Subscription }>('/subscriptions', data).then(r => r.data.data),

  updateStatus: (id: number, status: string) =>
    api.patch<{ data: Subscription }>(`/subscriptions/${id}/status`, { status }).then(r => r.data.data),

  delete: (id: number) => api.delete(`/subscriptions/${id}`),
}
