import api from './api'
import type { Category } from '@/types'

export const categoryService = {
  list: () => api.get<{ data: Category[] }>('/categories').then(r => r.data.data),

  create: (data: { name: string; icon: string; color: string; type: string }) =>
    api.post<{ data: Category }>('/categories', data).then(r => r.data.data),
}
